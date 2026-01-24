import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for a single conversation entry
export interface IConversationEntry {
  speaker: "sales_representative" | "client";
  text: string;
  start: number;
  end: number;
}

// Interface for the Transcript document
export interface ITranscript extends Document {
  callSid: string;
  recordingSid: string;
  transcriptSid: string;
  createdAt: Date;
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  conversation: IConversationEntry[];
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
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Prevent model recompilation in development (Next.js hot reload)
const Transcript: Model<ITranscript> =
  mongoose.models.Transcript || mongoose.model<ITranscript>("Transcript", TranscriptSchema);

export default Transcript;
