export interface OpenRouterRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  model?: string
}

export interface OpenRouterResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
  }
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'google/gemini-flash-1.5'

/**
 * Call OpenRouter API as fallback
 */
export async function callOpenRouter(request: OpenRouterRequest): Promise<OpenRouterResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }
  
  const messages = []
  
  if (request.systemPrompt) {
    messages.push({
      role: 'system',
      content: request.systemPrompt,
    })
  }
  
  messages.push({
    role: 'user',
    content: request.prompt,
  })
  
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Talkio Sales Copilot',
    },
    body: JSON.stringify({
      model: request.model ?? DEFAULT_MODEL,
      messages,
      temperature: request.temperature ?? 0.3,
      max_tokens: request.maxTokens ?? 4096,
      response_format: { type: 'json_object' },
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }
  
  const data = await response.json()
  
  return {
    text: data.choices[0]?.message?.content ?? '',
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
    } : undefined,
  }
}

/**
 * Stream OpenRouter response for live copilot
 */
export async function* streamOpenRouter(request: OpenRouterRequest): AsyncGenerator<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }
  
  const messages = []
  
  if (request.systemPrompt) {
    messages.push({
      role: 'system',
      content: request.systemPrompt,
    })
  }
  
  messages.push({
    role: 'user',
    content: request.prompt,
  })
  
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Talkio Sales Copilot',
    },
    body: JSON.stringify({
      model: request.model ?? DEFAULT_MODEL,
      messages,
      temperature: request.temperature ?? 0.5,
      max_tokens: request.maxTokens ?? 1024,
      stream: true,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }
  
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }
  
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '))
    
    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') continue
      
      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      } catch {
        // Skip malformed chunks
      }
    }
  }
}
