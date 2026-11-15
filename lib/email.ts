// Email transport abstraction.
// - If RESEND_API_KEY is set, sends via Resend (https://resend.com).
// - Otherwise logs the email to the console (dev fallback).
// - Never throws; always returns { ok }.

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

const DEFAULT_FROM = process.env.EMAIL_FROM ?? 'Church at the Stadiums <no-reply@cats.local>';

export async function sendEmail(msg: EmailMessage): Promise<{ ok: boolean; error?: string }> {
  const from = msg.from ?? DEFAULT_FROM;
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.log(`\n[email·dev] To: ${msg.to}\n[email·dev] Subject: ${msg.subject}\n[email·dev] ${msg.text ?? stripTags(msg.html).slice(0, 500)}\n`);
    return { ok: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[email] Resend failed', res.status, body);
      return { ok: false, error: `Resend ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error('[email] send failed', err);
    return { ok: false, error: (err as Error).message };
  }
}

function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
