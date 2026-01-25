// AI Analysis Types

export interface AnalysisResult {
  // Summary & Overview
  summary: string                    // 2-3 sentence overview of the call
  keyPoints: string[]                // Main discussion points
  
  // Sentiment & Interest
  overallSentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  clientInterestLevel: 'high' | 'medium' | 'low'
  
  // Sales Intelligence
  objections: string[]               // Client concerns/objections raised
  buyingSignals: string[]            // Positive indicators from client
  risks: string[]                    // Potential deal risks identified
  
  // Action Items
  nextSteps: string[]                // Recommended follow-up actions
  suggestedFollowUpDate?: string     // When to follow up
  
  // Pipeline Stage
  currentStage: 'initial_contact' | 'discovery' | 'demo' | 'proposal' | 'negotiation' | 'closing' | 'closed_won' | 'closed_lost'
  stageConfidence: number            // 0-100 confidence in stage assessment
  
  // Metadata
  analyzedAt: Date
  modelUsed: string
  processingTimeMs: number
}

export interface LLMProvider {
  name: string
  modelId: string
  analyze(prompt: string): Promise<string>
  isAvailable(): Promise<boolean>
}

export interface ProviderConfig {
  provider: 'gemini' | 'openrouter'
  model?: string  // For OpenRouter, specify which model
}

// Available OpenRouter models (updated IDs - Jan 2026)
export const OPENROUTER_MODELS = {
  'claude-3-sonnet': 'anthropic/claude-3.5-sonnet',
  'claude-3-opus': 'anthropic/claude-3-opus',
  'claude-3-haiku': 'anthropic/claude-3.5-haiku',
  'gpt-4-turbo': 'openai/gpt-4-turbo',
  'gpt-4': 'openai/gpt-4',
  'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
  'llama-3-70b': 'meta-llama/llama-3.1-70b-instruct',
  'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct',
} as const

export type OpenRouterModel = keyof typeof OPENROUTER_MODELS
