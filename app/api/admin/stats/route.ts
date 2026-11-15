import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Church } from '@/lib/models/Church';
import { Event } from '@/lib/models/Event';
import { EventRegistration } from '@/lib/models/EventRegistration';
import { VolunteerApplication } from '@/lib/models/VolunteerApplication';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  await dbConnect();
  const [users, churches, verifiedChurches, events, pendingEvents, regs, volApps] = await Promise.all([
    User.countDocuments({}),
    Church.countDocuments({}),
    Church.countDocuments({ verified: true }),
    Event.countDocuments({}),
    Event.countDocuments({ status: 'Draft' }),
    EventRegistration.countDocuments({}),
    VolunteerApplication.countDocuments({}),
  ]);

  return NextResponse.json({
    users,
    churches,
    verifiedChurches,
    pendingChurches: churches - verifiedChurches,
    events,
    pendingEvents,
    registrations: regs,
    volunteerApplications: volApps,
  });
}
