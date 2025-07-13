import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPersistence() {
  try {
    await prisma.$connect();
    const batchJob = await prisma.batchJob.create({
      data: {
        userId: '00c0d861-8abd-4bf2-9fda-f33599f4f833',
        status: 'pending',
        totalItems: 1,
      },
    });
    const vector = '[' + Array(768).fill('0.1').join(',') + ']';
    await prisma.$executeRawUnsafe(
      `INSERT INTO public.vector_chunks (id, resource_id, summary_id, chunk_index, chunk_type, content, token_count, vector) VALUES ('11111111-1111-1111-1111-111111111111', '50f0000a-ca90-4a7b-9091-93cbe65d84e5', 'c615ac7a-6438-442f-998c-22b1a5bfda3a', 1, 'data', 'test content', 2, '${vector}'::vector)`
    );
    const log = await prisma.executionLog.create({
      data: {
        id: '22222222-2222-2222-2222-222222222222',
        taskId: batchJob.id,
        taskName: 'PersistenceTest',
        status: 'completed',
        startTime: new Date(),
      },
    });
    console.log('Vector inserted and logged:', log);
    await prisma.$disconnect();
  } catch (e) {
    console.error('Persistence error:', e);
  }
}

testPersistence();
