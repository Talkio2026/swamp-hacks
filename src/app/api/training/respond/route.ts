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

    const prompt = `ROLE: You are playing ${scenario.persona.name} in a sales training simulation.
A real human user is practicing their sales skills by talking to you.

CRITICAL RULES - FOLLOW EXACTLY:
- You are ONLY ${scenario.persona.name}. NEVER generate the Sales Rep's dialogue.
- Respond with ONLY ONE response - your next line of dialogue as ${scenario.persona.name}.
- The human user will type their response as the Sales Rep. DO NOT simulate their side.
- DO NOT continue the conversation. DO NOT write multiple exchanges.
- DO NOT write "Sales Rep:", "Rep:", or any prefix for the user's lines.
- NO actions in brackets [like this], NO asterisks *like this*, NO stage directions.
- Just speak naturally as ${scenario.persona.name} would in a real phone call.
- Keep responses to 1-3 sentences.

${scenario.systemPrompt}

CONVERSATION SO FAR:
${conversationHistory}

Respond now as ${scenario.persona.name} with your next single line of dialogue:`

    // Get AI provider - use Gemini Flash for speed
    const provider = getProvider({ provider: 'gemini' })
    
    let response: string
    try {
      response = await provider.analyze(prompt)
    } catch {
      // Fallback to OpenRouter with Claude Haiku (faster than Sonnet)
      const fallbackProvider = getProvider({ provider: 'openrouter', model: 'claude-3-haiku' })
      response = await fallbackProvider.analyze(prompt)
    }

    // Clean up the response
    let cleanResponse = response.trim()
    
    // Remove any "Name:" prefix if present
    const namePrefix = `${scenario.persona.name}:`
    if (cleanResponse.startsWith(namePrefix)) {
      cleanResponse = cleanResponse.slice(namePrefix.length).trim()
    }
    
    // Remove quotes if the response is wrapped in them
    if (cleanResponse.startsWith('"') && cleanResponse.endsWith('"')) {
      cleanResponse = cleanResponse.slice(1, -1)
    }
    
    // CRITICAL: Strip out any Sales Rep lines the AI might have generated
    // Split by common patterns and take only the first response
    const salesRepPatterns = [
      '\nSales Rep:',
      '\n\nSales Rep:',
      '\nRep:',
      '\n\nRep:',
      '\nYou:',
      '\n\nYou:',
      '\n[Sales Rep]',
      '\n\n[Sales Rep]',
    ]
    
    for (const pattern of salesRepPatterns) {
      const idx = cleanResponse.indexOf(pattern)
      if (idx !== -1) {
        cleanResponse = cleanResponse.slice(0, idx).trim()
      }
    }
    
    // Also strip any continuation after the prospect's name appears again
    const prospectContinuation = `\n${scenario.persona.name}:`
    const contIdx = cleanResponse.indexOf(prospectContinuation)
    if (contIdx !== -1) {
      cleanResponse = cleanResponse.slice(0, contIdx).trim()
    }
    
    // Remove any action descriptions in brackets or asterisks
    cleanResponse = cleanResponse
      .replace(/\[.*?\]/g, '')
      .replace(/\*.*?\*/g, '')
      .replace(/\(.*?\)/g, '')
      .trim()

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
