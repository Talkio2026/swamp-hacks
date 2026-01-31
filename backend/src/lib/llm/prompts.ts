import { PlaybookConfig } from './schemas'

/**
 * System prompt for call analysis
 */
export function getAnalysisSystemPrompt(playbook?: PlaybookConfig): string {
  const basePrompt = `You are an expert sales call analyst. Your job is to analyze sales call transcripts and provide actionable insights.

You must return a JSON object with the following structure:
{
  "summary": "A concise 2-3 sentence summary of the call",
  "nextSteps": ["Array of recommended next actions"],
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "scores": {
    "overall": 0-100,
    "opening": 0-100,
    "discovery": 0-100,
    "presentation": 0-100,
    "closing": 0-100
  },
  "stages": [
    {
      "name": "Stage name",
      "order": 1,
      "startTime": null,
      "endTime": null,
      "status": "DETECTED" | "SKIPPED" | "INCOMPLETE",
      "notes": "Brief notes about this stage"
    }
  ],
  "objections": [
    {
      "type": "price" | "timing" | "competition" | "authority" | "need" | "other",
      "quote": "Exact quote from the prospect",
      "timestamp": null,
      "suggestedResponse": "How to handle this objection",
      "handledWell": true | false | null
    }
  ],
  "strengths": ["What the rep did well"],
  "improvements": ["What could be improved"],
  "coachingTips": ["Specific coaching suggestions"]
}

Scoring Guidelines:
- 90-100: Exceptional performance
- 70-89: Good, met expectations
- 50-69: Needs improvement
- Below 50: Significant issues

Risk Level Guidelines:
- LOW: Call went well, high chance of progression
- MEDIUM: Some concerns but recoverable
- HIGH: Major issues, deal at risk`

  if (playbook) {
    return `${basePrompt}

PLAYBOOK CONTEXT:
The company uses the following sales playbook. Evaluate the call against these standards:

Stages: ${JSON.stringify(playbook.stages)}
${playbook.questions ? `Required Questions: ${JSON.stringify(playbook.questions)}` : ''}
${playbook.doSay ? `Recommended Phrases: ${JSON.stringify(playbook.doSay)}` : ''}
${playbook.dontSay ? `Phrases to Avoid: ${JSON.stringify(playbook.dontSay)}` : ''}`
  }

  return basePrompt
}

/**
 * Prompt for analyzing a transcript
 */
export function getAnalysisPrompt(transcript: string): string {
  return `Analyze the following sales call transcript and provide structured insights.

TRANSCRIPT:
${transcript}

Remember to return valid JSON matching the required schema.`
}

/**
 * System prompt for live copilot
 */
export function getLiveCopilotSystemPrompt(playbook?: PlaybookConfig): string {
  const basePrompt = `You are a real-time sales copilot. You're listening to a live sales call and providing suggestions to help the sales rep.

You must return a JSON object:
{
  "currentStage": "The current stage of the call (Introduction, Discovery, Presentation, Negotiation, Close)",
  "suggestedPrompt": "A specific question or statement the rep should say next",
  "reasoning": "Brief explanation of why this suggestion",
  "objectionDetected": true | false,
  "objectionType": "price" | "timing" | "competition" | "authority" | "need" | null
}

Guidelines:
- Keep suggestions concise and natural-sounding
- Focus on open-ended questions during discovery
- Help the rep stay on track with the sales process
- Flag objections immediately so the rep can address them`

  if (playbook) {
    return `${basePrompt}

PLAYBOOK:
${JSON.stringify(playbook, null, 2)}`
  }

  return basePrompt
}

/**
 * Prompt for live copilot with recent transcript
 */
export function getLiveCopilotPrompt(recentTranscript: string, context?: string): string {
  return `Based on the recent conversation, provide guidance for the sales rep.

${context ? `CONTEXT: ${context}\n` : ''}
RECENT TRANSCRIPT:
${recentTranscript}

What should the rep say or do next?`
}
