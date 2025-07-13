import { PrismaClient } from '@prisma/client';
import { genAI } from './config';

interface SimilarChunk {
  id: string;
  content: string;
  resource_id: string;
  title: string;
  similarity: number;
}

export async function performVectorSimilaritySearch(query: string, options?: {
  namespace?: string,
  topK?: number,
  similarityThreshold?: number
}): Promise<SimilarChunk[]> {
  const prisma = new PrismaClient();
  const {
    namespace = 'default',
    topK = 5,
    similarityThreshold = 0.7
  } = options || {};

  try {
    // Validate inputs
    if (!query || query.trim() === '') {
      throw new Error('Query must be a non-empty string');
    }

    // Generate embedding for the query
    const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });
    const embeddingResponse = await embeddingModel.embedContent(query);
    const queryEmbedding = embeddingResponse.embedding.values;

    // Validate embedding generation
    if (!queryEmbedding || queryEmbedding.length === 0) {
      throw new Error('Failed to generate embedding for the query');
    }

    // Perform vector similarity search using raw SQL with pgvector
    const similarChunks = await prisma.$queryRaw<SimilarChunk[]>`
      SELECT 
        vc.id, 
        vc.content, 
        vc.resource_id,
        r.title,
        1 - (vc.vector <=> ${queryEmbedding}::vector) AS similarity
      FROM 
        public.vector_chunks vc
      JOIN 
        public.content_summaries cs ON vc.summary_id = cs.id
      JOIN 
        public.resources r ON vc.resource_id = r.id
      WHERE 
        vc.pinecone_namespace = ${namespace}
        AND 1 - (vc.vector <=> ${queryEmbedding}::vector) >= ${similarityThreshold}
      ORDER BY 
        similarity DESC
      LIMIT ${topK}
    `;

    // Log search results for monitoring
    console.log('Vector Similarity Search Results:', {
      query,
      namespace,
      topK,
      similarityThreshold,
      resultsCount: similarChunks.length
    });

    return similarChunks;
  } catch (error) {
    // Comprehensive error logging
    console.error('Vector Similarity Search Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      query,
      namespace,
      topK,
      similarityThreshold
    });

    // Rethrow or handle specific error types
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unexpected error during vector similarity search');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Utility function for embedding generation
export async function generateEmbedding(text: string, model: string = 'embedding-001') {
  try {
    const embeddingModel = genAI.getGenerativeModel({ model });
    const embeddingResponse = await embeddingModel.embedContent(text);
    return embeddingResponse.embedding.values;
  } catch (error) {
    console.error('Embedding Generation Error:', error);
    throw error;
  }
}
