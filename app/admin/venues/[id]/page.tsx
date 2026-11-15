'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type VenueDetail = {
  id: string; name: string; city: string; country: string;
  capacity: number; type: 'Indoor' | 'Outdoor'; verified: boolean;
  booking: 'confirmed' | 'pending' | 'available' | 'unverified';
  bookingDate?: string; upcoming: number; initials?: string;
};

const Hero = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 26px 28px;
  display: flex;
  gap: 22px;
  align-items: center;
  flex-wrap: wrap;
`;

const Mark = styled.div`
  width: 84px;
  height: 84px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${tokens.color.primary}, ${tokens.color.primarySoft});
  color: ${tokens.color.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 28px;
  flex-shrink: 0;
`;

const Grid = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 20px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 22px 26px;
  & + & {
    margin-top: 16px;
  }
`;

const FactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-top: 16px;
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Fact = styled.div`
  .lbl { font-size: 11px; color: ${tokens.color.textSecondary}; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; }
  .val { font-size: 14px; color: ${tokens.color.textPrimary}; margin-top: 4px; font-weight: 500; }
`;

const Step = styled.div<{ $done?: boolean; $current?: boolean }>`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  opacity: ${(p) => (!p.$done && !p.$current ? 0.5 : 1)};
  .num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 11px;
    font-family: ${tokens.font.display};
    background: ${(p) => (p.$done ? tokens.color.success : p.$current ? tokens.color.secondary : tokens.color.surface2)};
    color: ${(p) => (p.$done ? '#fff' : p.$current ? tokens.color.primary : tokens.color.textSecondary)};
  }
  & + & { margin-top: 10px; }
`;

const bookingBadge = (b: string): { tone: BadgeTone; label: string } => {
  if (b === 'confirmed') return { tone: 'success', label: 'Booking confirmed' };
  if (b === 'pending') return { tone: 'warning', label: 'Booking pending' };
  if (b === 'unverified') return { tone: 'error', label: 'Unverified' };
  return { tone: 'neutral', label: 'Available' };
};

export default function VenueDetailPage({ params }: { params: { id: string } }) {
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'forbidden'>('loading');

  useEffect(() => {
    fetch(`/api/admin/venues/${encodeURIComponent(params.id)}`).then(async (r) => {
      if (r.status === 403) { setStatus('forbidden'); return; }
      if (!r.ok) { setStatus('missing'); return; }
      const d = await r.json();
      // Attach initials for display
      const v = d.venue as VenueDetail;
      v.initials = v.name.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
      setVenue(v);
      setStatus('ready');
    }).catch(() => setStatus('missing'));
  }, [params.id]);

  if (status === 'forbidden') return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;
  if (status === 'loading') return <div style={{ padding: 40, color: tokens.color.textSecondary }}>Loading venue…</div>;
  if (status === 'missing' || !venue) return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Venue not found</h1>
      <Link href="/admin/venues" style={{ color: tokens.color.primary, marginTop: 8, display: 'inline-block' }}>Back to venues</Link>
    </div>
  );
  const b = bookingBadge(venue.booking);

  return (
    <>
      <Hero>
        <Mark>{venue.initials}</Mark>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {venue.verified && <Badge $tone="success">✓ Verified venue</Badge>}
            <Badge $tone={b.tone}>{b.label}{venue.bookingDate ? ` · ${venue.bookingDate}` : ''}</Badge>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 12, lineHeight: 1.05 }}>{venue.name}</h1>
          <div style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 8 }}>
            {venue.city}, {venue.country} · {venue.type} · Capacity {venue.capacity.toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button $variant="secondary">Edit venue</Button>
          <Button>Assign to event →</Button>
        </div>
      </Hero>

      <Grid>
        <div>
          <Section>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Venue information</h2>
            <FactGrid>
              <Fact>
                <div className="lbl">Address</div>
                <div className="val">{venue.city}, {venue.country}</div>
              </Fact>
              <Fact>
                <div className="lbl">Capacity</div>
                <div className="val">{venue.capacity.toLocaleString()} (verified)</div>
              </Fact>
              <Fact>
                <div className="lbl">Type</div>
                <div className="val">{venue.type}</div>
              </Fact>
              <Fact>
                <div className="lbl">Accessibility</div>
                <div className="val">Full · hearing loop</div>
              </Fact>
              <Fact>
                <div className="lbl">Operations contact</div>
                <div className="val">[To be assigned]</div>
              </Fact>
              <Fact>
                <div className="lbl">Associated events</div>
                <div className="val">{venue.upcoming} upcoming</div>
              </Fact>
            </FactGrid>
          </Section>

          <Section>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Facilities</h2>
            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Stage · fixed', 'Large screens', 'PA system', 'Green rooms', 'Medical station', 'On-site security', 'Parking', 'Transit nearby'].map((f) => (
                <span
                  key={f}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 999,
                    background: tokens.color.surface2,
                    color: tokens.color.textPrimary,
                    fontSize: 12.5,
                    fontWeight: 600,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </Section>
        </div>

        <aside>
          <Section style={{ marginTop: 0 }}>
            <div style={{ color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
              Booking status
            </div>
            <div style={{ marginTop: 12 }}>
              <Step $done><div className="num">✓</div><div><div style={{ fontWeight: 600, fontSize: 13 }}>Enquiry sent</div><div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>12 Feb 2026</div></div></Step>
              <Step $done><div className="num">✓</div><div><div style={{ fontWeight: 600, fontSize: 13 }}>Hold confirmed</div><div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>28 Feb 2026</div></div></Step>
              <Step $done><div className="num">✓</div><div><div style={{ fontWeight: 600, fontSize: 13 }}>Contract signed</div><div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>18 Jul 2026</div></div></Step>
              <Step $current><div className="num">4</div><div><div style={{ fontWeight: 700, fontSize: 13 }}>Final payment due</div><div style={{ color: tokens.color.warningText, fontSize: 11.5 }}>15 Mar 2027</div></div></Step>
              <Step><div className="num">5</div><div><div style={{ fontWeight: 600, fontSize: 13 }}>Load-in day</div><div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>15 May 2027</div></div></Step>
            </div>
          </Section>

          <div style={{
            marginTop: 16,
            padding: 16,
            background: tokens.color.warningSurface,
            border: `1px solid ${tokens.color.warningBorder}`,
            borderRadius: 12,
            fontSize: 12,
            color: tokens.color.warningText,
            lineHeight: 1.55,
          }}>
            Venue booking states are tracked separately from directory listing. "Confirmed" requires a signed contract uploaded here.
          </div>
        </aside>
      </Grid>
    </>
  );
}
