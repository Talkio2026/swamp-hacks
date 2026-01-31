/**
 * MongoDB Atlas Vector Search Service
 * Provides semantic search across all transcripts
 */

import connectDB from '@/lib/mongodb';
import Transcript, { ITranscript } from '@/lib/models/Transcript';
import { generateEmbedding, createEmbeddingText, isEmbeddingConfigured } from './embeddings';

// Vector search index name (must match what's configured in MongoDB Atlas)
const VECTOR_INDEX_NAME = 'transcript_vector_index';

export interface VectorSearchResult {
  transcript: ITranscript;
  score: number;
}

export interface SearchFilters {
  salesRepEmail?: string;
  clientId?: string;
  industry?: string;
  outcome?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Perform vector search to find semantically similar transcripts
 */
export async function vectorSearch(
  query: string,
  options: {
    limit?: number;
    filters?: SearchFilters;
    minScore?: number;
  } = {}
): Promise<VectorSearchResult[]> {
  const { limit = 5, filters = {}, minScore = 0.5 } = options;

  if (!isEmbeddingConfigured()) {
    throw new Error('Embedding service is not configured. Please add OPENROUTER_API_KEY to your environment.');
  }

  await connectDB();

  // Generate embedding for the query
  const { embedding: queryEmbedding } = await generateEmbedding(query);

  // Build filter conditions
  const filterConditions: Record<string, unknown> = {};
  
  if (filters.salesRepEmail) {
    filterConditions.salesRepEmail = filters.salesRepEmail;
  }
  if (filters.clientId) {
    filterConditions.clientId = filters.clientId;
  }
  if (filters.industry) {
    filterConditions.industry = filters.industry;
  }
  if (filters.outcome) {
    filterConditions.outcome = filters.outcome;
  }
  if (filters.status) {
    filterConditions.status = filters.status;
  }
  if (filters.dateFrom || filters.dateTo) {
    filterConditions.createdAt = {};
    if (filters.dateFrom) {
      (filterConditions.createdAt as Record<string, Date>).$gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      (filterConditions.createdAt as Record<string, Date>).$lte = filters.dateTo;
    }
  }

  // MongoDB Atlas Vector Search aggregation pipeline
  const pipeline = [
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: limit * 10, // Search more candidates for better results
        limit: limit,
        filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined,
      },
    },
    {
      $project: {
        _id: 1,
        callSid: 1,
        clientName: 1,
        companyName: 1,
        industry: 1,
        salesRepName: 1,
        salesRepEmail: 1,
        createdAt: 1,
        sentiment: 1,
        status: 1,
        outcome: 1,
        conversation: 1,
        analysis: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
    {
      $match: {
        score: { $gte: minScore },
      },
    },
  ];

  try {
    const results = await Transcript.aggregate(pipeline);
    
    return results.map((doc) => ({
      transcript: doc as ITranscript,
      score: doc.score,
    }));
  } catch (error) {
    // If vector search fails (e.g., index not created), fall back to text search
    console.error('[VectorSearch] Vector search failed, falling back to text search:', error);
    return fallbackTextSearch(query, limit, filters);
  }
}

/**
 * Fallback text search when vector search is not available
 */
async function fallbackTextSearch(
  query: string,
  limit: number,
  filters: SearchFilters
): Promise<VectorSearchResult[]> {
  await connectDB();

  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  
  const matchConditions: Record<string, unknown> = {
    $or: [
      { 'analysis.summary': { $regex: searchTerms.join('|'), $options: 'i' } },
      { 'analysis.objections': { $elemMatch: { $regex: searchTerms.join('|'), $options: 'i' } } },
      { 'analysis.keyPoints': { $elemMatch: { $regex: searchTerms.join('|'), $options: 'i' } } },
      { clientName: { $regex: searchTerms.join('|'), $options: 'i' } },
      { companyName: { $regex: searchTerms.join('|'), $options: 'i' } },
    ],
  };

  // Add filters
  if (filters.salesRepEmail) {
    matchConditions.salesRepEmail = filters.salesRepEmail;
  }
  if (filters.clientId) {
    matchConditions.clientId = filters.clientId;
  }
  if (filters.industry) {
    matchConditions.industry = filters.industry;
  }
  if (filters.outcome) {
    matchConditions.outcome = filters.outcome;
  }
  if (filters.status) {
    matchConditions.status = filters.status;
  }

  const results = await Transcript.find(matchConditions)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Return with fake scores for fallback
  return results.map((doc) => ({
    transcript: doc as ITranscript,
    score: 0.7, // Default score for text matches
  }));
}

/**
 * Generate and store embedding for a transcript
 */
export async function generateTranscriptEmbedding(callSid: string): Promise<void> {
  if (!isEmbeddingConfigured()) {
    console.warn('[VectorSearch] Embedding service not configured, skipping embedding generation');
    return;
  }

  await connectDB();

  const transcript = await Transcript.findOne({ callSid });
  if (!transcript) {
    throw new Error(`Transcript not found: ${callSid}`);
  }

  // Create searchable text
  const embeddingText = createEmbeddingText({
    clientName: transcript.clientName,
    companyName: transcript.companyName,
    industry: transcript.industry,
    conversation: transcript.conversation,
    analysis: transcript.analysis,
    outcome: transcript.outcome,
    status: transcript.status,
  });

  // Generate embedding
  const { embedding } = await generateEmbedding(embeddingText);

  // Store embedding
  await Transcript.updateOne(
    { callSid },
    {
      $set: {
        embedding,
        embeddingText,
        embeddingGeneratedAt: new Date(),
      },
    }
  );

  console.log(`[VectorSearch] Generated embedding for transcript: ${callSid}`);
}

/**
 * Batch generate embeddings for all transcripts without embeddings
 */
export async function generateMissingEmbeddings(batchSize: number = 10): Promise<number> {
  if (!isEmbeddingConfigured()) {
    console.warn('[VectorSearch] Embedding service not configured');
    return 0;
  }

  await connectDB();

  // Find transcripts without embeddings
  const transcripts = await Transcript.find({
    embedding: { $exists: false },
    'analysis.summary': { $exists: true }, // Only embed analyzed transcripts
  })
    .limit(batchSize)
    .lean();

  let generated = 0;

  for (const transcript of transcripts) {
    try {
      await generateTranscriptEmbedding(transcript.callSid);
      generated++;
    } catch (error) {
      console.error(`[VectorSearch] Failed to generate embedding for ${transcript.callSid}:`, error);
    }
  }

  console.log(`[VectorSearch] Generated ${generated} embeddings`);
  return generated;
}

/**
 * Get aggregated insights from transcripts
 */
export async function getAggregatedInsights(salesRepEmail?: string): Promise<{
  totalCalls: number;
  avgSentiment: Record<string, number>;
  topObjections: { objection: string; count: number }[];
  topBuyingSignals: { signal: string; count: number }[];
  outcomeBreakdown: Record<string, number>;
  avgInterestLevel: Record<string, number>;
}> {
  await connectDB();

  const matchStage: Record<string, unknown> = {
    'analysis.summary': { $exists: true },
  };
  
  if (salesRepEmail) {
    matchStage.salesRepEmail = salesRepEmail;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        totalCalls: [{ $count: 'count' }],
        sentimentBreakdown: [
          { $group: { _id: '$sentiment', count: { $sum: 1 } } },
        ],
        outcomeBreakdown: [
          { $match: { outcome: { $exists: true } } },
          { $group: { _id: '$outcome', count: { $sum: 1 } } },
        ],
        interestLevelBreakdown: [
          { $match: { 'analysis.clientInterestLevel': { $exists: true } } },
          { $group: { _id: '$analysis.clientInterestLevel', count: { $sum: 1 } } },
        ],
        objections: [
          { $unwind: '$analysis.objections' },
          { $group: { _id: '$analysis.objections', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ],
        buyingSignals: [
          { $unwind: '$analysis.buyingSignals' },
          { $group: { _id: '$analysis.buyingSignals', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ],
      },
    },
  ];

  const [result] = await Transcript.aggregate(pipeline);

  return {
    totalCalls: result.totalCalls[0]?.count || 0,
    avgSentiment: result.sentimentBreakdown.reduce(
      (acc: Record<string, number>, item: { _id: string; count: number }) => {
        acc[item._id] = item.count;
        return acc;
      },
      {}
    ),
    outcomeBreakdown: result.outcomeBreakdown.reduce(
      (acc: Record<string, number>, item: { _id: string; count: number }) => {
        acc[item._id] = item.count;
        return acc;
      },
      {}
    ),
    avgInterestLevel: result.interestLevelBreakdown.reduce(
      (acc: Record<string, number>, item: { _id: string; count: number }) => {
        acc[item._id] = item.count;
        return acc;
      },
      {}
    ),
    topObjections: result.objections.map((item: { _id: string; count: number }) => ({
      objection: item._id,
      count: item.count,
    })),
    topBuyingSignals: result.buyingSignals.map((item: { _id: string; count: number }) => ({
      signal: item._id,
      count: item.count,
    })),
  };
}
