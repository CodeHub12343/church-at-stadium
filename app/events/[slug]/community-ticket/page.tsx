'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldGroup, Hint } from '@/components/ui/Input';
import { Eyebrow } from '@/components/ui/Card';
import { required } from '@/lib/form';
import { Loading } from '@/components/ui/Spinner';

type Availability = {
  totalReserved: number;
  seatsClaimed: number;
  seatsRemaining: number;
  reservedPct: number;
  totalCapacity: number;
  isConfigured: boolean;
};

type EventSummary = {
  slug: string; title: string; dateLabel: string; venue: string; city: string; country: string;
};

const Page = styled.div`
  background: ${tokens.color.surface};
  min-height: 100vh;
`;

const Top = styled.div`
  background: #fff;
  border-bottom: 1px solid ${tokens.color.border};
  padding: 14px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  @media (max-width: ${tokens.bp.mobile}) { padding: 12px 16px; }
`;

const Shell = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0,1fr) 320px;
  gap: 24px;
  padding: 28px 32px 48px;
  @media (max-width: 920px) {
    grid-template-columns: 1fr;
    padding: 20px 16px 40px;
  }
`;

const Card = styled.section`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 16px;
  padding: 26px 28px;
  @media (max-width: ${tokens.bp.mobile}) { padding: 20px 16px; }
`;

const Rail = styled.aside`
  display: flex; flex-direction: column; gap: 14px;
  @media (max-width: 920px) { order: -1; }
`;

const MiniCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 16px 18px;
`;

const Pool = styled.div`
  background: ${tokens.color.primary};
  color: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  .k { font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; color: ${tokens.color.secondary}; }
  .v { font-size: 26px; font-weight: 800; margin-top: 6px; }
  .d { color: rgba(255,255,255,0.78); font-size: 12.5px; margin-top: 4px; }
`;

const Bar = styled.div`
  height: 6px;
  margin-top: 14px;
  background: rgba(255,255,255,0.18);
  border-radius: 999px;
  overflow: hidden;
  position: relative;
  span { position: absolute; inset: 0 auto 0 0; background: ${tokens.color.secondary}; }
`;

const TypeCard = styled.label<{ $on?: boolean }>`
  display: block;
  padding: 16px 18px;
  border: 1.5px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.borderStrong)};
  background: ${(p) => (p.$on ? tokens.color.secondarySoft : '#fff')};
  border-radius: 12px;
  cursor: pointer;
  & + & { margin-top: 10px; }
  display: grid;
  grid-template-columns: 22px 1fr auto;
  gap: 12px;
  align-items: start;
  input { margin-top: 3px; accent-color: ${tokens.color.primary}; }
  .t { font-weight: 700; font-size: 14.5px; }
  .d { color: ${tokens.color.textSecondary}; font-size: 12.5px; margin-top: 3px; line-height: 1.55; }
  .seats {
    font-size: 11.5px; font-weight: 700; color: ${tokens.color.primary};
    background: ${tokens.color.secondarySoft};
    padding: 4px 9px; border-radius: 999px; letter-spacing: 0.06em; text-transform: uppercase;
  }
`;

const Check = styled.label`
  display: flex; gap: 10px; align-items: flex-start;
  font-size: 13px;
  line-height: 1.55;
  color: ${tokens.color.textSecondary};
  cursor: pointer;
  & + & { margin-top: 10px; }
  input { margin-top: 2px; accent-color: ${tokens.color.primary}; width: 16px; height: 16px; flex-shrink: 0; }
  b { color: ${tokens.color.textPrimary}; font-weight: 700; }
`;

const Error = styled.div`
  margin-top: 16px;
  padding: 10px 12px;
  background: ${tokens.color.errorSurface};
  border: 1px solid ${tokens.color.errorBorder};
  color: ${tokens.color.errorText};
  border-radius: 10px;
  font-size: 13px;
`;

const Success = styled.div`
  padding: 22px;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  text-align: center;
  .k { color: ${tokens.color.secondary}; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; }
  h2 { font-size: 22px; font-weight: 800; margin-top: 6px; }
  .ref {
    display: inline-block;
    margin-top: 14px;
    background: ${tokens.color.primary};
    color: #fff;
    font-family: ${tokens.font.display};
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 15px;
  }
  p { color: ${tokens.color.textSecondary}; font-size: 13.5px; line-height: 1.6; margin-top: 14px; max-width: 540px; margin-left: auto; margin-right: auto; }
`;

