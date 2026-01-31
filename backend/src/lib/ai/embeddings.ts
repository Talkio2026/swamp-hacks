/**
 * Embedding Service for Vector Search
 * Uses OpenRouter embeddings API (OpenAI-compatible)
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const EMBEDDING_MODEL = 'openai/text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokensUsed: number;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // Clean and truncate text if needed (max ~8000 tokens for embedding model)
  const cleanedText = text.slice(0, 30000).trim();

  const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Talkio Sales AI',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: cleanedText,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter Embedding API error: ${error}`);
  }

  const data = await response.json();
  
  return {
    embedding: data.data[0].embedding,
    model: EMBEDDING_MODEL,
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // Clean texts
  const cleanedTexts = texts.map(t => t.slice(0, 30000).trim());

  const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Talkio Sales AI',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: cleanedTexts,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter Embedding API error: ${error}`);
  }

  const data = await response.json();
  
  return data.data.map((item: { embedding: number[]; index: number }) => ({
    embedding: item.embedding,
    model: EMBEDDING_MODEL,
    tokensUsed: Math.floor((data.usage?.total_tokens || 0) / texts.length),
  }));
}

/**
 * Create searchable text from transcript data for embedding
 * Combines all relevant fields into a single searchable string
 */
export function createEmbeddingText(transcript: {
  clientName?: string;
  companyName?: string;
  industry?: string;
  conversation?: { speaker: string; text: string }[];
  analysis?: {
    summary?: string;
    keyPoints?: string[];
    objections?: string[];
    buyingSignals?: string[];
    risks?: string[];
    nextSteps?: string[];
  };
  outcome?: string;
  status?: string;
}): string {
  const parts: string[] = [];

  // Client info
  if (transcript.clientName) {
    parts.push(`Client: ${transcript.clientName}`);
  }
  if (transcript.companyName) {
    parts.push(`Company: ${transcript.companyName}`);
  }
  if (transcript.industry) {
    parts.push(`Industry: ${transcript.industry}`);
  }

  // Status and outcome
  if (transcript.status) {
    parts.push(`Call Status: ${transcript.status.replace(/_/g, ' ')}`);
  }
  if (transcript.outcome) {
    parts.push(`Outcome: ${transcript.outcome.replace(/_/g, ' ')}`);
  }

  // Analysis summary
  if (transcript.analysis?.summary) {
    parts.push(`Summary: ${transcript.analysis.summary}`);
  }

  // Key points
  if (transcript.analysis?.keyPoints?.length) {
    parts.push(`Key Points: ${transcript.analysis.keyPoints.join('. ')}`);
  }

  // Objections (important for sales coaching)
  if (transcript.analysis?.objections?.length) {
    parts.push(`Client Objections: ${transcript.analysis.objections.join('. ')}`);
  }

  // Buying signals
  if (transcript.analysis?.buyingSignals?.length) {
    parts.push(`Buying Signals: ${transcript.analysis.buyingSignals.join('. ')}`);
  }

  // Risks
  if (transcript.analysis?.risks?.length) {
    parts.push(`Risks: ${transcript.analysis.risks.join('. ')}`);
  }

  // Next steps
  if (transcript.analysis?.nextSteps?.length) {
    parts.push(`Next Steps: ${transcript.analysis.nextSteps.join('. ')}`);
  }

  // Conversation highlights (first and last few exchanges)
  if (transcript.conversation?.length) {
    const conv = transcript.conversation;
    const highlights = [
      ...conv.slice(0, 5),  // First 5 exchanges
      ...conv.slice(-5),   // Last 5 exchanges
    ];
    const uniqueHighlights = highlights.filter((h, i, arr) => 
      arr.findIndex(x => x.text === h.text) === i
    );
    const convText = uniqueHighlights
      .map(c => `${c.speaker === 'sales_representative' ? 'Rep' : 'Client'}: ${c.text}`)
      .join(' ');
    parts.push(`Conversation Highlights: ${convText}`);
  }

  return parts.join('\n\n');
}

/**
 * Check if embedding service is configured
 */
export function isEmbeddingConfigured(): boolean {
  return !!OPENROUTER_API_KEY;
}

export { EMBEDDING_DIMENSIONS };
