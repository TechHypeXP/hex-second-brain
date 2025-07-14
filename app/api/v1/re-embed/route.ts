import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { systemConfig } from '@/config/system';

// Define the schema for the incoming request body
const reEmbedRequestSchema = z.object({
  resourceIds: z.array(z.string().uuid()).min(1, 'At least one resource ID is required'),
  userId: z.string().uuid(),
  newEmbeddingModel: z.string().optional(),
  newChunkSize: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resourceIds, userId, newEmbeddingModel, newChunkSize } = reEmbedRequestSchema.parse(body);

    console.log('Initiating re-embedding for resources:', resourceIds, 'by user:', userId);
    console.log('New config (if provided):', { newEmbeddingModel, newChunkSize });

    // Placeholder for Re-embedding Logic:
    // 1. Fetch resources from the database using resourceIds.
    // 2. Calculate estimated cost based on resource size and new model/chunk size.
    //    (This would involve more complex logic based on actual token counts and model pricing)
    const estimatedCost = 0.0; // Simulate cost calculation
    const currentEmbeddingModel = systemConfig.ai.embeddingModel;
    const currentChunkSize = systemConfig.ai.chunkSize;

    // Simulate re-embedding process
    const reEmbeddedResources = await prisma.resource.findMany({
      where: {
        id: {
          in: resourceIds,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    // In a real scenario, this would involve:
    // - Iterating through resources
    // - Chunking their content based on newChunkSize
    // - Calling Gemini embedding API with newEmbeddingModel
    // - Updating vectors in Pinecone/pgvector
    // - Logging changes in change_log table

    // Log re-embedding attempt in change_log
    await prisma.changeLog.create({
      data: {
        userId: userId,
        changeType: 're_embed_resources',
        changeDetails: {
          resourceIds: resourceIds,
          oldEmbeddingModel: currentEmbeddingModel,
          newEmbeddingModel: newEmbeddingModel || currentEmbeddingModel,
          oldChunkSize: currentChunkSize,
          newChunkSize: newChunkSize || currentChunkSize,
          estimatedCost: estimatedCost,
        },
      },
    });

    return NextResponse.json({
      message: 'Resource re-embedding initiated successfully',
      reEmbeddedCount: reEmbeddedResources.length,
      estimatedCost: estimatedCost,
      details: reEmbeddedResources,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: error.issues }, { status: 400 });
    }
    console.error('Error during resource re-embedding:', error);
    return NextResponse.json({ error: 'Failed to process re-embedding request' }, { status: 500 });
  }
}
