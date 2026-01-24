import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for CallClientMapping - links Twilio calls to clients
export interface ICallClientMapping extends Document {
  callSid: string;
  clientId: string;
  createdAt: Date;
}

// CallClientMapping schema
const CallClientMappingSchema = new Schema<ICallClientMapping>(
  {
    callSid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to create mapping when call is initiated
CallClientMappingSchema.statics.createMapping = async function (
  callSid: string,
  clientId: string
): Promise<ICallClientMapping> {
  return this.create({ callSid, clientId });
};

// Static method to get client ID for a call
CallClientMappingSchema.statics.getClientIdForCall = async function (
  callSid: string
): Promise<string | null> {
  const mapping = await this.findOne({ callSid });
  return mapping ? mapping.clientId : null;
};

// Interface for the model with static methods
interface ICallClientMappingModel extends Model<ICallClientMapping> {
  createMapping(callSid: string, clientId: string): Promise<ICallClientMapping>;
  getClientIdForCall(callSid: string): Promise<string | null>;
}

// Prevent model recompilation in development
const CallClientMapping: ICallClientMappingModel =
  (mongoose.models.CallClientMapping as ICallClientMappingModel) ||
  mongoose.model<ICallClientMapping, ICallClientMappingModel>("CallClientMapping", CallClientMappingSchema);

export default CallClientMapping;
