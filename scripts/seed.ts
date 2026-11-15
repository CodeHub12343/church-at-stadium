import 'dotenv/config';
import { dbConnect } from '../lib/mongodb';
import { Event } from '../lib/models/Event';
import { Church } from '../lib/models/Church';
import { Venue } from '../lib/models/Venue';
import { VolunteerOpportunity } from '../lib/models/VolunteerOpportunity';
import { HelpCategory, HelpArticle } from '../lib/models/HelpArticle';
import { Incident } from '../lib/models/Incident';
import { PressRelease } from '../lib/models/PressRelease';

const pressReleases = [
  {
    slug: 'wembley-2027-announced',
    title: 'Wembley Prayer Gathering 2027 announced — 240 UK churches confirmed',
    excerpt: 'The largest prayer gathering in UK history will fill Wembley Stadium on 16 and 17 May 2027, bringing together 82,000 worshippers from 240 verified churches across the United Kingdom.',
    tag: 'Announcement' as const,
    publishedAt: new Date('2026-09-12'),
  },
  {
    slug: 'platform-1m-registrations',
    title: 'Church at the Stadiums passes 1,000,000 registrations',
    excerpt: 'The collaboration platform now coordinates events across 48 cities on four continents, with over 1,186 verified churches participating.',
    tag: 'Milestone' as const,
    publishedAt: new Date('2026-07-04'),
  },
  {
    slug: 'brazil-partnership',
    title: 'CATS announces Americas expansion with São Paulo Unity Summit',
    excerpt: 'Allianz Parque will host the first continental summit for Latin American churches in September 2027.',
    tag: 'Partnership' as const,
    publishedAt: new Date('2026-05-22'),
  },
];
import { events, churchDirectory, venues } from '../lib/mockData';

const helpCategories = [
  { slug: 'churches', title: 'Churches & verification', description: 'Applications, approvals, verification documents.', icon: '⛪', bg: '#FDF3DC', order: 1 },
  { slug: 'events', title: 'Events & registration', description: 'Registering, group registration, capacity, waitlists.', icon: '🎫', bg: '#E8EFFB', order: 2 },
  { slug: 'volunteer', title: 'Volunteering', description: 'Applying, approvals, assignments, no-shows.', icon: '🤝', bg: '#E6F5EC', order: 3 },
  { slug: 'organizers', title: 'Event organizers', description: 'Creating events, approvals, check-in, programmes.', icon: '🎪', bg: '#FDF3DC', order: 4 },
  { slug: 'account', title: 'Account & access', description: 'Password reset, verification, sign-in issues.', icon: '🔐', bg: '#F3F4F6', order: 5 },
  { slug: 'privacy', title: 'Privacy & safety', description: 'Data, safeguarding, reporting concerns.', icon: '🛡', bg: '#FBEAEA', order: 6 },
  { slug: 'messaging', title: 'Messaging', description: 'Direct messages, notifications, preferences.', icon: '✉', bg: '#F3E6FB', order: 7 },
  { slug: 'venues', title: 'Venues', description: 'Venue bookings, access, logistics.', icon: '🏟', bg: '#FDF3DC', order: 8 },
];

const helpArticles = [
  { slug: 'group-registration', categorySlug: 'events', readMinutes: 4,
    title: 'How do I register for an event with my family or group?',
    body: `When you register from the event page, you can choose Group registration and enter the number of attendees. One reference is issued for the whole group. On the day of the event, the organizer can check everyone in against that reference.

If your group grows after you register, open the registration on your dashboard and update the party size. Capacity limits are checked each time a change is made.` },
  { slug: 'verification-docs', categorySlug: 'churches', readMinutes: 6,
    title: 'What documents does our church need to be verified?',
    body: `You'll need the church's official registration or incorporation document, a letter of authorization from your senior pastor naming the primary representative, and basic contact details for your church.

Verification usually takes 48 hours. You'll receive a notification when a decision is made. Rejected applications can be resubmitted with updated documents.` },
  { slug: 'registration-vs-attendance', categorySlug: 'events', readMinutes: 3,
    title: "What's the difference between registration and attendance?",
    body: `Registration reserves your spot and gives you a reference. Attendance is recorded on the night through check-in. If you register but can't attend, open your dashboard and cancel so the seat can be released.` },
  { slug: 'volunteer-reporting', categorySlug: 'volunteer', readMinutes: 5,
    title: "I'm a volunteer — how do I know when and where to show up?",
    body: `Your assignment notification includes the event, your department, the reporting time, and the gate. You can also view your upcoming assignments from the volunteer portal on your dashboard.

Please arrive at least 60 minutes before the published start time unless a different reporting time is given.` },
  { slug: 'password-reset', categorySlug: 'account', readMinutes: 2,
    title: 'How do I reset my password?',
    body: `Go to the sign-in page and click Forgot? Enter your email and we'll send you a reset link. Links expire after 30 minutes. If the email doesn't arrive, check spam and confirm you used the account's primary address.` },
];

