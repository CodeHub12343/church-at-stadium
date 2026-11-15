import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { SupportTicket } from '@/lib/models/SupportTicket';
import { isEmail, isNonEmptyString } from '@/lib/validators';
import { limit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { supportAckTemplate } from '@/lib/emailTemplates';

export async function POST(req: Request) {
  const rl = await limit(req, 'support.create', { max: 5, windowMs: 60 * 60 * 1000 });
  if (rl) return rl;
  try {
    const body = await req.json();
    const { name, email, subject, body: text, topic, category } = body ?? {};

    if (!isNonEmptyString(name)) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    if (!isEmail(email)) return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    if (!isNonEmptyString(subject)) return NextResponse.json({ error: 'Subject required' }, { status: 400 });
    if (!isNonEmptyString(text)) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    await dbConnect();
    const session = await getServerSession(authOptions);
    const reference = `TICK-${crypto.randomInt(100000, 999999)}`;

    const t = await SupportTicket.create({
      reference,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      body: text.trim(),
      category: category === 'contact' ? 'contact' : 'help',
      topic: isNonEmptyString(topic) ? topic : undefined,
      userId: session?.user?.id || undefined,
    });

    const tmpl = supportAckTemplate({ name: t.name, reference: t.reference, subject: t.subject });
    await sendEmail({ to: t.email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
    return NextResponse.json({ ok: true, reference: t.reference });
  } catch (err) {
    console.error('[support] error', err);
    return NextResponse.json({ error: 'Could not send' }, { status: 500 });
  }
}
