import mongoose, { Schema, Model, models } from 'mongoose';

export interface IAdminSettings {
  _id: mongoose.Types.ObjectId;
  key: 'global';
  platformName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  requireChurchVerification: boolean;
  defaultTimezone: string;
  brandPrimary: string;
  brandSecondary: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSettingsSchema = new Schema<IAdminSettings>(
  {
    key: { type: String, enum: ['global'], unique: true, default: 'global' },
    platformName: { type: String, default: 'Church at the Stadiums' },
    supportEmail: { type: String, default: 'help@churchatthestadiums.com' },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },
    requireChurchVerification: { type: Boolean, default: true },
    defaultTimezone: { type: String, default: 'Europe/London' },
    brandPrimary: { type: String, default: '#101B32' },
    brandSecondary: { type: String, default: '#C6A45B' },
  },
  { timestamps: true }
);

export const AdminSettings: Model<IAdminSettings> =
  models.AdminSettings || mongoose.model<IAdminSettings>('AdminSettings', AdminSettingsSchema);
