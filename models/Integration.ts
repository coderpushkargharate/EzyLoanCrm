import mongoose, { Schema, Document } from 'mongoose';

export type IntegrationProvider = 'facebook' | 'whatsapp';

export interface IIntegration extends Document {
  provider: IntegrationProvider;
  enabled: boolean;
  // Provider-specific credentials (Facebook page token, WhatsApp token, etc.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;
  connectedAt?: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    provider: { type: String, required: true, unique: true, enum: ['facebook', 'whatsapp'] },
    enabled: { type: Boolean, default: false },
    config: { type: Schema.Types.Mixed, default: {} },
    connectedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Integration ||
  mongoose.model<IIntegration>('Integration', IntegrationSchema);
