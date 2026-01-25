import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateInsights, QUICK_INSIGHTS, QuickInsightKey } from '@/lib/ai/rag-insights';
import { OpenRouterModel } from '@/lib/ai/types';

export const maxDuration = 60; // Allow longer execution for RAG

interface ChatRequest {
  message: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  quickInsightKey?: QuickInsightKey;
  filters?: {
    clientId?: string;
    industry?: string;
    outcome?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  model?: OpenRouterModel;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if OpenRouter is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API is not configured. Please add OPENROUTER_API_KEY to your environment.' },
        { status: 500 }
      );
    }

    const body: ChatRequest = await request.json();
    const { message, conversationHistory = [], quickInsightKey, filters = {}, model = 'claude-3-haiku' } = body;

    // Use quick insight question if key provided
    const question = quickInsightKey && QUICK_INSIGHTS[quickInsightKey] 
      ? QUICK_INSIGHTS[quickInsightKey] 
      : message;

    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const searchFilters = {
      ...filters,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    };

    // Generate insights using RAG
    const response = await generateInsights({
      question,
      conversationHistory,
      filters: searchFilters,
      model,
    });

    return NextResponse.json({
      message: response.answer,
      sources: response.sources,
      stats: response.aggregatedStats,
      model: response.model,
      processingTimeMs: response.processingTimeMs,
    });
  } catch (error) {
    console.error('[API] POST /api/insights/chat error:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Embedding service is not configured')) {
        return NextResponse.json(
          { 
            error: 'Vector search is not fully configured. Please add OPENROUTER_API_KEY for embeddings.',
            fallbackAvailable: true,
          },
          { status: 500 }
        );
      }
      
      if (error.message.includes('OpenRouter')) {
        return NextResponse.json(
          { error: 'AI service temporarily unavailable. Please try again.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate insights. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to check service status and get quick insights options
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const openRouterConfigured = !!process.env.OPENROUTER_API_KEY;
    const embeddingConfigured = !!process.env.OPENROUTER_API_KEY;

    return NextResponse.json({
      status: openRouterConfigured ? 'ready' : 'not_configured',
      vectorSearchEnabled: embeddingConfigured,
      quickInsights: Object.entries(QUICK_INSIGHTS).map(([key, question]) => ({
        key,
        question,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      })),
      availableModels: [
        { id: 'claude-3-haiku', name: 'Claude 3 Haiku', speed: 'fast', quality: 'good' },
        { id: 'claude-3-sonnet', name: 'Claude 3.5 Sonnet', speed: 'medium', quality: 'excellent' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', speed: 'fast', quality: 'good' },
      ],
    });
  } catch (error) {
    console.error('[API] GET /api/insights/chat error:', error);
    return NextResponse.json(
      { error: 'Failed to check service status' },
      { status: 500 }
    );
  }
}
