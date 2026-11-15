'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Eyebrow } from '@/components/ui/Card';
import { isValidEmail, required } from '@/lib/form';
import { MountFade } from '@/components/motion/Reveal';

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
`;

const Side = styled.aside`
  position: relative;
  padding: 36px 28px;
  color: #fff;
  overflow: hidden;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(11, 20, 40, 0.65) 0%, rgba(11, 20, 40, 0.92) 100%),
      url('/images/18.jpg') center / cover no-repeat;
    z-index: -1;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    min-height: 220px;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
`;

const Form = styled.div`
  padding: 48px 52px;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 32px 20px;
  }
`;

const PasswordField = styled.div`
  position: relative;
  button {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 6px;
  }
  input {
    padding-right: 44px;
  }
`;

const Divider = styled.div`
  margin-top: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${tokens.color.textSecondary};
  font-size: 12px;
  div {
    flex: 1;
    height: 1px;
    background: ${tokens.color.border};
  }
`;

const SocialRow = styled.div`
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const SocialBtn = styled.button`
  padding: 11px;
  border: 1px solid ${tokens.color.borderStrong};
  border-radius: 10px;
  background: #fff;
  font-family: inherit;
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

function LoginPageInner() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search?.get('callbackUrl') || '/dashboard';
  return (
    <Page>
      <Side>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(198,164,91,0.14)',
              border: '1px solid rgba(198,164,91,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V10l8-6 8 6v10h-5v-6H9v6H4z" stroke={tokens.color.secondary} strokeWidth="1.8" />
            </svg>
          </div>
          <span style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 14 }}>CATS</span>
        </Link>
        <div style={{ marginTop: 180 }}>
          <div
            style={{
              color: tokens.color.secondary,
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Church at the Stadiums
          </div>
          <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginTop: 12 }}>
            Welcome back to the gathering.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5, lineHeight: 1.6, marginTop: 14 }}>
            Sign in to coordinate your church, your event team, or your volunteer commitments.
          </p>
        </div>
      </Side>

      <Form>
        <div style={{ display: 'flex', justifyContent: 'flex-end', color: tokens.color.textSecondary, fontSize: 13 }}>
          New here? <Link href="/register" style={{ fontWeight: 600, marginLeft: 6 }}>Create account</Link>
        </div>

        <MountFade $delay={60}>
          <div style={{ marginTop: 40 }}>
            <Eyebrow>Sign in</Eyebrow>
            <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>Welcome back</h1>
            <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6 }}>
              Access your dashboard and continue your work.
            </p>
          </div>
        </MountFade>

        <form
          style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 18 }}
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
            if (!required(password)) { setError('Enter your password.'); return; }
            setLoading(true);
            try {
              const res = await signIn('credentials', {
                email: email.trim(), password,
                redirect: false, callbackUrl,
              });
              if (res?.error) {
                setError('Email or password is incorrect.');
                return;
              }
              if (!res?.ok) {
                setError('Sign-in failed. Please try again.');
                return;
              }
              router.push(callbackUrl);
              router.refresh();
            } catch {
              setError('Network error. Check your connection and try again.');
            } finally {
              setLoading(false);
            }
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
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <Label style={{ margin: 0 }}>Password</Label>
              <Link href="/forgot" style={{ fontSize: 12.5, fontWeight: 600, color: tokens.color.info }}>
                Forgot?
              </Link>
            </div>
            <PasswordField>
              <Input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label="Show password">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke={tokens.color.textSecondary} strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="3" stroke={tokens.color.textSecondary} strokeWidth="1.8" />
                </svg>
              </button>
            </PasswordField>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ accentColor: tokens.color.primary, width: 16, height: 16 }} />
            Remember me on this device
          </label>
          {error && (
            <div style={{ padding: '10px 12px', background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, borderRadius: 10, fontSize: 13 }}>
              {error}
            </div>
          )}
          <Button type="submit" $size="lg" $block disabled={loading}>{loading ? 'Signing in…' : 'Sign in →'}</Button>
        </form>

        <Divider>
          <div />
          OR CONTINUE WITH
          <div />
        </Divider>

        <SocialRow>
          <SocialBtn>Google</SocialBtn>
          <SocialBtn>Apple</SocialBtn>
        </SocialRow>

        <div style={{ marginTop: 'auto', paddingTop: 28, color: tokens.color.textSecondary, fontSize: 11.5, lineHeight: 1.5 }}>
          By signing in you agree to our <Link href="/terms">Terms</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </div>
      </Form>
    </Page>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
