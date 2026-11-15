'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldGroup, Select } from '@/components/ui/Input';
import { Eyebrow } from '@/components/ui/Card';
import { submitJson, isValidEmail, isValidPassword, required } from '@/lib/form';
import { MountFade } from '@/components/motion/Reveal';

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
`;

const Side = styled.aside`
  position: relative;
  color: #fff;
  padding: 48px 48px 56px;
  min-height: 100vh;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(11, 20, 40, 0.55) 0%, rgba(11, 20, 40, 0.92) 100%),
      url('/images/12.jpg') center / cover no-repeat;
    z-index: -1;
  }
  @media (max-width: ${tokens.bp.tablet}) {
    min-height: 260px;
    padding: 28px 24px 24px;
  }
`;

const FormSide = styled.div`
  background: ${tokens.color.surface};
  padding: 48px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrap = styled.div`
  width: 100%;
  max-width: 520px;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 16px;
  padding: 36px 40px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 28px 20px;
  }
`;

const Role = styled.label<{ $on?: boolean }>`
  padding: 14px 16px;
  border: 1.5px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.borderStrong)};
  background: ${(p) => (p.$on ? tokens.color.secondarySoft : '#fff')};
  border-radius: 11px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  input {
    margin-top: 2px;
    accent-color: ${tokens.color.primary};
    width: 16px;
    height: 16px;
  }
`;

export default function RegisterPage() {
  const [role, setRole] = useState('church_rep');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Page>
      <Side>
        <div style={{ color: tokens.color.secondary, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
          Church at the Stadiums
        </div>
        <h2 style={{ color: '#fff', fontSize: 32, fontWeight: 800, lineHeight: 1.15, marginTop: 12, maxWidth: 420 }}>
          Join a network already gathering in forty-two stadiums.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14.5, lineHeight: 1.65, marginTop: 14, maxWidth: 440 }}>
          One shared workspace for churches, organizers, volunteers, and venues — coordinating the loudest nights of
          worship the world has ever seen.
        </p>
      </Side>
      <FormSide>
      <Wrap>
        <MountFade $delay={60}>
          <Eyebrow>Join the network</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Create your account</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6 }}>
            You can refine your role and link your church after sign-up.
          </p>
        </MountFade>

        <form
          style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 18 }}
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            if (!required(firstName)) { setError('First name is required.'); return; }
            if (!required(lastName)) { setError('Last name is required.'); return; }
            if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
            if (!isValidPassword(password)) { setError('Password must be at least 8 characters.'); return; }
            setLoading(true);
            const res = await submitJson<{ email: string; verificationRequired?: boolean }>('/api/auth/register', {
              firstName: firstName.trim(), lastName: lastName.trim(),
              email: email.trim(), password, country, role,
            });
            setLoading(false);
            if (!res.ok) { setError(res.error); return; }
            if (res.data?.verificationRequired) {
              router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
            } else {
              router.push(`/login?registered=1&email=${encodeURIComponent(email.trim())}`);
            }
          }}
        >
          <FieldGroup $cols={2}>
            <div>
              <Label>First name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
            </div>
            <div>
              <Label>Last name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
            </div>
          </FieldGroup>

          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@yourchurch.org" />
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
          </div>

          <div>
            <Label>Country</Label>
            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option>United Kingdom</option>
              <option>United States</option>
              <option>Brazil</option>
              <option>India</option>
              <option>Germany</option>
            </Select>
          </div>

          <div>
            <Label>How will you use the platform?</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Role $on={role === 'church_rep'}>
                <input type="radio" checked={role === 'church_rep'} onChange={() => setRole('church_rep')} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>Church rep</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 11.5, marginTop: 2 }}>
                    Represent a church
                  </div>
                </div>
              </Role>
              <Role $on={role === 'volunteer'}>
                <input type="radio" checked={role === 'volunteer'} onChange={() => setRole('volunteer')} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>Volunteer</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 11.5, marginTop: 2 }}>
                    Serve at gatherings
                  </div>
                </div>
              </Role>
              <Role $on={role === 'organizer'}>
                <input type="radio" checked={role === 'organizer'} onChange={() => setRole('organizer')} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>Organizer</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 11.5, marginTop: 2 }}>
                    Plan events
                  </div>
                </div>
              </Role>
              <Role $on={role === 'attendee'}>
                <input type="radio" checked={role === 'attendee'} onChange={() => setRole('attendee')} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>Attendee</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 11.5, marginTop: 2 }}>
                    Attend a gathering
                  </div>
                </div>
              </Role>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 12px', background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, borderRadius: 10, fontSize: 13 }}>
              {error}
            </div>
          )}
          <Button type="submit" $size="lg" disabled={loading}>{loading ? 'Creating account…' : 'Create account →'}</Button>
          <div style={{ textAlign: 'center', fontSize: 13, color: tokens.color.textSecondary }}>
            Already have an account? <Link href="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </div>
        </form>
      </Wrap>
      </FormSide>
    </Page>
  );
}
