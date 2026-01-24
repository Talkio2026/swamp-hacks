import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getScenarioById } from '@/lib/training/scenarios'
import { getProvider } from '@/lib/ai/providers'

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

// POST /api/training/evaluate - Evaluate a training session
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { scenarioId, conversation, duration } = body as {
      scenarioId: string
      conversation: ConversationTurn[]
      duration: number // in seconds
    }

    const scenario = getScenarioById(scenarioId)
    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      )
    }

    // Build evaluation prompt
    const evaluationPrompt = buildEvaluationPrompt(scenario, conversation, duration)

    // Get AI provider
    const provider = getProvider({ provider: 'gemini' })
    
    let response: string
    try {
      response = await provider.analyze(evaluationPrompt)
    } catch {
      // Fallback to OpenRouter
      const fallbackProvider = getProvider({ provider: 'openrouter', model: 'claude-3-sonnet' })
      response = await fallbackProvider.analyze(evaluationPrompt)
    }

    // Parse the response
    let evaluation
    try {
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : response
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/)
      evaluation = objectMatch ? JSON.parse(objectMatch[0]) : JSON.parse(jsonStr)
    } catch {
      console.error('[Training] Failed to parse evaluation:', response)
      return NextResponse.json(
        { error: 'Failed to parse evaluation response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      evaluation,
    })
  } catch (error) {
    console.error('[Training] Evaluation error:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate training session' },
      { status: 500 }
    )
  }
}

function buildEvaluationPrompt(
  scenario: ReturnType<typeof getScenarioById>,
  conversation: ConversationTurn[],
  duration: number
): string {
  if (!scenario) return ''

  const transcript = conversation
    .map(turn => `[${turn.role === 'user' ? 'Sales Rep' : scenario.persona.name}]: ${turn.content}`)
    .join('\n')

  return `You are an expert sales coach evaluating a training session. Analyze this practice conversation and provide detailed feedback.

TRAINING SCENARIO: ${scenario.name}
DIFFICULTY: ${scenario.difficulty}
CATEGORY: ${scenario.category}

PROSPECT PERSONA:
- Name: ${scenario.persona.name}
- Title: ${scenario.persona.title}
- Company: ${scenario.persona.company}
- Personality: ${scenario.persona.personality}

SESSION OBJECTIVES:
${scenario.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

EVALUATION CRITERIA:
${scenario.evaluationCriteria.map(c => `- ${c.criterion} (weight: ${c.weight}/10)`).join('\n')}

CONVERSATION TRANSCRIPT:
${transcript}

SESSION DURATION: ${Math.round(duration / 60)} minutes

Please provide a comprehensive evaluation in the following JSON format:
{
  "overallScore": 0-100,
  "grade": "A" | "B" | "C" | "D" | "F",
  "objectivesAchieved": [
    {
      "objective": "string",
      "achieved": true | false,
      "notes": "string"
    }
  ],
  "criteriaScores": [
    {
      "criterion": "string",
      "score": 0-100,
      "feedback": "string"
    }
  ],
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "keyMoments": [
    {
      "type": "positive" | "negative" | "missed_opportunity",
      "description": "string",
      "suggestion": "string"
    }
  ],
  "specificFeedback": {
    "opening": "string",
    "questioningSkills": "string",
    "listening": "string",
    "objectionHandling": "string",
    "closing": "string"
  },
  "coachingTips": ["string"],
  "recommendedPractice": "string"
}

Be specific, constructive, and actionable in your feedback. Reference specific things the rep said or could have said differently.`
}
