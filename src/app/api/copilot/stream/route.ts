import { NextRequest } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { streamLLM, LiveSuggestionSchema } from '@/lib/llm'
import { getLiveCopilotSystemPrompt, getLiveCopilotPrompt } from '@/lib/llm/prompts'
import { getDefaultPlaybook } from '@/lib/services/playbooks'
import { PlaybookConfig } from '@/lib/llm/schemas'

// POST /api/copilot/stream - SSE endpoint for live copilot
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    const body = await request.json()
    const { transcript, context } = body as { 
      transcript: string
      context?: string 
    }
    
    if (!transcript) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Transcript is required' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Get the org's default playbook for context
    const playbook = await getDefaultPlaybook(session.orgId)
    const playbookConfig = playbook?.stages as PlaybookConfig | undefined
    
    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream AI response
          let fullResponse = ''
          
          for await (const chunk of streamLLM({
            prompt: getLiveCopilotPrompt(transcript, context),
            systemPrompt: getLiveCopilotSystemPrompt(playbookConfig),
            temperature: 0.5,
            maxTokens: 512,
          })) {
            fullResponse += chunk
            
            // Send chunk as SSE event
            const data = `data: ${JSON.stringify({ chunk })}\n\n`
            controller.enqueue(encoder.encode(data))
          }
          
          // Try to parse final response as structured suggestion
          try {
            const parsed = JSON.parse(fullResponse)
            const suggestion = LiveSuggestionSchema.parse(parsed)
            
            const finalData = `data: ${JSON.stringify({ suggestion, done: true })}\n\n`
            controller.enqueue(encoder.encode(finalData))
          } catch {
            // If parsing fails, send raw text
            const finalData = `data: ${JSON.stringify({ text: fullResponse, done: true })}\n\n`
            controller.enqueue(encoder.encode(finalData))
          }
          
          controller.close()
        } catch (error) {
          console.error('[SSE] Stream error:', error)
          const errorData = `data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        }
      },
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[API] POST /api/copilot/stream error:', error)
    
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      return new Response(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: error.message } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Failed to start stream' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
