'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Eyebrow } from '@/components/ui/Card';
import type { MockEvent } from '@/lib/mockData';

const Page = styled.div`
  background: ${tokens.color.surface};
  min-height: 100vh;
  padding: 48px 16px 80px;
`;

const Wrap = styled.div`
  max-width: 760px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 20px;
  padding: 48px 48px 40px;
  box-shadow: ${tokens.shadow.md};
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 32px 22px 28px;
  }
`;

const pop = keyframes`
  0% { transform: scale(0.4); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const CheckWrap = styled.div`
  width: 84px;
  height: 84px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #16A36A, #22C486);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 36px rgba(22, 163, 106, 0.3);
  animation: ${pop} 0.5s ease-out;
`;

const Reference = styled.div`
  background: ${tokens.color.surface};
  border: 1px dashed ${tokens.color.border};
  border-radius: 12px;
  padding: 18px 22px;
  margin-top: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  .lbl {
    font-size: 11px;
    color: ${tokens.color.textSecondary};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .val {
    font-family: 'ui-monospace', 'SF Mono', Consolas, monospace;
    font-size: 18px;
    font-weight: 700;
    color: ${tokens.color.primary};
    margin-top: 2px;
  }
`;

const EventStrip = styled.div<{ $g: [string, string] }>`
  margin-top: 24px;
  background: ${(p) => `linear-gradient(135deg, ${p.$g[0]}, ${p.$g[1]})`};
  border-radius: 14px;
  padding: 20px 24px;
  color: #fff;
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 14px;
  align-items: center;
`;

const EventMark = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tokens.color.secondary};
`;

const NextList = styled.ol`
  margin: 26px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
  counter-reset: step;
  li {
    display: grid;
    grid-template-columns: 36px 1fr;
    gap: 14px;
    align-items: flex-start;
    counter-increment: step;
    padding: 14px 16px;
    background: ${tokens.color.surface};
    border: 1px solid ${tokens.color.border};
    border-radius: 12px;
  }
  li::before {
    content: counter(step);
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: ${tokens.color.primary};
    color: ${tokens.color.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${tokens.font.display};
    font-weight: 800;
    font-size: 13px;
  }
  strong {
    font-size: 14px;
  }
  p {
    margin: 2px 0 0;
    color: ${tokens.color.textSecondary};
    font-size: 13px;
    line-height: 1.55;
  }
`;

export default function RegistrationSuccessPage({ params }: { params: { slug: string } }) {
  const search = useSearchParams();
  const refFromUrl = search?.get('ref') ?? '';
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [reference, setReference] = useState(refFromUrl);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [ev, reg] = await Promise.all([
        fetch(`/api/events/${encodeURIComponent(params.slug)}`).then((r) => (r.ok ? r.json() : null)),
        refFromUrl
          ? fetch(`/api/events/${encodeURIComponent(params.slug)}/register?reference=${encodeURIComponent(refFromUrl)}`).then((r) => (r.ok ? r.json() : null))
          : Promise.resolve(null),
      ]);
      setEvent(ev?.event ?? null);
      if (reg?.registration?.reference) setReference(reg.registration.reference);
      setLoading(false);
    })();
  }, [params.slug, refFromUrl]);

  if (loading) {
    return <Page><Wrap><div style={{ textAlign: 'center', padding: 60, color: tokens.color.textSecondary }}>Loading…</div></Wrap></Page>;
  }

  if (!event) {
    return (
      <Page><Wrap><div style={{ textAlign: 'center', padding: 60 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Event not found</h1>
        <Link href="/events" style={{ color: tokens.color.primary, marginTop: 10, display: 'inline-block' }}>Back to events</Link>
      </div></Wrap></Page>
    );
  }

  return (
    <Page>
      <Wrap>
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <Link href="/events" style={{ color: tokens.color.textSecondary, fontSize: 12.5 }}>
            ← All events
          </Link>
        </div>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <CheckWrap>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12l5 5 11-12" />
              </svg>
            </CheckWrap>
            <Eyebrow>Registration confirmed</Eyebrow>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 8, lineHeight: 1.1 }}>
              You're in. See you at {event.city}.
            </h1>
            <p style={{ color: tokens.color.textSecondary, fontSize: 15, marginTop: 10, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.65 }}>
              A confirmation email with your digital pass is on its way. You can also show your reference number at the gate.
            </p>
          </div>

          <Reference>
            <div>
              <div className="lbl">Reference number</div>
              <div className="val">{reference || '—'}</div>
            </div>
            <Button $variant="secondary" $size="sm" onClick={() => { if (reference) navigator.clipboard?.writeText(reference); }}>Copy</Button>
          </Reference>

          <EventStrip $g={event.gradient}>
            <EventMark>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 9h18M8 3v4M16 3v4" />
              </svg>
            </EventMark>
            <div>
              <div style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 18 }}>{event.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 4 }}>
                {event.dateLabel} · {event.venue}, {event.city}
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <Badge $tone="gold">{event.category}</Badge>
                <Badge $tone="info">{event.expected} expected</Badge>
              </div>
            </div>
          </EventStrip>

          <NextList>
            <li>
              <div>
                <strong>Check your inbox</strong>
                <p>Your digital pass and gate instructions should arrive within 10 minutes. Add noreply@churchatthestadiums.org to your contacts.</p>
              </div>
            </li>
            <li>
              <div>
                <strong>Add it to your calendar</strong>
                <p>Download the .ics file from the event page and import it into your calendar.</p>
              </div>
            </li>
            <li>
              <div>
                <strong>Watch for a pre-event briefing</strong>
                <p>We'll email travel, parking, and gate information 72 hours before the event.</p>
              </div>
            </li>
            <li>
              <div>
                <strong>Serve, if you'd like</strong>
                <p>Volunteer slots are still open. Browse opportunities in the Volunteer portal.</p>
              </div>
            </li>
          </NextList>

          <div
            style={{
              marginTop: 28,
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link href={`/events/${event.slug}`}>
              <Button $variant="secondary">Back to event</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Open my dashboard →</Button>
            </Link>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 20, color: tokens.color.textSecondary, fontSize: 12.5 }}>
          Need help? <Link href="/help" style={{ color: tokens.color.primary, fontWeight: 600 }}>Visit the help centre</Link> or{' '}
          <Link href="/help/support" style={{ color: tokens.color.primary, fontWeight: 600 }}>contact support</Link>.
        </div>
      </Wrap>
    </Page>
  );
}
