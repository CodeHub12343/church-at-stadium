'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

const EmailIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, ${tokens.color.secondarySoft}, #fff);
  border: 1px solid ${tokens.color.warningBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${tokens.color.secondarySoft};
  color: ${tokens.color.warningText};
  font-size: 13px;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 999px;
`;

export default function VerifyEmailPage() {
  const search = useSearchParams();
  const token = search?.get('token');
  const emailParam = search?.get('email');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>(token ? 'verifying' : 'idle');
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (r.ok) {
          setStatus('verified');
          setVerifiedEmail(d.email ?? null);
        } else {
          setStatus('failed');
        }
      })
      .catch(() => setStatus('failed'));
  }, [token]);

  async function resend() {
    if (!emailParam) return;
    setResendState('sending');
    await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailParam }),
    });
    setResendState('sent');
  }

  if (status === 'verifying') {
    return (
      <AuthShell eyebrow="Account setup" headline="Verifying your email…" blurb="This only takes a moment.">
        <div style={{ margin: '48px auto', maxWidth: 420, textAlign: 'center', color: tokens.color.textSecondary }}>
          Checking your link…
        </div>
      </AuthShell>
    );
  }

  if (status === 'verified') {
    return (
      <AuthShell eyebrow="Account setup" headline="Email verified." blurb="Your account is now fully active.">
        <div style={{ margin: '48px auto', maxWidth: 420, textAlign: 'center' }}>
          <EmailIcon>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke={tokens.color.success} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </EmailIcon>
          <Eyebrow style={{ marginTop: 20 }}>All set</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Welcome aboard</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
            {verifiedEmail ? <>Verified: <Chip>✉ {verifiedEmail}</Chip></> : 'Your email has been confirmed.'}
          </p>
          <div style={{ marginTop: 28 }}>
            <Link href="/login"><Button $size="lg">Sign in to continue →</Button></Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  if (status === 'failed') {
    return (
      <AuthShell eyebrow="Account setup" headline="That link didn't work." blurb="It may be expired or already used.">
        <div style={{ margin: '48px auto', maxWidth: 420, textAlign: 'center' }}>
          <p style={{ color: tokens.color.textSecondary, fontSize: 14, lineHeight: 1.6 }}>
            Links expire after 24 hours and can only be used once. You can request a new one from the sign-in page.
          </p>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/login"><Button $size="lg">Go to sign in</Button></Link>
            <Link href="/help/support"><Button $variant="secondary">Contact support</Button></Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account setup"
      headline="Almost there — check your inbox."
      blurb="We sent you a link to confirm your email. It expires in 24 hours."
    >
      <div style={{ margin: '48px auto', maxWidth: 420, textAlign: 'center' }}>
        <EmailIcon>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l2-2h14l2 2" stroke={tokens.color.secondary} strokeWidth="1.8" />
          </svg>
        </EmailIcon>

        <Eyebrow style={{ marginTop: 20 }}>Check your email</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Verify your address</h1>
        <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
          Click the link we sent to confirm you own this email. Once you do, your account is fully active.
        </p>

        {emailParam && (
          <div style={{ marginTop: 20 }}>
            <Chip>✉ {emailParam}</Chip>
          </div>
        )}

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/login"><Button $size="lg">I&apos;ve verified — sign in</Button></Link>
          {emailParam && (
            <Button $variant="secondary" onClick={resend} disabled={resendState !== 'idle'}>
              {resendState === 'sending' ? 'Sending…' : resendState === 'sent' ? 'Sent — check your inbox' : 'Resend verification link'}
            </Button>
          )}
        </div>

        <div style={{ marginTop: 20, color: tokens.color.textSecondary, fontSize: 12.5, lineHeight: 1.55 }}>
          Wrong address? <Link href="/register" style={{ color: tokens.color.info, fontWeight: 600 }}>Go back and fix it</Link>.
        </div>

        <div style={{ marginTop: 40, padding: '14px 16px', background: tokens.color.surface, border: `1px solid ${tokens.color.border}`, borderRadius: 10, fontSize: 12, color: tokens.color.textSecondary, lineHeight: 1.6, textAlign: 'left' }}>
          Dev tip: verification links are logged to the server terminal — look for <code>[auth] verify link</code>.
        </div>
      </div>
    </AuthShell>
  );
}
