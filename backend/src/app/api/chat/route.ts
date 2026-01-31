import { NextRequest, NextResponse } from 'next/server';

// Support Chatbot configuration
// Uses DigitalOcean GenAI Agent or compatible OpenAI-style API
const SUPPORT_CHATBOT_BASE_URL = process.env.SUPPORT_CHATBOT_BASE_URL;
const SUPPORT_CHATBOT_API_KEY = process.env.SUPPORT_CHATBOT_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // Validate configuration
    if (!SUPPORT_CHATBOT_BASE_URL || !SUPPORT_CHATBOT_API_KEY) {
      console.error('[Support Chatbot] Missing configuration:', {
        hasBaseUrl: !!SUPPORT_CHATBOT_BASE_URL,
        hasApiKey: !!SUPPORT_CHATBOT_API_KEY,
      });
      return NextResponse.json(
        { error: 'Support chatbot is not configured. Please set SUPPORT_CHATBOT_BASE_URL and SUPPORT_CHATBOT_API_KEY.' },
        { status: 503 }
      );
    }

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

    const url = `${SUPPORT_CHATBOT_BASE_URL}/api/v1/chat/completions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPPORT_CHATBOT_API_KEY}`,
      },
      body: JSON.stringify({ messages, stream: false }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('[Support Chatbot] Agent error:', response.status, responseText);
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
    console.error('[Support Chatbot] API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
