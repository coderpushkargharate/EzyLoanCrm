import mongoose, { Schema, Document } from 'mongoose';

export type LeadStatus =
  | 'New'
  | 'No Response'
  | 'Cold'
  | 'Warm'
  | '1. Interested'
  | '0. Not Interested'
  | 'Lost'
  | 'Converted'
  | 'Out Of Odisha';

export interface ILead extends Document {
  name: string;
  displayName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
  status: LeadStatus;
  source?: string;
  sourceMessageId?: string;
  opportunitySize?: string;
  leadStage?: string;
  followUpDate?: Date;
  lastActivity?: Date;
  assignedTo?: mongoose.Types.ObjectId;
  groups?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    displayName: { type: String, trim: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    notes: { type: String },
    opportunitySize: { type: String, trim: true },
    leadStage: { type: String, trim: true },
    status: {
      type: String,
      enum: ['New', 'No Response', 'Cold', 'Warm', '1. Interested', '0. Not Interested', 'Lost', 'Converted', 'Out Of Odisha'],
      default: 'New',
    },
    source: { type: String, default: 'Manual' },
    sourceMessageId: { type: String, index: true },
    followUpDate: { type: Date },
    lastActivity: { type: Date, default: Date.now },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    groups: [{ type: String }],
  },
  { timestamps: true }
);

LeadSchema.index({ name: 'text', phone: 'text', email: 'text', notes: 'text' });

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
