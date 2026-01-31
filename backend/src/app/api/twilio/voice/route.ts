import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const twilioNumber = process.env.TWILIO_PHONE_NUMBER!
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NGROK_URL

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const to = formData.get('To') as string
    const from = formData.get('From') as string

    console.log(`[Voice TwiML] Outbound call request - To: ${to}, From: ${from}`)

    const VoiceResponse = twilio.twiml.VoiceResponse
    const twiml = new VoiceResponse()

    if (to) {
      // Normalize the destination phone number for the callback
      // Add +1 prefix if it's a 10-digit US number
      let normalizedTo = to
      if (/^\d{10}$/.test(to)) {
        normalizedTo = `+1${to}`
      } else if (/^\d{11}$/.test(to) && to.startsWith('1')) {
        normalizedTo = `+${to}`
      } else if (!to.startsWith('+') && /^\d+$/.test(to)) {
        normalizedTo = `+${to}`
      }

      // Dial the destination number
      // answerOnBridge: true makes caller hear ringing immediately instead of silence
      // Include destination phone in callback URL for client matching
      const dial = twiml.dial({
        callerId: twilioNumber,
        answerOnBridge: true,
        record: 'record-from-answer-dual',
        recordingStatusCallback: `${baseUrl}/api/twilio/recording-status?dialedNumber=${encodeURIComponent(normalizedTo)}`,
        recordingStatusCallbackMethod: 'POST',
        recordingStatusCallbackEvent: ['completed'],
      })

      // Check if it's a phone number (starts with + or digit) or a client
      if (/^[\d+]/.test(to)) {
        dial.number(to)
      } else {
        dial.client(to)
      }
    } else {
      twiml.say('No destination number provided.')
    }

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Error generating TwiML:', error)
    
    const VoiceResponse = twilio.twiml.VoiceResponse
    const twiml = new VoiceResponse()
    twiml.say('An error occurred. Please try again.')
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  }
}
