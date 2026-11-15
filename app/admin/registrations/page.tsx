'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type Reg = {
  id: string; reference: string; eventSlug: string; name: string; email: string;
  partySize: number; mode: 'individual' | 'group'; country: string; city: string;
  churchName?: string; days: string[];
  checkInStatus: 'pending' | 'in' | 'duplicate' | 'denied'; checkedInAt?: string; createdAt: string;
};

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const Kpis = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Kpi = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 16px 18px;
  .l { color: ${tokens.color.textSecondary}; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
  .v { font-family: ${tokens.font.display}; font-weight: 800; font-size: 26px; margin-top: 2px; font-variant-numeric: tabular-nums; color: ${tokens.color.primary}; }
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
    padding: 14px 20px;
    font-size: 13.5px;
    border-bottom: 1px solid ${tokens.color.surface2};
  }
  tr:last-child td { border-bottom: none; }
`;

const statusTone = (s: Reg['checkInStatus']) =>
  s === 'in' ? 'success' : s === 'duplicate' ? 'warning' : s === 'denied' ? 'error' : 'neutral';

const statusLabel = (s: Reg['checkInStatus']) =>
  s === 'in' ? 'Checked in' : s === 'duplicate' ? 'Duplicate' : s === 'denied' ? 'Denied' : 'Pending';

export default function RegistrationsPage() {
  const [regs, setRegs] = useState<Reg[]>([]);
  const [eventFilter, setEventFilter] = useState('');
  const [forbidden, setForbidden] = useState(false);

  async function refresh() {
    const qs = eventFilter ? `?event=${encodeURIComponent(eventFilter)}` : '';
    const r = await fetch(`/api/admin/registrations${qs}`);
    if (r.status === 403) { setForbidden(true); return; }
    const d = await r.json();
    setRegs(d.registrations ?? []);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [eventFilter]);

  const counts = useMemo(() => ({
    total: regs.length,
    checkedIn: regs.filter((r) => r.checkInStatus === 'in').length,
    pending: regs.filter((r) => r.checkInStatus === 'pending').length,
    flagged: regs.filter((r) => r.checkInStatus === 'duplicate' || r.checkInStatus === 'denied').length,
  }), [regs]);

  if (forbidden) return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Attendees</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Registrations</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            Across all events · live data
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            placeholder="Filter by event slug"
            style={{ padding: '8px 12px', border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontSize: 13, minWidth: 220 }}
          />
          <Button>Export CSV</Button>
        </div>
      </Head>

      <Kpis>
        <Kpi><div className="l">Registrations</div><div className="v">{counts.total}</div></Kpi>
        <Kpi><div className="l">Checked in</div><div className="v" style={{ color: tokens.color.successText }}>{counts.checkedIn}</div></Kpi>
        <Kpi><div className="l">Pending</div><div className="v" style={{ color: tokens.color.warningText }}>{counts.pending}</div></Kpi>
        <Kpi><div className="l">Flagged</div><div className="v" style={{ color: tokens.color.errorText }}>{counts.flagged}</div></Kpi>
      </Kpis>

      <Table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Lead attendee</th>
            <th>Event</th>
            <th>Country</th>
            <th>Group</th>
            <th>Status</th>
            <th>Checked in</th>
          </tr>
        </thead>
        <tbody>
          {regs.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', color: tokens.color.textSecondary }}>No registrations match.</td></tr>
          )}
          {regs.map((r) => (
            <tr key={r.id}>
              <td className="mono" style={{ fontWeight: 600 }}>{r.reference}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>{r.email}</div>
              </td>
              <td style={{ color: tokens.color.textSecondary }}>{r.eventSlug}</td>
              <td style={{ color: tokens.color.textSecondary }}>{r.country}</td>
              <td className="mono" style={{ fontWeight: 600 }}>{r.partySize}</td>
              <td><Badge $tone={statusTone(r.checkInStatus)}>{statusLabel(r.checkInStatus)}</Badge></td>
              <td style={{ color: tokens.color.textSecondary }}>
                {r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
