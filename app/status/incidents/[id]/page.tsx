'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Card';

type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'Investigating' | 'Identified' | 'Monitoring' | 'Resolved' | 'Maintenance';

interface IncidentUpdate {
  status: IncidentStatus;
  time: string;
  body: string;
}

interface Incident {
  id: string;
  title: string;
  date: string;
  duration: string;
  resolved: boolean;
  summary: string;
  impact: string;
  affected: string[];
  updates: IncidentUpdate[];
  rootCause: string;
  remediation: string[];
}

const incidents: Record<string, Incident> = {
  'email-queue-oct-27': {
    id: 'email-queue-oct-27',
    title: 'Elevated email delivery delays',
    date: '27 October 2026',
    duration: '42 minutes',
    resolved: true,
    summary:
      'A regional queue at our email provider delayed verification and confirmation emails for approximately 42 minutes. All queued messages were delivered once the backlog cleared.',
    impact:
      'New account verification, event confirmation and ticket emails were delayed by up to 42 minutes. No messages were lost. Users who did not receive the email during this window received it once service resumed.',
    affected: ['Email delivery'],
    updates: [
      { status: 'Resolved', time: '27 Oct 2026 · 15:12 UTC', body: 'All backlogged messages have now delivered. Mail delivery has returned to normal latency. Marking as resolved.' },
      { status: 'Monitoring', time: '27 Oct 2026 · 14:48 UTC', body: 'Queue drain is underway. We expect the backlog to clear within 20 minutes. Continuing to monitor.' },
      { status: 'Identified', time: '27 Oct 2026 · 14:36 UTC', body: 'The email provider has confirmed a regional queue congestion. Delivery is proceeding but slowly. We will continue to monitor.' },
      { status: 'Investigating', time: '27 Oct 2026 · 14:30 UTC', body: 'We are seeing a backlog of outbound verification and confirmation emails. Investigating with our email provider.' },
    ],
    rootCause:
      'Our email provider had a transient queueing bug affecting the EU-West-1 region, which caused outbound delivery to slow for approximately 42 minutes before draining.',
    remediation: [
      'Cross-region failover for transactional mail is being prepared and will be live by 30 November 2026.',
      'A dashboard now alerts on outbound mail latency over 90 seconds instead of only on failures.',
      'Working with the email provider to add a canary route that verifies each regional queue every minute.',
    ],
  },
  'eu-signin-oct-9': {
    id: 'eu-signin-oct-9',
    title: 'Degraded sign-in — Europe region',
    date: '9 October 2026',
    duration: '18 minutes',
    resolved: true,
    summary:
      'A failed identity-provider rollover slowed sign-in attempts from Europe for 18 minutes. The rollover was reverted and sign-in latency returned to normal.',
    impact: 'Sign-in from European IPs was slow (5–20s) for 18 minutes. Sessions already signed in were not affected. No credentials were compromised.',
    affected: ['Authentication & sign-in'],
    updates: [
      { status: 'Resolved', time: '9 Oct 2026 · 09:42 UTC', body: 'Rollback complete. Sign-in latency has returned to baseline across all regions. Resolved.' },
      { status: 'Identified', time: '9 Oct 2026 · 09:30 UTC', body: 'Identified the degraded path. Rolling back the identity-provider configuration change.' },
      { status: 'Investigating', time: '9 Oct 2026 · 09:24 UTC', body: 'Investigating slow sign-ins from European IP ranges.' },
    ],
    rootCause:
      'A planned identity-provider configuration change did not propagate to one node in the EU region, forcing a retry loop for a subset of sign-in requests.',
    remediation: [
      'IdP configuration changes now ship behind a progressive rollout with per-region health gates.',
      'Added synthetic sign-in checks from each region every 60 seconds to catch regional regressions sooner.',
    ],
  },
  'storage-maint-sep-14': {
    id: 'storage-maint-sep-14',
    title: 'Scheduled maintenance · document storage',
    date: '14 September 2026',
    duration: '38 minutes',
    resolved: true,
    summary: 'Planned storage migration. File uploads were queued during the window; no data was lost.',
    impact: 'Users could still read documents during the window. New uploads were queued and processed within 5 minutes of the maintenance ending.',
    affected: ['Documents & file storage'],
    updates: [
      { status: 'Resolved', time: '14 Sep 2026 · 03:08 UTC', body: 'Maintenance complete. Upload queue has drained; storage is fully operational.' },
      { status: 'Maintenance', time: '14 Sep 2026 · 02:30 UTC', body: 'Starting scheduled storage migration. Uploads will be queued; reads are unaffected.' },
    ],
    rootCause: 'Planned migration from the legacy storage region to the new multi-region cluster.',
    remediation: ['New uploads are now served by a cluster that supports in-place expansion without a maintenance window.'],
  },
};

