/**
 * LLM Gateway - Single entry point for all AI calls
 * Default: Gemini → Fallback: OpenRouter
 */

import { z } from 'zod'
import { callGemini, streamGemini } from './gemini'
import { callOpenRouter, streamOpenRouter } from './openrouter'

export interface LLMRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface LLMResponse<T> {
  data: T
  provider: 'gemini' | 'openrouter'
  retried: boolean
}

/**
 * Call LLM and parse response with Zod schema
 * Automatically falls back to OpenRouter if Gemini fails
 */
export async function callLLM<T>(
  request: LLMRequest,
  schema: z.ZodSchema<T>
): Promise<LLMResponse<T>> {
  let lastError: Error | null = null
  let retried = false
  
  // Try Gemini first
  try {
    const response = await callGemini(request)
    const parsed = JSON.parse(response.text)
    const validated = schema.parse(parsed)
    
    return {
      data: validated,
      provider: 'gemini',
      retried: false,
    }
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error))
    console.error('[LLM] Gemini failed:', lastError.message)
  }
  
  // Fallback to OpenRouter
  try {
    retried = true
    const response = await callOpenRouter(request)
    const parsed = JSON.parse(response.text)
    const validated = schema.parse(parsed)
    
    return {
      data: validated,
      provider: 'openrouter',
      retried: true,
    }
  } catch (error) {
    const openRouterError = error instanceof Error ? error : new Error(String(error))
    console.error('[LLM] OpenRouter failed:', openRouterError.message)
    
    // Both failed - throw the original error
    throw new Error(
      `LLM call failed. Gemini: ${lastError?.message}. OpenRouter: ${openRouterError.message}`
    )
  }
}

/**
 * Stream LLM response (for live copilot)
 * Falls back to OpenRouter if Gemini fails
 */
export async function* streamLLM(request: LLMRequest): AsyncGenerator<string> {
  // Try Gemini first
  try {
    for await (const chunk of streamGemini(request)) {
      yield chunk
    }
    return
  } catch (error) {
    console.error('[LLM] Gemini streaming failed:', error)
  }
  
  // Fallback to OpenRouter
  try {
    for await (const chunk of streamOpenRouter(request)) {
      yield chunk
    }
  } catch (error) {
    console.error('[LLM] OpenRouter streaming failed:', error)
    throw new Error('All LLM providers failed for streaming')
  }
}

// Re-export schemas
export * from './schemas'
