import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import connectToDatabase from "@/lib/mongodb";
import Transcript from "@/lib/models/Transcript";
import Client, { normalizePhoneNumber } from "@/lib/models/Client";
import { transcribeWithDeepgram, deepgramToConversation } from "@/lib/transcription/deepgram";
import { analyzeTranscript } from "@/lib/ai/analyzer";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const intelligenceServiceSid = process.env.TWILIO_INTELLIGENCE_SERVICE_SID;

// Transcription provider: "deepgram" (recommended) or "twilio"
const transcriptionProvider = process.env.TRANSCRIPTION_PROVIDER || "deepgram";

interface ConversationEntry {
  speaker: "sales_representative" | "client";
  text: string;
  start: number;
  end: number;
}

interface TranscriptOutput {
  callSid: string;
  recordingSid: string;
  transcriptSid: string;
  createdAt: string;
  sentiment: string;  // "positive", "negative", "neutral", or "mixed"
  conversation: ConversationEntry[];
}

// Helper to delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Poll for transcript completion
async function waitForTranscriptCompletion(
  client: Twilio.Twilio,
  transcriptSid: string,
  maxWaitMs: number = 5 * 60 * 1000 // 5 minutes
): Promise<boolean> {
  const startTime = Date.now();
  const pollIntervalMs = 5000; // 5 seconds

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const transcript = await client.intelligence.v2.transcripts(transcriptSid).fetch();
      console.log(`[Recording Status] Transcript ${transcriptSid} status: ${transcript.status}`);

      if (transcript.status === "completed") {
        return true;
      } else if (transcript.status === "failed") {
        console.error(`[Recording Status] Transcript failed: ${transcriptSid}`);
        return false;
      }

      await sleep(pollIntervalMs);
    } catch (error) {
      console.error(`[Recording Status] Error polling transcript:`, error);
      await sleep(pollIntervalMs);
    }
  }

  console.error(`[Recording Status] Transcript timeout: ${transcriptSid}`);
  return false;
}

export async function POST(req: NextRequest) {
  // Parse form data from Twilio
  const formData = await req.formData();
  const recordingSid = formData.get("RecordingSid") as string;
  const callSid = formData.get("CallSid") as string;
  const recordingStatus = formData.get("RecordingStatus") as string;
  
  // Get phone numbers from Twilio callback
  // "To" is the number that was dialed (client's number)
  // "From" is our Twilio number
  const toNumber = formData.get("To") as string | null;
  const fromNumber = formData.get("From") as string | null;
  
  // Get the dialed number from query parameter (passed from voice TwiML)
  // This is more reliable than Twilio's form data for browser-originated calls
  const url = new URL(req.url);
  const dialedNumber = url.searchParams.get("dialedNumber");

  console.log(`[Recording Status] Received callback: RecordingSid=${recordingSid}, CallSid=${callSid}, Status=${recordingStatus}, To=${toNumber}, From=${fromNumber}, DialedNumber=${dialedNumber}`);

  // Immediately respond 200 to Twilio
  // Process transcription in background
  if (recordingStatus !== "completed") {
    console.log(`[Recording Status] Ignoring status: ${recordingStatus}`);
    return NextResponse.json({ status: "ok" });
  }

  // Validate environment - only require Intelligence SID if using Twilio transcription
  const useDeepgram = transcriptionProvider === "deepgram" && process.env.DEEPGRAM_API_KEY;
  
  if (!accountSid || !authToken) {
    console.error("[Recording Status] Missing Twilio credentials (Account SID or Auth Token)");
    return NextResponse.json({ status: "error", message: "Missing Twilio credentials" }, { status: 500 });
  }
  
  if (!useDeepgram && !intelligenceServiceSid) {
    console.error("[Recording Status] Missing Twilio Intelligence Service SID (required when not using Deepgram)");
    return NextResponse.json({ status: "error", message: "Missing Intelligence Service SID" }, { status: 500 });
  }

  // Process transcription asynchronously (don't await)
  // Use dialedNumber from query param (most reliable), fallback to toNumber from form data
  const phoneForMatching = dialedNumber || toNumber;
  processTranscription(recordingSid, callSid, phoneForMatching).catch((err) => {
    console.error(`[Recording Status] Background transcription error:`, err);
  });

  return NextResponse.json({ status: "ok" });
}