const findIncident = (id: string) => incidents[id];

const Wrap = styled.div`
  background: ${tokens.color.surface};
  min-height: 100vh;
  padding: 48px 0 80px;
`;

const Crumbs = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${tokens.color.textSecondary};
  font-size: 13px;
  margin-bottom: 18px;
  a:hover {
    color: ${tokens.color.primary};
  }
`;

const Hero = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 20px;
`;

const Panel = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 22px 26px;
  margin-bottom: 16px;
  h3 {
    font-family: ${tokens.font.display};
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    margin-bottom: 14px;
  }
`;

const Update = styled.div`
  padding: 16px 0;
  border-top: 1px solid ${tokens.color.surface2};
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 16px;
  &:first-of-type {
    border-top: none;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const statusTone = (s: IncidentStatus): BadgeTone => {
  const v = String(s).toLowerCase();
  if (v === 'resolved') return 'success';
  if (v === 'investigating') return 'error';
  if (v === 'identified') return 'warning';
  if (v === 'monitoring') return 'info';
  return 'neutral';
};

type Live = {
  incident: {
    slug: string; title: string; status: string; severity: string; impact: string;
    affectedServices: string[]; startedAt: string; resolvedAt?: string;
    updates: Array<{ at: string; status: string; body: string }>;
  };
};

function duration(startedAt: string, resolvedAt?: string) {
  const end = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  const mins = Math.max(1, Math.floor((end - new Date(startedAt).getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function IncidentDetailPage({ params }: { params: { id: string } }) {
  const [live, setLive] = useState<Live | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    fetch(`/api/status/incidents/${encodeURIComponent(params.id)}`).then(async (r) => {
      if (!r.ok) { setStatus('missing'); return; }
      setLive(await r.json());
      setStatus('ready');
    }).catch(() => setStatus('missing'));
  }, [params.id]);

  if (status === 'loading') return <><PublicNav /><div style={{ padding: 60, textAlign: 'center', color: tokens.color.textSecondary }}>Loading incident…</div></>;
  if (status === 'missing' || !live) {
    return (
      <>
        <PublicNav />
        <Wrap>
          <Container>
            <div style={{ padding: 60, textAlign: 'center' }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>Incident not found</h1>
              <Link href="/status" style={{ color: tokens.color.primary, marginTop: 8, display: 'inline-block' }}>Back to status</Link>
            </div>
          </Container>
        </Wrap>
      </>
    );
  }

  const inc = live.incident;
  const resolved = inc.status === 'resolved';

  return (
    <>
      <PublicNav />
      <Wrap>
        <Container>
          <Crumbs>
            <Link href="/status">← Status</Link>
            <span>/</span>
            <strong style={{ color: tokens.color.primary }}>Incident</strong>
          </Crumbs>

          <Hero>
            <Eyebrow>{new Date(inc.startedAt).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })}</Eyebrow>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 10, lineHeight: 1.15 }}>{inc.title}</h1>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              {resolved ? <Badge $tone="success" $withDot>Resolved</Badge> : <Badge $tone="warning" $withDot>{inc.status}</Badge>}
              <Badge $tone="neutral">Duration {duration(inc.startedAt, inc.resolvedAt)}</Badge>
              <Badge $tone="info">Severity: {inc.severity}</Badge>
              {inc.affectedServices.map((a) => (
                <Badge key={a} $tone="info">{a}</Badge>
              ))}
            </div>
            <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.7, color: tokens.color.textSecondary, maxWidth: 820 }}>
              {inc.impact}
            </p>
          </Hero>

          <Panel>
            <h3>Timeline</h3>
            {inc.updates.length === 0 && (
              <div style={{ color: tokens.color.textSecondary, fontSize: 13 }}>No updates yet.</div>
            )}
            {inc.updates.map((u, i) => (
              <Update key={i}>
                <div>
                  <div style={{ fontSize: 12, color: tokens.color.textSecondary, letterSpacing: '0.04em' }}>
                    {new Date(u.at).toLocaleString()}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Badge $tone={statusTone(u.status as 'investigating' | 'identified' | 'monitoring' | 'resolved')} $withDot>{u.status}</Badge>
                  </div>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: tokens.color.textPrimary }}>{u.body}</div>
              </Update>
            ))}
          </Panel>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Link href="/status" style={{ color: tokens.color.primary, fontWeight: 600 }}>
              ← Back to status page
            </Link>
          </div>
        </Container>
      </Wrap>
      <PublicFooter />
    </>
  );
}
