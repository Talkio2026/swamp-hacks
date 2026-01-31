import { NextRequest, NextResponse } from 'next/server';

// Playbook Assistant configuration
// Uses DigitalOcean GenAI Agent or compatible OpenAI-style API
const PLAYBOOK_AGENT_BASE_URL = process.env.PLAYBOOK_AGENT_BASE_URL;
const PLAYBOOK_AGENT_API_KEY = process.env.PLAYBOOK_AGENT_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // Validate configuration
    if (!PLAYBOOK_AGENT_BASE_URL || !PLAYBOOK_AGENT_API_KEY) {
      console.error('[Playbook Agent] Missing configuration:', {
        hasBaseUrl: !!PLAYBOOK_AGENT_BASE_URL,
        hasApiKey: !!PLAYBOOK_AGENT_API_KEY,
      });
      return NextResponse.json(
        { error: 'Playbook agent is not configured. Please set PLAYBOOK_AGENT_BASE_URL and PLAYBOOK_AGENT_API_KEY.' },
        { status: 503 }
      );
    }

    const { message, conversationHistory, playbookId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build the messages array (OpenAI-compatible format)
    const messages = conversationHistory || [];
    messages.push({ role: 'user', content: message });

    const url = `${PLAYBOOK_AGENT_BASE_URL}/api/v1/chat/completions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PLAYBOOK_AGENT_API_KEY}`,
      },
      body: JSON.stringify({ messages, stream: false }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('[Playbook Agent] Agent error:', response.status, responseText);
      return NextResponse.json(
        { error: `AI agent error: ${response.status}` },
        { status: response.status }
      );
    }

    // Parse response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json({ message: responseText, success: true });
    }

    const assistantMessage = data.choices?.[0]?.message?.content 
      || data.response 
      || data.message 
      || data.content
      || (typeof data === 'string' ? data : JSON.stringify(data));

    return NextResponse.json({ message: assistantMessage, success: true });
  } catch (error) {
    console.error('[Playbook Agent] API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
