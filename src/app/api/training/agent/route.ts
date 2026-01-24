import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getScenarioById, TrainingScenario } from '@/lib/training/scenarios'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

interface ElevenLabsAgent {
  agent_id: string
  name: string
}

// POST /api/training/agent - Create or get an ElevenLabs agent for a training scenario
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key') {
      // Return mock mode if no API key
      return NextResponse.json({
        mode: 'mock',
        message: 'ElevenLabs API key not configured. Using text-only mode.',
      })
    }

    const body = await request.json()
    const { scenarioId } = body

    const scenario = getScenarioById(scenarioId)
    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      )
    }

    // Create a conversational AI agent with the scenario's persona
    const agent = await createElevenLabsAgent(scenario)
    
    return NextResponse.json({
      mode: 'voice',
      agentId: agent.agent_id,
      agentName: agent.name,
      scenario: {
        id: scenario.id,
        name: scenario.name,
        persona: scenario.persona,
        objectives: scenario.objectives,
      },
    })
  } catch (error) {
    console.error('[Training] Error creating agent:', error)
    return NextResponse.json(
      { error: 'Failed to create training agent' },
      { status: 500 }
    )
  }
}

async function createElevenLabsAgent(scenario: TrainingScenario): Promise<ElevenLabsAgent> {
  const agentConfig = {
    name: `Training: ${scenario.persona.name}`,
    conversation_config: {
      agent: {
        prompt: {
          prompt: scenario.systemPrompt,
        },
        first_message: getFirstMessage(scenario),
        language: 'en',
      },
      asr: {
        quality: 'high',
        provider: 'elevenlabs',
      },
      tts: {
        voice_id: scenario.voiceId || 'ErXwobaYiN019PkySvjV', // Default to Antoni
        model_id: 'eleven_turbo_v2_5',
        stability: 0.5,
        similarity_boost: 0.75,
      },
      turn: {
        turn_timeout: 10, // seconds
        mode: 'turn_based',
      },
    },
    platform_settings: {
      widget: {
        variant: 'compact',
      },
    },
  }

  const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agentConfig),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[Training] ElevenLabs agent creation error:', error)
    throw new Error('Failed to create ElevenLabs agent')
  }

  return response.json()
}

function getFirstMessage(scenario: TrainingScenario): string {
  // Generate contextually appropriate first message based on scenario
  switch (scenario.category) {
    case 'cold-call':
      return `Hello? Who is this?`
    case 'discovery':
      return `Hi, thanks for jumping on the call. I have about 30 minutes. What would you like to cover today?`
    case 'objection-handling':
      return `Hey! Good to connect again. So, I've been thinking about what you showed me... I have some concerns about the pricing we need to discuss.`
    case 'closing':
      return `Hi there. So... I think we're at decision time. I've been thinking a lot about this.`
    case 'demo':
      return `Thanks for setting this up. I've seen a couple other demos already, so I know what I'm looking for. Let's dive in.`
    default:
      return `Hello, thanks for calling.`
  }
}
