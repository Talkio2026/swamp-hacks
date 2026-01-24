import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getScenarioById } from '@/lib/training/scenarios'
import { getProvider } from '@/lib/ai/providers'

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

// POST /api/training/respond - Generate AI prospect response (text mode)
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { scenarioId, conversation } = body as {
      scenarioId: string
      conversation: ConversationTurn[]
    }

    const scenario = getScenarioById(scenarioId)
    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      )
    }

    // Build conversation prompt
    const conversationHistory = conversation
      .map(turn => `${turn.role === 'user' ? 'Sales Rep' : scenario.persona.name}: ${turn.content}`)
      .join('\n')

    const prompt = `${scenario.systemPrompt}

CONVERSATION SO FAR:
${conversationHistory}

Now respond as ${scenario.persona.name}. Stay in character. Be natural and conversational. 
Respond with just your dialogue - no actions or stage directions.
Keep responses concise (1-3 sentences typically).`

    // Get AI provider
    const provider = getProvider({ provider: 'gemini' })
    
    let response: string
    try {
      response = await provider.analyze(prompt)
    } catch {
      // Fallback to OpenRouter
      const fallbackProvider = getProvider({ provider: 'openrouter', model: 'claude-3-sonnet' })
      response = await fallbackProvider.analyze(prompt)
    }

    // Clean up the response (remove any "Name:" prefix if present)
    let cleanResponse = response.trim()
    const namePrefix = `${scenario.persona.name}:`
    if (cleanResponse.startsWith(namePrefix)) {
      cleanResponse = cleanResponse.slice(namePrefix.length).trim()
    }
    
    // Remove quotes if the response is wrapped in them
    if (cleanResponse.startsWith('"') && cleanResponse.endsWith('"')) {
      cleanResponse = cleanResponse.slice(1, -1)
    }

    return NextResponse.json({
      response: cleanResponse,
    })
  } catch (error) {
    console.error('[Training] Response generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
