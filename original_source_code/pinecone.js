import { Pinecone } from '@pinecone-database/pinecone'

const pineconeApiKey = import.meta.env.VITE_PINECONE_API_KEY

let pinecone = null

// Initialize Pinecone client
const initializePinecone = async () => {
  if (!pinecone && pineconeApiKey) {
    try {
      pinecone = new Pinecone({
        apiKey: pineconeApiKey
      })
    } catch (error) {
      console.error('Failed to initialize Pinecone:', error)
    }
  }
  return pinecone
}

// Get or create index
const getIndex = async (indexName = 'second-brain') => {
  const pc = await initializePinecone()
  if (!pc) return null

  try {
    // Check if index exists
    const indexList = await pc.listIndexes()
    const indexExists = indexList.indexes?.some(index => index.name === indexName)

    if (!indexExists) {
      // Create index if it doesn't exist
      await pc.createIndex({
        name: indexName,
        dimension: 1536, // OpenAI embedding dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      })
      
      // Wait for index to be ready
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    return pc.index(indexName)
  } catch (error) {
    console.error('Error getting/creating index:', error)
    return null
  }
}

// Generate embeddings using OpenAI (mock implementation for demo)
const generateEmbedding = async (text) => {
  // In a real implementation, you would call OpenAI's embedding API
  // For demo purposes, we'll return a mock embedding
  // You would need to implement this with your preferred embedding service
  
  // Mock embedding - in production, use OpenAI embeddings API
  const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() - 0.5)
  return mockEmbedding
}

// Upsert resource to Pinecone
export const upsertResourceVector = async (resource) => {
  try {
    const index = await getIndex()
    if (!index) return { success: false, error: 'Pinecone not available' }

    // Create text content for embedding
    const textContent = [
      resource.title,
      resource.description,
      resource.content,
      ...(resource.tags || [])
    ].filter(Boolean).join(' ')

    // Generate embedding
    const embedding = await generateEmbedding(textContent)

    // Prepare metadata
    const metadata = {
      id: resource.id,
      title: resource.title,
      description: resource.description || '',
      type: resource.type,
      url: resource.url || '',
      tags: resource.tags || [],
      space_id: resource.space_id || '',
      classification_id: resource.classification_id || '',
      user_id: resource.user_id,
      created_at: resource.created_at
    }

    // Upsert to Pinecone
    await index.upsert([{
      id: resource.id,
      values: embedding,
      metadata
    }])

    return { success: true }
  } catch (error) {
    console.error('Error upserting to Pinecone:', error)
    return { success: false, error: error.message }
  }
}

// Search similar resources
export const searchSimilarResources = async (query, userId, topK = 10) => {
  try {
    const index = await getIndex()
    if (!index) return { results: [], error: 'Pinecone not available' }

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)

    // Search in Pinecone
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK,
      filter: { user_id: userId },
      includeMetadata: true
    })

    // Format results
    const results = searchResults.matches?.map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata
    })) || []

    return { results, error: null }
  } catch (error) {
    console.error('Error searching Pinecone:', error)
    return { results: [], error: error.message }
  }
}

// Delete resource from Pinecone
export const deleteResourceVector = async (resourceId) => {
  try {
    const index = await getIndex()
    if (!index) return { success: false, error: 'Pinecone not available' }

    await index.deleteOne(resourceId)
    return { success: true }
  } catch (error) {
    console.error('Error deleting from Pinecone:', error)
    return { success: false, error: error.message }
  }
}

// Get resource recommendations
export const getResourceRecommendations = async (resourceId, userId, topK = 5) => {
  try {
    const index = await getIndex()
    if (!index) return { results: [], error: 'Pinecone not available' }

    // Fetch the resource vector
    const fetchResult = await index.fetch([resourceId])
    const resourceVector = fetchResult.records?.[resourceId]?.values

    if (!resourceVector) {
      return { results: [], error: 'Resource not found in vector database' }
    }

    // Find similar resources
    const searchResults = await index.query({
      vector: resourceVector,
      topK: topK + 1, // +1 to exclude the original resource
      filter: { user_id: userId },
      includeMetadata: true
    })

    // Filter out the original resource and format results
    const results = searchResults.matches
      ?.filter(match => match.id !== resourceId)
      ?.slice(0, topK)
      ?.map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata
      })) || []

    return { results, error: null }
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return { results: [], error: error.message }
  }
}

// Batch operations for initial data sync
export const batchUpsertResources = async (resources) => {
  try {
    const index = await getIndex()
    if (!index) return { success: false, error: 'Pinecone not available' }

    const vectors = []
    
    for (const resource of resources) {
      const textContent = [
        resource.title,
        resource.description,
        resource.content,
        ...(resource.tags || [])
      ].filter(Boolean).join(' ')

      const embedding = await generateEmbedding(textContent)
      
      vectors.push({
        id: resource.id,
        values: embedding,
        metadata: {
          id: resource.id,
          title: resource.title,
          description: resource.description || '',
          type: resource.type,
          url: resource.url || '',
          tags: resource.tags || [],
          space_id: resource.space_id || '',
          classification_id: resource.classification_id || '',
          user_id: resource.user_id,
          created_at: resource.created_at
        }
      })
    }

    // Batch upsert
    await index.upsert(vectors)
    return { success: true }
  } catch (error) {
    console.error('Error batch upserting to Pinecone:', error)
    return { success: false, error: error.message }
  }
}

export { initializePinecone }

