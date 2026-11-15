import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { VolunteerOpportunity } from '@/lib/models/VolunteerOpportunity';

export async function GET() {
  await dbConnect();
  const docs = await VolunteerOpportunity.find({}).sort({ recommended: -1, createdAt: -1 }).lean();
  return NextResponse.json({
    opportunities: docs.map((o) => ({
      id: o.opportunityId,
      eventSlug: o.eventSlug,
      department: o.department,
      role: o.role,
      city: o.city,
      dateLabel: o.dateLabel,
      monthShort: o.monthShort,
      dayShort: o.dayShort,
      filled: o.filled,
      total: o.total,
      supervisor: o.supervisor,
      requirements: o.requirements,
      recommended: o.recommended,
    })),
  });
}
