import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { VolunteerApplication, VolunteerAppStatus } from '@/lib/models/VolunteerApplication';
import { VolunteerOpportunity } from '@/lib/models/VolunteerOpportunity';
import { Event } from '@/lib/models/Event';
import { Notification } from '@/lib/models/Notification';
import { User } from '@/lib/models/User';
import { sendEmail } from '@/lib/email';
import { volunteerApprovedTemplate } from '@/lib/emailTemplates';
import { recordAudit } from '@/lib/audit';

const ALLOWED: VolunteerAppStatus[] = ['submitted', 'under_review', 'approved', 'declined', 'withdrawn'];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await dbConnect();
  const app = await VolunteerApplication.findById(params.id);
  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

  // Ownership check: the event this application belongs to must be owned by the caller.
  const ev = await Event.findOne({ slug: app.eventSlug }).select('createdBy title').lean();
  if (!ev) return NextResponse.json({ error: 'Event missing' }, { status: 404 });
  if (String(ev.createdBy) !== String(session.user.id)) {
    return NextResponse.json({ error: 'Not your event' }, { status: 403 });
  }

  app.status = body.status;
  if (body.reportingInstructions) app.reportingInstructions = String(body.reportingInstructions);
  await app.save();

  if (body.status === 'approved') {
    await Notification.create({
      userId: app.userId,
      title: `Volunteer role approved · ${app.role}`,
      body: `You're on the team for ${app.city}. Watch for your schedule from the organiser.`,
      tag: 'Invitation',
      link: '/dashboard/volunteers',
      icon: '✓',
      bg: '#E6F5EC',
      fg: '#0E7A4C',
    });

    const opp = await VolunteerOpportunity.findOne({ opportunityId: app.opportunityId });
    if (opp && opp.filled < opp.total) {
      opp.filled += 1;
      await opp.save();
    }

    const user = await User.findById(app.userId).select('email firstName').lean();
    if (user?.email) {
      const tmpl = volunteerApprovedTemplate({
        firstName: user.firstName ?? 'there',
        role: app.role,
        eventTitle: ev.title,
      });
      await sendEmail({ to: user.email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
    }
  } else if (body.status === 'declined') {
    await Notification.create({
      userId: app.userId,
      title: `Volunteer application update · ${app.role}`,
      body: `The organiser has declined your application for ${app.city}. Try another role in the Volunteer Portal.`,
      tag: 'Invitation',
      link: '/dashboard/volunteers',
      icon: '•',
      bg: '#FEF2F2',
      fg: '#991B1B',
    });
  }

  await recordAudit({
    actorId: session.user.id,
    action: `volunteer.${body.status}`,
    description: `Volunteer application "${app.role}" set to ${body.status}`,
    resource: String(app._id),
    severity: body.status === 'approved' ? 'success' : body.status === 'declined' ? 'sensitive' : 'info',
  });

  return NextResponse.json({ ok: true, status: app.status });
}
