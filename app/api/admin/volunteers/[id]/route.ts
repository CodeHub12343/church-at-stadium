import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { VolunteerApplication, VolunteerAppStatus } from '@/lib/models/VolunteerApplication';
import { Notification } from '@/lib/models/Notification';
import { User } from '@/lib/models/User';
import { Event } from '@/lib/models/Event';
import { VolunteerOpportunity } from '@/lib/models/VolunteerOpportunity';
import { recordAudit } from '@/lib/audit';
import { sendEmail } from '@/lib/email';
import { volunteerApprovedTemplate } from '@/lib/emailTemplates';

const ALLOWED: VolunteerAppStatus[] = ['submitted', 'under_review', 'approved', 'declined', 'withdrawn'];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  if (body.status && ALLOWED.includes(body.status)) update.status = body.status;
  if (body.note) update.note = String(body.note);
  if (body.reportingInstructions) update.reportingInstructions = String(body.reportingInstructions);

  await dbConnect();
  const app = await VolunteerApplication.findByIdAndUpdate(params.id, { $set: update }, { new: true }).lean();
  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

  if (body.status === 'approved') {
    await Notification.create({
      userId: app.userId,
      title: `Volunteer role approved · ${app.role}`,
      body: `You're on the team for ${app.city}. Watch for your schedule and gate assignment.`,
      tag: 'Invitation',
      link: '/dashboard/volunteers',
      icon: '✓',
      bg: '#E6F5EC',
      fg: '#0E7A4C',
    });

    // Increment the opportunity's filled count (bounded by its total).
    const opp = await VolunteerOpportunity.findOne({ opportunityId: app.opportunityId });
    if (opp && opp.filled < opp.total) {
      opp.filled += 1;
      await opp.save();
    }

    const [user, event] = await Promise.all([
      User.findById(app.userId).select('email firstName').lean(),
      Event.findOne({ slug: app.eventSlug }).select('title').lean(),
    ]);
    if (user?.email) {
      const tmpl = volunteerApprovedTemplate({
        firstName: user.firstName ?? 'there',
        role: app.role,
        eventTitle: event?.title ?? app.city,
      });
      await sendEmail({ to: user.email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
    }
  }
  if (body.status) {
    await recordAudit({
      actorId: auth.userId,
      action: `volunteer.${body.status}`,
      description: `Volunteer application "${app.role}" in ${app.city} set to ${body.status}`,
      resource: String(app._id),
      severity: body.status === 'approved' ? 'success' : body.status === 'declined' ? 'sensitive' : 'info',
    });
  }
  return NextResponse.json({ ok: true, status: app.status });
}
