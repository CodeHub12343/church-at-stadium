import type { HydratedDocument } from 'mongoose';
import { Announcement, IAnnouncement } from './models/Announcement';
import { Notification } from './models/Notification';
import { User } from './models/User';
import { sendEmail } from './email';
import { announcementTemplate } from './emailTemplates';

export async function sendAnnouncement(a: HydratedDocument<IAnnouncement>) {
  const userFilter: Record<string, unknown> = {};
  if (a.audience !== 'all') {
    userFilter.role = a.audience === 'church_reps' ? 'church_rep' : a.audience.slice(0, -1);
  }
  const recipients = await User.find(userFilter).select('_id email firstName').lean();
  if (recipients.length) {
    await Notification.insertMany(
      recipients.map((u) => ({
        userId: u._id,
        title: a.title,
        body: a.body,
        tag: 'Event update',
        icon: '📣',
        bg: '#FDF3DC',
        fg: '#8A6410',
      }))
    );
    const tmpl = announcementTemplate({ title: a.title, body: a.body });
    // Fan out emails sequentially so one failure doesn't tank the rest.
    for (const u of recipients) {
      if (u.email) await sendEmail({ to: u.email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
    }
  }
  a.status = 'sent';
  a.sentAt = new Date();
  a.recipientCount = recipients.length;
  await a.save();
  return recipients.length;
}

export async function processDueAnnouncements(): Promise<{ processed: number; sent: number[] }> {
  const now = new Date();
  const due = await Announcement.find({ status: 'scheduled', scheduledFor: { $lte: now } });
  const counts: number[] = [];
  for (const a of due) {
    const n = await sendAnnouncement(a);
    counts.push(n);
  }
  return { processed: due.length, sent: counts };
}
