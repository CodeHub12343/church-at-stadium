'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type LogEntry = {
  id: string; action: string; description: string;
  actorName: string; actorRole: string; resource?: string;
  severity: 'info' | 'success' | 'sensitive' | 'alert';
  ip?: string; createdAt: string;
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}
function colorOf(name: string) {
  const colors = ['#C6A45B', '#101B32', '#3975CC', '#16A36A', '#8E2DE2', '#DC4545'];
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

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
    font-size: 13px;
    border-bottom: 1px solid ${tokens.color.surface2};
    vertical-align: top;
  }
  tr:last-child td { border-bottom: none; }
`;

const AlertRow = styled.tr`
  background: ${tokens.color.errorSurface};
  &:hover td { background: #fde7e7; }
`;

const Avatar = styled.div<{ $bg: string }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: ${(p) => p.$bg};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 10px;
  font-family: ${tokens.font.display};
  flex-shrink: 0;
`;

const sevTone = (s: string): BadgeTone => {
  if (s === 'alert') return 'error';
  if (s === 'sensitive') return 'warning';
  if (s === 'success') return 'success';
  return 'neutral';
};

const sevLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [severity, setSeverity] = useState('');
  const [forbidden, setForbidden] = useState(false);

  async function refresh() {
    const qs = severity ? `?severity=${severity}` : '';
    const r = await fetch(`/api/admin/audit-logs${qs}`);
    if (r.status === 403) { setForbidden(true); return; }
    const d = await r.json();
    setLogs(d.logs ?? []);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [severity]);

  if (forbidden) return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;

  const counts = {
    total: logs.length,
    admin: logs.filter((l) => l.severity === 'sensitive' || l.severity === 'success').length,
    sensitive: logs.filter((l) => l.severity === 'sensitive').length,
    alerts: logs.filter((l) => l.severity === 'alert').length,
  };

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Security &amp; compliance</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Audit logs</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            Immutable record of every administrative change.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={{ padding: '8px 12px', border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontSize: 13, background: '#fff' }}
          >
            <option value="">All severities</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="sensitive">Sensitive</option>
            <option value="alert">Alert</option>
          </select>
          <Button onClick={refresh}>Refresh</Button>
        </div>
      </Head>

      <Kpis>
        <Kpi><div className="l">Logged events</div><div className="v" style={{ color: tokens.color.primary }}>{counts.total}</div></Kpi>
        <Kpi><div className="l">Admin actions</div><div className="v" style={{ color: tokens.color.primary }}>{counts.admin}</div></Kpi>
        <Kpi><div className="l">Sensitive</div><div className="v" style={{ color: tokens.color.warningText }}>{counts.sensitive}</div></Kpi>
        <Kpi><div className="l">Alerts</div><div className="v" style={{ color: tokens.color.errorText }}>{counts.alerts}</div></Kpi>
      </Kpis>

      <Table>
        <thead>
          <tr>
            <th style={{ width: 170 }}>Time</th>
            <th>Action</th>
            <th>Actor</th>
            <th>Resource</th>
            <th>IP</th>
            <th style={{ width: 100 }}>Severity</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: tokens.color.textSecondary }}>No events yet. Approve a church or change a role to populate the log.</td></tr>
          )}
          {logs.map((e) => {
            const RowTag = e.severity === 'alert' ? AlertRow : 'tr';
            return (
              <RowTag key={e.id}>
                <td className="mono" style={{ color: tokens.color.textSecondary }}>
                  {new Date(e.createdAt).toLocaleString()}
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: e.severity === 'alert' || e.severity === 'sensitive' ? tokens.color.errorText : tokens.color.primary }}>
                    {e.action}
                  </div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 11.5, marginTop: 2, maxWidth: 480 }}>
                    {e.description}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar $bg={colorOf(e.actorName)}>{initialsOf(e.actorName)}</Avatar>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{e.actorName}</div>
                      <div style={{ color: tokens.color.textSecondary, fontSize: 11 }}>{e.actorRole}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: tokens.color.textSecondary }} className="mono">{e.resource || '—'}</td>
                <td style={{ color: tokens.color.textSecondary, fontSize: 12 }} className="mono">{e.ip || '—'}</td>
                <td>
                  <Badge $tone={sevTone(e.severity)} $withDot={e.severity === 'alert'}>
                    {sevLabel(e.severity)}
                  </Badge>
                </td>
              </RowTag>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
