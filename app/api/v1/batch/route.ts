import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jobQueue } from '@/lib/queue';
import { systemConfig } from '@/config/system';

export async function POST(request: Request) {
  const { resources, userId } = await request.json();
  
  try {
    const batchJob = await prisma.batchJob.create({
      data: {
        userId: userId,
        totalItems: resources.length,
        status: 'pending'
      }
    });

    // Add to BullMQ queue with Redis
    await jobQueue.add('processBatch', {
      batchId: batchJob.id,
      resources,
      userId,
      config: {
        embeddingModel: systemConfig.ai.embeddingModel,
        chunkSize: systemConfig.ai.chunkSize
      }
    });

    return NextResponse.json({
      jobId: batchJob.id,
      status: 'Batch processing started',
      progress: 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start batch processing' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');
  
  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
  }

  try {
    const batchJob = await prisma.batchJob.findUnique({
      where: { id: jobId }
    });

    return NextResponse.json(batchJob);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get batch status' }, { status: 500 });
  }
}
