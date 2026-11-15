'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, FieldGroup, Textarea, Hint } from '@/components/ui/Input';
import type { MockEvent } from '@/lib/mockData';
import { submitJson, isValidEmail, required } from '@/lib/form';
import { Loading } from '@/components/ui/Spinner';

const Topbar = styled.div`
  height: 56px;
  background: #fff;
  border-bottom: 1px solid ${tokens.color.border};
  display: flex;
  align-items: center;
  padding: 0 32px;
  justify-content: space-between;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 0 16px;
  }
`;

const Page = styled.div`
  background: ${tokens.color.surface};
  min-height: 100vh;
`;

const Wrap = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 28px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 20px 16px;
  }
`;

const EventBanner = styled.div`
  background: linear-gradient(135deg, #0b1428, ${tokens.color.primary} 55%, #1b2e55);
  border-radius: 14px;
  padding: 22px 24px;
  color: #fff;
  display: flex;
  gap: 16px;
  align-items: center;
`;

const EventMark = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(198, 164, 91, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tokens.color.secondary};
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 19px;
  flex-shrink: 0;
`;

const Toggle = styled.div`
  margin-top: 20px;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  padding: 6px;
  display: flex;
  gap: 6px;
`;

const ToggleBtn = styled.button<{ $on?: boolean }>`
  flex: 1;
  padding: 11px;
  border: none;
  background: ${(p) => (p.$on ? tokens.color.primary : 'transparent')};
  color: ${(p) => (p.$on ? '#fff' : tokens.color.textPrimary)};
  border-radius: 9px;
  font-family: inherit;
  font-weight: ${(p) => (p.$on ? 700 : 600)};
  font-size: 13.5px;
  cursor: pointer;
`;

const Card = styled.div`
  margin-top: 16px;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 28px 30px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 20px;
  }
`;

const SectionH = styled.h2`
  font-size: 17px;
  font-weight: 700;
`;

const DayCard = styled.label<{ $on?: boolean }>`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 11px 14px;
  border: 1px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.borderStrong)};
  background: ${(p) => (p.$on ? tokens.color.secondarySoft : '#fff')};
  border-radius: 10px;
  cursor: pointer;
  input {
    accent-color: ${tokens.color.primary};
    width: 16px;
    height: 16px;
  }
`;

const ConsentBox = styled.label`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid ${tokens.color.borderStrong};
  border-radius: 10px;
  cursor: pointer;
  input {
    margin-top: 2px;
    accent-color: ${tokens.color.primary};
    width: 16px;
    height: 16px;
  }
`;

const SummaryBar = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 18px;
  background: ${tokens.color.surface};
  border-radius: 12px;
  border: 1px solid ${tokens.color.border};
  flex-wrap: wrap;
`;

const Notice = styled.div`
  padding: 12px 16px;
  background: ${tokens.color.warningSurface};
  border: 1px solid ${tokens.color.warningBorder};
  border-radius: 10px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 12.5px;
  color: ${tokens.color.warningText};
  line-height: 1.55;
`;

export default function RegisterEventPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [mode, setMode] = useState<'individual' | 'group'>('individual');
  const [day1, setDay1] = useState(true);
  const [day2, setDay2] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [city, setCity] = useState('');
  const [churchName, setChurchName] = useState('');
  const [accessibility, setAccessibility] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [consentReminders, setConsentReminders] = useState(true);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      const callback = `/events/${encodeURIComponent(params.slug)}/register`;
      router.replace(`/login?callbackUrl=${encodeURIComponent(callback)}`);
    }
  }, [authStatus, params.slug, router]);

  useEffect(() => {
    fetch(`/api/events/${encodeURIComponent(params.slug)}`)
      .then(async (r) => {
        if (r.status === 404) { setStatus('missing'); return; }
        const d = await r.json();
        setEvent(d.event);
        setStatus('ready');
      })
      .catch(() => setStatus('missing'));
  }, [params.slug]);

  // Prefill from the signed-in user's profile once we have a session.
  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    fetch('/api/me/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.profile) return;
        const p = d.profile as { firstName?: string; lastName?: string; email?: string; country?: string; churchName?: string };
        if (p.firstName) setFirstName((v) => v || p.firstName!);
        if (p.lastName) setLastName((v) => v || p.lastName!);
        if (p.email) setEmail(p.email); // email is locked, always use session email
        if (p.country) setCountry((v) => (v === 'United Kingdom' ? p.country! : v));
        if (p.churchName) setChurchName((v) => v || p.churchName!);
      })
      .catch(() => {});
  }, [authStatus]);

  if (authStatus === 'loading' || status === 'loading') {
    return <Page><Loading pad={60} /></Page>;
  }
  if (authStatus === 'unauthenticated') {
    return <Page><div style={{ padding: 60, textAlign: 'center', color: tokens.color.textSecondary }}>Redirecting to sign in…</div></Page>;
  }
  if (status === 'missing' || !event) return <Page><div style={{ padding: 60, textAlign: 'center' }}><h1>Event not found</h1><Link href="/events" style={{ color: tokens.color.primary }}>Back to events</Link></div></Page>;

  return (
    <Page>
      <Topbar>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: tokens.color.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V10l8-6 8 6v10h-5v-6H9v6H4z" stroke={tokens.color.secondary} strokeWidth="1.8" />
            </svg>
          </div>
          <span style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 14 }}>
            Church at the Stadiums
          </span>
        </div>
        <Link href={`/events/${event.slug}`} style={{ color: tokens.color.textSecondary, fontSize: 12.5 }}>
          ← Back to event
        </Link>
      </Topbar>

      <Wrap>
        <EventBanner>
          <EventMark>{event.title.split(' ').map((w) => w[0]).slice(0, 2).join('')}</EventMark>
          <div>
            <div
              style={{
                color: tokens.color.secondary,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Register for
            </div>
            <div style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 20, marginTop: 2 }}>
              {event.title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5, marginTop: 4 }}>
              {event.dateLabel} · {event.venue}, {event.city} · Free entry
            </div>
          </div>
        </EventBanner>

        <Toggle>
          <ToggleBtn $on={mode === 'individual'} onClick={() => setMode('individual')}>
            Individual registration
          </ToggleBtn>
          <ToggleBtn $on={mode === 'group'} onClick={() => setMode('group')}>
            Group registration (2+)
          </ToggleBtn>
        </Toggle>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            if (!required(firstName)) { setError('First name is required.'); return; }
            if (!required(lastName)) { setError('Last name is required.'); return; }
            if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
            if (!required(city)) { setError('City is required.'); return; }
            if (mode === 'group' && partySize < 2) { setError('Group size must be at least 2.'); return; }
            if (!day1 && !day2) { setError('Pick at least one day.'); return; }
            if (!terms) { setError('Please agree to the terms to continue.'); return; }
            setSubmitting(true);
            const days: string[] = [];
            if (day1) days.push('Day 1');
            if (day2) days.push('Day 2');
            const res = await submitJson<{ reference: string }>(`/api/events/${encodeURIComponent(params.slug)}/register`, {
              mode,
              partySize: mode === 'group' ? partySize : 1,
              firstName: firstName.trim(), lastName: lastName.trim(),
              email: email.trim(), country, city: city.trim(),
              churchName: churchName.trim(), days,
              accessibility: accessibility.trim(),
              consentReminders, consentMarketing,
            });
            setSubmitting(false);
            if (!res.ok) { setError(res.error); return; }
            router.push(`/events/${encodeURIComponent(params.slug)}/register/success?ref=${encodeURIComponent(res.data.reference)}`);
          }}
        >
          <Card>
            <div>
              <SectionH>Your details</SectionH>
              <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 4 }}>
                Only your name and email appear on your ticket. Other fields help the organizer plan.
              </div>
            </div>
            <FieldGroup $cols={2}>
              <div>
                <Label>First name *</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
              </div>
              <div>
                <Label>Last name *</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
              </div>
            </FieldGroup>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={email} readOnly disabled autoComplete="email" />
              <Hint>Your ticket goes to your account&apos;s email. <Link href="/dashboard/profile" style={{ color: tokens.color.info, textDecoration: 'underline' }}>Change in your profile</Link>.</Hint>
            </div>
            <FieldGroup $cols={2}>
              <div>
                <Label>Country *</Label>
                <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option>United Kingdom</option>
                  <option>Ghana</option>
                  <option>Brazil</option>
                  <option>India</option>
                  <option>Kenya</option>
                  <option>Germany</option>
                  <option>United States</option>
                </Select>
              </div>
              <div>
                <Label>City *</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
            </FieldGroup>
            <div>
              <Label>Church affiliation (optional)</Label>
              <Input value={churchName} onChange={(e) => setChurchName(e.target.value)} placeholder="Your church name" />
            </div>
            {mode === 'group' && (
              <div>
                <Label>Group size *</Label>
                <Input type="number" min={2} max={500} value={partySize} onChange={(e) => setPartySize(Math.max(2, Number(e.target.value) || 2))} />
                <Hint>Approximate number travelling together (minimum 2).</Hint>
              </div>
            )}
          </Card>

          <Card>
            <SectionH>Access &amp; attendance</SectionH>
            <FieldGroup $cols={2}>
              <div>
                <Label>Days attending *</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <DayCard $on={day1}>
                    <input type="checkbox" checked={day1} onChange={(e) => setDay1(e.target.checked)} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                        Day 1 · Evening
                      </div>
                      <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>Night of united prayer</div>
                    </div>
                  </DayCard>
                  <DayCard $on={day2}>
                    <input type="checkbox" checked={day2} onChange={(e) => setDay2(e.target.checked)} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>Day 2 · Evening</div>
                      <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>Closing stadium service</div>
                    </div>
                  </DayCard>
                </div>
              </div>
              <div>
                <Label>Accessibility requirements (optional)</Label>
                <Textarea rows={4} value={accessibility} onChange={(e) => setAccessibility(e.target.value)} placeholder="Mobility, hearing, sight, dietary, or other accommodations we can plan for." />
                <Hint>Information is shared only with the hospitality coordinators.</Hint>
              </div>
            </FieldGroup>
          </Card>

          <Card>
            <SectionH>Communication</SectionH>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ConsentBox>
                <input type="checkbox" checked={consentReminders} onChange={(e) => setConsentReminders(e.target.checked)} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>Event reminders &amp; updates</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                    Essential schedule changes, gate assignments, and reminders. Recommended.
                  </div>
                </div>
              </ConsentBox>
              <ConsentBox>
                <input type="checkbox" checked={consentMarketing} onChange={(e) => setConsentMarketing(e.target.checked)} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>News from Church at the Stadiums</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                    Monthly digest of new events across the network. Unsubscribe any time.
                  </div>
                </div>
              </ConsentBox>
            </div>
          </Card>

          <Card>
            <SummaryBar>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: tokens.color.textSecondary,
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Summary
                </div>
                <div style={{ marginTop: 4, fontSize: 13.5 }}>
                  <strong>{mode === 'group' ? `${partySize} attendees` : '1 attendee'}</strong> · {[day1 && 'Day 1', day2 && 'Day 2'].filter(Boolean).join(' + ') || 'No days selected'} · {event.venue} ·{' '}
                  <span style={{ color: tokens.color.successText, fontWeight: 700 }}>Free</span>
                </div>
              </div>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12.5 }}>
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} required style={{ accentColor: tokens.color.primary, width: 16, height: 16 }} />
                I agree to the <Link href="/terms" style={{ color: tokens.color.info, textDecoration: 'underline' }}>Terms</Link>
              </label>
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Confirm registration →'}</Button>
            </SummaryBar>
            {error && (
              <div style={{ padding: '10px 12px', background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, borderRadius: 10, fontSize: 13 }}>
                {error}
              </div>
            )}

            <Notice>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="9" stroke={tokens.color.warning} strokeWidth="1.8" />
                <path d="M12 8v5M12 16h.01" stroke={tokens.color.warning} strokeWidth="1.8" />
              </svg>
              <div>
                Registering reserves your spot and sends you a reference. Actual attendance is recorded at the gate. QR
                check-in and live attendance tracking are planned as a future enhancement.
              </div>
            </Notice>
          </Card>
        </form>
      </Wrap>
    </Page>
  );
}
