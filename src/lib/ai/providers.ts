import { GoogleGenerativeAI } from '@google/generative-ai'
import { LLMProvider, OPENROUTER_MODELS, OpenRouterModel } from './types'

/**
 * Gemini Provider - Primary LLM
 */
export class GeminiProvider implements LLMProvider {
  name = 'Gemini'
  modelId = 'gemini-2.0-flash'
  
  private client: GoogleGenerativeAI | null = null

  constructor(modelId?: string) {
    if (modelId) this.modelId = modelId
    
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey)
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!this.client
  }

  async analyze(prompt: string): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini API key not configured')
    }

    const model = this.client.getGenerativeModel({ model: this.modelId })
    
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    return text
  }
}

/**
 * OpenRouter Provider - Supports multiple models
 */
export class OpenRouterProvider implements LLMProvider {
  name = 'OpenRouter'
  modelId: string
  
  private apiKey: string | null = null

  constructor(model: OpenRouterModel = 'claude-3-sonnet') {
    this.modelId = OPENROUTER_MODELS[model]
    this.apiKey = process.env.OPENROUTER_API_KEY || null
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey
  }

  async analyze(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        'X-Title': 'Talkio Sales AI',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,  // Lower temperature for more consistent analysis
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${error}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }
}

/**
 * Get the appropriate LLM provider based on configuration
 */
export function getProvider(config?: { 
  provider?: 'gemini' | 'openrouter'
  model?: OpenRouterModel 
}): LLMProvider {
  const providerType = config?.provider || 'gemini'
  
  if (providerType === 'openrouter') {
    return new OpenRouterProvider(config?.model || 'claude-3-sonnet')
  }
  
  return new GeminiProvider()
}

/**
 * Get available providers
 */
export async function getAvailableProviders(): Promise<{ name: string; available: boolean }[]> {
  const gemini = new GeminiProvider()
  const openRouter = new OpenRouterProvider()
  
  return [
    { name: 'Gemini', available: await gemini.isAvailable() },
    { name: 'OpenRouter', available: await openRouter.isAvailable() },
  ]
}
