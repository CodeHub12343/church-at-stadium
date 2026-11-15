import 'dotenv/config';
import { dbConnect } from '../lib/mongodb';
import mongoose from 'mongoose';

import { Event } from '../lib/models/Event';
import { EventRegistration } from '../lib/models/EventRegistration';
import { Church } from '../lib/models/Church';
import { UserChurchMembership } from '../lib/models/UserChurchMembership';
import { Venue } from '../lib/models/Venue';
import { VolunteerOpportunity } from '../lib/models/VolunteerOpportunity';
import { VolunteerApplication } from '../lib/models/VolunteerApplication';
import { Document } from '../lib/models/Document';
import { Task } from '../lib/models/Task';
import { Message, MessageThread } from '../lib/models/Message';
import { Notification } from '../lib/models/Notification';
import { Announcement } from '../lib/models/Announcement';
import { Report } from '../lib/models/Report';
import { PartnerApplication } from '../lib/models/PartnerApplication';
import { SupportTicket } from '../lib/models/SupportTicket';
import { PressRelease } from '../lib/models/PressRelease';
import { Incident } from '../lib/models/Incident';

async function main() {
  await dbConnect();

  const tasks: Array<[string, () => Promise<{ deletedCount?: number }>]> = [
    ['Event',               () => Event.deleteMany({})],
    ['EventRegistration',   () => EventRegistration.deleteMany({})],
    ['Church',              () => Church.deleteMany({})],
    ['UserChurchMembership',() => UserChurchMembership.deleteMany({})],
    ['Venue',               () => Venue.deleteMany({})],
    ['VolunteerOpportunity',() => VolunteerOpportunity.deleteMany({})],
    ['VolunteerApplication',() => VolunteerApplication.deleteMany({})],
    ['Document',            () => Document.deleteMany({})],
    ['Task',                () => Task.deleteMany({})],
    ['Message',             () => Message.deleteMany({})],
    ['MessageThread',       () => MessageThread.deleteMany({})],
    ['Notification',        () => Notification.deleteMany({})],
    ['Announcement',        () => Announcement.deleteMany({})],
    ['Report',              () => Report.deleteMany({})],
    ['PartnerApplication',  () => PartnerApplication.deleteMany({})],
    ['SupportTicket',       () => SupportTicket.deleteMany({})],
    ['PressRelease',        () => PressRelease.deleteMany({})],
    ['Incident',            () => Incident.deleteMany({})],
  ];

  console.log('[clear] Starting cleanup. Preserved: User, AuthToken, LoginAttempt, RateLimit, AdminSettings, AuditLog, HelpCategory, HelpArticle.\n');

  for (const [name, fn] of tasks) {
    const res = await fn();
    console.log(`[clear] ${name.padEnd(24)} deleted ${res.deletedCount ?? 0}`);
  }

  console.log('\n[clear] Done.');
  await mongoose.connection.close();
}

main().catch((e) => {
  console.error('[clear] Failed:', e);
  process.exit(1);
});
