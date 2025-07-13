import { prisma } from '@/lib/prisma'; // Import the existing Prisma client
import { redis } from '@/lib/redis'; // Import the existing Redis client
import { env } from 'process';

// Centralized configuration for all services
export const systemConfig = {
  // Database configuration
  db: {
    prisma: prisma, // Use the imported Prisma client
  },
  
  // Redis configuration for BullMQ
  redis: {
    client: redis, // Use the imported Redis client
  },
  
  // AI configuration (Gemini by default)
  ai: {
    embeddingModel: env.EMBEDDING_MODEL || 'gemini',
    chunkSize: {
      video: parseInt(env.VIDEO_CHUNK_SIZE || '250'),
      article: parseInt(env.ARTICLE_CHUNK_SIZE || '300'),
      pdf: parseInt(env.PDF_CHUNK_SIZE || '200'),
      onenote: parseInt(env.ONENOTE_CHUNK_SIZE || '200'),
    },
    validationWeights: {
      factualConsistency: parseFloat(env.FACTUAL_WEIGHT || '0.3'),
      tonalAlignment: parseFloat(env.TONAL_WEIGHT || '0.2'),
      keyEntityPresence: parseFloat(env.ENTITY_WEIGHT || '0.25'),
      conclusionCongruence: parseFloat(env.CONCLUSION_WEIGHT || '0.25'),
    },
  },
  
  // System-wide constants
  constants: {
    MAX_SEARCH_RESULTS: 10,
    DEFAULT_EMBEDDING_DIMENSION: 768,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
  },
};
