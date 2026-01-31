import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import Transcript from "@/lib/models/Transcript";
import { getProvider } from "@/lib/ai/providers";
import { buildClientAgentPrompt } from "@/lib/ai/prompts/client-agent";

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

interface ClientAgentResult {
  relationshipSummary: string;
  clientProfile: {
    communicationStyle: string;
    decisionMakingProcess: string;
    keyPriorities: string[];
    painPoints: string[];
  };
  relationshipTimeline: Array<{
    callNumber: number;
    date: string;
    milestone: string;
  }>;
  progressionAnalysis: {
    startingStage: string;
    currentStage: string;
    stageProgression: string;
    velocityAssessment: string;
  };
  sentimentTrend: {
    overall: string;
    trend: string;
    analysis: string;
  };
  objectionsHistory: Array<{
    objection: string;
    whenRaised: string;
    status: string;
    resolution: string;
  }>;
  competitorIntelligence: {
    mentioned: string[];
    clientPerception: string;
    differentiators: string;
  };
  buyingSignals: string[];
  risks: Array<{
    risk: string;
    severity: string;
    mitigation: string;
  }>;
  recommendedStrategy: {
    immediateActions: string[];
    talkingPoints: string[];
    questionsToAsk: string[];
    avoidTopics: string[];
  };
  nextBestAction: string;
  dealProbability: {
    percentage: number;
    rationale: string;
  };
  modelUsed: string;
  generatedAt: Date;
  processingTimeMs: number;
}

