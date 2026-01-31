import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/mongodb'
import Transcript from '@/lib/models/Transcript'
import type { ITranscript } from '@/lib/models/Transcript'
import { analyzeTranscript } from '@/lib/ai/analyzer'
import { ProviderConfig, OpenRouterModel, OPENROUTER_MODELS } from '@/lib/ai/types'
import { generateTranscriptEmbedding } from '@/lib/ai/vector-search'
import { isEmbeddingConfigured } from '@/lib/ai/embeddings'

interface RouteContext {
  params: Promise<{ callSid: string }>
}

// GET - Fetch existing analysis for a transcript
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { callSid } = await context.params
    
    await connectToDatabase()
    
    const transcript = await Transcript.findOne({ callSid })
    
    if (!transcript) {
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 })
    }
    
    // Return the analysis if it exists
    if (transcript.analysis) {
      return NextResponse.json({
        hasAnalysis: true,
        analysis: transcript.analysis,
      })
    }
    
    return NextResponse.json({
      hasAnalysis: false,
      analysis: null,
    })
  } catch (error) {
    console.error('Error fetching analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    )
  }
}

// POST - Run analysis on a transcript
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { callSid } = await context.params
    const body = await request.json().catch(() => ({}))
    
    // Parse provider configuration
    const config: ProviderConfig = {
      provider: body.provider || 'gemini',
      model: body.model as OpenRouterModel,
    }
    
    // Validate OpenRouter model if specified
    if (config.provider === 'openrouter' && config.model) {
      if (!(config.model in OPENROUTER_MODELS)) {
        return NextResponse.json(
          { error: `Invalid model: ${config.model}` },
          { status: 400 }
        )
      }
    }
    
    await connectToDatabase()
    
    const transcript = await Transcript.findOne({ callSid })
    
    if (!transcript) {
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 })
    }
    
    if (!transcript.conversation || transcript.conversation.length === 0) {
      return NextResponse.json(
        { error: 'Transcript has no conversation data to analyze' },
        { status: 400 }
      )
    }
    
    // Run the analysis
    console.log(`[Analysis] Starting analysis for callSid: ${callSid} with ${config.provider}`)
    const analysis = await analyzeTranscript(transcript, config)
    console.log(`[Analysis] Completed in ${analysis.processingTimeMs}ms`)
    
    // Save the analysis to the transcript
    transcript.analysis = analysis
    
    // Also update some transcript fields based on analysis
    if (analysis.overallSentiment) {
      transcript.sentiment = analysis.overallSentiment
    }
    if (analysis.currentStage) {
      transcript.status = mapStageToStatus(analysis.currentStage)
    }
    if (analysis.nextSteps && analysis.nextSteps.length > 0) {
      transcript.nextAction = analysis.nextSteps[0]
    }
    
    await transcript.save()
    
    // Generate embedding for vector search (non-blocking)
    if (isEmbeddingConfigured()) {
      generateTranscriptEmbedding(callSid).catch(err => {
        console.warn(`[Analysis] Failed to generate embedding for ${callSid}:`, err.message)
      })
    }
    
    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('Error running analysis:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze transcript' },
      { status: 500 }
    )
  }
}

// Map analysis stage to transcript status
function mapStageToStatus(stage: string): ITranscript['status'] {
  const stageMap: Record<string, ITranscript['status']> = {
    'initial_contact': 'initial_contact',
    'discovery': 'initial_contact',
    'demo': 'demo',
    'proposal': 'followup',
    'negotiation': 'negotiation',
    'closing': 'negotiation',
    'closed_won': 'contract_accepted',
    'closed_lost': 'rejected',
  }
  return stageMap[stage] || 'in_progress'
}
