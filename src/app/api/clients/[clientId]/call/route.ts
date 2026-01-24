import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import connectDB from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import CallClientMapping from "@/lib/models/CallClientMapping";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

// POST /api/clients/[clientId]/call - Initiate a call to a client
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { clientId } = await params;
    
    // Validate Twilio configuration
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return NextResponse.json(
        { error: "Twilio configuration missing" },
        { status: 500 }
      );
    }

    await connectDB();

    // Find the client
    const client = await Client.findOne({ clientId });
    
    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Get the base URL for callbacks
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NGROK_URL;
    
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Base URL not configured (NEXT_PUBLIC_BASE_URL or NGROK_URL)" },
        { status: 500 }
      );
    }

    // Initialize Twilio client
    const twilioClient = Twilio(accountSid, authToken);

    // Initiate the call
    const call = await twilioClient.calls.create({
      to: client.contactPhone,
      from: twilioPhoneNumber,
      url: `${baseUrl}/api/twilio/voice`, // TwiML endpoint
      record: true,
      recordingStatusCallback: `${baseUrl}/api/twilio/recording-status`,
      recordingStatusCallbackEvent: ["completed"],
      statusCallback: `${baseUrl}/api/twilio/call-status`,
      statusCallbackEvent: ["completed"],
    });

    console.log(`[Call API] Initiated call to ${client.clientName} (${client.companyName}): ${call.sid}`);

    // Create the call-client mapping
    await CallClientMapping.create({
      callSid: call.sid,
      clientId: client.clientId,
    });

    console.log(`[Call API] Created call-client mapping: ${call.sid} -> ${client.clientId}`);

    return NextResponse.json({
      message: "Call initiated successfully",
      callSid: call.sid,
      client: {
        clientId: client.clientId,
        clientName: client.clientName,
        companyName: client.companyName,
        contactPhone: client.contactPhone,
      },
    });
  } catch (error) {
    console.error("[API] POST /api/clients/[clientId]/call error:", error);
    return NextResponse.json(
      { error: "Failed to initiate call", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
