import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const logs = await prisma.executionLog.findMany({
      orderBy: { startTime: 'desc' },
      take: 20,
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to fetch execution logs:', error);
    return NextResponse.json({ error: 'Failed to fetch execution logs' }, { status: 500 });
  }
}
