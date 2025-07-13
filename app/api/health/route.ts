// File: app/api/health/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Redis } from "ioredis";
import { Pinecone } from "@pinecone-database/pinecone";

// This function will test the connection to a service and measure latency
async function checkService(
  serviceName: string,
  servicePromise: Promise<any>
): Promise<{ status: string; latency: number }> {
  const startTime = Date.now();
  try {
    await servicePromise;
    const endTime = Date.now();
    return {
      status: "ok",
      latency: endTime - startTime,
    };
  } catch (error: any) {
    const endTime = Date.now();
    console.error(`Health check for ${serviceName} failed:`, error.message);
    return {
      status: "error",
      latency: endTime - startTime,
    };
  }
}

export async function GET() {
  // Check Supabase (PostgreSQL) connection by running a simple query
  const dbCheck = checkService("database", prisma.$queryRaw`SELECT 1`);

  // Check Redis connection by pinging the server
  const redisClient = new Redis(process.env.REDIS_URL as string);
  const redisCheck = checkService("redis", redisClient.ping());
  redisClient.quit(); // Close the connection

  // Check Pinecone connection by fetching index stats
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY as string,
  });
  const pineconeIndex = pinecone.index("second-brain"); // NOTE: Make sure your index is named 'second-brain'
  const pineconeCheck = checkService(
    "pinecone",
    pineconeIndex.describeIndexStats()
  );

  // Wait for all checks to complete
  const [dbResult, redisResult, pineconeResult] = await Promise.all([
    dbCheck,
    redisCheck,
    pineconeCheck,
  ]);

  const healthStatus = {
    database: dbResult,
    redis: redisResult,
    pinecone: pineconeResult,
    timestamp: new Date().toISOString(),
  };

  // Determine overall status code
  const isHealthy =
    dbResult.status === "ok" &&
    redisResult.status === "ok" &&
    pineconeResult.status === "ok";

  return NextResponse.json(healthStatus, { status: isHealthy ? 200 : 503 });
}
