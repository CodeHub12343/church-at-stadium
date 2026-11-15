'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Loading } from '@/components/ui/Spinner';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, Eyebrow } from '@/components/ui/Card';

type MyEvent = {
  reference: string; partySize: number; mode: 'individual' | 'group'; days: string[];
  checkInStatus: 'pending' | 'in' | 'duplicate' | 'denied'; createdAt: string;
  event: {
    slug: string; title: string; category: string; dateLabel: string; start: string; end: string;
    city: string; country: string; venue: string; gradient: [string, string]; image?: string;
    status: string; expected: string; churches: number; capacityPct: number;
  };
};

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
`;

const StatRow = styled.div`
  display: flex;
  gap: 10px;
`;

const StatPill = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  padding: 12px 18px;
  text-align: center;
  .n {
    font-family: ${tokens.font.display};
    font-weight: 800;
    font-size: 22px;
    color: ${tokens.color.primary};
    font-variant-numeric: tabular-nums;
  }
  .l {
    font-size: 11px;
    color: ${tokens.color.textSecondary};
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 700;
  }
`;

const Grid = styled.div`
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 18px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Ticket = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  box-shadow: ${tokens.shadow.md};
  display: flex;
  flex-direction: column;
`;

const TicketHeader = styled.div`
  background: linear-gradient(135deg, #0b1428, ${tokens.color.primary} 55%, #1b2e55);
  padding: 24px 28px;
  color: #fff;
  position: relative;
  overflow: hidden;
`;

const Perf = styled.div`
  position: relative;
  height: 18px;
  background: #fff;
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${tokens.color.surface};
  }
  &::before { left: -10px; }
  &::after { right: -10px; }
`;

const Dashes = styled.div`
  position: absolute;
  top: 50%;
  left: 20px;
  right: 20px;
  border-top: 1.5px dashed ${tokens.color.borderStrong};
`;

const TicketBody = styled.div`
  padding: 20px 28px;
  display: flex;
  gap: 28px;
  align-items: center;
  @media (max-width: ${tokens.bp.mobile}) {
    flex-direction: column;
    text-align: center;
  }
`;

const QRBox = styled.div`
  width: 130px;
  height: 130px;
  background: #fff;
  border: 1.5px solid ${tokens.color.primary};
  border-radius: 14px;
  padding: 10px;
  flex-shrink: 0;
  position: relative;
`;

const EventRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 0;
  border-top: 1px solid ${tokens.color.surface2};
  &:first-child { border-top: none; }
