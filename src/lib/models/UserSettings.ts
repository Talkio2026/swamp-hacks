import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for User Settings
export interface IUserSettings extends Document {
  clerkUserId: string;
  email: string;
  
  // AI Model preferences
  aiModel: {
    provider: "gemini" | "openrouter";
    openRouterModel?: string;  // e.g., "claude-3-sonnet", "gpt-4-turbo"
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Schema for User Settings
const UserSettingsSchema = new Schema<IUserSettings>(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    aiModel: {
      provider: {
        type: String,
        enum: ["gemini", "openrouter"],
        default: "gemini",
      },
      openRouterModel: {
        type: String,
        default: "claude-3-sonnet",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const UserSettings: Model<IUserSettings> =
  mongoose.models.UserSettings || mongoose.model<IUserSettings>("UserSettings", UserSettingsSchema);

export default UserSettings;

// Available AI models for the UI
export const AI_MODELS = [
  // Gemini
  { id: "gemini", provider: "gemini", name: "Google Gemini", description: "Fast and efficient" },
  
  // OpenRouter models
  { id: "claude-3-opus", provider: "openrouter", name: "Claude 3 Opus", description: "Most capable, best for complex analysis" },
  { id: "claude-3-sonnet", provider: "openrouter", name: "Claude 3 Sonnet", description: "Balanced performance and cost" },
  { id: "claude-3-haiku", provider: "openrouter", name: "Claude 3 Haiku", description: "Fastest Claude model" },
  { id: "gpt-4-turbo", provider: "openrouter", name: "GPT-4 Turbo", description: "OpenAI's latest GPT-4" },
  { id: "gpt-4", provider: "openrouter", name: "GPT-4", description: "Original GPT-4" },
  { id: "gpt-3.5-turbo", provider: "openrouter", name: "GPT-3.5 Turbo", description: "Fast and affordable" },
  { id: "llama-3-70b", provider: "openrouter", name: "Llama 3 70B", description: "Meta's open model" },
  { id: "mixtral-8x7b", provider: "openrouter", name: "Mixtral 8x7B", description: "Mistral's mixture of experts" },
] as const;

export type AIModelId = typeof AI_MODELS[number]["id"];
