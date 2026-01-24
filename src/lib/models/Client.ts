import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for the Client document
export interface IClient extends Document {
  clientId: string;
  clientName: string;
  companyName: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  salesRepName: string;
  salesRepEmail: string;
  initialNotes?: string;
  currentStatus: "prospect" | "qualified" | "demo_scheduled" | "negotiation" | "closed_won" | "closed_lost";
  totalCalls: number;
  createdAt: Date;
  updatedAt: Date;
}

// Main Client schema
const ClientSchema = new Schema<IClient>(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    salesRepName: {
      type: String,
      required: true,
    },
    salesRepEmail: {
      type: String,
      required: true,
      index: true,
    },
    initialNotes: {
      type: String,
      default: null,
    },
    currentStatus: {
      type: String,
      enum: ["prospect", "qualified", "demo_scheduled", "negotiation", "closed_won", "closed_lost"],
      default: "prospect",
    },
    totalCalls: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to generate next client ID
ClientSchema.statics.generateClientId = async function (): Promise<string> {
  const lastClient = await this.findOne().sort({ clientId: -1 }).exec();
  
  if (!lastClient) {
    return "CLT_001";
  }
  
  const lastIdNum = parseInt(lastClient.clientId.split("_")[1], 10);
  const nextIdNum = lastIdNum + 1;
  return `CLT_${nextIdNum.toString().padStart(3, "0")}`;
};

// Static method to find client by phone number
ClientSchema.statics.findByPhone = function (phone: string) {
  // Normalize phone number (remove non-digits except leading +)
  const normalizedPhone = normalizePhoneNumber(phone);
  return this.findOne({ contactPhone: normalizedPhone });
};

// Helper function to normalize phone numbers
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  const hasPlus = phone.startsWith("+");
  const digits = phone.replace(/\D/g, "");
  
  // Add country code if not present (assuming US)
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  return hasPlus ? `+${digits}` : `+${digits}`;
}

// Interface for the model with static methods
interface IClientModel extends Model<IClient> {
  generateClientId(): Promise<string>;
  findByPhone(phone: string): Promise<IClient | null>;
}

// Prevent model recompilation in development (Next.js hot reload)
const Client: IClientModel =
  (mongoose.models.Client as IClientModel) || mongoose.model<IClient, IClientModel>("Client", ClientSchema);

export default Client;
