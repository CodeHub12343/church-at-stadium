import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { EventRegistration } from '@/lib/models/EventRegistration';

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { reference, gate, action } = body ?? {};
  if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

  await dbConnect();
  const reg = await EventRegistration.findOne({ eventSlug: params.slug, reference });
  if (!reg) {
    return NextResponse.json({ error: 'Reference not found', status: 'denied' }, { status: 404 });
  }

  if (action === 'deny') {
    reg.checkInStatus = 'denied';
    reg.note = 'Denied by steward';
    await reg.save();
    return NextResponse.json({ ok: true, status: 'denied', reference: reg.reference });
  }

  if (reg.checkInStatus === 'in') {
    // Record duplicate attempt but don't change the original timestamp
    return NextResponse.json({
      ok: true,
      status: 'duplicate',
      reference: reg.reference,
      name: `${reg.firstName} ${reg.lastName}`,
      partySize: reg.partySize,
      note: `Pass already scanned at ${reg.checkedInAt?.toISOString()}`,
    });
  }

  reg.checkInStatus = 'in';
  reg.checkedInAt = new Date();
  if (gate) reg.gate = gate;
  await reg.save();

  return NextResponse.json({
    ok: true,
    status: 'in',
    reference: reg.reference,
    name: `${reg.firstName} ${reg.lastName}`,
    partySize: reg.partySize,
    gate: reg.gate,
    checkedInAt: reg.checkedInAt,
  });
}
