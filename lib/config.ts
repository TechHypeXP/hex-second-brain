import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

export type Config = {
  embeddingModel: string;
  chunkSize: number;
  validationWeights: {
    factualConsistency: number;
    tonalAlignment: number;
    keyEntityPresence: number;
    conclusionCongruence: number;
  };
};

export const systemConfig: Config = {
  embeddingModel: process.env.EMBEDDING_MODEL || "gemini-flash",
  chunkSize: parseInt(process.env.CHUNK_SIZE || "250"),
  validationWeights: {
    factualConsistency: parseFloat(process.env.FACTUAL_WEIGHT || "0.3"),
    tonalAlignment: parseFloat(process.env.TONAL_WEIGHT || "0.2"),
    keyEntityPresence: parseFloat(process.env.ENTITY_WEIGHT || "0.25"),
    conclusionCongruence: parseFloat(process.env.CONCLUSION_WEIGHT || "0.25"),
  },
};

// Initialize Prisma Client with datasource configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Initialize Redis Client
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Initialize Pinecone Client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export { prisma, redis, genAI, pinecone };
