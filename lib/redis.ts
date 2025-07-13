// File: lib/redis.ts

import Redis from "ioredis";

// Ensure the REDIS_URL is defined in the environment variables
if (!process.env.REDIS_URL) {
  // This check is important. It will now pass because dotenv loads the .env file first.
  throw new Error("REDIS_URL is not defined in the environment variables.");
}

const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisClient.on("connect", () => {
  console.log("[REDIS] Connected to Redis server.");
});

redisClient.on("error", (err) => {
  console.error("[REDIS] Redis connection error:", err);
});

export { redisClient as redis };
// This file sets up a Redis client using ioredis.
// It connects to the Redis server using the URL defined in the environment variables.
// The client is exported for use in other parts of the application.
// It also includes basic error handling and connection logging.
// This is useful for caching, job queues, and other Redis functionalities in the application.
// The `redis` client can be used in other files to interact with the Redis server.
// Make sure to handle the connection and errors appropriately in your application.
// The `maxRetriesPerRequest` option is set to `null` to allow unlimited retries
// for requests, which can be useful in development or when the Redis server is temporarily unavailable.
// Adjust this setting based on your application's needs.
// This file is essential for setting up Redis in your application.
// It ensures that the Redis client is properly configured and ready to use across your application.
