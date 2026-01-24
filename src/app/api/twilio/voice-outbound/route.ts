import { NextRequest } from "next/server";

const REP_PHONE = process.env.REP_PHONE_NUMBER || "";
const NGROK_URL = process.env.NGROK_URL || "";

// POST /api/twilio/voice-outbound - TwiML for outbound calls
// This is called by Twilio when the outbound call connects to the client
export async function POST(req: NextRequest) {
  console.log("[Voice Outbound] Call connected, returning TwiML");

  // When the client answers, we need to connect them to the sales rep
  // The sales rep should be connected via their browser (using Twilio Client SDK)
  // or we can dial their phone number
  
  if (!REP_PHONE) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sales rep phone number is not configured. Goodbye.</Say>
  <Hangup/>
</Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  }

  // Recording is already set up in the outbound API call
  // Here we just connect the client to the sales rep
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Please hold while we connect you.</Say>
  <Dial callerId="${process.env.TWILIO_PHONE_NUMBER}">
    <Number>${REP_PHONE}</Number>
  </Dial>
</Response>`;

  return new Response(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
}

// Also handle GET for testing
export async function GET(req: NextRequest) {
  return POST(req);
}
