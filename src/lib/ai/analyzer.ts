import { AnalysisResult, ProviderConfig, OpenRouterModel } from './types'
import { getProvider } from './providers'
import { buildAnalysisPrompt } from './prompts/transcript-analysis'
import { ITranscript, IConversationEntry } from '../models/Transcript'

/**
 * Format conversation entries into a readable transcript string
 */
function formatTranscript(conversation: IConversationEntry[]): string {
  return conversation
    .map((entry) => {
      const speaker = entry.speaker === 'sales_representative' ? 'Sales Rep' : 'Client'
      const timestamp = formatTimestamp(entry.start)
      return `[${timestamp}] ${speaker}: ${entry.text}`
    })
    .join('\n\n')
}

/**
 * Format seconds into MM:SS
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Parse the LLM response into a structured AnalysisResult
 */
function parseAnalysisResponse(response: string, modelUsed: string, processingTimeMs: number): AnalysisResult {
  // Extract JSON from the response (handle markdown code blocks)
  let jsonStr = response
  
  // Remove markdown code block if present
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }
  
  // Try to find JSON object in the response
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (objectMatch) {
    jsonStr = objectMatch[0]
  }
  
  try {
    const parsed = JSON.parse(jsonStr)
    
    return {
      summary: parsed.summary || 'Analysis completed',
      keyPoints: parsed.keyPoints || [],
      overallSentiment: parsed.overallSentiment || 'neutral',
      clientInterestLevel: parsed.clientInterestLevel || 'medium',
      objections: parsed.objections || [],
      buyingSignals: parsed.buyingSignals || [],
      risks: parsed.risks || [],
      nextSteps: parsed.nextSteps || [],
      suggestedFollowUpDate: parsed.suggestedFollowUpDate,
      currentStage: parsed.currentStage || 'initial_contact',
      stageConfidence: parsed.stageConfidence || 50,
      analyzedAt: new Date(),
      modelUsed,
      processingTimeMs,
    }
  } catch (error) {
    console.error('Failed to parse LLM response:', error)
    console.error('Raw response:', response)
    
    // Return a default analysis if parsing fails
    return {
      summary: 'Analysis parsing failed. Please try again.',
      keyPoints: [],
      overallSentiment: 'neutral',
      clientInterestLevel: 'medium',
      objections: [],
      buyingSignals: [],
      risks: ['Analysis could not be completed'],
      nextSteps: ['Review the transcript manually'],
      currentStage: 'initial_contact',
      stageConfidence: 0,
      analyzedAt: new Date(),
      modelUsed,
      processingTimeMs,
    }
  }
}

/**
 * Analyze a transcript using the specified LLM provider
 * Falls back to OpenRouter if Gemini fails (quota exceeded, etc.)
 */
export async function analyzeTranscript(
  transcript: ITranscript,
  config?: ProviderConfig
): Promise<AnalysisResult> {
  const startTime = Date.now()
  
  // Format the transcript for analysis
  const formattedTranscript = formatTranscript(transcript.conversation)
  
  // Build the prompt
  const prompt = buildAnalysisPrompt({
    transcript: formattedTranscript,
    clientName: transcript.clientName,
    companyName: transcript.companyName,
    industry: transcript.industry,
    callNumber: transcript.callNumber,
    initialNotes: transcript.initialNotes,
  })
  
  // Get the primary provider
  const primaryProvider = getProvider({
    provider: config?.provider,
    model: config?.model as OpenRouterModel,
  })
  
  // Check if provider is available
  const isAvailable = await primaryProvider.isAvailable()
  if (!isAvailable) {
    throw new Error(`${primaryProvider.name} is not available. Please check your API key.`)
  }
  
  try {
    // Try primary provider first
    const response = await primaryProvider.analyze(prompt)
    const processingTimeMs = Date.now() - startTime
    return parseAnalysisResponse(response, `${primaryProvider.name}/${primaryProvider.modelId}`, processingTimeMs)
  } catch (error) {
    // If Gemini fails (quota exceeded, etc.), fall back to OpenRouter
    if (config?.provider !== 'openrouter') {
      console.log(`[Analyzer] ${primaryProvider.name} failed, falling back to OpenRouter...`)
      console.error(`[Analyzer] Primary error:`, error)
      
      const fallbackProvider = getProvider({
        provider: 'openrouter',
        model: 'claude-3-sonnet',
      })
      
      const fallbackAvailable = await fallbackProvider.isAvailable()
      if (fallbackAvailable) {
        const response = await fallbackProvider.analyze(prompt)
        const processingTimeMs = Date.now() - startTime
        return parseAnalysisResponse(response, `${fallbackProvider.name}/${fallbackProvider.modelId} (fallback)`, processingTimeMs)
      }
    }
    
    // Re-throw if no fallback available
    throw error
  }
}

/**
 * Re-analyze a transcript with a different model
 */
export async function reanalyzeWithModel(
  transcript: ITranscript,
  model: OpenRouterModel
): Promise<AnalysisResult> {
  return analyzeTranscript(transcript, {
    provider: 'openrouter',
    model,
  })
}
