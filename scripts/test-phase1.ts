import { Job } from "bullmq";
import { jobQueue } from "../lib/queue";
import prisma from "../lib/prisma";
import { redis } from "../lib/config"; // Import redis for connection check
async function runPhase1IntegrationTest() {
  console.log("Starting Phase 1 Integration Test...");

  try {
    // 1. Verify Database Connection and basic operation
    console.log("Testing Database Connection...");
    await prisma.$connect();
    console.log("Database connected successfully.");

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`Database contains ${userCount} users (basic query test successful).`);

    // Verify ExecutionLog table exists and is queryable
    const logCount = await prisma.executionLog.count();
    console.log(`ExecutionLog table exists and contains ${logCount} entries.`);

    // 2. Verify Redis Connection
    console.log("Testing Redis Connection...");
    await redis.ping();
    console.log("Redis connected successfully.");

    // 3. Verify Queue Functionality
    console.log("Testing Queue Functionality...");
    const testJobName = "test-phase1-job";
    const testJobData = { message: "Hello from integration test!" };

    // Ensure the queue is ready
    await jobQueue.waitUntilReady();
    console.log("Job queue is ready.");

    // Add a test job to the queue
    const job = await jobQueue.add(testJobName, testJobData, {
      removeOnComplete: true,
      removeOnFail: true,
    });
    console.log(`Test job added to queue with ID: ${job.id}`);

    // Note: Verifying the worker *processes* the job requires the worker to be running
    // and would typically involve waiting for a specific log or database change.
    // For this integration test, we'll focus on adding the job successfully and
    // checking the queue state, assuming the worker is configured correctly elsewhere.
    // A more advanced test would involve a dedicated test worker or mocking.

    // Check if the job exists in the queue (basic check)
    const jobStatus = await jobQueue.getJob(job.id!);
    if (jobStatus) {
      console.log(`Job ${job.id} found in queue.`);
    } else {
      throw new Error(`Job ${job.id} not found in queue after adding.`);
    }

    // 4. Verify Worker Connection (Indirect Check)
    // This is hard to test directly without controlling the worker process.
    // We assume the worker is running and connected if Redis and the Queue are working.
    console.log("Assuming Worker is connected if Redis and Queue are functional.");


    console.log("\nPhase 1 Integration Test Completed Successfully.");

  } catch (error: any) {
    console.error("\nPhase 1 Integration Test Failed:");
    console.error(error);
    process.exit(1); // Exit with a non-zero code to indicate failure
  } finally {
    // Disconnect clients
    await prisma.$disconnect();
    await redis.quit();
    console.log("Database and Redis connections closed.");
  }
}

runPhase1IntegrationTest();
