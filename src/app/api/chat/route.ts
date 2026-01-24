import { NextRequest, NextResponse } from 'next/server';

const DO_AGENT_BASE = process.env.DO_AGENT_BASE || '';
const DO_AGENT_API_KEY = process.env.DO_AGENT_API_KEY || '';

export async function POST(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e04a3cda-9882-48bd-9028-74165ea5ab43',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:POST:entry',message:'POST handler called',data:{hasBase:!!DO_AGENT_BASE,baseLength:DO_AGENT_BASE.length,hasKey:!!DO_AGENT_API_KEY,keyLength:DO_AGENT_API_KEY.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
  // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e04a3cda-9882-48bd-9028-74165ea5ab43',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:beforeFetch',message:'About to fetch DO agent',data:{url,messageCount:messages.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,E'})}).catch(()=>{});
    // #endregion
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DO_AGENT_API_KEY}`,
      },
      body: JSON.stringify({ messages, stream: false }),
    });

    const responseText = await response.text();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e04a3cda-9882-48bd-9028-74165ea5ab43',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:afterFetch',message:'Received response from DO',data:{status:response.status,ok:response.ok,textPreview:responseText.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C,D'})}).catch(()=>{});
    // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e04a3cda-9882-48bd-9028-74165ea5ab43',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:catch',message:'Exception in POST handler',data:{errorMsg:String(error),errorName:(error as Error)?.name},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C,D'})}).catch(()=>{});
    // #endregion
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