export default function CommunityTicketPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const slug = params?.slug ?? '';

  const [availability, setAvailability] = useState<Availability | null>(null);
  const [event, setEvent] = useState<EventSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [ticketType, setTicketType] = useState<'adult' | 'mother_child'>('adult');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ebtAck, setEbtAck] = useState(false);
  const [privacyAck, setPrivacyAck] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string; seats: number } | null>(null);

  // Require sign-in so people can see their reservation in their dashboard
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/events/${slug}/community-ticket`)}`);
    }
  }, [authStatus, slug, router]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const [availRes, evRes] = await Promise.all([
          fetch(`/api/events/${slug}/community-ticket`),
          fetch(`/api/events/${slug}`),
        ]);
        if (availRes.ok) setAvailability((await availRes.json()).availability);
        if (evRes.ok) {
          const d = await evRes.json();
          setEvent(d.event ?? null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/me/profile').then((r) => r.ok ? r.json() : null).then((d) => {
      if (!d?.profile) return;
      const p = d.profile as { firstName?: string; lastName?: string; email?: string };
      if (p.firstName) setFirstName((v) => v || p.firstName!);
      if (p.lastName) setLastName((v) => v || p.lastName!);
      if (p.email) setEmail((v) => v || p.email!);
    }).catch(() => {});
  }, [session?.user]);

  async function submit() {
    setError(null);
    if (!required(firstName)) { setError('First name is required.'); return; }
    if (!required(lastName)) { setError('Last name is required.'); return; }
    if (!email.includes('@')) { setError('A valid email is required.'); return; }
    if (!ebtAck) { setError('Please confirm you can show a valid EBT card or other accepted proof of eligibility at entry.'); return; }
    if (!privacyAck) { setError('Please acknowledge the privacy notice.'); return; }

    setSubmitting(true);
    const res = await fetch(`/api/events/${slug}/community-ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketType, firstName, lastName, email, phone, ebtAcknowledged: ebtAck, privacyAcknowledged: privacyAck }),
    });
    setSubmitting(false);
    const data = await res.json().catch(() => ({} as { error?: string; reference?: string; seats?: number; availability?: Availability }));
    if (!res.ok) { setError(data.error || 'Could not reserve a community ticket.'); if (data.availability) setAvailability(data.availability); return; }
    setDone({ reference: data.reference!, seats: data.seats! });
    if (data.availability) setAvailability(data.availability);
  }

  const pct = availability && availability.totalReserved > 0
    ? Math.min(100, Math.round((availability.seatsClaimed / availability.totalReserved) * 100))
    : 0;

  if (authStatus === 'loading' || loading) {
    return <Page><Loading pad={60} /></Page>;
  }

  return (
    <Page>
      <Top>
        <Link href={`/events/${slug}`} style={{ color: tokens.color.textSecondary }}>← Back to event</Link>
        <Link href="/community-access" style={{ color: tokens.color.info, fontWeight: 600 }}>About this policy</Link>
      </Top>

      <Shell>
        <div>
          <Eyebrow>Community ticket · Free</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>
            Reserve a free community seat {event ? `for ${event.title}` : ''}
          </h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 8, maxWidth: 640, lineHeight: 1.6 }}>
            Every event reserves 10% of tickets — free — for qualifying low-income individuals and families. Request
            your seat here. We won't ask for your EBT card number. You'll show your ID and EBT card at entry.
          </p>

          {done ? (
            <div style={{ marginTop: 22 }}>
              <Success>
                <div className="k">Reserved</div>
                <h2>You're on the list.</h2>
                <div className="ref">{done.reference}</div>
                <p>
                  Save this reference and show it at the gate with your government-issued ID and valid EBT card (or other accepted proof of eligibility).
                  You reserved <b>{done.seats} {done.seats === 1 ? 'seat' : 'seats'}</b>.
                </p>
                <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/dashboard/community-tickets"><Button>Open my tickets</Button></Link>
                  <Link href={`/events/${slug}`}><Button $variant="secondary">Back to event</Button></Link>
                </div>
              </Success>
            </div>
          ) : (
            <Card style={{ marginTop: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>How many seats do you need?</div>
              <TypeCard $on={ticketType === 'adult'}>
                <input type="radio" checked={ticketType === 'adult'} onChange={() => setTicketType('adult')} />
                <div>
                  <div className="t">Individual / adult</div>
                  <div className="d">One free seat for you. Show your ID and EBT card at entry.</div>
                </div>
                <span className="seats">1 seat</span>
              </TypeCard>
              <TypeCard $on={ticketType === 'mother_child'}>
                <input type="radio" checked={ticketType === 'mother_child'} onChange={() => setTicketType('mother_child')} />
                <div>
                  <div className="t">Mother + child benefit</div>
                  <div className="d">
                    A mother attending with her child receives one free child ticket. Both count toward the 10% community allocation.
                    Please bring your child with you at entry so staff can seat you together.
                  </div>
                </div>
                <span className="seats">2 seats</span>
              </TypeCard>

              <div style={{ marginTop: 22, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Your details</div>
              <FieldGroup $cols={2}>
                <div>
                  <Label>First name *</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label>Last name *</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Hint>We'll email your reference. We never share this.</Hint>
                </div>
                <div>
                  <Label>Phone <span style={{ fontWeight: 400, color: tokens.color.textSecondary }}>(optional)</span></Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="For gate reminders" />
                </div>
              </FieldGroup>

              <div style={{ marginTop: 22, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Confirmations</div>
              <Check>
                <input type="checkbox" checked={ebtAck} onChange={(e) => setEbtAck(e.target.checked)} />
                <span>
                  I confirm I will present a <b>valid EBT card</b> (or other accepted proof of low-income eligibility) together with my <b>government-issued ID</b> at entry.
                </span>
              </Check>
              <Check>
                <input type="checkbox" checked={privacyAck} onChange={(e) => setPrivacyAck(e.target.checked)} />
                <span>
                  I understand my <b>EBT card number is not collected or stored</b> by this website. Verification happens in person at the venue.
                </span>
              </Check>

              {error && <Error>{error}</Error>}

              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/community-access" style={{ color: tokens.color.textSecondary, fontSize: 13 }}>Read the full policy</Link>
                <Button onClick={submit} disabled={submitting || !availability?.isConfigured || (availability?.seatsRemaining ?? 0) < (ticketType === 'mother_child' ? 2 : 1)}>
                  {submitting ? 'Reserving…' : 'Reserve my free seat →'}
                </Button>
              </div>
            </Card>
          )}
        </div>

        <Rail>
          <MiniCard>
            <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: tokens.color.textSecondary }}>Event</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 6 }}>{event?.title || '—'}</div>
            <div style={{ fontSize: 12.5, color: tokens.color.textSecondary, marginTop: 2 }}>{event?.dateLabel}</div>
            <div style={{ fontSize: 12.5, color: tokens.color.textSecondary }}>{event?.venue}{event?.city ? ` · ${event.city}` : ''}</div>
          </MiniCard>

          <Pool>
            <div className="k">Community allocation</div>
            {availability?.isConfigured ? (
              <>
                <div className="v">{availability.seatsRemaining.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}>of {availability.totalReserved.toLocaleString()} left</span></div>
                <div className="d">{availability.reservedPct}% of {availability.totalCapacity.toLocaleString()} total capacity</div>
                <Bar><span style={{ width: `${pct}%` }} /></Bar>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.72)', marginTop: 8 }}>
                  First come, first served until the allocation is exhausted.
                </div>
              </>
            ) : (
              <div className="d">The organizer hasn't published a ticket capacity yet, so community seats can't be reserved. Please check back.</div>
            )}
          </Pool>

          <MiniCard style={{ background: tokens.color.secondarySoft, border: `1px solid ${tokens.color.secondary}33` }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: tokens.color.primary }}>Privacy promise</div>
            <div style={{ fontSize: 12.5, color: tokens.color.textPrimary, marginTop: 6, lineHeight: 1.55 }}>
              We never ask for or store your EBT card number. Verification happens in person at the gate with your ID and EBT card.
            </div>
          </MiniCard>
        </Rail>
      </Shell>
    </Page>
  );
}
