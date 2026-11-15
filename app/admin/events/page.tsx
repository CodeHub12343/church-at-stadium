'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type AdminEvent = {
  slug: string; title: string; category: string; status: string;
  start: string; dateLabel: string; city: string; venue: string;
  churches: number; expected: string; capacityPct: number; registrations: number;
};

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  overflow: hidden;
  th {
    text-align: left;
    font-size: 11px;
    color: ${tokens.color.textSecondary};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
    padding: 14px 20px;
    border-bottom: 1px solid ${tokens.color.border};
    background: ${tokens.color.surface};
  }
  td {
    padding: 16px 20px;
    font-size: 13.5px;
    border-bottom: 1px solid ${tokens.color.surface2};
    vertical-align: middle;
  }
  tr:last-child td {
    border-bottom: none;
  }
  tr:hover td {
    background: #fbfbfd;
  }
`;

const statusLabel = (s: string): { tone: BadgeTone; label: string } => {
  if (s === 'Open') return { tone: 'success', label: 'Open' };
  if (s === 'Approved') return { tone: 'info', label: 'Approved' };
  if (s === 'Invitation') return { tone: 'warning', label: 'By invitation' };
  return { tone: 'neutral', label: 'Draft' };
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [acting, setActing] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  async function refresh() {
    const r = await fetch('/api/admin/events');
    if (r.status === 403) { setForbidden(true); return; }
    const d = await r.json();
    setEvents(d.events ?? []);
  }
  useEffect(() => { refresh(); }, []);

  async function setStatus(slug: string, status: string) {
    setActing(slug);
    await fetch(`/api/admin/events/${encodeURIComponent(slug)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setActing(null);
    refresh();
  }

  if (forbidden) return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;

  const drafts = events.filter((e) => e.status === 'Draft').length;

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Event directory</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Events</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            {events.length} total · {drafts} drafts awaiting approval
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/events/review"><Button $variant="secondary">Approval queue</Button></Link>
          <Link href="/dashboard/events/new"><Button>+ Create event</Button></Link>
        </div>
      </Head>

      <Table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Venue</th>
            <th>Date</th>
            <th>Churches</th>
            <th>Registrations</th>
            <th>Capacity</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            const s = statusLabel(e.status);
            return (
              <tr key={e.slug}>
                <td>
                  <div style={{ fontWeight: 700 }}>{e.title}</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12 }}>{e.category}</div>
                </td>
                <td style={{ color: tokens.color.textSecondary }}>{e.venue}<br /><span style={{ fontSize: 11 }}>{e.city}</span></td>
                <td style={{ color: tokens.color.textSecondary }}>{e.dateLabel}</td>
                <td className="mono" style={{ fontWeight: 600 }}>{e.churches}</td>
                <td className="mono" style={{ fontWeight: 600 }}>{e.registrations.toLocaleString()}</td>
                <td className="mono" style={{ color: tokens.color.textSecondary }}>{e.capacityPct}%</td>
                <td><Badge $tone={s.tone}>{s.label}</Badge></td>
                <td>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {e.status === 'Draft' && (
                      <Button $size="sm" onClick={() => setStatus(e.slug, 'Open')} disabled={acting === e.slug}>
                        Approve
                      </Button>
                    )}
                    <Link href={`/admin/events/${e.slug}`} style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 12.5 }}>
                      Open →
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
