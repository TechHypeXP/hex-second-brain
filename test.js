import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('Connected to Supabase');
    const logs = await prisma.executionLog.findMany();
    console.log('ExecutionLog entries:', logs);
    await prisma.$disconnect();
  } catch (e) {
    console.error('Connection failed:', e);
  }
}

test();
