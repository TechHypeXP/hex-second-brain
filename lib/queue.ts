// File: lib/queue.ts

import { Queue } from "bullmq";
import { redis } from "./config"; // Import our configured redis client

const jobQueue = new Queue("jobQueue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: {
      count: 1000,
    },
  },
});

jobQueue.on("error", (err) => {
  console.error("[BULLMQ] Queue error:", err);
});

export { jobQueue };
// This file sets up a BullMQ queue instance for managing background jobs.
// It imports the Redis client and creates a queue named 'jobQueue'.
// The queue is configured with default job options, including retry attempts,
// backoff strategies, and automatic removal of completed or failed jobs.
