import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { jobQueue } from '../lib/queue';
import { Worker } from 'bullmq';
import Redis from 'ioredis';

test.describe('Phase 1 Integration QA', () => {
  const prisma = new PrismaClient();
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

  test('Database Connection and Basic CRUD', async () => {
    // Test database connection and basic operation
    const testUser = await prisma.user.findFirst();
    expect(testUser).toBeTruthy();
  });

  test('Redis Queue Connectivity', async () => {
    // Test Redis connection and queue functionality
    await jobQueue.add('test-job', { testData: 'integration-check' });
    const jobs = await jobQueue.getJobs(['waiting', 'active']);
    expect(jobs.length).toBeGreaterThan(0);
  });

  test('Worker Basic Functionality', async () => {
    const worker = new Worker('jobQueue', async (job) => {
      // Simulate a basic job processing
      return { processed: true };
    }, { connection: redis });

    // Add a test job
    const testJob = await jobQueue.add('test-worker-job', { testData: 'worker-check' });

    // Wait for job completion with timeout
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Job processing timeout'));
      }, 5000);

      worker.on('completed', (job) => {
        clearTimeout(timeout);
        resolve(job.returnvalue);
      });

      worker.on('failed', (job, err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    expect(result).toBeTruthy();
  });

  test('ExecutionLog Creation', async () => {
    // Test creating an ExecutionLog entry
    const testLog = await prisma.executionLog.create({
      data: {
        id: `test-log-${Date.now()}`,
        taskId: 'integration-test',
        taskName: 'Phase 1 QA Test',
        status: 'STARTED'
      }
    });

    expect(testLog).toBeTruthy();
    expect(testLog.status).toBe('STARTED');
  });

  test.afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
    await redis.quit();
  });
});
