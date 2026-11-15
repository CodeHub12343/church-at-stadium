'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';

type Overall = 'operational' | 'degraded' | 'outage';
type ServiceStatus = 'operational' | 'degraded' | 'outage';
type IncidentSummary = { slug: string; title: string; status: string; severity: string; startedAt: string; resolvedAt?: string; impact?: string };
type StatusResponse = {
  overall: Overall;
  services: Array<{ key: string; name: string; status: ServiceStatus }>;
  openIncidents: IncidentSummary[];
  recent: IncidentSummary[];
};

const serviceDesc: Record<string, string> = {
  api: 'Core REST API and backend',
  web: 'churchatthestadiums.com and app pages',
  notifications: 'In-app notifications',
  registrations: 'Event registration and tickets',
  checkin: 'On-site check-in',
  db: 'Database (MongoDB)',
};

const Wrap = styled.div`
  background: ${tokens.color.surface};
  min-height: 100vh;
  padding-bottom: 60px;
`;

const HeroBanner = styled.div`
  margin: 40px 0 32px;
  background: linear-gradient(135deg, #f3fbf6, #fff);
  border: 1px solid #bfe4ce;
  border-radius: 16px;
  padding: 24px 28px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
`;

const CheckCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${tokens.color.success};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(22, 163, 106, 0.3);
`;

const ComponentsCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  overflow: hidden;
`;

const CompRow = styled.div`
  padding: 16px 22px;
  display: grid;
  grid-template-columns: 1fr 460px 90px;
  gap: 20px;
  align-items: center;
  border-bottom: 1px solid ${tokens.color.surface2};
  &:last-child { border-bottom: none; }
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const BarRow = styled.div`
  display: flex;
  gap: 3px;
  align-items: flex-end;
  height: 30px;
`;

const Bar = styled.span<{ $tone: 'ok' | 'deg' | 'out' | 'mnt'; $h: number }>`
  width: 5px;
  border-radius: 2px;
  height: ${(p) => p.$h}px;
  background: ${(p) =>
    p.$tone === 'ok'
      ? tokens.color.success
      : p.$tone === 'deg'
      ? tokens.color.warning
      : p.$tone === 'out'
      ? tokens.color.error
      : tokens.color.info};
