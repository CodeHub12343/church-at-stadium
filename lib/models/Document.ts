import mongoose, { Schema, Model, models } from 'mongoose';

export type DocumentAccess = 'Team' | 'Restricted' | 'Public';
export type DocumentType = 'PDF' | 'DOC' | 'XLS' | 'PNG' | 'JPG' | 'OTHER';

export interface IDocument {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  slug: string;
  name: string;
  type: DocumentType;
  sizeKB: number;
  pages?: number;
  eventSlug?: string;
  folderName?: string;
  access: DocumentAccess;
  description?: string;
  fileUrl?: string;
  contentType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    slug: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, default: 'OTHER' },
    sizeKB: { type: Number, default: 0 },
    pages: { type: Number },
    eventSlug: { type: String, index: true },
    folderName: { type: String },
    access: { type: String, enum: ['Team', 'Restricted', 'Public'], default: 'Team' },
    description: { type: String },
    fileUrl: { type: String },
    contentType: { type: String },
  },
  { timestamps: true }
);

DocumentSchema.index({ ownerId: 1, slug: 1 }, { unique: true });

export const Document: Model<IDocument> =
  models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
