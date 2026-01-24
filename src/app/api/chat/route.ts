import { NextRequest, NextResponse } from 'next/server';

const DO_AGENT_BASE = 'https://vkx2avvumpj4cf5y76pw3pci.agents.do-ai.run';
const DO_AGENT_API_KEY = 'An3rOc5CseZKU8C5dILeYBo7Km2m9LXf';

// Try multiple possible endpoint paths
const ENDPOINTS = [
  '/api/v1/chat/completions',
  '/v1/chat/completions', 
  '/chat/completions',
  '/chat',
  '/api/chat',
  '',
];

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

    // Try different request body formats
    const requestBodies = [
      { messages, stream: false },
      { messages },
      { input: message, messages },
      { prompt: message, messages },
      { query: message },
      { message },
    ];

    let lastError = '';
    let lastStatus = 500;

    // Try each endpoint
    for (const endpoint of ENDPOINTS) {
      const url = `${DO_AGENT_BASE}${endpoint}`;
      
      for (const body of requestBodies) {
        try {
          console.log(`Trying: ${url} with body keys: ${Object.keys(body).join(', ')}`);
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${DO_AGENT_API_KEY}`,
            },
            body: JSON.stringify(body),
          });

          const responseText = await response.text();
          console.log(`Response from ${url}: ${response.status} - ${responseText.substring(0, 200)}`);

          if (response.ok) {
            // Success! Parse and return
            let data;
            try {
              data = JSON.parse(responseText);
            } catch {
              return NextResponse.json({ message: responseText, success: true });
            }

            const assistantMessage = data.choices?.[0]?.message?.content 
              || data.choices?.[0]?.text
              || data.response 
              || data.message 
              || data.content
              || data.output
              || data.answer
              || data.result
              || data.text
              || (typeof data === 'string' ? data : JSON.stringify(data));

            return NextResponse.json({ message: assistantMessage, success: true });
          }

          lastError = responseText;
          lastStatus = response.status;
        } catch (e) {
          console.error(`Error with ${url}:`, e);
          continue;
        }
      }
    }

    // All attempts failed
    console.error('All endpoints failed. Last error:', lastError);
    return NextResponse.json(
      { error: `AI agent error: ${lastStatus}` },
      { status: lastStatus }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
