'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, Eyebrow } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';

type Stats = {
  users: number; churches: number; verifiedChurches: number; pendingChurches: number;
  events: number; pendingEvents: number; registrations: number; volunteerApplications: number;
};
type PendingChurch = {
  slug: string; name: string; initials: string; city: string; country: string;
  submittedAt: string; verified: boolean;
};
type AuditEntry = {
  id: string;
  action: string;
  description: string;
  actorName: string;
  actorRole: string;
  severity: 'info' | 'success' | 'sensitive' | 'alert';
  createdAt: string;
};

function activityTone(severity: AuditEntry['severity']): 'success' | 'info' | 'warning' | 'neutral' | 'error' {
  switch (severity) {
    case 'success': return 'success';
    case 'sensitive': return 'warning';
    case 'alert': return 'error';
    case 'info':
    default: return 'info';
  }
}

function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('en', { day: '2-digit', month: 'short' });
  const time = d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} · ${time}`;
}

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
`;

const Stats = styled.div`
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Row = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th {
    text-align: left;
    font-size: 11.5px;
    color: ${tokens.color.textSecondary};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
    padding: 12px 16px;
    border-bottom: 1px solid ${tokens.color.border};
    background: ${tokens.color.surface};
  }
  td {
    padding: 14px 16px;
    font-size: 13.5px;
    border-bottom: 1px solid ${tokens.color.surface2};
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
`;

const Avatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${tokens.color.secondarySoft};
  color: ${tokens.color.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 11px;
  font-family: ${tokens.font.display};
  flex-shrink: 0;
`;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<PendingChurch[]>([]);
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await fetch('/api/admin/stats');
      if (s.status === 403) { setForbidden(true); return; }
      setStats(await s.json());
      const c = await fetch('/api/admin/churches?status=pending').then((r) => r.json());
      setPending(c.churches ?? []);
      try {
        const a = await fetch('/api/admin/audit-logs?limit=5').then((r) => r.json());
        setActivity((a.logs ?? []) as AuditEntry[]);
      } catch {
        setActivity([]);
      } finally {
        setActivityLoading(false);
      }
    })();
  }, []);

  if (forbidden) {
    return (
      <div style={{ padding: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Admin only</h1>
        <p style={{ color: tokens.color.textSecondary, marginTop: 8 }}>
          You need an admin role to view this area. Promote your account via <code>npm run db:promote &lt;email&gt;</code>.
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Control center</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Platform overview</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 4 }}>
            Current state across churches, events, people, and venues.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Select defaultValue="30d" style={{ width: 160 }}>
            <option value="30d">Last 30 days</option>
            <option value="7d">Last 7 days</option>
            <option value="ytd">Year to date</option>
          </Select>
          <Button>Export report</Button>
        </div>
      </Head>

      <Stats>
        <StatCard
          label="Registered users"
          value={(stats?.users ?? 0).toLocaleString()}
          foot="Across the platform"
        />
        <StatCard
          label="Verified churches"
          value={`${(stats?.verifiedChurches ?? 0).toLocaleString()} / ${(stats?.churches ?? 0).toLocaleString()}`}
          foot={`${stats?.pendingChurches ?? 0} in review`}
          badge={stats?.pendingChurches ? { text: 'in review', tone: 'warning' } : undefined}
        />
        <StatCard
          label="Events"
          value={String(stats?.events ?? 0)}
          foot={`${stats?.pendingEvents ?? 0} drafts awaiting approval`}
          badge={stats?.pendingEvents ? { text: 'approvals', tone: 'error' } : undefined}
        />
        <StatCard
          label="Event registrations"
          value={(stats?.registrations ?? 0).toLocaleString()}
          foot={`${stats?.volunteerApplications ?? 0} volunteer apps`}
        />
      </Stats>

      <Row>
        <Card $padded={false}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${tokens.color.surface2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Pending church applications</h2>
              <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                Oldest first · {stats?.pendingChurches ?? 0} awaiting review
              </div>
            </div>
            <Link href="/admin/churches" style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 13 }}>
              Review queue →
            </Link>
          </div>
          <Table>
            <thead>
              <tr>
                <th>Church</th>
                <th>Country</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 && (
                <tr><td colSpan={4} style={{ color: tokens.color.textSecondary, textAlign: 'center' }}>No applications waiting.</td></tr>
              )}
              {pending.slice(0, 6).map((c) => (
                <tr key={c.slug}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar>{c.initials}</Avatar>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ color: tokens.color.textSecondary, fontSize: 12 }}>{c.city}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: tokens.color.textSecondary }}>{c.country}</td>
                  <td style={{ color: tokens.color.textSecondary }}>{new Date(c.submittedAt).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/churches/${c.slug}`} style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 12.5 }}>
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader>
            <h2>Recent platform activity</h2>
            <Link href="/admin/audit-logs">Full log →</Link>
          </CardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5 }}>
            {activityLoading && (
              <div style={{ color: tokens.color.textSecondary, fontSize: 13 }}>Loading recent activity…</div>
            )}
            {!activityLoading && activity.length === 0 && (
              <div style={{ color: tokens.color.textSecondary, fontSize: 13 }}>
                No recorded activity yet. Admin actions and sign-ins will appear here.
              </div>
            )}
            {activity.map((entry) => (
              <ActivityItem
                key={entry.id}
                tone={activityTone(entry.severity)}
                text={
                  <>
                    {entry.description}
                    {entry.actorName && entry.actorName !== 'System' && (
                      <> · <strong>{entry.actorName}</strong></>
                    )}
                  </>
                }
                when={formatActivityTime(entry.createdAt)}
              />
            ))}
          </div>
        </Card>
      </Row>
    </>
  );
}

function ActivityItem({
  tone,
  text,
  when,
}: {
  tone: 'success' | 'info' | 'warning' | 'neutral' | 'error';
  text: React.ReactNode;
  when: string;
}) {
  const bg = {
    success: tokens.color.successBg,
    info: tokens.color.infoBg,
    warning: tokens.color.warningBg,
    neutral: tokens.color.surface2,
    error: tokens.color.errorBg,
  }[tone];
  const fg = {
    success: tokens.color.successText,
    info: tokens.color.infoText,
    warning: tokens.color.warningText,
    neutral: tokens.color.textSecondary,
    error: tokens.color.errorText,
  }[tone];
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: bg,
          color: fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontWeight: 700,
        }}
      >
        ●
      </div>
      <div>
        <div>{text}</div>
        <div style={{ color: tokens.color.textSecondary, fontSize: 11.5, marginTop: 2 }}>{when}</div>
      </div>
    </div>
  );
}