const sampleIncidents = [
  {
    slug: 'notifications-slow-2026-11-11',
    title: 'Notifications delivery is slow',
    severity: 'minor' as const,
    status: 'resolved' as const,
    impact: 'Some users saw a 5–10 minute delay on in-app notifications.',
    affectedServices: ['notifications'],
    startedAt: new Date(Date.now() - 2 * 3600 * 1000),
    resolvedAt: new Date(Date.now() - 1 * 3600 * 1000),
    updates: [
      { at: new Date(Date.now() - 2 * 3600 * 1000), status: 'investigating', body: 'We’re seeing delayed delivery on in-app notifications and are looking into it.' },
      { at: new Date(Date.now() - 1.5 * 3600 * 1000), status: 'identified', body: 'Identified upstream queue backlog; draining is in progress.' },
      { at: new Date(Date.now() - 1 * 3600 * 1000), status: 'resolved', body: 'Queue cleared, delivery times back to normal. We’ll monitor for 12 hours.' },
    ],
  },
];

const opportunities = [
  {
    opportunityId: 'opp-lag-media-cam',
    eventSlug: 'lagos-awakening',
    department: 'Media',
    role: 'Camera operator',
    city: 'Lagos',
    dateLabel: '4 Jul 2027',
    monthShort: 'Jul',
    dayShort: '04',
    filled: 6,
    total: 12,
    supervisor: 'Pastor Ola',
    recommended: true,
  },
  {
    opportunityId: 'opp-sp-hospitality-lead',
    eventSlug: 'sao-paulo-unity-summit',
    department: 'Hospitality',
    role: 'Welcome gate lead',
    city: 'São Paulo',
    dateLabel: '22 Sep 2027',
    monthShort: 'Sep',
    dayShort: '22',
    filled: 2,
    total: 8,
    requirements: 'Requires PT fluency',
  },
  {
    opportunityId: 'opp-mum-prayer-intercessor',
    eventSlug: 'mumbai-night-of-prayer',
    department: 'Prayer Team',
    role: 'Intercessor',
    city: 'Mumbai',
    dateLabel: '12 Oct 2027',
    monthShort: 'Oct',
    dayShort: '12',
    filled: 22,
    total: 25,
  },
  {
    opportunityId: 'opp-wem-media-cam',
    eventSlug: 'wembley-prayer-gathering-2027',
    department: 'Media',
    role: 'Camera operator',
    city: 'London',
    dateLabel: '16 May 2027',
    monthShort: 'May',
    dayShort: '16',
    filled: 8,
    total: 14,
    supervisor: 'Esther Okonkwo',
  },
  {
    opportunityId: 'opp-wem-ushering',
    eventSlug: 'wembley-prayer-gathering-2027',
    department: 'Ushering',
    role: 'Gate B usher',
    city: 'London',
    dateLabel: '16 May 2027',
    monthShort: 'May',
    dayShort: '16',
    filled: 42,
    total: 60,
  },
];

async function main() {
  const conn = await dbConnect();
  console.log('[seed] connected to', conn.connection.name);

  // Events: upsert by slug
  let ev = 0;
  for (const e of events) {
    await Event.updateOne({ slug: e.slug }, { $set: e }, { upsert: true });
    ev++;
  }
  console.log(`[seed] events upserted: ${ev}`);

  // Churches: upsert by slug
  let ch = 0;
  for (const c of churchDirectory) {
    await Church.updateOne({ slug: c.slug }, { $set: c }, { upsert: true });
    ch++;
  }
  console.log(`[seed] churches upserted: ${ch}`);

  // Venues: upsert by venueId (renamed from id to avoid Mongo _id conflict)
  let vn = 0;
  for (const v of venues) {
    const { id, ...rest } = v;
    await Venue.updateOne({ venueId: id }, { $set: { venueId: id, ...rest } }, { upsert: true });
    vn++;
  }
  console.log(`[seed] venues upserted: ${vn}`);

  let op = 0;
  for (const o of opportunities) {
    await VolunteerOpportunity.updateOne({ opportunityId: o.opportunityId }, { $set: o }, { upsert: true });
    op++;
  }
  console.log(`[seed] volunteer opportunities upserted: ${op}`);

  let hc = 0;
  for (const c of helpCategories) {
    await HelpCategory.updateOne({ slug: c.slug }, { $set: c }, { upsert: true });
    hc++;
  }
  console.log(`[seed] help categories upserted: ${hc}`);

  let ha = 0;
  for (const a of helpArticles) {
    await HelpArticle.updateOne({ slug: a.slug }, { $set: a }, { upsert: true });
    ha++;
  }
  console.log(`[seed] help articles upserted: ${ha}`);

  let inc = 0;
  for (const i of sampleIncidents) {
    await Incident.updateOne({ slug: i.slug }, { $set: i }, { upsert: true });
    inc++;
  }
  console.log(`[seed] incidents upserted: ${inc}`);

  let pr = 0;
  for (const r of pressReleases) {
    await PressRelease.updateOne({ slug: r.slug }, { $set: r }, { upsert: true });
    pr++;
  }
  console.log(`[seed] press releases upserted: ${pr}`);

  await conn.disconnect();
  console.log('[seed] done');
}

main().catch((err) => {
  console.error('[seed] error', err);
  process.exit(1);
});
