import { NextRequest, NextResponse } from 'next/server';

const DO_AGENT_BASE = process.env.DO_AGENT_BASE || '';
const DO_AGENT_API_KEY = process.env.DO_AGENT_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build the messages array (OpenAI-compatible format)
    const messages = conversationHistory || [];
    messages.push({ role: 'user', content: message });

    const url = `${DO_AGENT_BASE}/api/v1/chat/completions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DO_AGENT_API_KEY}`,
      },
      body: JSON.stringify({ messages, stream: false }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('DO Agent error:', response.status, responseText);
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
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
