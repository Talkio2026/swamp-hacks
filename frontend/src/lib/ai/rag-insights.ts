/**
 * RAG (Retrieval Augmented Generation) Service for Sales Insights
 * Combines MongoDB Vector Search with OpenRouter LLM generation
 */

import { vectorSearch, VectorSearchResult, SearchFilters, getAggregatedInsights } from './vector-search';
import { OpenRouterProvider } from './providers';
import { OpenRouterModel } from './types';

export interface InsightQuery {
  question: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  filters?: SearchFilters;
  model?: OpenRouterModel;
}

export interface InsightResponse {
  answer: string;
  sources: {
    callSid: string;
    clientName: string;
    companyName?: string;
    summary: string;
    relevanceScore: number;
  }[];
  aggregatedStats?: {
    totalCallsAnalyzed: number;
    topObjections: string[];
    topBuyingSignals: string[];
  };
  model: string;
  processingTimeMs: number;
}

/**
 * System prompt for the sales insights RAG assistant
 */
const INSIGHTS_SYSTEM_PROMPT = `You are an expert B2B Sales Coach and Performance Analyst for a sales team. Your role is to help sales representatives understand their performance, identify patterns across their calls, and provide actionable coaching advice.

You have access to the sales rep's call transcripts, including:
- Call summaries and key points
- Client objections raised during calls
- Buying signals identified
- Call outcomes and next steps
- Sentiment analysis

GUIDELINES:
1. Be specific and cite actual examples from the provided call data
2. Identify patterns and trends across multiple calls
3. Provide actionable, practical advice
4. Be encouraging but honest about areas for improvement
5. Use data to back up your observations
6. When discussing objections or issues, also suggest how to handle them better
7. Keep responses focused and concise (2-4 paragraphs typically)
8. If asked about specific metrics, provide numbers when available

RESPONSE FORMAT:
- Start with a direct answer to the question
- Support with specific examples from the calls when relevant
- End with actionable recommendations if appropriate

Remember: You're helping the sales rep improve their performance, not just analyzing data.`;

/**
 * Format transcript data for the LLM context
 */
function formatTranscriptsForContext(results: VectorSearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant call data found.';
  }

  return results.map((result, index) => {
    const t = result.transcript;
    const parts: string[] = [];
    
    parts.push(`### Call ${index + 1} (Relevance: ${(result.score * 100).toFixed(0)}%)`);
    parts.push(`**Client:** ${t.clientName || 'Unknown'} ${t.companyName ? `(${t.companyName})` : ''}`);
    
    if (t.industry) {
      parts.push(`**Industry:** ${t.industry}`);
    }
    
    if (t.createdAt) {
      parts.push(`**Date:** ${new Date(t.createdAt).toLocaleDateString()}`);
    }
    
    if (t.outcome) {
      parts.push(`**Outcome:** ${t.outcome.replace(/_/g, ' ')}`);
    }
    
    if (t.analysis?.summary) {
      parts.push(`**Summary:** ${t.analysis.summary}`);
    }
    
    if (t.analysis?.objections?.length) {
      parts.push(`**Objections Raised:** ${t.analysis.objections.join('; ')}`);
    }
    
    if (t.analysis?.buyingSignals?.length) {
      parts.push(`**Buying Signals:** ${t.analysis.buyingSignals.join('; ')}`);
    }
    
    if (t.analysis?.risks?.length) {
      parts.push(`**Risks Identified:** ${t.analysis.risks.join('; ')}`);
    }
    
    if (t.analysis?.keyPoints?.length) {
      parts.push(`**Key Points:** ${t.analysis.keyPoints.slice(0, 3).join('; ')}`);
    }

    return parts.join('\n');
  }).join('\n\n---\n\n');
}

/**
 * Generate insights using RAG
 */
export async function generateInsights(query: InsightQuery): Promise<InsightResponse> {
  const startTime = Date.now();
  const { question, conversationHistory = [], filters = {}, model = 'claude-3-haiku' } = query;

  // 1. Perform vector search to find relevant transcripts
  const searchResults = await vectorSearch(question, {
    limit: 6,
    filters,
    minScore: 0.4,
  });

  // 2. Get aggregated stats for additional context
  const aggregatedStats = await getAggregatedInsights(filters.salesRepEmail);

  // 3. Build context from retrieved documents
  const transcriptContext = formatTranscriptsForContext(searchResults);
  
  const statsContext = `
## Your Overall Performance Stats:
- **Total Calls Analyzed:** ${aggregatedStats.totalCalls}
- **Top Objections You Encounter:** ${aggregatedStats.topObjections.slice(0, 5).map(o => o.objection).join(', ') || 'None identified'}
- **Common Buying Signals:** ${aggregatedStats.topBuyingSignals.slice(0, 5).map(s => s.signal).join(', ') || 'None identified'}
- **Outcome Breakdown:** ${Object.entries(aggregatedStats.outcomeBreakdown).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ') || 'N/A'}
- **Interest Level Distribution:** ${Object.entries(aggregatedStats.avgInterestLevel).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}
`;

  // 4. Build the full prompt
  const fullContext = `${statsContext}\n\n## Relevant Calls for Your Question:\n\n${transcriptContext}`;
  
  const messages = [
    { role: 'system' as const, content: INSIGHTS_SYSTEM_PROMPT },
    ...conversationHistory.slice(-6), // Keep last 6 messages for context
    { 
      role: 'user' as const, 
      content: `Based on the following call data and performance metrics, please answer this question:

**Question:** ${question}

---
${fullContext}
---

Please provide a helpful, specific answer based on this data.`
    },
  ];

  // 5. Generate response using OpenRouter
  const provider = new OpenRouterProvider(model);
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Talkio Sales Insights',
    },
    body: JSON.stringify({
      model: provider.modelId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.4,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  const answer = data.choices[0]?.message?.content || 'I could not generate a response. Please try again.';

  const processingTimeMs = Date.now() - startTime;

  return {
    answer,
    sources: searchResults.map(r => ({
      callSid: r.transcript.callSid,
      clientName: r.transcript.clientName || 'Unknown',
      companyName: r.transcript.companyName,
      summary: r.transcript.analysis?.summary || 'No summary available',
      relevanceScore: r.score,
    })),
    aggregatedStats: {
      totalCallsAnalyzed: aggregatedStats.totalCalls,
      topObjections: aggregatedStats.topObjections.slice(0, 5).map(o => o.objection),
      topBuyingSignals: aggregatedStats.topBuyingSignals.slice(0, 5).map(s => s.signal),
    },
    model: provider.modelId,
    processingTimeMs,
  };
}

/**
 * Quick insights - predefined queries for common questions
 */
export const QUICK_INSIGHTS = {
  performance: "How am I performing overall? What are my strengths and areas for improvement?",
  objections: "What are the most common objections I face and how can I handle them better?",
  patterns: "What patterns do you see in my successful vs unsuccessful calls?",
  improvement: "Based on my call history, what's the one thing I should focus on improving?",
  buyingSignals: "Am I recognizing and responding to buying signals effectively?",
  closing: "How can I improve my closing techniques based on my call data?",
  discovery: "How well am I conducting discovery calls? What questions should I ask more?",
  followUp: "Am I following up effectively? What calls need immediate attention?",
} as const;

export type QuickInsightKey = keyof typeof QUICK_INSIGHTS;
