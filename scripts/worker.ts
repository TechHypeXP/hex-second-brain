// File: scripts/worker.ts

// --- STEP 1: LOAD ENVIRONMENT VARIABLES ---
// This must be the very first thing to run, before any other imports
// that might need environment variables.
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

// --- STEP 2: REGULAR IMPORTS ---
import { Worker, Job } from "bullmq";
import { redis } from "../lib/redis";
import prisma from "../lib/prisma";
import { systemConfig } from '../config/system'; // Import system config

interface Resource {
  id: string;
  type: "youtube" | "book" | "article" | "pdf" | "podcast" | "tweet" | "linkedin" | "website" | "document";
  url?: string;
  content?: string;
  transcript?: string;
  description?: string;
  title?: string;
  metadata?: any;
}

interface JobData {
  batchId: string;
  resources: Resource[];
  userId: string;
  config: {
    embeddingModel: string;
    chunkSize: number;
  };
}

console.log("Worker process starting...");

// Placeholder for fetching content (e.g., from URL, local file, etc.)
async function fetchContent(resource: Resource): Promise<string> {
  console.log(`[WORKER] Fetching content for resource ID: ${resource.id}, Type: ${resource.type}`);
  // In a real scenario, this would involve:
  // - Web scraping for articles
  // - YouTube API for video transcripts
  // - PDF/OneNote parsing
  if (resource.content) return resource.content;
  if (resource.transcript) return resource.transcript;
  // For now, return a dummy content based on type
  return `Dummy content for ${resource.type} resource ID: ${resource.id}`;
}

// Placeholder for the two-tier AI Synthesis Engine
async function runSynthesisEngine(resource: Resource, userId: string, config: any): Promise<any> {
  console.log(`[WORKER] Running synthesis engine for resource ID: ${resource.id}`);
  // This function will call the /api/extract and /api/validate endpoints
  // and handle the two-tier RAG process.

  // Step 1: Call /api/extract
  const extractResponse = await fetch('http://localhost:3000/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resource, userId, config }),
  });
  const extractedData = await extractResponse.json();

  if (!extractResponse.ok) {
    throw new Error(`Extraction failed: ${extractedData.error || extractResponse.statusText}`);
  }
  console.log(`[WORKER] Extraction successful for resource ${resource.id}`);

  // Step 2: Call /api/validate
  const validateResponse = await fetch('http://localhost:3000/api/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extractedData: extractedData.extractedData, resourceId: resource.id, userId }),
  });
  const validationResult = await validateResponse.json();

  if (!validateResponse.ok) {
    throw new Error(`Validation failed: ${validationResult.error || validateResponse.statusText}`);
  }
  console.log(`[WORKER] Validation successful for resource ${resource.id}`);

  return {
    summary: extractedData.extractedData.summary,
    keyPoints: extractedData.extractedData.keyPoints,
    suggestedCategories: extractedData.extractedData.suggestedCategories,
    suggestedTags: extractedData.extractedData.suggestedTags,
    validationResult: validationResult.validationResult,
    // Assuming categoryId comes from validationResult.final_categories or similar
    categoryId: validationResult.validationResult.final_categories?.[0] || null, // Placeholder
    title: resource.title || `Processed ${resource.type} ${resource.id}`,
  };
}


