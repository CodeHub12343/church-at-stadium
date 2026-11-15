import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { VolunteerApplication } from '@/lib/models/VolunteerApplication';
import { VolunteerOpportunity } from '@/lib/models/VolunteerOpportunity';
import { isNonEmptyString } from '@/lib/validators';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const apps = await VolunteerApplication.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    applications: apps.map((a) => ({
      id: String(a._id),
      opportunityId: a.opportunityId,
      eventSlug: a.eventSlug,
      department: a.department,
      role: a.role,
      city: a.city,
      status: a.status,
      note: a.note,
      reportingInstructions: a.reportingInstructions,
      createdAt: a.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { opportunityId } = body ?? {};
  if (!isNonEmptyString(opportunityId)) {
    return NextResponse.json({ error: 'Missing opportunity' }, { status: 400 });
  }

  await dbConnect();
  const opp = await VolunteerOpportunity.findOne({ opportunityId }).lean();
  if (!opp) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });

  const existing = await VolunteerApplication.findOne({
    userId: session.user.id,
    opportunityId,
  }).lean();
  if (existing) {
    return NextResponse.json({ error: 'You already applied to this role' }, { status: 409 });
  }

  const app = await VolunteerApplication.create({
    userId: session.user.id,
    opportunityId,
    eventSlug: opp.eventSlug,
    department: opp.department,
    role: opp.role,
    city: opp.city,
    status: 'submitted',
  });

  return NextResponse.json({
    ok: true,
    application: {
      id: String(app._id),
      status: app.status,
      department: app.department,
      role: app.role,
    },
  });
}
