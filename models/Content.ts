import mongoose, { Schema, Document } from 'mongoose';

export type ContentType = 'document' | 'image' | 'link' | 'article';

export interface IContent extends Document {
  title: string;
  type: ContentType;
  url?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['document', 'image', 'link', 'article'],
      default: 'link',
    },
    url: { type: String, trim: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);
