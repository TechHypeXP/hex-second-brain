// File: tests/setup-verification.test.ts
// TDD Test for Project Environment Setup Validation

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

test.describe('Project Environment Setup Validation', () => {
  test('should verify TypeScript configuration and strict mode', async () => {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBeTruthy();
    
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.noEmit).toBe(true);
    expect(tsconfig.compilerOptions.allowImportingTsExtensions).toBe(true);
  });

  test('should verify all required environment variables are documented', async () => {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    expect(fs.existsSync(envExamplePath)).toBeTruthy();
    
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    const requiredVars = [
      'DATABASE_URL',
      'REDIS_URL', 
      'GOOGLE_API_KEY',
      'PINECONE_API_KEY',
      'EMBEDDING_MODEL',
      'CHUNK_SIZE'
    ];
    
    requiredVars.forEach(envVar => {
      expect(envExample).toContain(envVar);
    });
  });

  test('should verify lib/config.ts exports all required configurations', async () => {
    const configPath = path.join(process.cwd(), 'lib/config.ts');
    expect(fs.existsSync(configPath)).toBeTruthy();
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    expect(configContent).toContain('export { prisma, redis, genAI, pinecone }');
    expect(configContent).toContain('export const systemConfig');
  });

  test('should verify package.json has all required dependencies', async () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredDeps = [
      '@playwright/test',
      '@prisma/client',
      'bullmq',
      'ioredis',
      '@google/generative-ai',
      '@pinecone-database/pinecone'
    ];
    
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    requiredDeps.forEach(dep => {
      expect(allDeps[dep]).toBeDefined();
    });
  });

  test('should verify TypeScript compilation passes with zero errors', async () => {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
    } catch (error: any) {
      throw new Error(`TypeScript compilation failed: ${error.stdout || error.stderr}`);
    }
  });

  test('should verify ESLint passes with zero warnings', async () => {
    try {
      const output = execSync('npx next lint --max-warnings 0', { stdio: 'pipe', encoding: 'utf8' });
      expect(output).toContain('No ESLint warnings or errors');
    } catch (error: any) {
      throw new Error(`ESLint failed: ${error.stdout || error.stderr}`);
    }
  });

  test('should verify Prisma schema is valid and can generate client', async () => {
    try {
      execSync('npx prisma generate', { stdio: 'pipe' });
      execSync('npx prisma validate', { stdio: 'pipe' });
    } catch (error: any) {
      throw new Error(`Prisma validation failed: ${error.stdout || error.stderr}`);
    }
  });

  test('should verify security dependencies have no high/critical vulnerabilities', async () => {
    try {
      const auditOutput = execSync('npm audit --audit-level=high --json', { stdio: 'pipe', encoding: 'utf8' });
      const audit = JSON.parse(auditOutput);
      expect(audit.metadata.vulnerabilities.high).toBe(0);
      expect(audit.metadata.vulnerabilities.critical).toBe(0);
    } catch (error: any) {
      if (error.status === 0) {
        // No vulnerabilities found
        return;
      }
      throw new Error(`Security audit failed: ${error.stdout || error.stderr}`);
    }
  });
});
