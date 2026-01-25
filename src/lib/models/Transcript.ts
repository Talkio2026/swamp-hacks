import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for a single conversation entry
export interface IConversationEntry {
  speaker: "sales_representative" | "client";
  text: string;
  start: number;
  end: number;
}

// Interface for scheduled meeting detection
export interface IScheduledMeeting {
  detected: boolean;
  date?: string;        // YYYY-MM-DD format
  time?: string;        // HH:MM 24-hour format  
  duration?: number;    // minutes
  type?: "call" | "demo" | "meeting";
  notes?: string;       // What was agreed to be discussed
}

// Interface for AI Analysis result
export interface IAnalysis {
  summary: string;
  keyPoints: string[];
  overallSentiment: "positive" | "neutral" | "negative" | "mixed";
  clientInterestLevel: "high" | "medium" | "low";
  objections: string[];
  buyingSignals: string[];
  risks: string[];
  nextSteps: string[];
  suggestedFollowUpDate?: string;
  currentStage: string;
  stageConfidence: number;
  scheduledMeeting?: IScheduledMeeting;
  analyzedAt: Date;
  modelUsed: string;
  processingTimeMs: number;
}

// Interface for the Transcript document
export interface ITranscript extends Document {
  // Core Twilio fields (required)
  callSid: string;
  recordingSid: string;
  transcriptSid: string;
  createdAt: Date;
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  conversation: IConversationEntry[];
  
  // Client data fields (populated from dashboard)
  clientId?: string;
  clientName?: string;
  companyName?: string;
  industry?: string;
  contactEmail?: string;
  contactPhone?: string;
  salesRepName?: string;
  salesRepEmail?: string;
  initialNotes?: string;
  
  // Call tracking fields
  callNumber?: number;
  status?: "initial_contact" | "demo" | "followup" | "negotiation" | "contract_accepted" | "rejected" | "in_progress";
  outcome?: "interested" | "very_interested" | "hesitant_interest" | "pending_decision" | "closed_won" | "closed_lost" | "rejected";
  nextAction?: string;
  
  // AI Analysis
  analysis?: IAnalysis;
  
  // Vector Search Embedding
  embedding?: number[];           // 1536-dimension vector for semantic search
  embeddingText?: string;         // The text that was embedded (for debugging)
  embeddingGeneratedAt?: Date;    // When the embedding was last generated
}

// Schema for conversation entries
const ConversationEntrySchema = new Schema<IConversationEntry>(
  {
    speaker: {
      type: String,
      enum: ["sales_representative", "client"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    start: {
      type: Number,
      required: true,
    },
    end: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

// Main Transcript schema
const TranscriptSchema = new Schema<ITranscript>(
  {
    // Core Twilio fields (required)
    callSid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    recordingSid: {
      type: String,
      required: true,
    },
    transcriptSid: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral", "mixed"],
      default: "neutral",
    },
    conversation: {
      type: [ConversationEntrySchema],
      default: [],
    },
    
    // Client data fields (populated from dashboard - all optional)
    clientId: {
      type: String,
      index: true,
    },
    clientName: {
      type: String,
    },
    companyName: {
      type: String,
    },
    industry: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    contactPhone: {
      type: String,
      index: true,
    },
    salesRepName: {
      type: String,
    },
    salesRepEmail: {
      type: String,
      index: true,
    },
    initialNotes: {
      type: String,
    },
    
    // Call tracking fields
    callNumber: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["initial_contact", "demo", "followup", "negotiation", "contract_accepted", "rejected", "in_progress"],
    },
    outcome: {
      type: String,
      enum: ["interested", "very_interested", "hesitant_interest", "pending_decision", "closed_won", "closed_lost", "rejected"],
    },
    nextAction: {
      type: String,
    },
    
    // AI Analysis
    analysis: {
      summary: String,
      keyPoints: [String],
      overallSentiment: {
        type: String,
        enum: ["positive", "neutral", "negative", "mixed"],
      },
      clientInterestLevel: {
        type: String,
        enum: ["high", "medium", "low"],
      },
      objections: [String],
      buyingSignals: [String],
      risks: [String],
      nextSteps: [String],
      suggestedFollowUpDate: String,
      currentStage: String,
      stageConfidence: Number,
      scheduledMeeting: {
        detected: { type: Boolean, default: false },
        date: String,      // YYYY-MM-DD
        time: String,      // HH:MM
        duration: Number,  // minutes
        type: {
          type: String,
          enum: ["call", "demo", "meeting"],
        },
        notes: String,
      },
      analyzedAt: Date,
      modelUsed: String,
      processingTimeMs: Number,
    },
    
    // Vector Search Embedding (1536 dimensions for text-embedding-3-small)
    embedding: {
      type: [Number],
      index: false,  // We'll create a vector search index in Atlas
    },
    embeddingText: {
      type: String,
    },
    embeddingGeneratedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Prevent model recompilation in development (Next.js hot reload)
const Transcript: Model<ITranscript> =
  mongoose.models.Transcript || mongoose.model<ITranscript>("Transcript", TranscriptSchema);

export default Transcript;