`;

const DateChip = styled.div`
  padding: 7px 0;
  background: ${tokens.color.surface};
  border-radius: 9px;
  text-align: center;
  .m { color: ${tokens.color.secondary}; font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  .d { font-family: ${tokens.font.display}; font-weight: 800; font-size: 17px; color: ${tokens.color.primary}; }
`;

const AnnounceCard = styled.div<{ $tone?: 'gold' | 'info' }>`
  margin-top: 8px;
  padding: 14px;
  background: ${(p) => (p.$tone === 'gold' ? tokens.color.secondarySoft : tokens.color.surface)};
  border: 1px solid ${(p) => (p.$tone === 'gold' ? tokens.color.warningBorder : tokens.color.border)};
  border-radius: 11px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
`;

export default function AttendeePortalPage() {
  const [upcoming, setUpcoming] = useState<MyEvent[]>([]);
  const [stats, setStats] = useState({ upcomingCount: 0, attendedCount: 0, groupCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me/events').then((r) => r.json()).then((d) => {
      setUpcoming(d.upcoming ?? []);
      setStats(d.stats ?? { upcomingCount: 0, attendedCount: 0, groupCount: 0 });
      setLoading(false);
    });
  }, []);

  const feature = upcoming[0];

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Your gatherings</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Your gatherings</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 4 }}>
            {stats.upcomingCount === 0
              ? 'No upcoming events yet — browse what’s next.'
              : `${stats.upcomingCount} upcoming. Keep your registration reference handy at the gate.`}
          </p>
        </div>
        <StatRow>
          <StatPill>
            <div className="n">{stats.upcomingCount}</div>
            <div className="l">Upcoming</div>
          </StatPill>
          <StatPill>
            <div className="n">{stats.attendedCount}</div>
            <div className="l">Attended</div>
          </StatPill>
          <StatPill>
            <div className="n">{stats.groupCount}</div>
            <div className="l">Group</div>
          </StatPill>
        </StatRow>
      </Head>

      {loading && <Loading pad={24} />}
      {!loading && !feature && (
        <div style={{ marginTop: 22, padding: 28, border: `1px dashed ${tokens.color.border}`, borderRadius: 14, background: '#fff', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>No tickets yet</div>
          <div style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 6 }}>Pick a gathering and register — your ticket will show up here.</div>
          <Link href="/events" style={{ display: 'inline-block', marginTop: 14 }}>
            <Button>Browse events →</Button>
          </Link>
        </div>
      )}

      {feature && (
      <Grid>
        <Ticket>
          <TicketHeader>
            <div
              style={{
                color: tokens.color.secondary,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Your next event · {feature.checkInStatus === 'in' ? 'Checked in' : 'Confirmed'}
            </div>
            <h2
              style={{
                color: '#fff',
                fontSize: 28,
                fontWeight: 800,
                marginTop: 10,
                lineHeight: 1.1,
              }}
            >
              {feature.event.title}
            </h2>
            <div
              style={{
                display: 'flex',
                gap: 32,
                marginTop: 22,
                color: 'rgba(255,255,255,0.85)',
                fontSize: 13,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  When
                </div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>{feature.event.dateLabel}</div>
              </div>
              <div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Where
                </div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>{feature.event.venue} · {feature.event.city}</div>
              </div>
              <div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Attendees
                </div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>{feature.partySize} {feature.partySize === 1 ? 'person' : 'people'}</div>
              </div>
            </div>
          </TicketHeader>

          <Perf>
            <Dashes />
          </Perf>

          <TicketBody>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: tokens.color.textSecondary,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Registration reference
              </div>
              <div
                className="mono"
                style={{
                  fontFamily: tokens.font.display,
                  fontWeight: 800,
                  fontSize: 22,
                  color: tokens.color.primary,
                  marginTop: 4,
                  letterSpacing: '0.05em',
                }}
              >
                {feature.reference}
              </div>
              <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
                Present this reference at the gate. QR check-in and live attendance tracking are planned as a future
                enhancement.
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button $size="sm" onClick={() => navigator.clipboard?.writeText(feature.reference)}>Copy reference</Button>
                <Link href={`/events/${feature.event.slug}`}><Button $size="sm" $variant="secondary">Event page</Button></Link>
              </div>
            </div>
            <QRBox>
              <svg width="110" height="110" viewBox="0 0 110 110" aria-hidden="true">
                <rect width="110" height="110" fill="#fff" />
                <rect x="4" y="4" width="26" height="26" fill="none" stroke={tokens.color.primary} strokeWidth="4" />
                <rect x="12" y="12" width="10" height="10" fill={tokens.color.primary} />
                <rect x="80" y="4" width="26" height="26" fill="none" stroke={tokens.color.primary} strokeWidth="4" />
                <rect x="88" y="12" width="10" height="10" fill={tokens.color.primary} />
                <rect x="4" y="80" width="26" height="26" fill="none" stroke={tokens.color.primary} strokeWidth="4" />
                <rect x="12" y="88" width="10" height="10" fill={tokens.color.primary} />
                <g fill={tokens.color.primary}>
                  <rect x="40" y="10" width="6" height="6" />
                  <rect x="50" y="10" width="6" height="6" />
                  <rect x="60" y="10" width="6" height="6" />
                  <rect x="70" y="20" width="6" height="6" />
                  <rect x="40" y="30" width="6" height="6" />
                  <rect x="60" y="30" width="6" height="6" />
                  <rect x="80" y="40" width="6" height="6" />
                  <rect x="40" y="40" width="6" height="6" />
                  <rect x="50" y="50" width="6" height="6" />
                  <rect x="60" y="60" width="6" height="6" />
                  <rect x="40" y="60" width="6" height="6" />
                  <rect x="70" y="60" width="6" height="6" />
                  <rect x="80" y="70" width="6" height="6" />
                  <rect x="40" y="70" width="6" height="6" />
                  <rect x="60" y="80" width="6" height="6" />
                  <rect x="50" y="90" width="6" height="6" />
                  <rect x="70" y="90" width="6" height="6" />
                  <rect x="80" y="90" width="6" height="6" />
                </g>
              </svg>
            </QRBox>
          </TicketBody>
        </Ticket>

        <Card>
          <CardHeader>
            <h2>All upcoming</h2>
            <Link href="/events">Discover more →</Link>
          </CardHeader>
          {upcoming.length === 0 && (
            <div style={{ padding: 16, color: tokens.color.textSecondary, fontSize: 13 }}>
              Nothing else on your list yet.
            </div>
          )}
          {upcoming.map((u) => {
            const d = new Date(u.event.start);
            const tone = u.checkInStatus === 'in' ? 'success' : u.event.status === 'Invitation' ? 'info' : 'success';
            const label = u.checkInStatus === 'in' ? 'Checked in' : 'Confirmed';
            return (
              <EventRow key={u.reference}>
                <DateChip>
                  <div className="m">{d.toLocaleString('en', { month: 'short' })}</div>
                  <div className="d">{d.getDate()}</div>
                </DateChip>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{u.event.title}</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 2 }}>
                    {u.event.city} · {u.partySize} {u.partySize === 1 ? 'attendee' : 'attendees'} · Ref {u.reference}
                  </div>
                </div>
                <Badge $tone={tone}>{label}</Badge>
              </EventRow>
            );
          })}
        </Card>
      </Grid>
      )}
    </>
  );
}
