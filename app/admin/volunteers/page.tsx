'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

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
  .v { font-family: ${tokens.font.display}; font-weight: 800; font-size: 26px; margin-top: 2px; font-variant-numeric: tabular-nums; }
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

const Avatar = styled.div<{ $bg: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${(p) => p.$bg};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 11px;
`;

type AdminVolApp = {
  id: string; opportunityId: string; eventSlug: string; department: string; role: string;
  city: string; status: 'submitted' | 'under_review' | 'approved' | 'declined' | 'withdrawn';
  createdAt: string; user: { id: string; name: string; email: string } | null;
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}
function colorOf(email: string) {
  const colors = ['#C6A45B', '#101B32', '#3975CC', '#16A36A', '#8E2DE2', '#DC4545'];
  let h = 0; for (const c of email || '') h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}
const tone = (s: AdminVolApp['status']) =>
  s === 'approved' ? 'success' : s === 'under_review' || s === 'submitted' ? 'warning' : s === 'declined' ? 'error' : 'neutral';
const statusLabel = (s: AdminVolApp['status']) =>
  s === 'approved' ? 'Approved' : s === 'under_review' ? 'Under review' : s === 'submitted' ? 'Submitted' : s === 'declined' ? 'Declined' : 'Withdrawn';

export default function AdminVolunteersPage() {
  const [apps, setApps] = useState<AdminVolApp[]>([]);
  const [acting, setActing] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  async function refresh() {
    const r = await fetch('/api/admin/volunteers');
    if (r.status === 403) { setForbidden(true); return; }
    const d = await r.json();
    setApps(d.applications ?? []);
  }
  useEffect(() => { refresh(); }, []);

  async function act(id: string, status: AdminVolApp['status']) {
    setActing(id);
    await fetch(`/api/admin/volunteers/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setActing(null);
    refresh();
  }

  if (forbidden) return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;

  const counts = {
    total: apps.length,
    approved: apps.filter((a) => a.status === 'approved').length,
    review: apps.filter((a) => a.status === 'under_review' || a.status === 'submitted').length,
    declined: apps.filter((a) => a.status === 'declined').length,
  };

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Volunteer management</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Volunteers</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            {counts.total} applications across events
          </p>
        </div>
      </Head>

      <Kpis>
        <Kpi><div className="l">Applications</div><div className="v" style={{ color: tokens.color.primary }}>{counts.total}</div></Kpi>
        <Kpi><div className="l">Approved</div><div className="v" style={{ color: tokens.color.successText }}>{counts.approved}</div></Kpi>
        <Kpi><div className="l">Awaiting review</div><div className="v" style={{ color: tokens.color.warningText }}>{counts.review}</div></Kpi>
        <Kpi><div className="l">Declined</div><div className="v" style={{ color: tokens.color.errorText }}>{counts.declined}</div></Kpi>
      </Kpis>

      <Table>
        <thead>
          <tr>
            <th>Volunteer</th>
            <th>Department · Role</th>
            <th>Event</th>
            <th>Applied</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {apps.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: tokens.color.textSecondary }}>No applications yet.</td></tr>
          )}
          {apps.map((a) => {
            const name = a.user?.name || 'Unknown';
            const email = a.user?.email || '';
            return (
              <tr key={a.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar $bg={colorOf(email)}>{initialsOf(name)}</Avatar>
                    <div>
                      <div style={{ fontWeight: 600 }}>{name}</div>
                      <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>{email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: tokens.color.textSecondary }}>
                  <div style={{ fontWeight: 600, color: tokens.color.textPrimary }}>{a.department}</div>
                  <div style={{ fontSize: 11.5 }}>{a.role}</div>
                </td>
                <td style={{ color: tokens.color.textSecondary }}>{a.eventSlug}<br /><span style={{ fontSize: 11 }}>{a.city}</span></td>
                <td style={{ color: tokens.color.textSecondary }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                <td><Badge $tone={tone(a.status)}>{statusLabel(a.status)}</Badge></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {a.status !== 'approved' && (
                      <Button $size="sm" onClick={() => act(a.id, 'approved')} disabled={acting === a.id}>
                        Approve
                      </Button>
                    )}
                    {a.status !== 'declined' && a.status !== 'approved' && (
                      <Button $size="sm" $variant="secondary" onClick={() => act(a.id, 'declined')} disabled={acting === a.id}>
                        Decline
                      </Button>
                    )}
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
