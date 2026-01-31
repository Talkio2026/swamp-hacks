/**
 * Seed Script for Mock Transcripts and Clients
 * 
 * This script reads mock transcript JSON files and inserts them into MongoDB.
 * It also creates corresponding Client records.
 * 
 * Usage:
 *   npx ts-node scripts/seed-mock-data.ts
 *   # or
 *   npx tsx scripts/seed-mock-data.ts
 */

import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not set");
  process.exit(1);
}

// Define schemas inline to avoid import issues
const ConversationEntrySchema = new mongoose.Schema(
  {
    speaker: {
      type: String,
      enum: ["sales_representative", "client"],
      required: true,
    },
    text: { type: String, required: true },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
  },
  { _id: false }
);

const TranscriptSchema = new mongoose.Schema(
  {
    callSid: { type: String, required: true, unique: true, index: true },
    recordingSid: { type: String, required: true },
    transcriptSid: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral", "mixed"],
      default: "neutral",
    },
    conversation: { type: [ConversationEntrySchema], default: [] },
    // Client data fields
    clientId: { type: String, index: true },
    clientName: { type: String },
    companyName: { type: String },
    industry: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String, index: true },
    salesRepName: { type: String },
    initialNotes: { type: String },
    // Call tracking fields
    callNumber: { type: Number },
    status: { type: String },
    outcome: { type: String },
    nextAction: { type: String },
  },
  { timestamps: true }
);

const ClientSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, unique: true, index: true },
    clientName: { type: String, required: true },
    companyName: { type: String, required: true },
    industry: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true, unique: true, index: true },
    salesRepName: { type: String, required: true },
    initialNotes: { type: String, default: null },
    currentStatus: {
      type: String,
      enum: ["prospect", "qualified", "demo_scheduled", "negotiation", "closed_won", "closed_lost"],
      default: "prospect",
    },
    totalCalls: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Get or create models
const Transcript = mongoose.models.Transcript || mongoose.model("Transcript", TranscriptSchema);
const Client = mongoose.models.Client || mongoose.model("Client", ClientSchema);

interface MockTranscript {
  clientId: string;
  clientName: string;
  companyName: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  salesRepName: string;
  callNumber: number;
  callSid: string;
  recordingSid: string;
  transcriptSid: string;
  status: string;
  outcome: string;
  nextAction: string;
  createdAt: string;
  sentiment: string;
  conversation: Array<{
    speaker: string;
    text: string;
    start: number;
    end: number;
  }>;
}

async function seedMockData() {
  console.log("🚀 Starting mock data seed...\n");

  // Connect to MongoDB
  console.log("📡 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI as string);
  console.log("✅ Connected to MongoDB\n");

  const mockDir = path.join(process.cwd(), "mock_transcripts");
  
  // Check if mock_transcripts directory exists
  if (!fs.existsSync(mockDir)) {
    console.error(`❌ Mock transcripts directory not found: ${mockDir}`);
    process.exit(1);
  }

  // Get all client folders (CLT_XXX_name)
  const clientFolders = fs.readdirSync(mockDir).filter((f) => f.startsWith("CLT_"));
  
  console.log(`📁 Found ${clientFolders.length} client folders\n`);

  const clientsCreated: string[] = [];
  const transcriptsCreated: string[] = [];

  for (const folder of clientFolders) {
    const folderPath = path.join(mockDir, folder);
    
    // Get all call JSON files
    const callFiles = fs.readdirSync(folderPath).filter((f) => f.endsWith(".json"));
    
    console.log(`\n📂 Processing ${folder} (${callFiles.length} calls)`);

    let clientCreated = false;

    for (const file of callFiles) {
      const filePath = path.join(folderPath, file);
      const data: MockTranscript = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // Create client record (only once per client)
      if (!clientCreated) {
        try {
          // Determine client status based on outcome
          let currentStatus: string;
          if (data.outcome === "closed_won") {
            currentStatus = "closed_won";
          } else if (data.outcome === "closed_lost") {
            currentStatus = "closed_lost";
          } else if (data.status === "demo") {
            currentStatus = "demo_scheduled";
          } else if (data.status === "negotiation") {
            currentStatus = "negotiation";
          } else if (data.outcome === "interested" || data.outcome === "very_interested") {
            currentStatus = "qualified";
          } else {
            currentStatus = "prospect";
          }

          // Check the last call for this client to get final status
          const lastCallFile = callFiles[callFiles.length - 1];
          const lastCallPath = path.join(folderPath, lastCallFile);
          const lastCallData: MockTranscript = JSON.parse(fs.readFileSync(lastCallPath, "utf-8"));
          
          if (lastCallData.outcome === "closed_won") {
            currentStatus = "closed_won";
          } else if (lastCallData.outcome === "closed_lost") {
            currentStatus = "closed_lost";
          } else if (lastCallData.outcome === "pending_decision") {
            currentStatus = "negotiation";
          }

          await Client.findOneAndUpdate(
            { clientId: data.clientId },
            {
              clientId: data.clientId,
              clientName: data.clientName,
              companyName: data.companyName,
              industry: data.industry,
              contactEmail: data.contactEmail,
              contactPhone: data.contactPhone,
              salesRepName: data.salesRepName,
              currentStatus,
              totalCalls: callFiles.length,
            },
            { upsert: true, new: true }
          );

          clientsCreated.push(data.clientId);
          clientCreated = true;
          console.log(`  ✅ Client: ${data.clientId} - ${data.clientName} (${data.companyName})`);
        } catch (error) {
          console.error(`  ❌ Error creating client ${data.clientId}:`, error);
        }
      }

      // Create transcript record
      try {
        await Transcript.findOneAndUpdate(
          { callSid: data.callSid },
          {
            callSid: data.callSid,
            recordingSid: data.recordingSid,
            transcriptSid: data.transcriptSid,
            createdAt: new Date(data.createdAt),
            sentiment: data.sentiment,
            conversation: data.conversation,
            clientId: data.clientId,
            clientName: data.clientName,
            companyName: data.companyName,
            industry: data.industry,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            salesRepName: data.salesRepName,
            callNumber: data.callNumber,
            status: data.status,
            outcome: data.outcome,
            nextAction: data.nextAction,
          },
          { upsert: true, new: true }
        );

        transcriptsCreated.push(data.callSid);
        console.log(`  ✅ Transcript: ${file} (Call #${data.callNumber})`);
      } catch (error) {
        console.error(`  ❌ Error creating transcript ${data.callSid}:`, error);
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SEED SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Clients created/updated: ${clientsCreated.length}`);
  console.log(`✅ Transcripts created/updated: ${transcriptsCreated.length}`);
  console.log("\nClients:");
  clientsCreated.forEach((id) => console.log(`   - ${id}`));
  console.log("\nTranscripts:");
  transcriptsCreated.forEach((sid) => console.log(`   - ${sid}`));
  console.log("=".repeat(50));

  // Disconnect
  await mongoose.disconnect();
  console.log("\n✅ Done! MongoDB connection closed.");
}

// Run the seed
seedMockData().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
