import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  leadId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  type: 'note' | 'call' | 'email' | 'meeting' | 'status_change' | 'created' | 'follow_up';
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['note', 'call', 'email', 'meeting', 'status_change', 'created', 'follow_up'],
      required: true,
    },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
