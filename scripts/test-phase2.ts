import { jobQueue } from "../lib/queue";
import { redis } from "../lib/config";
import prisma from "../lib/prisma";
import { v4 as uuidv4 } from 'uuid';

async function runPhase2E2ETest() {
  console.log("Starting Phase 2 E2E Workflow Test...");

  const batchId = uuidv4();
  const resourceId = uuidv4();
  const userId = uuidv4(); // Using a new UUID for user for isolation

  try {
    // 1. Create a dummy BatchJob and Resource in the database
    console.log(`Creating dummy BatchJob ${batchId} and Resource ${resourceId}...`);
    await prisma.batchJob.create({
      data: {
        id: batchId,
        userId: userId,
        status: "pending",
        totalItems: 1,
      },
    });

    await prisma.resource.create({
      data: {
        id: resourceId,
        user_id: userId,
        title: "Test Resource for E2E",
        type: "article", // Or any supported type
        content: "This is some test content for the E2E workflow. It discusses various topics to simulate real data.",
        processing_status: "pending",
        space_id: null, // Assuming space_id is optional or handled later
      },
    });
    console.log("Dummy BatchJob and Resource created.");

    // 2. Add an 'ingestion' job to the queue
    console.log(`Adding 'ingestion' job for resource ${resourceId} to the queue...`);
    const ingestionJob = await jobQueue.add(
      "ingestion",
      {
        batchId: batchId,
        resources: [{
          id: resourceId,
          content: "This is some test content for the E2E workflow. It discusses various topics to simulate real data.",
          type: "article",
        }],
        userId: userId,
        config: {
          embeddingModel: "gemini-flash", // Use a valid model name
          chunkSize: 250,
        },
      },
      { jobId: `ingestion-${resourceId}` }
    );
    console.log(`'ingestion' job added with ID: ${ingestionJob.id}`);

    // 3. Wait for the job chain to complete (Ingestion -> Defensive Analysis -> Internal Coherence -> Synthesis & Opinion -> Persistence)
    console.log("Waiting for the job chain to complete...");

    // We need to wait for the final job ('persistence') to complete.
    // BullMQ jobs can have dependencies, but the current worker implementation
    // adds subsequent jobs within the worker itself.
    // A simple approach is to poll the BatchJob status in the database.
    let jobStatus = "processing";
    const timeout = 60000; // 60 seconds timeout
    const interval = 2000; // Check every 2 seconds
    const startTime = Date.now();

    while (jobStatus !== "completed" && jobStatus !== "failed" && (Date.now() - startTime) < timeout) {
      const batch = await prisma.batchJob.findUnique({
        where: { id: batchId },
        select: { status: true },
      });
      if (batch) {
        jobStatus = batch.status;
        console.log(`BatchJob status: ${jobStatus}`);
      }
      if (jobStatus === "completed") break;
      if (jobStatus === "failed") throw new Error("Batch job failed during processing.");
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    if (jobStatus !== "completed") {
      throw new Error(`Batch job did not complete within the timeout. Final status: ${jobStatus}`);
    }

    console.log("Job chain completed successfully.");

    // 4. Verify final output in the database (ContentSummary, VectorChunk)
    console.log("Verifying final output in the database...");
    const contentSummary = await prisma.contentSummary.findFirst({
      where: { resourceId: resourceId },
    });

    if (!contentSummary) {
      throw new Error("ContentSummary record not found for the processed resource.");
    }
    console.log("ContentSummary found.");

    const vectorChunkCount = await prisma.vectorChunk.count({
      where: { resourceId: resourceId },
    });

    if (vectorChunkCount === 0) {
       // Note: The current worker implementation creates at least one dummy chunk.
       // If chunking logic changes, this check might need adjustment.
      console.warn("No VectorChunk records found for the processed resource. This might indicate an issue with the persistence agent.");
      // Depending on strictness, you might throw an error here.
    } else {
      console.log(`${vectorChunkCount} VectorChunk(s) found.`);
    }

    console.log("\nPhase 2 E2E Workflow Test Completed Successfully.");

  } catch (error: any) {
    console.error("\nPhase 2 E2E Workflow Test Failed:");
    console.error(error);
    // Clean up dummy data on failure
    try {
        await prisma.batchJob.delete({ where: { id: batchId } });
        await prisma.resource.delete({ where: { id: resourceId } });
        // Attempt to delete related records if they exist
        await prisma.executionLog.deleteMany({ where: { taskId: { startsWith: resourceId } } });
        await prisma.contentSummary.deleteMany({ where: { resourceId: resourceId } });
        await prisma.vectorChunk.deleteMany({ where: { resourceId: resourceId } });
        console.log("Cleaned up dummy data after failure.");
    } catch (cleanupError) {
        console.error("Failed to clean up dummy data:", cleanupError);
    }
    process.exit(1); // Exit with a non-zero code to indicate failure
  } finally {
    // Clean up dummy data on success
    try {
        await prisma.batchJob.delete({ where: { id: batchId } });
        await prisma.resource.delete({ where: { id: resourceId } });
        // Attempt to delete related records if they exist
        await prisma.executionLog.deleteMany({ where: { taskId: { startsWith: resourceId } } });
        await prisma.contentSummary.deleteMany({ where: { resourceId: resourceId } });
        await prisma.vectorChunk.deleteMany({ where: { resourceId: resourceId } });
        console.log("Cleaned up dummy data after success.");
    } catch (cleanupError) {
        console.error("Failed to clean up dummy data:", cleanupError);
    }
    // Disconnect clients
    await prisma.$disconnect();
    await redis.quit();
    console.log("Database and Redis connections closed.");
  }
}

runPhase2E2ETest();
