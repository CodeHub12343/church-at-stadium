'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Eyebrow } from '@/components/ui/Card';
import { submitJson, isValidEmail } from '@/lib/form';

const Note = styled.div`
  margin-top: 22px;
  padding: 14px 16px;
  background: ${tokens.color.surface};
  border: 1px solid ${tokens.color.border};
  border-radius: 10px;
  font-size: 13px;
  color: ${tokens.color.textSecondary};
  line-height: 1.55;
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <AuthShell
      eyebrow="Account recovery"
      headline="Forgotten password? No problem."
      blurb="We'll email you a secure link to set a new one. The link expires in 30 minutes."
      topLink={{ prefix: 'Remembered it?', label: 'Sign in', href: '/login' }}
    >
      <div style={{ marginTop: 40 }}>
        <Eyebrow>Forgot password</Eyebrow>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>Reset your password</h1>
        <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6 }}>
          Enter the email address associated with your account.
        </p>
      </div>
      <form
        style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
          setLoading(true);
          const res = await submitJson('/api/auth/forgot', { email: email.trim() });
          setLoading(false);
          if (!res.ok) { setError(res.error); return; }
          setSent(true);
        }}
      >
        <div>
          <Label>Email address</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourchurch.org"
            required
            autoComplete="email"
            disabled={sent}
          />
        </div>
        {error && (
          <div style={{ padding: '10px 12px', background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, borderRadius: 10, fontSize: 13 }}>
            {error}
          </div>
        )}
        {sent ? (
          <div style={{ padding: '12px 14px', background: tokens.color.successBg, border: `1px solid ${tokens.color.success}33`, color: tokens.color.successText, borderRadius: 10, fontSize: 13 }}>
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a reset link.
          </div>
        ) : (
          <Button type="submit" $size="lg" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button>
        )}
      </form>

      <Note>
        Didn't receive it? Check your spam folder, confirm the email you used for your account, or{' '}
        <Link href="/help/support" style={{ color: tokens.color.info, fontWeight: 600 }}>
          contact support
        </Link>
        .
      </Note>

      <div style={{ marginTop: 'auto', paddingTop: 28, color: tokens.color.textSecondary, fontSize: 11.5 }}>
        For your security, we won't confirm whether an email is registered until you click the link.
      </div>
    </AuthShell>
  );
}
