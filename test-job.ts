import { Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import cuid from 'cuid';

const prisma = new PrismaClient();
const queue = new Queue('jobQueue', { connection: { host: 'localhost', port: 6379 } });

async function addTestJob() {
  try {
    await queue.add('testJob', { test: 'QA verification' });
    console.log('Test job added to queue');
    const log = await prisma.executionLog.create({
      data: {
        id: cuid(),
        taskId: 'test-job-qa',
        taskName: 'TestJob',
        status: 'queued',
        startTime: new Date(),
      },
    });
    console.log('ExecutionLog entry created:', log);
  } catch (e) {
    console.error('Error adding test job:', e);
  } finally {
    await prisma.$disconnect();
  }
}

addTestJob();
