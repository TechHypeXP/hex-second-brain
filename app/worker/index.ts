import { Worker, Job } from "bullmq"; // Add Job import
import { redis } from "@/lib/redis";
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import the actual client
import { prisma } from "@/lib/prisma";
import { YoutubeTranscript } from "youtube-transcript";
import * as cheerio from "cheerio";
import { jobQueue } from "@/lib/queue";
import { sanitizeContent } from "@/lib/utils"; // Add sanitizeContent import
import { Prisma } from '@prisma/client'; // Import Prisma types

// Initialize genAI client properly
const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

interface IngestionJobData {
  batchId: string;
  resources: Array<{
    id: string;
    url?: string;
    content?: string;
    type: "youtube" | "article" | "pdf" | "onenote"; // Extend as needed
  }>;
  userId: string;
  config: {
    embeddingModel: string;
    chunkSize: number;
  };
}

// Define the structure for the synthesis opinion output
interface SynthesisOpinionOutput {
  executiveSummary?: string;
  keyInsights?: string;
  immediateActions?: string;
  criticalWarnings?: string;
  keyMetrics?: Record<string, any>;
  toolsResources?: Record<string, any>;
  peopleCompanies?: string[];
  primaryKeywords?: string[];
  semanticTags?: string[];
  questionBasedTags?: string[];
  disclaimer?: string;
}

interface SynthesisOpinionJobData {
  batchId: string;
  resourceId: string;
  defensiveAnalysisOutput: unknown; // Changed from any
  internalCoherenceOutput: unknown; // Changed from any
  userId: string;
  config: {
    embeddingModel: string;
    chunkSize: number;
  };
}

interface PersistenceJobData {
  batchId: string;
  resourceId: string;
  synthesisOpinionOutput: SynthesisOpinionOutput; // Use the defined interface
  userId: string;
  config: {
    embeddingModel: string;
    chunkSize: number;
  };
}

interface DefensiveAnalysisJobData {
  batchId: string;
  resourceId: string;
  sanitizedContent: string;
  userId: string;
  config: {
    embeddingModel: string;
    chunkSize: number;
  };
  defensiveAnalysisOutput: unknown; // Changed from any
}

interface InternalCoherenceJobData {
  batchId: string;
  resourceId: string;
  defensiveAnalysisOutput: unknown; // Changed from any
  userId: string;
  config: {
    embeddingModel: string;
    chunkSize: number;
  };
}