const worker = new Worker<JobData>(
  "jobQueue",
  async (job: Job<JobData>) => {
    const { batchId, resources, userId, config } = job.data;
    console.log(`\n[WORKER] Received Job ID: ${job.id}`);
    console.log(`[WORKER] Processing Batch ID: ${batchId} for user: ${userId}`);

    for (const resource of resources) {
      try {
        // === STAGE 1: INGESTION & ANALYSIS ===
        // 1. Fetch raw content from resource
        const rawContent = await fetchContent(resource);

        // 2. Run the two-tier AI Synthesis Engine
        const analysisResult = await runSynthesisEngine({ ...resource, content: rawContent }, userId, config);

        // === STAGE 2: PERSISTENCE ===
        // 3. Create or update the Resource record in the database using Prisma.
        const newResource = await prisma.resource.upsert({
          where: { id: resource.id }, // Use upsert to handle existing resources
          update: {
            title: analysisResult.title,
            content: analysisResult.summary, // Store summary as main content
            type: resource.type,
            tags: analysisResult.suggestedTags,
            classification_id: analysisResult.categoryId, // Corrected to classification_id
            metadata: {
              ...resource.metadata,
              extractedData: {
                summary: analysisResult.summary,
                keyPoints: analysisResult.keyPoints,
                suggestedCategories: analysisResult.suggestedCategories,
                suggestedTags: analysisResult.suggestedTags,
              },
              validationResult: analysisResult.validationResult,
            },
            user_id: userId,
          },
          create: {
            id: resource.id,
            user_id: userId,
            title: analysisResult.title,
            content: analysisResult.summary,
            type: resource.type,
            tags: analysisResult.suggestedTags,
            classification_id: analysisResult.categoryId, // Corrected to classification_id
            metadata: {
              ...resource.metadata,
              extractedData: {
                summary: analysisResult.summary,
                keyPoints: analysisResult.keyPoints,
                suggestedCategories: analysisResult.suggestedCategories,
                suggestedTags: analysisResult.suggestedTags,
              },
              validationResult: analysisResult.validationResult,
            },
          },
        });
        
        console.log(`Successfully processed and stored resource ${newResource.id}`);

        // 4. Update the progress of the parent batch job
        await prisma.batchJob.update({
          where: { id: batchId },
          data: { progress: { increment: 1 } },
        });

      } catch (error: any) {
        console.error(
          `[WORKER] Failed to process resource ${resource.id} for Batch ID: ${batchId}. Reason: ${error.message}`
        );
        // Optionally, update resource status to 'failed' or log specific error
        await prisma.batchJob.update({
          where: { id: batchId },
          data: { status: 'failed' }, // Mark batch as failed if any resource fails
        });
        throw new Error(`Failed to process resource ${resource.id}. Reason: ${error.message}`);
      }
    }

    // After processing all resources in the batch, check if the batch is complete
    const updatedBatchJob = await prisma.batchJob.findUnique({
      where: { id: batchId },
    });

    if (updatedBatchJob && updatedBatchJob.progress === updatedBatchJob.totalItems) {
      await prisma.batchJob.update({
        where: { id: batchId },
        data: {
          status: "completed",
        },
      });
      console.log(`[WORKER] Batch ID: ${batchId} is now complete!`);
    }

    return { status: "Completed Batch", batchId };
  },
  { connection: redis }
);

worker.on("completed", (job: Job<JobData>, result: any) => {
  console.log(`[WORKER] Job ID: ${job.id} has completed. Result:`, result);
});

worker.on("failed", (job: Job<JobData> | undefined, err: Error) => {
  if (job) {
    console.error(
      `[WORKER] Job ID: ${job.id} has failed with error: ${err.message}`
    );
  } else {
    console.error(
      `[WORKER] An unknown job has failed with error: ${err.message}`
    );
  }
});

worker.on("error", (err: Error) => {
  console.error(`[WORKER] A worker error has occurred: ${err.message}`);
});

process.on("SIGINT", () => {
  console.log("\n[WORKER] Shutting down worker gracefully...");
  worker.close();
  process.exit(0);
});

console.log("Worker is listening for jobs on 'jobQueue'...");
// This worker listens for jobs on the 'jobQueue' and processes them.
// It handles job completion, failure, and errors, and updates the database accordingly.
// The worker will log its activity to the console, making it easier to debug and monitor.
// Ensure that the worker is running in an environment where it can connect to Redis and the database
// to process jobs effectively. This is crucial for background processing tasks in the application.
// The worker is designed to handle jobs related to batch processing, updating the status of batch jobs,
// and simulating resource processing. It can be extended to include more complex logic as needed.
