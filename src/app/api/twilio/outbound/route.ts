import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const NGROK_URL = process.env.NGROK_URL || "";

// POST /api/twilio/outbound - Initiate an outbound call to a client
export async function POST(request: NextRequest) {
  try {
    // Validate environment
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error("[Outbound] Missing Twilio credentials");
      return NextResponse.json(
        { error: "Twilio is not configured" },
        { status: 500 }
      );
    }

    if (!NGROK_URL) {
      console.error("[Outbound] Missing NGROK_URL");
      return NextResponse.json(
        { error: "NGROK_URL is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { phoneNumber, clientName } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    console.log(`[Outbound] Initiating call to ${phoneNumber} (${clientName || 'Unknown'})`);

    const twilioClient = Twilio(accountSid, authToken);

    // Create outbound call
    // This will call the client's phone number FROM our Twilio number
    // When the client answers, Twilio will request TwiML from our voice-outbound endpoint
    const call = await twilioClient.calls.create({
      to: phoneNumber,           // Client's phone number (the one we're calling)
      from: twilioPhoneNumber,   // Our Twilio number
      url: `${NGROK_URL}/api/twilio/voice-outbound`,  // TwiML instructions when call connects
      record: true,
      recordingChannels: "dual",
      recordingStatusCallback: `${NGROK_URL}/api/twilio/recording-status`,
      recordingStatusCallbackEvent: ["completed"],
    });

    console.log(`[Outbound] Call initiated: ${call.sid} to ${phoneNumber}`);

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      to: phoneNumber,
      from: twilioPhoneNumber,
      status: call.status,
    });
  } catch (error) {
    console.error("[Outbound] Error initiating call:", error);
    return NextResponse.json(
      { error: "Failed to initiate call", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
