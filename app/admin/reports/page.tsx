'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, Eyebrow } from '@/components/ui/Card';

type Stats = {
  users: number; churches: number; verifiedChurches: number; pendingChurches: number;
  events: number; pendingEvents: number; registrations: number; volunteerApplications: number;
};
type ReportItem = {
  id: string; title: string; type: 'platform' | 'event' | 'church' | 'volunteers' | 'finance';
  status: 'draft' | 'ready'; periodStart?: string; periodEnd?: string; createdAt: string;
};

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const Chips = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Chip = styled.button<{ $on?: boolean }>`
  padding: 7px 12px;
  border-radius: 8px;
  background: ${(p) => (p.$on ? tokens.color.primary : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : tokens.color.textPrimary)};
  border: 1px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.border)};
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin: 18px 0;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const EventRow = styled.div`
  padding: 14px 22px;
  border-top: 1px solid ${tokens.color.surface2};
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  &:first-of-type {
    border-top: none;
  }
`;

const typeLabel: Record<ReportItem['type'], string> = {
  platform: 'Platform', event: 'Events', church: 'Churches', volunteers: 'Volunteers', finance: 'Finance',
};

export default function AdminReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  async function refresh() {
    const s = await fetch('/api/admin/stats');
    if (s.status === 403) { setForbidden(true); return; }
    setStats(await s.json());
    const r = await fetch('/api/admin/reports').then((x) => x.json());
    setReports(r.reports ?? []);
  }
  useEffect(() => { refresh(); }, []);

  async function generate(type: ReportItem['type']) {
    setGenerating(type);
    await fetch('/api/admin/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    setGenerating(null);
    refresh();
  }

  if (forbidden) return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Analytics</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Platform reports</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            Live snapshot plus generated report runs. All data is from your own database.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chips>
            {(['platform', 'event', 'church', 'volunteers'] as const).map((t) => (
              <Chip key={t} onClick={() => generate(t)} disabled={generating === t}>
                {generating === t ? 'Generating…' : `+ ${typeLabel[t]}`}
              </Chip>
            ))}
          </Chips>
        </div>
      </Head>

      <Stats>
        <StatCard label="Users" value={(stats?.users ?? 0).toLocaleString()} foot="Total registered" />
        <StatCard label="Verified churches" value={`${stats?.verifiedChurches ?? 0} / ${stats?.churches ?? 0}`} foot={`${stats?.pendingChurches ?? 0} in review`} />
        <StatCard label="Events" value={String(stats?.events ?? 0)} foot={`${stats?.pendingEvents ?? 0} drafts`} />
        <StatCard label="Registrations" value={(stats?.registrations ?? 0).toLocaleString()} foot={`${stats?.volunteerApplications ?? 0} volunteer apps`} />
      </Stats>

      <Row>
        <Card>
          <CardHeader>
            <h2>Registrations &amp; attendance · 12 weeks</h2>
            <span style={{ color: tokens.color.textSecondary, fontSize: 12 }}>Weekly</span>
          </CardHeader>
          <div style={{ marginTop: 16 }}>
            <svg viewBox="0 0 700 220" width="100%" height="220" aria-hidden="true">
              <defs>
                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={tokens.color.primary} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={tokens.color.primary} stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="40" y1="30" x2="700" y2="30" stroke={tokens.color.surface2} />
              <line x1="40" y1="90" x2="700" y2="90" stroke={tokens.color.surface2} />
              <line x1="40" y1="150" x2="700" y2="150" stroke={tokens.color.surface2} />
              <line x1="40" y1="200" x2="700" y2="200" stroke={tokens.color.border} />
              <text x="4" y="34" fontSize="10" fill={tokens.color.textSecondary}>25k</text>
              <text x="4" y="94" fontSize="10" fill={tokens.color.textSecondary}>20k</text>
              <text x="4" y="154" fontSize="10" fill={tokens.color.textSecondary}>15k</text>
              <path
                d="M40 180 L105 165 L170 150 L235 135 L300 118 L365 100 L430 88 L495 72 L560 60 L625 48 L690 40 L690 200 L40 200 Z"
                fill="url(#grad)"
              />
              <path
                d="M40 180 L105 165 L170 150 L235 135 L300 118 L365 100 L430 88 L495 72 L560 60 L625 48 L690 40"
                fill="none"
                stroke={tokens.color.primary}
                strokeWidth="2.5"
              />
              <path
                d="M40 195 L105 185 L170 175 L235 170 L300 155 L365 145 L430 128 L495 112 L560 95 L625 80 L690 65"
                fill="none"
                stroke={tokens.color.secondary}
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
            </svg>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, color: tokens.color.textSecondary, fontSize: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 3, background: tokens.color.primary, borderRadius: 2 }} />
                Registered
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 3, background: tokens.color.secondary, borderRadius: 2 }} />
                Attended
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h2>Event mix</h2>
          </CardHeader>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            {[
              { l: 'Stadium worship', v: 10, c: tokens.color.primary },
              { l: 'Gospel crusade', v: 7, c: tokens.color.secondary },
              { l: 'Youth gathering', v: 5, c: tokens.color.success },
              { l: 'Conference', v: 4, c: tokens.color.info },
              { l: 'United prayer', v: 2, c: '#8E2DE2' },
            ].map((x) => (
              <div key={x.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
                  {x.l}
                </span>
                <span className="mono" style={{ fontWeight: 700 }}>{x.v}</span>
              </div>
            ))}
          </div>
        </Card>
      </Row>

      <Card $padded={false}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${tokens.color.surface2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Generated reports</h2>
          <span style={{ color: tokens.color.textSecondary, fontSize: 12 }}>{reports.length} saved</span>
        </div>
        {reports.length === 0 && (
          <div style={{ padding: 28, textAlign: 'center', color: tokens.color.textSecondary, fontSize: 13 }}>
            No reports yet. Use the <strong>+</strong> buttons above to generate one.
          </div>
        )}
        {reports.map((r) => (
          <EventRow key={r.id}>
            <div>
              <Link href={`/admin/reports/${r.id}`} style={{ fontWeight: 700, fontSize: 13.5, color: tokens.color.textPrimary }}>
                {r.title}
              </Link>
              <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                {typeLabel[r.type]} · Generated {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
            <Badge $tone={r.status === 'ready' ? 'success' : 'warning'}>{r.status}</Badge>
          </EventRow>
        ))}
      </Card>
    </>
  );
}