// POST /api/clients/[clientId]/agent-summary - Generate AI agent summary for a client
export async function POST(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch the client
    const client = await Client.findOne({ clientId });
    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Fetch all transcripts for this client
    const transcripts = await Transcript.find({ clientId }).sort({ createdAt: 1 });

    if (transcripts.length === 0) {
      return NextResponse.json(
        { error: "No transcripts found for this client. Make some calls first!" },
        { status: 400 }
      );
    }

    // Check for force refresh parameter
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    // Check if we have a valid cached summary
    // Cache is valid if transcript count matches (no new calls added)
    if (
      !forceRefresh &&
      client.agentSummary &&
      client.agentSummaryTranscriptCount === transcripts.length
    ) {
      console.log(`[Client Agent] Returning cached summary for ${clientId} (${transcripts.length} transcripts)`);
      
      return NextResponse.json({
        success: true,
        cached: true,
        clientId,
        clientName: client.clientName,
        companyName: client.companyName,
        totalTranscripts: transcripts.length,
        summary: client.agentSummary,
      });
    }

    console.log(`[Client Agent] Generating new summary for ${clientId} (${transcripts.length} transcripts, cached: ${client.agentSummaryTranscriptCount || 0})`);

    // Build the prompt
    const prompt = buildClientAgentPrompt({
      client: {
        clientName: client.clientName,
        companyName: client.companyName,
        industry: client.industry,
        contactEmail: client.contactEmail,
        contactPhone: client.contactPhone,
        salesRepName: client.salesRepName,
        currentStatus: client.currentStatus,
        totalCalls: client.totalCalls,
        initialNotes: client.initialNotes,
      },
      transcripts: transcripts.map(t => ({
        callNumber: t.callNumber,
        createdAt: t.createdAt?.toISOString(),
        sentiment: t.sentiment,
        status: t.status,
        analysis: t.analysis,
        conversation: t.conversation,
      })),
    });

    // Get the LLM provider - try Gemini first, fallback to OpenRouter
    let provider = getProvider({ provider: 'gemini' });
    let response: string;
    
    try {
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        throw new Error('Gemini not available');
      }
      response = await provider.analyze(prompt);
    } catch (error) {
      console.log('[Client Agent] Gemini failed, falling back to OpenRouter...');
      console.error('[Client Agent] Primary error:', error);
      
      provider = getProvider({ provider: 'openrouter', model: 'claude-3-sonnet' });
      const fallbackAvailable = await provider.isAvailable();
      if (!fallbackAvailable) {
        throw new Error('No AI provider available. Please check your API keys.');
      }
      response = await provider.analyze(prompt);
    }

    const processingTimeMs = Date.now() - startTime;

    // Parse the response
    let result: ClientAgentResult;
    try {
      // Extract JSON from the response
      let jsonStr = response;
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonStr = objectMatch[0];
      }
      
      const parsed = JSON.parse(jsonStr);
      
      result = {
        relationshipSummary: parsed.relationshipSummary || 'Analysis completed',
        clientProfile: parsed.clientProfile || {
          communicationStyle: 'Unknown',
          decisionMakingProcess: 'Unknown',
          keyPriorities: [],
          painPoints: [],
        },
        relationshipTimeline: parsed.relationshipTimeline || [],
        progressionAnalysis: parsed.progressionAnalysis || {
          startingStage: 'initial_contact',
          currentStage: 'initial_contact',
          stageProgression: 'Unknown',
          velocityAssessment: 'Unknown',
        },
        sentimentTrend: parsed.sentimentTrend || {
          overall: 'neutral',
          trend: 'stable',
          analysis: 'Insufficient data',
        },
        objectionsHistory: parsed.objectionsHistory || [],
        competitorIntelligence: parsed.competitorIntelligence || {
          mentioned: [],
          clientPerception: 'None mentioned',
          differentiators: 'None identified',
        },
        buyingSignals: parsed.buyingSignals || [],
        risks: parsed.risks || [],
        recommendedStrategy: parsed.recommendedStrategy || {
          immediateActions: [],
          talkingPoints: [],
          questionsToAsk: [],
          avoidTopics: [],
        },
        nextBestAction: parsed.nextBestAction || 'Follow up with the client',
        dealProbability: parsed.dealProbability || {
          percentage: 50,
          rationale: 'Insufficient data for accurate prediction',
        },
        modelUsed: `${provider.name}/${provider.modelId}`,
        generatedAt: new Date(),
        processingTimeMs,
      };
    } catch (parseError) {
      console.error('[Client Agent] Failed to parse response:', parseError);
      console.error('[Client Agent] Raw response:', response);
      
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`[Client Agent] Generated summary for ${clientId} in ${processingTimeMs}ms`);

    // Cache the result in the client document
    client.agentSummary = result;
    client.agentSummaryTranscriptCount = transcripts.length;
    await client.save();
    
    console.log(`[Client Agent] Cached summary for ${clientId} (${transcripts.length} transcripts)`);

    return NextResponse.json({
      success: true,
      cached: false,
      clientId,
      clientName: client.clientName,
      companyName: client.companyName,
      totalTranscripts: transcripts.length,
      summary: result,
    });

  } catch (error) {
    console.error("[API] POST /api/clients/[clientId]/agent-summary error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate client summary", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// GET /api/clients/[clientId]/agent-summary - Get cached summary
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch the client
    const client = await Client.findOne({ clientId });
    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Get current transcript count
    const transcriptCount = await Transcript.countDocuments({ clientId });

    // Check if we have a cached summary
    if (client.agentSummary) {
      const isStale = client.agentSummaryTranscriptCount !== transcriptCount;
      
      return NextResponse.json({
        success: true,
        hasCachedSummary: true,
        isStale, // True if there are new transcripts since last generation
        clientId,
        clientName: client.clientName,
        companyName: client.companyName,
        cachedTranscriptCount: client.agentSummaryTranscriptCount,
        currentTranscriptCount: transcriptCount,
        summary: client.agentSummary,
      });
    }

    return NextResponse.json({
      success: true,
      hasCachedSummary: false,
      clientId,
      clientName: client.clientName,
      currentTranscriptCount: transcriptCount,
      message: "No cached summary. Use POST to generate one.",
    });

  } catch (error) {
    console.error("[API] GET /api/clients/[clientId]/agent-summary error:", error);
    return NextResponse.json(
      { error: "Failed to get client summary" },
      { status: 500 }
    );
  }
}
