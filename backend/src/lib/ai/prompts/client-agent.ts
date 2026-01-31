/**
 * CLIENT AGENT PROMPT
 * 
 * This prompt template is for the client-level AI agent that analyzes
 * all transcripts and interactions with a specific client to provide
 * a comprehensive relationship summary.
 */

export const CLIENT_AGENT_PROMPT = `
You are an expert sales relationship analyst AI. Your job is to analyze the complete history of interactions with a client and provide a comprehensive relationship summary that helps sales representatives understand the full context and optimize their approach.

## CLIENT INFORMATION:
- Client Name: {clientName}
- Company: {companyName}
- Industry: {industry}
- Contact Email: {contactEmail}
- Contact Phone: {contactPhone}
- Sales Rep: {salesRepName}
- Current Pipeline Status: {currentStatus}
- Total Calls: {totalCalls}
- Initial Notes: {initialNotes}

## COMPLETE INTERACTION HISTORY:
{transcriptsData}

## YOUR TASK:
Analyze the complete history of interactions with this client and provide a comprehensive analysis in the following JSON format. Focus on patterns, progression, and actionable insights.

{
  "relationshipSummary": "3-5 sentence executive summary of the entire relationship with this client - where it started, how it evolved, and current state",
  
  "clientProfile": {
    "communicationStyle": "How does this client prefer to communicate? Direct/detailed/casual/formal?",
    "decisionMakingProcess": "What have you learned about their decision-making process?",
    "keyPriorities": ["What matters most to this client based on all conversations"],
    "painPoints": ["Recurring challenges or problems they've mentioned"]
  },
  
  "relationshipTimeline": [
    {
      "callNumber": 1,
      "date": "2024-01-15",
      "milestone": "Brief description of what happened in this call and any key turning points"
    }
  ],
  
  "progressionAnalysis": {
    "startingStage": "Where the relationship started",
    "currentStage": "initial_contact|discovery|demo|proposal|negotiation|closing|closed_won|closed_lost",
    "stageProgression": "How has the deal progressed? What drove each stage transition?",
    "velocityAssessment": "Is this deal moving fast, slow, or at normal pace?"
  },
  
  "sentimentTrend": {
    "overall": "positive|neutral|negative|mixed",
    "trend": "improving|stable|declining",
    "analysis": "How has client sentiment changed over time and why?"
  },
  
  "objectionsHistory": [
    {
      "objection": "Specific objection raised",
      "whenRaised": "Call 1/2/3",
      "status": "resolved|unresolved|partially_addressed",
      "resolution": "How it was addressed (if applicable)"
    }
  ],
  
  "competitorIntelligence": {
    "mentioned": ["List any competitors mentioned across all calls"],
    "clientPerception": "What has the client said about competitors?",
    "differentiators": "What differentiates us based on their feedback?"
  },
  
  "buyingSignals": [
    "All positive indicators collected across all conversations"
  ],
  
  "risks": [
    {
      "risk": "Specific risk to the deal",
      "severity": "high|medium|low",
      "mitigation": "Suggested approach to address this"
    }
  ],
  
  "recommendedStrategy": {
    "immediateActions": ["What should be done right now"],
    "talkingPoints": ["Key points to emphasize in next conversation"],
    "questionsToAsk": ["Strategic questions to advance the deal"],
    "avoidTopics": ["Sensitive areas to navigate carefully"]
  },
  
  "nextBestAction": "The single most important next step for this client",
  
  "dealProbability": {
    "percentage": 75,
    "rationale": "Why this probability based on all interactions"
  },
  
  "modelUsed": "Model that generated this analysis"
}

## GUIDELINES:
1. Synthesize information across ALL calls - look for patterns and evolution
2. Be specific and reference actual conversations when possible
3. Focus on actionable intelligence that helps close the deal
4. Identify trends and changes over time
5. Consider the full relationship context, not just individual calls
6. Highlight any inconsistencies or concerns across conversations
7. Return ONLY valid JSON, no additional text

## COMPREHENSIVE ANALYSIS:
`

/**
 * Format transcripts data for the prompt
 */
function formatTranscriptsForPrompt(transcripts: TranscriptData[]): string {
  if (!transcripts || transcripts.length === 0) {
    return 'No call transcripts available yet.'
  }

  return transcripts.map((t, index) => {
    const callHeader = `\n### CALL ${index + 1} (${t.createdAt || 'Unknown date'})`
    const sentiment = t.sentiment ? `\nSentiment: ${t.sentiment}` : ''
    const status = t.status ? `\nStatus: ${t.status}` : ''
    
    let analysisSection = ''
    if (t.analysis) {
      analysisSection = `
Previous AI Analysis:
- Summary: ${t.analysis.summary || 'N/A'}
- Interest Level: ${t.analysis.clientInterestLevel || 'N/A'}
- Stage: ${t.analysis.currentStage || 'N/A'}
- Key Points: ${(t.analysis.keyPoints || []).join(', ') || 'None'}
- Objections: ${(t.analysis.objections || []).join(', ') || 'None'}
- Buying Signals: ${(t.analysis.buyingSignals || []).join(', ') || 'None'}
- Next Steps: ${(t.analysis.nextSteps || []).join(', ') || 'None'}`
    }

    let conversationSection = ''
    if (t.conversation && t.conversation.length > 0) {
      conversationSection = '\n\nConversation:\n' + t.conversation.map(entry => {
        const speaker = entry.speaker === 'sales_representative' ? 'Sales Rep' : 'Client'
        return `${speaker}: ${entry.text}`
      }).join('\n')
    }

    return `${callHeader}${sentiment}${status}${analysisSection}${conversationSection}`
  }).join('\n\n---\n')
}

interface TranscriptAnalysis {
  summary?: string
  clientInterestLevel?: string
  currentStage?: string
  keyPoints?: string[]
  objections?: string[]
  buyingSignals?: string[]
  nextSteps?: string[]
}

interface ConversationEntry {
  speaker: string
  text: string
}

interface TranscriptData {
  callNumber?: number
  createdAt?: string
  sentiment?: string
  status?: string
  analysis?: TranscriptAnalysis
  conversation?: ConversationEntry[]
}

interface ClientData {
  clientName?: string
  companyName?: string
  industry?: string
  contactEmail?: string
  contactPhone?: string
  salesRepName?: string
  currentStatus?: string
  totalCalls?: number
  initialNotes?: string
}

/**
 * Builds the complete prompt with client data and all transcripts
 */
export function buildClientAgentPrompt(params: {
  client: ClientData
  transcripts: TranscriptData[]
}): string {
  const { client, transcripts } = params
  
  return CLIENT_AGENT_PROMPT
    .replace('{clientName}', client.clientName || 'Unknown')
    .replace('{companyName}', client.companyName || 'Unknown')
    .replace('{industry}', client.industry || 'Unknown')
    .replace('{contactEmail}', client.contactEmail || 'Unknown')
    .replace('{contactPhone}', client.contactPhone || 'Unknown')
    .replace('{salesRepName}', client.salesRepName || 'Unknown')
    .replace('{currentStatus}', client.currentStatus || 'Unknown')
    .replace('{totalCalls}', String(client.totalCalls || transcripts.length))
    .replace('{initialNotes}', client.initialNotes || 'None')
    .replace('{transcriptsData}', formatTranscriptsForPrompt(transcripts))
}
