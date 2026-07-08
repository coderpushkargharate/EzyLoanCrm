import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSettings {
  leadAlertEmail?: boolean;
  dailySummary?: 'always' | 'updates' | 'never';
  summaryHour?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
  avatar?: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
  settings?: IUserSettings;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    avatar: { type: String },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    company: { type: String, trim: true },
    settings: {
      leadAlertEmail: { type: Boolean, default: false },
      dailySummary: { type: String, enum: ['always', 'updates', 'never'], default: 'updates' },
      summaryHour: { type: String, default: '5:00 PM' },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
