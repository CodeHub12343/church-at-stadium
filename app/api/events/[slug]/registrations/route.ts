import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { EventRegistration } from '@/lib/models/EventRegistration';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));

  const [recent, all] = await Promise.all([
    EventRegistration.find({ eventSlug: params.slug }).sort({ createdAt: -1 }).limit(limit).lean(),
    EventRegistration.find({ eventSlug: params.slug }).lean(),
  ]);

  const checkedIn = all
    .filter((r) => r.checkInStatus === 'in')
    .reduce((sum, r) => sum + (r.partySize || 1), 0);
  const flagged = all.filter((r) => r.checkInStatus === 'duplicate' || r.checkInStatus === 'denied').length;

  return NextResponse.json({
    total: all.length,
    checkedIn,
    flagged,
    recent: recent.map((r) => ({
      reference: r.reference,
      name: `${r.firstName} ${r.lastName}`.trim(),
      email: r.email,
      partySize: r.partySize,
      churchName: r.churchName,
      status: r.checkInStatus,
      gate: r.gate,
      note: r.note,
      createdAt: r.createdAt,
      checkedInAt: r.checkedInAt,
    })),
  });
}