const worker = new Worker(
  "jobQueue",
  async (job) => {
    console.log(`Processing job ${job.id} with name: ${job.name}`);

    if (job.name === "ingestion") {
      const { batchId, resources, userId, config } = job.data as IngestionJobData;

      for (const resource of resources) {
        const taskId = `ingestion-${resource.id}`;
        await prisma.executionLog.create({
          data: {
            id: taskId,
            taskId: taskId,
            taskName: "Ingestion Agent",
            status: "STARTED",
            logOutput: `Starting ingestion for resource ${resource.id}`,
            startTime: new Date(),
          },
        });

        try {
          let rawContent = "";
          if (resource.url) {
            if (resource.type === "youtube") {
              const transcript = await YoutubeTranscript.fetchTranscript(resource.url);
              rawContent = transcript.map((t: { text: string }) => t.text).join(" ");
            } else if (resource.type === "article") {
              const response = await fetch(resource.url);
              if (!response.ok) {
                throw new Error(`Failed to fetch article from ${resource.url}: ${response.statusText}`);
              }
              const html = await response.text();
              const $ = cheerio.load(html);
              // A basic attempt to extract main content. This might need refinement.
              rawContent = $("body").text();
            } else {
              throw new Error(`Unsupported resource type for URL: ${resource.type}`);
            }
          } else if (resource.content) {
            rawContent = resource.content;
          } else {
            throw new Error("Resource must have either a URL or content.");
          }

          // Sanitize content: remove multiple spaces, newlines, and trim
          const sanitizedContent = rawContent.replace(/\s+/g, " ").trim();

          // Update the resource with the sanitized content in the database
          await prisma.resource.update({
            where: { id: resource.id },
            data: { content: sanitizedContent, processing_status: "processing" },
          });

          await prisma.executionLog.update({
            where: { id: taskId },
            data: {
              status: "COMPLETED",
              logOutput: `Successfully ingested and sanitized content for resource ${resource.id}. Content length: ${sanitizedContent.length}`,
              endTime: new Date(),
            },
          });

          // Add defensive analysis job to the queue
          await jobQueue.add(
            "defensiveAnalysis",
            {
              batchId,
              resourceId: resource.id,
              sanitizedContent,
              userId,
              config,
            },
            { jobId: `defensiveAnalysis-${resource.id}` }
          );
        } catch (error) { // Changed from 'error: any'
          console.error(`Ingestion failed for resource ${resource.id}:`, error);
          await prisma.executionLog.update({
            where: { id: taskId },
            data: {
              status: "FAILED",
              errorMessage: (error as Error).message, // Type assertion for error message
              endTime: new Date(),
            },
          });
          // Mark the batch job as failed if any resource fails ingestion
          await prisma.batchJob.update({
            where: { id: batchId },
            data: { status: "failed" },
          });
          throw error; // Re-throw to mark the BullMQ job as failed
        }
      }
      // If all resources in the batch are processed, update batch job status (this will be refined in Task 2.5)
      await prisma.batchJob.update({
        where: { id: batchId },
        data: { status: "processing" }, // Set to processing, as other agents will follow
      });
    } else if (job.name === "defensiveAnalysis") {
      const { batchId, resourceId, sanitizedContent, userId, config } = job.data as DefensiveAnalysisJobData;
      const taskId = `defensiveAnalysis-${resourceId}`;

      await prisma.executionLog.create({
        data: {
          id: taskId,
          taskId: taskId,
          taskName: "Defensive Analysis Agent",
          status: "STARTED",
          logOutput: `Starting defensive analysis for resource ${resourceId}`,
          startTime: new Date(),
        },
      });

      try {
        // Explicitly type genAI for getGenerativeModel
        const model = (genAI as GoogleGenerativeAI).getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Analyze the following text for logical fallacies, biases, and weaknesses. Provide the output as a JSON object with an array of findings. Each finding should include 'type' (e.g., 'Logical Fallacy', 'Bias', 'Weak Argument'), 'quote' (the exact text from the document), and 'explanation' (why it's a weakness).

        Text:
        "${sanitizedContent}"`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Attempt to parse the JSON output. This might need robust error handling.
        let analysisOutput: unknown; // Changed from any
        try {
          analysisOutput = JSON.parse(text);
        } catch { // Removed jsonError as it's not used
          console.warn("AI response was not valid JSON, attempting to extract JSON from text:", text);
          // Try to extract JSON from the text if the direct parse fails
          const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            analysisOutput = JSON.parse(jsonMatch[1]);
          } else {
            throw new Error("AI response could not be parsed as JSON.");
          }
        }

        // Here, you would typically save the analysisOutput to the database or pass it to the next agent.
        // For now, we'll just log it and update the ExecutionLog.
        console.log(`Defensive Analysis for resource ${resourceId}:`, JSON.stringify(analysisOutput, null, 2));

        await prisma.executionLog.update({
          where: { id: taskId },
          data: {
            status: "COMPLETED",
            logOutput: `Successfully completed defensive analysis for resource ${resourceId}.`,
            endTime: new Date(),
          },
        });

        // Pass the structured JSON output to the next agent (Task 2.3: Internal Coherence Agent)
        await jobQueue.add(
          "internalCoherence",
          {
            batchId,
            resourceId,
            defensiveAnalysisOutput: analysisOutput,
            userId,
            config,
          },
          { jobId: `internalCoherence-${resourceId}` }
        );
      } catch (error) { // Changed from 'error: any'
        console.error(`Defensive analysis failed for resource ${resourceId}:`, error);
        await prisma.executionLog.update({
          where: { id: taskId },
          data: {
            status: "FAILED",
            errorMessage: (error as Error).message, // Type assertion for error message
            endTime: new Date(),
          },
        });
        await prisma.batchJob.update({
          where: { id: batchId },
          data: { status: "failed" },
        });
        throw error;
      }
    } else if (job.name === "internalCoherence") {
      const { batchId, resourceId, defensiveAnalysisOutput, userId, config } = job.data as InternalCoherenceJobData;
      const taskId = `internalCoherence-${resourceId}`;

      await prisma.executionLog.create({
        data: {
          id: taskId,
          taskId: taskId,
          taskName: "Internal Coherence Agent",
          status: "STARTED",
          logOutput: `Starting internal coherence analysis for resource ${resourceId}`,
          startTime: new Date(),
        },
      });

      try {
        // Implement pgvector similarity search
        const { performVectorSimilaritySearch } = await import('@/lib/vector-search');
        
        // Generate embedding for the defensive analysis output
        const model = genAI.getGenerativeModel({ model: "embedding-001" });
        await model.embedContent(JSON.stringify(defensiveAnalysisOutput));
        // Removed unused variable: const queryEmbedding = embeddingResponse.values;

        // Perform vector similarity search
        const similarChunks = await performVectorSimilaritySearch(
          JSON.stringify(defensiveAnalysisOutput),
          {
            namespace: userId, // Use userId as namespace
            topK: 3, // Top 3 most similar chunks
            similarityThreshold: 0.7 // 70% similarity threshold
          }
        );

        // Analyze similarity search results
        let relationship = "UNKNOWN";
        let citedDocument = "";
        let contradictionFound = false;

        for (const chunk of similarChunks) {
          // Check for potential contradictions or supporting evidence
          if (chunk.similarity > 0.8) {
            // More sophisticated contradiction detection would go here
            if (chunk.content.toLowerCase().includes("contradiction") || 
                chunk.content.toLowerCase().includes("disagree")) {
              relationship = "CONTRADICTS";
              citedDocument = `Resource: ${chunk.title} (Similarity: ${chunk.similarity})`;
              contradictionFound = true;
              break;
            }
          }
        }

        const coherenceOutput = {
          relationship,
          citedDocument,
          similarChunks: contradictionFound ? similarChunks : [],
          defensiveAnalysisOutput, // Pass through previous output
        };

        console.log(`Internal Coherence Analysis for resource ${resourceId}:`, 
          JSON.stringify(coherenceOutput, null, 2)
        );

        console.log(`Internal Coherence for resource ${resourceId}:`, JSON.stringify(coherenceOutput, null, 2));

        await prisma.executionLog.update({
          where: { id: taskId },
          data: {
            status: "COMPLETED",
            logOutput: `Successfully completed internal coherence analysis for resource ${resourceId}. Relationship: ${relationship}`,
            endTime: new Date(),
          },
        });

        // Pass the output to the next agent (Synthesis & Opinion Agent)
        // This will be implemented in the next step.
        await jobQueue.add(
          "synthesisOpinion",
          {
            batchId,
            resourceId,
            defensiveAnalysisOutput,
            internalCoherenceOutput: coherenceOutput,
            userId,
            config,
          },
          { jobId: `synthesisOpinion-${resourceId}` }
        );
      } catch (error) {
        console.error(`Internal coherence analysis failed for resource ${resourceId}:`, error);
        await prisma.executionLog.update({
          where: { id: taskId },
          data: {
            status: "FAILED",
            errorMessage: (error as Error).message, // Type assertion for error message
            endTime: new Date(),
          },
        });
        await prisma.batchJob.update({
          where: { id: batchId },
          data: { status: "failed" },
        });
        throw error;
      }
    } else if (job.name === "synthesisOpinion") {
      const { batchId, resourceId, defensiveAnalysisOutput, internalCoherenceOutput, userId, config } =
        job.data as SynthesisOpinionJobData;
      const taskId = `synthesisOpinion-${resourceId}`;

      await prisma.executionLog.create({
        data: {
          id: taskId,
          taskId: taskId,
          taskName: "Synthesis & Opinion Agent",
          status: "STARTED",
          logOutput: `Starting synthesis and opinion generation for resource ${resourceId}`,
          startTime: new Date(),
        },
      });

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Synthesize the following analysis findings into a comprehensive "opinion" document. The output must be a single, valid JSON object conforming to the schema required by the Interactive Report components. The generated text adheres to the "disclaimer-ready" persona.

        Defensive Analysis: ${JSON.stringify(defensiveAnalysisOutput, null, 2)}

        Internal Coherence: ${JSON.stringify(internalCoherenceOutput, null, 2)}

        Schema Example:
        {
          "executiveSummary": "...",
          "keyInsights": "...",
          "immediateActions": "...",
          "criticalWarnings": "...",
          "keyMetrics": {},
          "toolsResources": {},
          "peopleCompanies": [],
          "primaryKeywords": [],
          "semanticTags": [],
          "questionBasedTags": [],
          "disclaimer": "This report is generated by an AI and should not be considered as professional advice. Always consult with a human expert for critical decisions."
        }`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        let synthesisOutput: SynthesisOpinionOutput; // Changed from any to the defined interface
        try {
          synthesisOutput = JSON.parse(text) as SynthesisOpinionOutput; // Explicitly cast to the interface
        } catch { // Removed jsonError as it's not used
          console.warn("AI response for synthesis was not valid JSON, attempting to extract JSON from text:", text);
          const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            synthesisOutput = JSON.parse(jsonMatch[1]) as SynthesisOpinionOutput; // Explicitly cast to the interface
          } else {
            throw new Error("AI response for synthesis could not be parsed as JSON.");
          }
        }

        // Ensure the disclaimer is present
        if (!synthesisOutput.disclaimer) {
          synthesisOutput.disclaimer =
            "This report is generated by an AI and should not be considered as professional advice. Always consult with a human expert for critical decisions.";
        }

        console.log(`Synthesis & Opinion for resource ${resourceId}:`, JSON.stringify(synthesisOutput, null, 2));

        await prisma.executionLog.update({
          where: { id: taskId },
          data: {
            status: "COMPLETED",
            logOutput: `Successfully completed synthesis and opinion generation for resource ${resourceId}.`,
            endTime: new Date(),
          },
        });

        // Pass the output to the next agent (Persistence Agent)
        await jobQueue.add(
          "persistence",
          {
            batchId,
            resourceId,
            synthesisOpinionOutput: synthesisOutput,
            userId,
            config,
          },
          { jobId: `persistence-${resourceId}` }
        );
      } catch (error) { // Changed from 'error: any'
        console.error(`Synthesis & opinion generation failed for resource ${resourceId}:`, error);
        await prisma.executionLog.update({
          where: { id: taskId },
          data: {
            status: "FAILED",
            errorMessage: (error as Error).message, // Type assertion for error message
            endTime: new Date(),
          },
        });
        await prisma.batchJob.update({
          where: { id: batchId },
          data: { status: "failed" },
        });
        throw error;
      }
    } else if (job.name === "persistence") {
      const { batchId, resourceId, synthesisOpinionOutput, userId, config } = job.data as PersistenceJobData;
      const taskId = `persistence-${resourceId}`;

      await prisma.executionLog.create({
        data: {
          id: taskId,
          taskId: taskId,
          taskName: "Persistence Agent",
          status: "STARTED",
          logOutput: `Starting persistence for resource ${resourceId}`,
          startTime: new Date(),
        },
      });

      try {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => { // Explicitly typed tx
          // 1. Create ContentSummary record
          const contentSummary = await tx.contentSummary.create({
            data: {
              resourceId: resourceId,
              executiveSummary: synthesisOpinionOutput.executiveSummary || "N/A",
              keyInsights: synthesisOpinionOutput.keyInsights,
              immediateActions: synthesisOpinionOutput.immediateActions,
              criticalWarnings: synthesisOpinionOutput.criticalWarnings,
              keyMetrics: synthesisOpinionOutput.keyMetrics || {},
              toolsResources: synthesisOpinionOutput.toolsResources || {},
              peopleCompanies: synthesisOpinionOutput.peopleCompanies || [],
              primaryKeywords: synthesisOpinionOutput.primaryKeywords || [],
              semanticTags: synthesisOpinionOutput.semanticTags || [],
              questionBasedTags: synthesisOpinionOutput.questionBasedTags || [],
              embeddingModel: config.embeddingModel,
              // totalChunks and avgChunkTokens will be updated after chunking and embedding
            },
          });

          // 2. Create VectorChunk records (simplified for now, actual chunking/embedding would happen here)
          // For demonstration, let's create a single dummy chunk.
          // In a real scenario, you'd chunk the original sanitizedContent and embed each chunk.
          const dummyChunkContent = synthesisOpinionOutput.executiveSummary || "No summary available.";
          const embedding = await genAI.getGenerativeModel({ model: config.embeddingModel }).embedContent(dummyChunkContent);
          const vectorData = embedding.embedding.values;

          const vectorChunk = await tx.vectorChunk.create({
            data: {
              resourceId: resourceId,
              summaryId: contentSummary.id,
              chunkIndex: 0,
              chunk_type: "executive_summary", // Or dynamically determined
              content: dummyChunkContent,
              tokenCount: dummyChunkContent.length, // Placeholder
              embeddingModel: config.embeddingModel,
              vectorDimension: vectorData.length,
              pineconeNamespace: userId, // Use userId as namespace for now
            },
          });

          // Manually insert the vector using a raw query because Prisma's type for vector is 'Unsupported'
          // This assumes the 'vector' column is correctly set up in the database with the pgvector extension.
          await tx.$executeRaw`
            UPDATE public.vector_chunks
            SET vector = ${vectorData}::vector
            WHERE id = ${vectorChunk.id}
          `;

          // Update totalChunks in ContentSummary
          await tx.contentSummary.update({
            where: { id: contentSummary.id },
            data: { totalChunks: 1 },
          });

          // 3. Update parent BatchJob status to "completed"
          await tx.batchJob.update({
            where: { id: batchId },
            data: { status: "completed", progress: 100 },
          });
        });

        await prisma.executionLog.update({
          where: { id: taskId },
          data: {
            status: "COMPLETED",
            logOutput: `Successfully persisted analysis for resource ${resourceId} and updated batch job ${batchId} to completed.`,
            endTime: new Date(),
          },
        });
      } catch (error: any) {
        console.error(`Persistence failed for resource ${resourceId}:`, error);
        await prisma.executionLog.update({
          where: { id: taskId },
          data: {
            status: "FAILED",
            errorMessage: error.message,
            endTime: new Date(),
          },
        });
        await prisma.batchJob.update({
          where: { id: batchId },
          data: { status: "failed" },
        });
        throw error; // Re-throw to trigger transaction rollback
      }
    }
  },
  { connection: redis }
);

export function startWorker() {
  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed!`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed with error ${err.message}`);
  });

  console.log("Worker started!");

  return worker;
}