`;

function uptimeBars(tone: 'ok' | 'deg' | 'out') {
  return (
    <BarRow>
      {Array.from({ length: 60 }).map((_, i) => {
        const h = tone === 'out' ? 10 : tone === 'deg' ? 16 : 30;
        return <Bar key={i} $tone={tone} $h={h} />;
      })}
    </BarRow>
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusResponse | null>(null);

  async function refresh() {
    const r = await fetch('/api/status').then((x) => x.json());
    setData(r);
  }
  useEffect(() => { refresh(); }, []);

  const overall = data?.overall ?? 'operational';
  const headerTone = overall === 'operational' ? 'success' : overall === 'degraded' ? 'warning' : 'error';
  const headerBg = overall === 'operational'
    ? 'linear-gradient(135deg, #f3fbf6, #fff)'
    : overall === 'degraded'
    ? 'linear-gradient(135deg, #fef8e8, #fff)'
    : 'linear-gradient(135deg, #fdeaea, #fff)';
  const headerBorder = overall === 'operational' ? '#bfe4ce' : overall === 'degraded' ? tokens.color.warningBorder : tokens.color.errorBorder;
  const headerText = overall === 'operational' ? '#0E4A2A' : overall === 'degraded' ? tokens.color.warningText : tokens.color.errorText;
  const headerLabel = overall === 'operational' ? 'All systems operational' : overall === 'degraded' ? 'Some systems degraded' : 'Major outage';

  return (
    <>
      <PublicNav />
      <Wrap>
        <Container>
          <HeroBanner style={{ background: headerBg, borderColor: headerBorder }}>
            <CheckCircle style={{
              background: overall === 'operational' ? tokens.color.success : overall === 'degraded' ? tokens.color.warning : tokens.color.error,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            </CheckCircle>
            <div style={{ flex: 1 }}>
              <div style={{ color: headerText, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Current status
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: headerText }}>{headerLabel}</h1>
              <div style={{ color: headerText, fontSize: 13.5, marginTop: 4, opacity: 0.8 }}>
                Updated just now ·{' '}
                {data?.openIncidents.length
                  ? `${data.openIncidents.length} open incident${data.openIncidents.length === 1 ? '' : 's'}`
                  : 'no open incidents'}
              </div>
            </div>
            <Badge $tone={headerTone} $withDot>{overall}</Badge>
          </HeroBanner>

          {(data?.openIncidents.length ?? 0) > 0 && (
            <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data!.openIncidents.map((inc) => (
                <Link key={inc.slug} href={`/status/incidents/${inc.slug}`} style={{ display: 'block', padding: '14px 18px', background: tokens.color.warningSurface, border: `1px solid ${tokens.color.warningBorder}`, borderRadius: 11 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge $tone="warning" $withDot>{inc.status}</Badge>
                    <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 14.5 }}>{inc.title}</div>
                    <span style={{ color: tokens.color.warningText, fontSize: 12 }}>· Started {new Date(inc.startedAt).toLocaleString()}</span>
                  </div>
                  <div style={{ color: tokens.color.warningText, fontSize: 13, marginTop: 6 }}>{inc.impact}</div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Platform components</h2>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: tokens.color.textSecondary, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 10, background: tokens.color.success, borderRadius: 2 }} />
                Operational
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 10, background: tokens.color.warning, borderRadius: 2 }} />
                Degraded
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 10, background: tokens.color.error, borderRadius: 2 }} />
                Outage
              </span>
            </div>
          </div>

          <ComponentsCard>
            {(data?.services ?? []).map((c) => {
              const tone: 'ok' | 'deg' | 'out' = c.status === 'operational' ? 'ok' : c.status === 'degraded' ? 'deg' : 'out';
              const badge = c.status === 'operational' ? 'success' : c.status === 'degraded' ? 'warning' : 'error';
              return (
                <CompRow key={c.key}>
                  <div>
                    <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 14.5 }}>{c.name}</div>
                    <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 3 }}>{serviceDesc[c.key] ?? c.key}</div>
                  </div>
                  {uptimeBars(tone)}
                  <div style={{ textAlign: 'right' }}>
                    <Badge $tone={badge} $withDot>{c.status}</Badge>
                  </div>
                </CompRow>
              );
            })}
          </ComponentsCard>

          <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 36, marginBottom: 14 }}>
            Incident history
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data?.recent.length ?? 0) === 0 && (
              <div style={{ padding: 20, color: tokens.color.textSecondary, fontSize: 13, textAlign: 'center' }}>No incidents yet.</div>
            )}
            {(data?.recent ?? []).map((h) => (
              <Link key={h.slug} href={`/status/incidents/${h.slug}`} style={{ display: 'block', padding: '14px 18px', background: '#fff', border: `1px solid ${tokens.color.border}`, borderRadius: 11 }}>
                <div style={{ fontSize: 11.5, color: tokens.color.textSecondary, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {new Date(h.startedAt).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Badge $tone={h.status === 'resolved' ? 'success' : 'warning'} $withDot>{h.status}</Badge>
                    <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 14.5, color: tokens.color.textPrimary }}>{h.title}</div>
                  </div>
                  <span className="mono" style={{ color: tokens.color.textSecondary, fontSize: 12 }}>{h.severity}</span>
                </div>
                {h.impact && (
                  <div style={{ color: tokens.color.textSecondary, fontSize: 13, marginTop: 6, lineHeight: 1.55 }}>
                    {h.impact}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </Container>
      </Wrap>
    </>
  );
}
