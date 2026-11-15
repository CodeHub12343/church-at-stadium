'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';

type AdminEventDetail = {
  slug: string; title: string; category: string; status: string;
  start: string; end: string; dateLabel: string; city: string; country: string; venue: string;
  churches: number; expected: string; capacityPct: number; registrations: number;
};

const Hero = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
`;

const Mark = styled.div`
  width: 84px;
  height: 84px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0b1428, ${tokens.color.primarySoft});
  color: ${tokens.color.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 26px;
  flex-shrink: 0;
`;

const Stats = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Row = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 14px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const CoverBar = styled.div`
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CovRow = styled.div`
  .lbl {
    display: flex;
    justify-content: space-between;
    font-size: 12.5px;
    margin-bottom: 4px;
  }
  .bar {
    height: 7px;
    background: ${tokens.color.surface2};
    border-radius: 999px;
    overflow: hidden;
  }
`;

const ChurchRow = styled.div`
  padding: 12px 0;
  border-top: 1px solid ${tokens.color.surface2};
  display: flex;
  align-items: center;
  gap: 10px;
  &:first-of-type {
    border-top: none;
  }
`;

const ChurchLogo = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${tokens.color.secondarySoft};
  color: ${tokens.color.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 11px;
  flex-shrink: 0;
`;

const statusBadge = (s: string): { tone: BadgeTone; label: string } => {
  if (s === 'open') return { tone: 'success', label: 'Open' };
  if (s === 'approved') return { tone: 'info', label: 'Approved' };
  if (s === 'invitation') return { tone: 'warning', label: 'By invitation' };
  return { tone: 'neutral', label: 'Draft' };
};

function Coverage({
  label,
  filled,
  total,
}: {
  label: string;
  filled: number;
  total: number;
}) {
  const pct = (filled / total) * 100;
  const tone = pct >= 90 ? tokens.color.success : pct >= 60 ? tokens.color.warning : tokens.color.error;
  return (
    <CovRow>
      <div className="lbl">
        <span>{label}</span>
        <span className="mono" style={{ color: tokens.color.textSecondary }}>
          {filled} / {total}
        </span>
      </div>
      <div className="bar">
        <div style={{ width: `${pct}%`, height: '100%', background: tone }} />
      </div>
    </CovRow>
  );
}

export default function AdminEventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'forbidden'>('loading');
  const [acting, setActing] = useState(false);

  async function refresh() {
    const r = await fetch('/api/admin/events');
    if (r.status === 403) { setStatus('forbidden'); return; }
    const d = await r.json();
    const ev = (d.events ?? []).find((e: AdminEventDetail) => e.slug === params.id);
    if (!ev) { setStatus('missing'); return; }
    setEvent(ev);
    setStatus('ready');
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params.id]);

  async function setEventStatus(nextStatus: string) {
    setActing(true);
    await fetch(`/api/admin/events/${encodeURIComponent(params.id)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    setActing(false);
    refresh();
  }

  if (status === 'forbidden') return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;
  if (status === 'loading') return <div style={{ padding: 40, color: tokens.color.textSecondary }}>Loading event…</div>;
  if (status === 'missing' || !event) return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Event not found</h1>
      <Link href="/admin/events" style={{ color: tokens.color.primary, marginTop: 8, display: 'inline-block' }}>Back to events</Link>
    </div>
  );

  const s = statusBadge(event.status.toLowerCase());
  const daysTo = Math.max(0, Math.ceil((new Date(event.start).getTime() - Date.now()) / 86400000));

  return (
    <>
      <Hero>
        <Mark>{event.title.split(' ').map((w) => w[0]).slice(0, 2).join('')}</Mark>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge $tone={s.tone}>{s.label}</Badge>
            <Badge $tone="gold">{event.category}</Badge>
            <span style={{ color: tokens.color.textSecondary, fontSize: 12.5 }}>{event.slug}</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{event.title}</h1>
          <div style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            {event.dateLabel} · {event.venue} · {event.city}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href={`/events/${event.slug}`}><Button $variant="secondary">View public page</Button></Link>
          {event.status === 'Draft' && (
            <Button style={{ background: tokens.color.success }} onClick={() => setEventStatus('Open')} disabled={acting}>
              {acting ? '…' : '✓ Approve & publish'}
            </Button>
          )}
          {event.status === 'Open' && (
            <Button $variant="danger" onClick={() => setEventStatus('Draft')} disabled={acting}>
              Move to draft
            </Button>
          )}
        </div>
      </Hero>

      <Stats>
        <StatCard label="Registrations" value={event.registrations.toLocaleString()} foot={`of ${event.expected} expected`} />
        <StatCard label="Churches" value={event.churches.toString()} foot="Participating" />
        <StatCard label="Capacity" value={`${event.capacityPct}%`} foot="Reported" />
        <StatCard label="Days to event" value={String(daysTo)} foot={event.status === 'Open' ? 'Registration open' : event.status} />
      </Stats>

      <Row>
        <Card>
          <CardHeader>
            <h2>Volunteer coverage</h2>
            <Link href="/admin/volunteers" style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 13 }}>
              Review applications →
            </Link>
          </CardHeader>
          <p style={{ fontSize: 13.5, color: tokens.color.textSecondary, lineHeight: 1.6 }}>
            Per-department coverage breakdowns will appear here once volunteer opportunities are published for this
            event and applications start coming in.
          </p>
        </Card>

        <Card>
          <CardHeader>
            <h2>Participating churches</h2>
            <span style={{ color: tokens.color.textSecondary, fontSize: 12 }}>
              {event.churches} {event.churches === 1 ? 'church' : 'churches'}
            </span>
          </CardHeader>
          <p style={{ fontSize: 13.5, color: tokens.color.textSecondary, lineHeight: 1.6 }}>
            A roster of participating churches will appear here as registrations link back to their home churches.
          </p>
        </Card>
      </Row>

      <Card style={{ marginTop: 14 }}>
        <CardHeader>
          <h2>Where attendees come from</h2>
          <Link href="/admin/registrations" style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 13 }}>
            View registrations →
          </Link>
        </CardHeader>
        <p style={{ fontSize: 13.5, color: tokens.color.textSecondary, lineHeight: 1.6 }}>
          Country-level breakdowns will appear here once registrations are in. Individual registrations and their
          submitted country are available on the registrations page.
        </p>
      </Card>
    </>
  );
}
