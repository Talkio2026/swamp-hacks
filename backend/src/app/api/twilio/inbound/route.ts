import { NextRequest } from "next/server";

// Rep phone number in E164 format (e.g., +15551234567)
const REP_PHONE = process.env.REP_PHONE_NUMBER || "";
const NGROK_URL = process.env.NGROK_URL || "https://epibolic-rugulose-leda.ngrok-free.dev";

export async function POST(req: NextRequest) {
  // Twilio expects TwiML XML
  if (!REP_PHONE) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Rep phone number is not configured.</Say>
  <Hangup/>
</Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  }

  // Dual-channel recording with status callback for transcription
  const recordingStatusCallback = `${NGROK_URL}/api/twilio/recording-status`;
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Recording recordingChannels="dual" recordingStatusCallback="${recordingStatusCallback}" recordingStatusCallbackMethod="POST"/>
  </Start>
  <Say>This call may be recorded for quality and training. Connecting you now.</Say>
  <Dial>
    <Number>${REP_PHONE}</Number>
  </Dial>
</Response>`;

  console.log("[Twilio Voice] Incoming call, starting dual-channel recording");
  return new Response(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
}
