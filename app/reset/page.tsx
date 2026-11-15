'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input, Label, Hint } from '@/components/ui/Input';
import { Eyebrow } from '@/components/ui/Card';
import { submitJson, isValidPassword } from '@/lib/form';

const StrengthBar = styled.div<{ $pct: number; $tone: 'low' | 'med' | 'high' }>`
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  .bar {
    flex: 1;
    height: 4px;
    background: ${tokens.color.surface2};
    border-radius: 999px;
    overflow: hidden;
  }
  .fill {
    width: ${(p) => p.$pct}%;
    height: 100%;
    background: ${(p) =>
      p.$tone === 'high' ? tokens.color.success : p.$tone === 'med' ? tokens.color.warning : tokens.color.error};
  }
  .lbl {
    font-size: 11.5px;
    font-weight: 700;
    color: ${(p) =>
      p.$tone === 'high' ? tokens.color.successText : p.$tone === 'med' ? tokens.color.warningText : tokens.color.errorText};
  }
`;

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function ResetPasswordPage() {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenState, setTokenState] = useState<{ valid: boolean | null; email?: string }>({ valid: null });
  const router = useRouter();
  const search = useSearchParams();
  const token = search?.get('token') ?? '';

  useEffect(() => {
    if (!token) {
      setTokenState({ valid: false });
      return;
    }
    fetch(`/api/auth/reset?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setTokenState({ valid: !!d.valid, email: d.email }))
      .catch(() => setTokenState({ valid: false }));
  }, [token]);

  const score = scorePassword(pw);
  const tone = score <= 2 ? 'low' : score === 3 ? 'med' : 'high';
  const label = score <= 2 ? 'Weak' : score === 3 ? 'OK' : 'Strong';

  return (
    <AuthShell
      eyebrow="Account recovery"
      headline="One more step — set a new password."
      blurb="Pick something unique. If you use a password manager, let it generate one for you."
      topLink={{ prefix: 'Done already?', label: 'Sign in', href: '/login' }}
    >
      <div style={{ marginTop: 40 }}>
        <Eyebrow>Reset password</Eyebrow>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>Choose a new password</h1>
        <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6 }}>
          {tokenState.email ? (
            <>For <strong style={{ color: tokens.color.primary }}>{tokenState.email}</strong></>
          ) : tokenState.valid === false ? (
            <span style={{ color: tokens.color.errorText }}>This reset link is invalid or has expired.</span>
          ) : (
            'Verifying your reset link…'
          )}
        </p>
      </div>

      {tokenState.valid !== false && (
      <form
        style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          if (!isValidPassword(pw)) { setError('Password must be at least 8 characters.'); return; }
          if (pw !== confirm) { setError("Passwords don't match."); return; }
          setLoading(true);
          const res = await submitJson('/api/auth/reset', { token, password: pw });
          setLoading(false);
          if (!res.ok) { setError(res.error); return; }
          router.push('/login');
        }}
      >
        <div>
          <Label>New password</Label>
          <Input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <StrengthBar $pct={(score / 5) * 100} $tone={tone}>
            <div className="bar">
              <div className="fill" />
            </div>
            <span className="lbl">{pw ? label : ' '}</span>
          </StrengthBar>
          <Hint>Use at least 12 characters, with a mix of letters, numbers, and symbols.</Hint>
        </div>
        <div>
          <Label>Confirm new password</Label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-type your new password"
            required
            autoComplete="new-password"
          />
        </div>
        {error && (
          <div style={{ padding: '10px 12px', background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, borderRadius: 10, fontSize: 13 }}>
            {error}
          </div>
        )}
        <Button type="submit" $size="lg" disabled={loading || !tokenState.valid}>{loading ? 'Setting…' : 'Set new password'}</Button>
      </form>
      )}

      <div style={{ marginTop: 22, padding: '14px 16px', background: tokens.color.warningSurface, border: `1px solid ${tokens.color.warningBorder}`, borderRadius: 10, fontSize: 12, color: tokens.color.warningText, lineHeight: 1.55 }}>
        After resetting, all your other devices will be signed out as a precaution.
      </div>
    </AuthShell>
  );
}
