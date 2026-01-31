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

    // Get AI provider - use Gemini Flash for speed
    const provider = getProvider({ provider: 'gemini' })
    
    let response: string
    try {
      response = await provider.analyze(evaluationPrompt)
    } catch {
      // Fallback to OpenRouter with Claude Haiku (faster than Sonnet)
      const fallbackProvider = getProvider({ provider: 'openrouter', model: 'claude-3-haiku' })
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

  // Calculate conversation metrics for context
  const repTurns = conversation.filter(t => t.role === 'user').length
  const isShortConversation = repTurns < 3

  return `You are an expert sales coach evaluating a PRACTICE training session. Your role is to provide constructive, encouraging feedback that helps the sales rep improve.

IMPORTANT GRADING GUIDELINES:
- This is a PRACTICE environment for learning - be fair and constructive
- Grade based on what was demonstrated, not what was missing due to short conversations
- Use this grade scale:
  * A (90-100): Excellent - demonstrated strong sales skills, achieved most objectives
  * B (80-89): Good - solid performance with minor areas for improvement  
  * C (70-79): Satisfactory - met basic expectations, clear room for growth
  * D (60-69): Needs Improvement - missed key objectives but showed some effort
  * F (below 60): Only for completely off-track conversations or inappropriate behavior
- For short conversations (${repTurns} rep turns), evaluate what WAS said, not penalize for brevity
- Focus on 2-3 strengths before discussing improvements
- Be specific and actionable - reference actual quotes from the conversation

${isShortConversation ? `NOTE: This was a shorter practice session with only ${repTurns} rep turns. Grade based on the quality of what was said, and provide guidance on what to cover in longer sessions.\n` : ''}
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

EVALUATION CRITERIA (weight indicates importance, not minimum score):
${scenario.evaluationCriteria.map(c => `- ${c.criterion} (importance: ${c.weight}/10)`).join('\n')}

CONVERSATION TRANSCRIPT:
${transcript || '[No conversation recorded - evaluate based on session attempt]'}

SESSION DURATION: ${Math.round(duration / 60)} minutes

Please provide a comprehensive evaluation in the following JSON format:
{
  "overallScore": 0-100,
  "grade": "A" | "B" | "C" | "D" | "F",
  "objectivesAchieved": [
    {
      "objective": "string",
      "achieved": true | false | "partial",
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
  "strengths": ["string - be specific, quote examples"],
  "areasForImprovement": ["string - be constructive, not critical"],
  "keyMoments": [
    {
      "type": "positive" | "negative" | "missed_opportunity",
      "description": "string",
      "suggestion": "string - what to do next time"
    }
  ],
  "specificFeedback": {
    "opening": "string",
    "questioningSkills": "string",
    "listening": "string",
    "objectionHandling": "string",
    "closing": "string"
  },
  "coachingTips": ["string - practical, actionable advice"],
  "recommendedPractice": "string - suggest next scenario or focus area"
}

Remember: Your goal is to help this sales rep IMPROVE. Lead with positives, be specific in feedback, and frame improvements as opportunities rather than failures.`
}
