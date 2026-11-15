'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Eyebrow } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type Ticket = {
  reference: string;
  ticketType: 'adult' | 'mother_child';
  seats: number;
  status: 'reserved' | 'cancelled' | 'issued' | 'no_show';
  createdAt: string;
  event: { slug: string; title: string; dateLabel: string; venue: string; city: string; country: string } | null;
};

const Head = styled.div`
  margin-bottom: 18px;
`;

const Grid = styled.div`
  display: grid;
  gap: 14px;
`;

const Row = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 18px 20px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  @media (max-width: ${tokens.bp.mobile}) { grid-template-columns: 1fr; }
`;

const Ref = styled.div`
  background: ${tokens.color.primary};
  color: #fff;
  font-family: ${tokens.font.display};
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  display: inline-block;
`;

export default function MyCommunityTicketsPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetch('/api/me/community-tickets')
      .then((r) => (r.ok ? r.json() : { tickets: [] }))
      .then((d) => setTickets(d.tickets ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Head>
        <Eyebrow>Community access · 10% free with EBT</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>My community tickets</h1>
        <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6, maxWidth: 640, lineHeight: 1.55 }}>
          Your reserved community seats. Bring your government-issued ID and valid EBT card (or accepted proof of low-income eligibility) to the gate.
        </p>
      </Head>

      {loading ? (
        <div style={{ padding: 40, color: tokens.color.textSecondary }}>Loading…</div>
      ) : tickets.length === 0 ? (
        <div style={{ background: '#fff', border: `1px solid ${tokens.color.border}`, borderRadius: 14, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>No community tickets yet</div>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 6, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>
            Every event reserves 10% of seats — free — for qualifying low-income individuals and families. Pick an event and request yours.
          </p>
          <div style={{ marginTop: 18, display: 'inline-flex', gap: 10 }}>
            <Link href="/events"><Button>Browse events</Button></Link>
            <Link href="/community-access"><Button $variant="secondary">About the policy</Button></Link>
          </div>
        </div>
      ) : (
        <Grid>
          {tickets.map((t) => (
            <Row key={t.reference}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Ref>{t.reference}</Ref>
                  <Badge $tone={t.status === 'reserved' ? 'info' : t.status === 'issued' ? 'success' : 'neutral'} $withDot>
                    {t.status}
                  </Badge>
                  <span style={{ fontSize: 12, color: tokens.color.textSecondary }}>
                    {t.ticketType === 'mother_child' ? `Mother + child · ${t.seats} seats` : `Individual · ${t.seats} seat`}
                  </span>
                </div>
                <div style={{ marginTop: 10, fontWeight: 700, fontSize: 15.5 }}>{t.event?.title || 'Event'}</div>
                <div style={{ fontSize: 12.5, color: tokens.color.textSecondary }}>
                  {t.event?.dateLabel} · {t.event?.venue}{t.event?.city ? `, ${t.event.city}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {t.event && <Link href={`/events/${t.event.slug}`}><Button $variant="secondary" $size="sm">View event</Button></Link>}
              </div>
            </Row>
          ))}
        </Grid>
      )}
    </>
  );
}
