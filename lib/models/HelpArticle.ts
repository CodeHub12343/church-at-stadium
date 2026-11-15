import mongoose, { Schema, Model, models } from 'mongoose';

export interface IHelpCategory {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  bg?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const HelpCategorySchema = new Schema<IHelpCategory>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    bg: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const HelpCategory: Model<IHelpCategory> =
  models.HelpCategory || mongoose.model<IHelpCategory>('HelpCategory', HelpCategorySchema);

export interface IHelpArticle {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  categorySlug: string;
  body: string;
  readMinutes: number;
  views: number;
  updatedAt: Date;
  createdAt: Date;
}

const HelpArticleSchema = new Schema<IHelpArticle>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    categorySlug: { type: String, required: true, index: true },
    body: { type: String, required: true },
    readMinutes: { type: Number, default: 3 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const HelpArticle: Model<IHelpArticle> =
  models.HelpArticle || mongoose.model<IHelpArticle>('HelpArticle', HelpArticleSchema);
