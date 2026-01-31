import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { currentUser } from '@clerk/nextjs/server'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID!

export async function GET() {
  try {
    // Get current user for identity
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check required environment variables
    if (!accountSid || !authToken || !twimlAppSid) {
      console.error('Missing Twilio credentials')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create an access token for the Twilio Voice SDK
    const AccessToken = twilio.jwt.AccessToken
    const VoiceGrant = AccessToken.VoiceGrant

    // Create a unique identity for this user
    const identity = user.emailAddresses[0]?.emailAddress || user.id

    // Create the access token
    const token = new AccessToken(
      accountSid,
      process.env.TWILIO_API_KEY!,
      process.env.TWILIO_API_SECRET!,
      { identity }
    )

    // Create a Voice grant and add it to the token
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: false, // We only need outgoing calls
    })

    token.addGrant(voiceGrant)

    // Return the token
    return NextResponse.json({
      token: token.toJwt(),
      identity,
    })
  } catch (error) {
    console.error('Error generating Twilio token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
