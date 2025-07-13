import { PrismaClient } from '@prisma/client';
import cuid from 'cuid';

const prisma = new PrismaClient();

async function testCrud() {
  try {
    // Create
    const log = await prisma.executionLog.create({
      data: {
        id: cuid(),
        taskId: 'crud-test',
        taskName: 'CrudTest',
        status: 'completed',
        startTime: new Date(),
        logOutput: 'Test output',
      },
    });
    console.log('Created:', log);

    // Read
    const logs = await prisma.executionLog.findMany({ where: { taskId: 'crud-test' } });
    console.log('Read:', logs);

    // Update
    await prisma.executionLog.update({
      where: { id: log.id },
      data: { status: 'updated' },
    });
    console.log('Updated:', await prisma.executionLog.findUnique({ where: { id: log.id } }));

    // Delete
    await prisma.executionLog.delete({ where: { id: log.id } });
    console.log('Deleted:', await prisma.executionLog.findUnique({ where: { id: log.id } }));
  } catch (e) {
    console.error('CRUD error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

testCrud();
