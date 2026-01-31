import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

// POST /api/training/tts - Convert text to speech using ElevenLabs
export async function POST(request: NextRequest) {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e0f75188-72b9-4fcd-8705-faf3b168b72d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tts/route.ts:POST_ENTRY',message:'TTS API handler started',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'TTS'})}).catch(()=>{});
    // #endregion

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // #region agent log
    const hasApiKey = !!ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key'
    fetch('http://127.0.0.1:7242/ingest/e0f75188-72b9-4fcd-8705-faf3b168b72d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tts/route.ts:API_KEY_CHECK',message:'ElevenLabs API key check',data:{hasApiKey,keyLength:ELEVENLABS_API_KEY?.length||0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'TTS'})}).catch(()=>{});
    // #endregion

    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e0f75188-72b9-4fcd-8705-faf3b168b72d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tts/route.ts:NO_API_KEY',message:'ElevenLabs API key not configured',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'TTS'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { text, voiceId } = body as { text: string; voiceId?: string }

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Default to a professional voice if not specified
    const voice = voiceId || 'ErXwobaYiN019PkySvjV' // Antoni

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e0f75188-72b9-4fcd-8705-faf3b168b72d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tts/route.ts:CALL_START',message:'Calling ElevenLabs API',data:{textLength:text.length,voice},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'TTS'})}).catch(()=>{});
    // #endregion

    // Call ElevenLabs TTS API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    )

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e0f75188-72b9-4fcd-8705-faf3b168b72d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tts/route.ts:RESPONSE_STATUS',message:'ElevenLabs response received',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'TTS'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      const error = await response.text()
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e0f75188-72b9-4fcd-8705-faf3b168b72d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tts/route.ts:API_ERROR',message:'ElevenLabs API error',data:{status:response.status,error:error.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'TTS'})}).catch(()=>{});
      // #endregion
      console.error('[TTS] ElevenLabs error:', error)
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: response.status }
      )
    }

    // Get the audio as array buffer and convert to base64
    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e0f75188-72b9-4fcd-8705-faf3b168b72d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tts/route.ts:SUCCESS',message:'TTS generation successful',data:{audioLength:base64Audio.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'TTS'})}).catch(()=>{});
    // #endregion

    return NextResponse.json({
      audio: base64Audio,
      contentType: 'audio/mpeg',
    })
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e0f75188-72b9-4fcd-8705-faf3b168b72d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tts/route.ts:EXCEPTION',message:'TTS exception',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'TTS'})}).catch(()=>{});
    // #endregion
    console.error('[TTS] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
