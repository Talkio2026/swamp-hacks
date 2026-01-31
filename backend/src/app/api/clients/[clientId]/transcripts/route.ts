import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transcript from "@/lib/models/Transcript";

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

// GET /api/clients/[clientId]/transcripts - Get all transcripts for a client
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { clientId } = await params;

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find all transcripts for this client
    const transcripts = await Transcript.find({ clientId }).sort({ createdAt: -1 });

    return NextResponse.json({
      transcripts,
      count: transcripts.length,
    });
  } catch (error) {
    console.error("[API] GET /api/clients/[clientId]/transcripts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcripts", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
