import mongoose, { Schema, Model, models } from 'mongoose';

export interface IChurch {
  _id: mongoose.Types.ObjectId;
  slug: string;
  initials: string;
  name: string;
  city: string;
  country: string;
  region: 'Europe' | 'Africa' | 'Americas' | 'Asia';
  denomination: string;
  established: number;
  size: string;
  branches: number;
  website: string;
  email: string;
  pastor: string;
  pastorTitle?: string;
  pastorEmail?: string;
  pastorPhone?: string;
  pastorYears?: string;
  repName?: string;
  repRole?: string;
  repEmail?: string;
  repPhone?: string;
  authorizationLetter?: string;
  interests?: string[];
  bio: string;
  image: string;
  gradient: [string, string];
  verified: boolean;
  upcoming: string[]; // event slugs
  createdAt: Date;
  updatedAt: Date;
}

const ChurchSchema = new Schema<IChurch>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    initials: { type: String, required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    region: { type: String, required: true, index: true },
    denomination: { type: String, required: true },
    established: { type: Number, required: true },
    size: { type: String, required: true },
    branches: { type: Number, default: 1 },
    website: { type: String, default: '' },
    email: { type: String, default: '' },
    pastor: { type: String, default: '' },
    pastorTitle: { type: String, default: '' },
    pastorEmail: { type: String, default: '' },
    pastorPhone: { type: String, default: '' },
    pastorYears: { type: String, default: '' },
    repName: { type: String, default: '' },
    repRole: { type: String, default: '' },
    repEmail: { type: String, default: '' },
    repPhone: { type: String, default: '' },
    authorizationLetter: { type: String, default: '' },
    interests: { type: [String], default: [] },
    bio: { type: String, default: '' },
    image: { type: String, default: '' },
    gradient: { type: [String], required: true, validate: (v: string[]) => v.length === 2 },
    verified: { type: Boolean, default: false },
    upcoming: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Church: Model<IChurch> = models.Church || mongoose.model<IChurch>('Church', ChurchSchema);
