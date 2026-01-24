import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transcript from "@/lib/models/Transcript";

interface RouteParams {
  params: Promise<{ callSid: string }>;
}

// GET /api/transcripts/[callSid] - Get a single transcript by callSid
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { callSid } = await params;

    if (!callSid) {
      return NextResponse.json(
        { error: "Call SID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the transcript
    const transcript = await Transcript.findOne({ callSid });

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("[API] GET /api/transcripts/[callSid] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcript", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
