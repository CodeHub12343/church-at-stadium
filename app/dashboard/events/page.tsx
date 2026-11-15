'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Eyebrow } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EventCard } from '@/components/events/EventCard';
import type { MockEvent } from '@/lib/mockData';

const Head = styled.div`
  margin-bottom: 22px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;

const Skeleton = styled.div`
  background: ${tokens.color.surface2};
  border-radius: 14px;
  height: 260px;
  position: relative;
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: sh 1.2s infinite;
  }
  @keyframes sh {
    from { transform: translateX(-100%); }
    to { transform: translateX(100%); }
  }
`;

const EmptyCard = styled.div`
  background: #fff;
  border: 1px dashed ${tokens.color.borderStrong};
  border-radius: 16px;
  padding: 48px 28px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 36px 20px;
  }
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0b1428, ${tokens.color.primary});
  color: ${tokens.color.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

type MeRole = 'admin' | 'church_rep' | 'organizer' | 'volunteer' | 'attendee';

export default function AvailableEventsPage() {
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<MeRole | null>(null);

  useEffect(() => {
    fetch('/api/events').then((r) => r.json()).then((d) => {
      setEvents(d.events ?? []);
      setLoading(false);
    });
    fetch('/api/me').then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d?.user?.role) setRole(d.user.role as MeRole);
    }).catch(() => {});
  }, []);

  const canCreate = role === 'organizer' || role === 'church_rep' || role === 'admin';

  return (
    <>
      <Head>
        <Eyebrow>Discover</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>Available events</h1>
        <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 4 }}>
          Browse every gathering across the network.
        </p>
      </Head>

      {loading && (
        <Grid>
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} />)}
        </Grid>
      )}

      {!loading && events.length === 0 && (
        <EmptyCard>
          <EmptyIcon>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 9h18M8 3v4M16 3v4" />
            </svg>
          </EmptyIcon>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>No events yet</h2>
            <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6, maxWidth: 420, lineHeight: 1.55 }}>
              {canCreate
                ? 'No gatherings are scheduled on the network yet. Publish the first one so churches and volunteers can get involved.'
                : 'No gatherings are scheduled on the network yet. Check back soon, or follow partner churches to be first to hear when they announce one.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {canCreate ? (
              <Link href="/dashboard/events/new"><Button $size="sm">+ Create event</Button></Link>
            ) : (
              <>
                <Link href="/churches"><Button $size="sm">Discover churches</Button></Link>
                <Link href="/dashboard/notifications"><Button $variant="secondary" $size="sm">Open inbox</Button></Link>
              </>
            )}
          </div>
        </EmptyCard>
      )}

      {!loading && events.length > 0 && (
        <Grid>
          {events.map((e) => <EventCard key={e.slug} event={e} />)}
        </Grid>
      )}
    </>
  );
}
