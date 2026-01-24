import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export interface GeminiRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface GeminiResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
  }
}

/**
 * Call Gemini API with structured prompt
 */
export async function callGemini(request: GeminiRequest): Promise<GeminiResponse> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: request.temperature ?? 0.3,
      maxOutputTokens: request.maxTokens ?? 4096,
      responseMimeType: 'application/json',
    },
  })
  
  const fullPrompt = request.systemPrompt 
    ? `${request.systemPrompt}\n\n${request.prompt}`
    : request.prompt
  
  const result = await model.generateContent(fullPrompt)
  const response = result.response
  const text = response.text()
  
  return {
    text,
    usage: {
      promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
      completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    },
  }
}

/**
 * Stream Gemini response for live copilot
 */
export async function* streamGemini(request: GeminiRequest): AsyncGenerator<string> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: request.temperature ?? 0.5,
      maxOutputTokens: request.maxTokens ?? 1024,
    },
  })
  
  const fullPrompt = request.systemPrompt 
    ? `${request.systemPrompt}\n\n${request.prompt}`
    : request.prompt
  
  const result = await model.generateContentStream(fullPrompt)
  
  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) {
      yield text
    }
  }
}
