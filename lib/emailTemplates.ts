const BRAND = '#0B1E3A';
const ACCENT = '#D4A24C';

function layout(title: string, body: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F6F5F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1C2440;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="background:#fff;border-radius:14px;overflow:hidden;border:1px solid #E6E3D8;">
        <div style="background:${BRAND};color:#fff;padding:20px 24px;">
          <div style="font-weight:800;font-size:18px;letter-spacing:0.5px;">CHURCH AT THE STADIUMS</div>
        </div>
        <div style="padding:28px 28px 32px;line-height:1.55;font-size:15px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${BRAND};">${title}</h1>
          ${body}
        </div>
      </div>
      <div style="text-align:center;color:#8A8572;font-size:12px;margin-top:20px;">
        Church at the Stadiums · This email was sent automatically.
      </div>
    </div>
  </body>
</html>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;margin:12px 0;">${label}</a>`;
}

export function verifyEmailTemplate(name: string, url: string) {
  return {
    subject: 'Confirm your email · Church at the Stadiums',
    html: layout('Confirm your email',
      `<p>Welcome, ${escapeHtml(name)}.</p>
       <p>Tap the button below within the next 24 hours to confirm your address.</p>
       ${button(url, 'Confirm email')}
       <p style="color:#6B6555;font-size:13px;">Or paste this link into your browser:<br><code>${escapeHtml(url)}</code></p>`
    ),
    text: `Welcome, ${name}.\n\nConfirm your email: ${url}\n\nThis link expires in 24 hours.`,
  };
}

export function resetPasswordTemplate(name: string, url: string) {
  return {
    subject: 'Reset your password · Church at the Stadiums',
    html: layout('Reset your password',
      `<p>Hi ${escapeHtml(name)},</p>
       <p>Someone asked to reset the password for this account. If that was you, tap below. The link expires in 30 minutes.</p>
       ${button(url, 'Reset password')}
       <p style="color:#6B6555;font-size:13px;">Didn't ask for this? Ignore this email. No change will be made.</p>`
    ),
    text: `Hi ${name},\n\nReset your password: ${url}\n\nThe link expires in 30 minutes. Ignore if this wasn't you.`,
  };
}

export function registrationConfirmedTemplate(args: {
  firstName: string;
  eventTitle: string;
  dateLabel: string;
  venue: string;
  reference: string;
  eventUrl: string;
}) {
  return {
    subject: `You're in · ${args.eventTitle}`,
    html: layout(`See you at ${escapeHtml(args.eventTitle)}`,
      `<p>Hi ${escapeHtml(args.firstName)},</p>
       <p>Your registration is confirmed.</p>
       <div style="background:#F6F5F1;border-radius:10px;padding:16px;margin:16px 0;">
         <div style="font-size:13px;color:#6B6555;">Reference</div>
         <div style="font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:${BRAND};letter-spacing:0.4px;">${escapeHtml(args.reference)}</div>
         <div style="margin-top:10px;font-size:13px;color:#6B6555;">When</div>
         <div style="font-weight:600;">${escapeHtml(args.dateLabel)}</div>
         <div style="margin-top:10px;font-size:13px;color:#6B6555;">Where</div>
         <div style="font-weight:600;">${escapeHtml(args.venue)}</div>
       </div>
       ${button(args.eventUrl, 'View event details')}
       <p style="color:#6B6555;font-size:13px;">Keep this reference for check-in on the day.</p>`
    ),
    text: `Hi ${args.firstName},\n\nYou're registered for ${args.eventTitle}.\nReference: ${args.reference}\nWhen: ${args.dateLabel}\nWhere: ${args.venue}\n\nDetails: ${args.eventUrl}`,
  };
}

export function supportAckTemplate(args: { name: string; reference: string; subject: string }) {
  return {
    subject: `We received your message · ${args.reference}`,
    html: layout('Thanks — we got it',
      `<p>Hi ${escapeHtml(args.name)},</p>
       <p>Your message is in our queue. We'll reply within one business day.</p>
       <div style="background:#F6F5F1;border-radius:10px;padding:14px 16px;margin:14px 0;">
         <div style="font-size:12px;color:#6B6555;">Reference</div>
         <div style="font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:${BRAND};">${escapeHtml(args.reference)}</div>
         <div style="margin-top:10px;font-size:12px;color:#6B6555;">Subject</div>
         <div>${escapeHtml(args.subject)}</div>
       </div>`
    ),
    text: `Hi ${args.name},\n\nWe received your message (ref ${args.reference}: "${args.subject}"). We'll reply within one business day.`,
  };
}

export function volunteerApprovedTemplate(args: { firstName: string; role: string; eventTitle: string }) {
  return {
    subject: `You're on the volunteer team for ${args.eventTitle}`,
    html: layout(`Welcome to the ${escapeHtml(args.eventTitle)} team`,
      `<p>Hi ${escapeHtml(args.firstName)},</p>
       <p>Your application was approved for <strong>${escapeHtml(args.role)}</strong>. Your dashboard now shows shift details and a briefing document.</p>
       <p style="color:${ACCENT};font-weight:700;">Thanks for serving.</p>`
    ),
    text: `Hi ${args.firstName},\n\nYou're approved for ${args.role} at ${args.eventTitle}. See your dashboard for details.`,
  };
}

export function announcementTemplate(args: { title: string; body: string }) {
  return {
    subject: args.title,
    html: layout(args.title,
      `<div style="white-space:pre-wrap;">${escapeHtml(args.body)}</div>`
    ),
    text: `${args.title}\n\n${args.body}`,
  };
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
