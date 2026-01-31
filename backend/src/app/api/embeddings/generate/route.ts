import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateTranscriptEmbedding, generateMissingEmbeddings } from '@/lib/ai/vector-search';
import { isEmbeddingConfigured } from '@/lib/ai/embeddings';

/**
 * POST /api/embeddings/generate
 * Generate embeddings for transcripts
 * 
 * Body:
 * - callSid?: string - Generate for specific transcript
 * - batchSize?: number - Generate for multiple missing transcripts (default: 10)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!userId && !isDev) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isEmbeddingConfigured()) {
      return NextResponse.json(
        { error: 'Embedding service is not configured. Please add OPENROUTER_API_KEY to your environment.' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { callSid, batchSize = 10 } = body;

    if (callSid) {
      // Generate for specific transcript
      await generateTranscriptEmbedding(callSid);
      return NextResponse.json({
        success: true,
        message: `Embedding generated for transcript: ${callSid}`,
      });
    } else {
      // Generate for batch of missing transcripts
      const generated = await generateMissingEmbeddings(batchSize);
      return NextResponse.json({
        success: true,
        generated,
        message: `Generated ${generated} embeddings`,
      });
    }
  } catch (error) {
    console.error('[API] POST /api/embeddings/generate error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate embeddings', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/embeddings/generate
 * Check embedding status
 */
export async function GET() {
  try {
    const { userId } = await auth();
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!userId && !isDev) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const configured = isEmbeddingConfigured();

    return NextResponse.json({
      configured,
      model: 'text-embedding-3-small',
      dimensions: 1536,
      note: configured 
        ? 'Embedding service is ready. POST to generate embeddings for transcripts.'
        : 'Please add OPENROUTER_API_KEY to enable embedding generation.',
    });
  } catch (error) {
    console.error('[API] GET /api/embeddings/generate error:', error);
    return NextResponse.json(
      { error: 'Failed to check embedding status' },
      { status: 500 }
    );
  }
}