async function processTranscription(recordingSid: string, callSid: string, dialedPhoneNumber: string | null) {
  const twilioClient = Twilio(accountSid, authToken);

  console.log(`[Recording Status] Creating transcript for recording: ${recordingSid} using ${transcriptionProvider}`);

  // If phone number not provided in webhook, fetch it from Twilio call details
  let phoneNumber = dialedPhoneNumber;
  let isOutbound = true;
  console.log(`[Recording Status] Initial phone number from webhook: ${phoneNumber}`);
  
  if (!phoneNumber) {
    try {
      console.log(`[Recording Status] Fetching call details for callSid: ${callSid}`);
      const callDetails = await twilioClient.calls(callSid).fetch();
      console.log(`[Recording Status] Call details - To: ${callDetails.to}, From: ${callDetails.from}, Direction: ${callDetails.direction}`);
      
      // Use "to" for outbound calls (we're calling the client)
      // Use "from" for inbound calls (client is calling us)
      isOutbound = callDetails.direction === 'outbound-api' || callDetails.direction === 'outbound-dial';
      phoneNumber = isOutbound ? callDetails.to : callDetails.from;
      
      console.log(`[Recording Status] Using phone number: ${phoneNumber} (direction: ${callDetails.direction})`);
    } catch (fetchError) {
      console.error(`[Recording Status] Failed to fetch call details:`, fetchError);
    }
  }

  let mergedConversation: ConversationEntry[] = [];
  let overallSentiment = "neutral";
  let transcriptSid = "";

  try {
    // ========== DEEPGRAM TRANSCRIPTION (Recommended - Better Accuracy) ==========
    if (transcriptionProvider === "deepgram" && process.env.DEEPGRAM_API_KEY) {
      console.log(`[Recording Status] Using Deepgram for transcription`);
      
      // Get recording URL from Twilio (requires auth)
      const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${recordingSid}.wav`;
      
      // Add basic auth to URL for Deepgram to fetch
      const authRecordingUrl = recordingUrl.replace("https://", `https://${accountSid}:${authToken}@`);
      
      const deepgramResult = await transcribeWithDeepgram(authRecordingUrl);
      
      if (deepgramResult && deepgramResult.utterances.length > 0) {
        // Convert to our format - first speaker (0) is typically the client
        // (they answer with "Hello?" for outbound, or start the conversation for inbound)
        // So firstSpeakerIsRep = false in most cases
        mergedConversation = deepgramToConversation(deepgramResult.utterances, false);
        transcriptSid = `deepgram_${recordingSid}`;
        
        // Simple sentiment based on keywords (Deepgram doesn't provide sentiment natively)
        const fullText = deepgramResult.fullTranscript.toLowerCase();
        const positiveWords = ["great", "excellent", "perfect", "thanks", "appreciate", "love", "wonderful", "amazing"];
        const negativeWords = ["problem", "issue", "frustrated", "annoyed", "disappointed", "terrible", "bad", "hate"];
        
        const positiveCount = positiveWords.filter(w => fullText.includes(w)).length;
        const negativeCount = negativeWords.filter(w => fullText.includes(w)).length;
        
        if (positiveCount > negativeCount * 2) overallSentiment = "positive";
        else if (negativeCount > positiveCount * 2) overallSentiment = "negative";
        else if (positiveCount > 0 && negativeCount > 0) overallSentiment = "mixed";
        else overallSentiment = "neutral";
        
        console.log(`[Recording Status] Deepgram transcription complete: ${mergedConversation.length} turns, confidence: ${(deepgramResult.confidence * 100).toFixed(1)}%`);
      } else {
        console.log(`[Recording Status] Deepgram returned no results, falling back to Twilio`);
      }
    }
    
    // ========== TWILIO VOICE INTELLIGENCE (Fallback) ==========
    if (mergedConversation.length === 0 && intelligenceServiceSid) {
      console.log(`[Recording Status] Using Twilio Voice Intelligence for transcription`);
      
      // Create transcript using Twilio Conversational Intelligence
      // dataLogging: true + redaction: false = keeps actual names/dates (no PII masking)
      // Note: These properties exist in API but may not be in SDK types
      const transcript = await twilioClient.intelligence.v2.transcripts.create({
        serviceSid: intelligenceServiceSid!,
        channel: {
          media_properties: {
            source_sid: recordingSid,
          },
        },
        customerKey: callSid,
        dataLogging: true,  // Store full transcript data (required for no redaction)
        redaction: false,   // Disable PII redaction - keeps names, dates, numbers visible
      } as Parameters<typeof twilioClient.intelligence.v2.transcripts.create>[0]);

      transcriptSid = transcript.sid;
      console.log(`[Recording Status] Transcript created: ${transcript.sid}`);

      // Poll until completed
      const completed = await waitForTranscriptCompletion(twilioClient, transcript.sid);
      if (!completed) {
        console.error(`[Recording Status] Transcript did not complete: ${transcript.sid}`);
        return;
      }

      // Fetch sentences
      console.log(`[Recording Status] Fetching sentences for transcript: ${transcript.sid}`);
      const sentences = await twilioClient.intelligence.v2
        .transcripts(transcript.sid)
        .sentences.list({ limit: 5000 });

      console.log(`[Recording Status] Retrieved ${sentences.length} sentences`);

      // Process sentences into conversation timeline
      const conversation: ConversationEntry[] = [];

      // Sentiment tracking
      let totalSentimentScore = 0;
      let sentimentCount = 0;
      let positiveCount = 0;
      let negativeCount = 0;

      for (const sentence of sentences) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sentenceAny = sentence as any;
        
        // Extract text - try multiple possible property names
        const text = sentence.transcript || sentenceAny.text || sentenceAny.transcript || sentenceAny.words || "";
        
        // Extract sentiment from sentence (Twilio provides this when sentiment analysis is enabled)
        const sentimentScore = sentenceAny.sentiment?.score ?? sentenceAny.sentimentScore ?? null;
        
        if (sentimentScore !== null && sentimentScore !== undefined) {
          const label = sentimentScore > 0.1 ? "positive" : sentimentScore < -0.1 ? "negative" : "neutral";
          totalSentimentScore += sentimentScore;
          sentimentCount++;
          if (label === "positive") positiveCount++;
          else if (label === "negative") negativeCount++;
        }

        // Channel mapping for Twilio dual-channel recordings:
        // For outbound calls (browser/app → phone):
        //   mediaChannel 1 = callee (client being called)
        //   mediaChannel 2 = caller (sales rep)
        // For inbound calls (phone → rep):
        //   mediaChannel 1 = caller (client calling in)
        //   mediaChannel 2 = callee (sales rep answering)
        // So: channel 1 is always the "other party" (client), channel 2 is the rep
        const speaker: "sales_representative" | "client" = 
          sentence.mediaChannel === 2 ? "sales_representative" : "client";

        const entry: ConversationEntry = {
          speaker,
          text,
          start: parseFloat(String(sentence.startTime)) || 0,
          end: parseFloat(String(sentence.endTime)) || 0,
        };

        conversation.push(entry);
      }

      // Sort conversation by start time
      conversation.sort((a, b) => a.start - b.start);

      // Merge consecutive messages from the same speaker
      for (const entry of conversation) {
        const lastEntry = mergedConversation[mergedConversation.length - 1];
        
        if (lastEntry && lastEntry.speaker === entry.speaker) {
          // Same speaker - merge text and extend end time
          lastEntry.text = `${lastEntry.text} ${entry.text}`;
          lastEntry.end = entry.end;
        } else {
          // Different speaker - add as new entry
          mergedConversation.push({ ...entry });
        }
      }

      console.log(`[Recording Status] Merged ${conversation.length} sentences into ${mergedConversation.length} conversation turns`);

      // Calculate overall sentiment
      const avgScore = sentimentCount > 0 ? totalSentimentScore / sentimentCount : 0;
      const getLabel = (score: number) => score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral";
      
      // Determine overall sentiment (mixed if significant variation)
      if (positiveCount > 0 && negativeCount > 0 && Math.abs(positiveCount - negativeCount) < Math.max(positiveCount, negativeCount) * 0.5) {
        overallSentiment = "mixed";
      } else {
        overallSentiment = getLabel(avgScore);
      }
    }

    console.log(`[Recording Status] Sentiment analysis: overall=${overallSentiment}`);

    // Build output object
    const output: TranscriptOutput = {
      callSid,
      recordingSid,
      transcriptSid,
      createdAt: new Date().toISOString(),
      sentiment: overallSentiment,
      conversation: mergedConversation,
    };

    // Connect to MongoDB and save transcript
    await connectToDatabase();
    
    // Look up client data by matching the dialed phone number
    let clientData: Record<string, unknown> = {};
    let callNumber = 1;
    
    try {
      if (phoneNumber) {
        // Normalize the phone number for matching
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        console.log(`[Recording Status] Looking up client by phone: ${phoneNumber} -> normalized: ${normalizedPhone}`);
        
        // Also log all clients in DB for debugging
        const allClients = await Client.find({}, { clientId: 1, clientName: 1, contactPhone: 1 });
        console.log(`[Recording Status] Clients in database:`, allClients.map(c => `${c.clientId}: ${c.contactPhone}`).join(', '));
        
        // Find client by phone number
        const matchedClient = await Client.findOne({ contactPhone: normalizedPhone });
        console.log(`[Recording Status] Match result:`, matchedClient ? `Found ${matchedClient.clientId}` : 'No match');
        
        if (matchedClient) {
          // Increment call count and get call number
          callNumber = matchedClient.totalCalls + 1;
          matchedClient.totalCalls = callNumber;
          await matchedClient.save();
          
          // Extract client data to merge with transcript
          clientData = {
            clientId: matchedClient.clientId,
            clientName: matchedClient.clientName,
            companyName: matchedClient.companyName,
            industry: matchedClient.industry,
            contactEmail: matchedClient.contactEmail,
            contactPhone: matchedClient.contactPhone,
            salesRepName: matchedClient.salesRepName,
            salesRepEmail: matchedClient.salesRepEmail,
            initialNotes: matchedClient.initialNotes,
            callNumber,
            status: callNumber === 1 ? "initial_contact" : "followup",
          };
          
          console.log(`[Recording Status] Matched client by phone: ${matchedClient.clientId} - ${matchedClient.clientName} (Call #${callNumber})`);
        } else {
          console.log(`[Recording Status] No client found with phone number: ${normalizedPhone}`);
        }
      } else {
        console.log(`[Recording Status] No phone number provided for client matching`);
      }
    } catch (clientError) {
      console.error(`[Recording Status] Error fetching client data:`, clientError);
      // Continue without client data - transcript will still be saved
    }
    
    // Use upsert to update if exists or create if not
    const savedTranscript = await Transcript.findOneAndUpdate(
      { callSid },
      {
        callSid,
        recordingSid,
        transcriptSid,
        sentiment: overallSentiment,
        conversation: mergedConversation,
        transcriptionProvider: transcriptionProvider === "deepgram" && process.env.DEEPGRAM_API_KEY ? "deepgram" : "twilio",
        // Merge client data (will be empty object if no client found)
        ...clientData,
      },
      { upsert: true, new: true }
    );

    console.log(`[Recording Status] Transcript saved to MongoDB: ${savedTranscript._id}`);
    console.log(`[Recording Status] Summary: ${mergedConversation.length} conversation turns, sentiment: ${overallSentiment}`);
    
    if (Object.keys(clientData).length > 0) {
      console.log(`[Recording Status] Client data merged: ${clientData.clientId} - ${clientData.clientName}`);
    }
    
    // ========== AUTOMATIC AI ANALYSIS ==========
    // Run AI analysis automatically after transcript is saved
    if (mergedConversation.length > 0) {
      try {
        console.log(`[Recording Status] Starting automatic AI analysis for callSid: ${callSid}`);
        
        // Re-fetch the transcript to ensure we have the latest data with all fields
        const transcriptForAnalysis = await Transcript.findOne({ callSid });
        
        if (transcriptForAnalysis) {
          // Run analysis with OpenRouter as primary provider
          const analysis = await analyzeTranscript(transcriptForAnalysis, { provider: 'openrouter' });
          
          console.log(`[Recording Status] AI analysis completed in ${analysis.processingTimeMs}ms`);
          
          // Save the analysis results back to the transcript
          transcriptForAnalysis.analysis = analysis;
          
          // Update transcript fields based on analysis
          if (analysis.overallSentiment) {
            transcriptForAnalysis.sentiment = analysis.overallSentiment;
          }
          if (analysis.currentStage) {
            transcriptForAnalysis.status = mapStageToStatus(analysis.currentStage);
          }
          if (analysis.nextSteps && analysis.nextSteps.length > 0) {
            transcriptForAnalysis.nextAction = analysis.nextSteps[0];
          }
          
          await transcriptForAnalysis.save();
          console.log(`[Recording Status] AI analysis saved to transcript`);
        }
      } catch (analysisError) {
        // Don't fail the whole process if analysis fails - transcript is already saved
        console.error(`[Recording Status] AI analysis failed (transcript still saved):`, analysisError);
      }
    }
  } catch (error) {
    console.error(`[Recording Status] Error processing transcription:`, error);
    throw error;
  }
}

// Map analysis stage to transcript status
type TranscriptStatus = "initial_contact" | "demo" | "followup" | "negotiation" | "contract_accepted" | "rejected" | "in_progress";

function mapStageToStatus(stage: string): TranscriptStatus {
  const stageMap: Record<string, TranscriptStatus> = {
    'initial_contact': 'initial_contact',
    'discovery': 'initial_contact',
    'demo': 'demo',
    'proposal': 'followup',
    'negotiation': 'negotiation',
    'closing': 'negotiation',
    'closed_won': 'contract_accepted',
    'closed_lost': 'rejected',
  };
  return stageMap[stage] || 'in_progress';
}
