// File: tests/database-health.test.ts
// TDD Test for Production Database Architecture

import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

test.describe('Production Database Architecture Validation', () => {
  test('should verify database connection and run a simple query', async () => {
    try {
      const result = await prisma.$queryRaw`SELECT 1`;
      expect(result).toBeTruthy();
    } catch (error: any) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  });

  test('should verify pgvector extension is enabled', async () => {
    try {
      const result: any[] = await prisma.$queryRaw`SELECT * FROM pg_extension WHERE extname = 'vector'`;
      expect(result.length).toBe(1);
    } catch (error: any) {
      throw new Error(`pgvector extension check failed: ${error.message}`);
    }
  });

  test('should verify versioned migrations can be applied', async () => {
    try {
      // This command will apply any pending migrations.
      // In a real CI/CD pipeline, you would have a separate script for this.
      execSync('npx prisma migrate deploy', { stdio: 'pipe' });
    } catch (error: any) {
      throw new Error(`Prisma migrate deploy failed: ${error.stdout || error.stderr}`);
    }
  });

  test('should simulate a connection stress test', async () => {
    const connectionPromises = [];
    const concurrentConnections = 100;

    for (let i = 0; i < concurrentConnections; i++) {
      connectionPromises.push(prisma.$queryRaw`SELECT 1`);
    }

    try {
      await Promise.all(connectionPromises);
    } catch (error: any) {
      throw new Error(`Connection stress test failed: ${error.message}`);
    }
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });
});
