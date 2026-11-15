'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, Eyebrow } from '@/components/ui/Card';
import { submitJson } from '@/lib/form';

type Opp = {
  id: string; eventSlug: string; department: string; role: string; city: string;
  dateLabel: string; monthShort: string; dayShort: string;
  filled: number; total: number; supervisor?: string; requirements?: string; recommended: boolean;
};

type MyApp = {
  id: string; department: string; role: string; city: string; eventSlug: string;
  status: 'submitted' | 'under_review' | 'approved' | 'declined' | 'withdrawn';
  reportingInstructions?: string; createdAt: string;
};

type Me = {
  firstName: string; lastName: string;
  stats: { approvedCount: number; pendingCount: number; oldestPendingDays: number | null; hoursServed: number; eventsServed: number };
  nextAssignment: { eventSlug: string; eventTitle: string; dateLabel: string; start: string; department: string; role: string; daysToGo: number } | null;
  applications: MyApp[];
};

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  @media (max-width: ${tokens.bp.mobile}) {
    h1 { font-size: 24px !important; line-height: 1.15; }
  }
`;

const HeadActions = styled.div`
  display: flex;
  gap: 10px;
  @media (max-width: ${tokens.bp.mobile}) {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    button {
      width: 100%;
      white-space: nowrap;
      padding: 12px 10px;
      font-size: 13.5px;
    }
  }
  .short { display: none; }
  @media (max-width: ${tokens.bp.mobile}) {
    .full { display: none; }
    .short { display: inline; }
  }
`;

const Row = styled.div`
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr 1fr;
  gap: 14px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const HeroCard = styled.div`
  background: linear-gradient(135deg, #0b1428, ${tokens.color.primary} 55%, #1b2e55);
  border-radius: 14px;
  padding: 22px;
  color: #fff;
  position: relative;
  overflow: hidden;
`;

const StatBox = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 18px 20px;
  .lbl { color: ${tokens.color.textSecondary}; font-size: 12.5px; font-weight: 600; }
  .val { font-family: ${tokens.font.display}; font-weight: 800; font-size: 30px; color: ${tokens.color.primary}; margin-top: 6px; font-variant-numeric: tabular-nums; }
  .sub { color: ${tokens.color.textSecondary}; font-size: 12px; margin-top: 2px; }
`;

const Grid = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const OppRow = styled.div`
  display: grid;
  grid-template-columns: 70px 1fr 100px 90px;
  gap: 14px;
  align-items: center;
  padding: 14px 0;
  border-top: 1px solid ${tokens.color.surface2};
  &:first-child { border-top: none; }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 56px 1fr;
  }
`;

const DateChip = styled.div`
  padding: 8px 0;
  background: ${tokens.color.surface};
  border-radius: 10px;
  text-align: center;
  .m { color: ${tokens.color.secondary}; font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  .d { font-family: ${tokens.font.display}; font-weight: 800; font-size: 19px; color: ${tokens.color.primary}; }
`;

const AppCard = styled.div<{ $tone?: 'approved' | 'review' | 'draft' }>`
  padding: 14px;
  border-radius: 11px;
  border: 1px solid ${(p) =>
    p.$tone === 'approved' ? '#BFE4CE' : p.$tone === 'review' ? tokens.color.warningBorder : tokens.color.border};
  background: ${(p) =>
    p.$tone === 'approved' ? 'linear-gradient(135deg,#E6F5EC,#F3FBF6)' : p.$tone === 'review' ? tokens.color.warningSurface : '#fff'};
`;

const appTone = (s: MyApp['status']): 'approved' | 'review' | 'draft' => {
  if (s === 'approved') return 'approved';
  if (s === 'submitted' || s === 'under_review') return 'review';
  return 'draft';
};

const appBadge = (s: MyApp['status']) => {
  if (s === 'approved') return { tone: 'success' as const, label: 'Approved' };
  if (s === 'under_review') return { tone: 'warning' as const, label: 'Under review' };
  if (s === 'submitted') return { tone: 'warning' as const, label: 'Submitted' };
  if (s === 'declined') return { tone: 'error' as const, label: 'Declined' };
  return { tone: 'neutral' as const, label: 'Withdrawn' };
};

export default function VolunteerPortalPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [opps, setOpps] = useState<Opp[]>([]);
  const [applying, setApplying] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh() {
    const [meRes, oppRes] = await Promise.all([
      fetch('/api/volunteer/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/volunteer/opportunities').then((r) => (r.ok ? r.json() : { opportunities: [] })),
    ]);
    if (meRes) setMe(meRes);
    setOpps(oppRes?.opportunities ?? []);
  }

  useEffect(() => { refresh(); }, []);

  async function apply(id: string) {
    setApplying(id);
    setNotice(null);
    const res = await submitJson('/api/volunteer/applications', { opportunityId: id });
    setApplying(null);
    if (!res.ok) { setNotice(res.error); return; }
    setNotice('Application submitted');
    await refresh();
  }

  const myAppsByOpp = new Set((me?.applications ?? []).map((a) => `${a.department}|${a.role}|${a.eventSlug}`));

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Welcome back</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>
            Ready to serve{me?.firstName ? `, ${me.firstName}` : ''}
          </h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 4 }}>
            {me?.nextAssignment
              ? `Your next assignment is in ${me.nextAssignment.daysToGo} ${me.nextAssignment.daysToGo === 1 ? 'day' : 'days'} at ${me.nextAssignment.eventTitle}.`
              : 'Browse opportunities below to get started.'}
          </p>
        </div>
        <HeadActions>
          <Button>
            <span className="full">Browse opportunities →</span>
            <span className="short">Browse roles →</span>
          </Button>
        </HeadActions>
      </Head>

      {notice && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: tokens.color.successBg, color: tokens.color.successText, border: `1px solid ${tokens.color.success}33`, borderRadius: 10, fontSize: 13 }}>
          {notice}
        </div>
      )}

      <Row>
        <HeroCard>
          <div
            style={{
              color: tokens.color.secondary,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Next assignment
          </div>
          <div style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 21, marginTop: 6 }}>
            {me?.nextAssignment?.eventTitle ?? 'No approved assignment yet'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 6 }}>
            {me?.nextAssignment
              ? `${me.nextAssignment.dateLabel} · ${me.nextAssignment.department} department`
              : 'Apply for a role below and we’ll put you on a team.'}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                fontFamily: tokens.font.display,
                fontWeight: 800,
                fontSize: 40,
                color: tokens.color.secondary,
                lineHeight: 1,
              }}
              className="mono"
            >
              {me?.nextAssignment?.daysToGo ?? '—'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.3 }}>
              days
              <br />
              to go
            </div>
          </div>
          {me?.nextAssignment && (
            <div style={{ marginTop: 14, color: 'rgba(255,255,255,0.75)', fontSize: 12.5 }}>
              You&apos;ll receive reporting instructions from the organiser before the day.
            </div>
          )}
        </HeroCard>

        <StatBox>
          <div className="lbl">Approved assignments</div>
          <div className="val">{me?.stats.approvedCount ?? 0}</div>
          <div className="sub">This year</div>
        </StatBox>
        <StatBox>
          <div className="lbl">Pending applications</div>
          <div className="val">{me?.stats.pendingCount ?? 0}</div>
          <div className="sub">
            {me?.stats.oldestPendingDays != null
              ? `Oldest: ${me.stats.oldestPendingDays} day${me.stats.oldestPendingDays === 1 ? '' : 's'} ago`
              : 'None pending'}
          </div>
        </StatBox>
        <StatBox>
          <div className="lbl">Hours served</div>
          <div className="val">{me?.stats.hoursServed ?? 0}</div>
          <div className="sub">Across {me?.stats.eventsServed ?? 0} events</div>
        </StatBox>
      </Row>

      <Grid>
        <Card>
          <CardHeader>
            <h2>Opportunities for you</h2>
            <a>See all →</a>
          </CardHeader>
          {opps.length === 0 && (
            <div style={{ padding: 20, color: tokens.color.textSecondary, fontSize: 13 }}>
              No open opportunities right now.
            </div>
          )}
          {opps.map((o) => {
            const already = myAppsByOpp.has(`${o.department}|${o.role}|${o.eventSlug}`);
            return (
              <OppRow key={o.id}>
                <DateChip>
                  <div className="m">{o.monthShort}</div>
                  <div className="d">{o.dayShort}</div>
                </DateChip>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{o.department} · {o.role}</div>
                    {o.recommended && <Badge $tone="info">Recommended</Badge>}
                  </div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 2 }}>
                    {o.filled} of {o.total} filled
                    {o.supervisor && <> · Supervisor: {o.supervisor}</>}
                    {o.requirements && <> · {o.requirements}</>}
                  </div>
                </div>
                <Badge $tone="neutral">{o.city}</Badge>
                <Button $size="sm" disabled={already || applying === o.id} onClick={() => apply(o.id)}>
                  {already ? 'Applied' : applying === o.id ? '…' : 'Apply'}
                </Button>
              </OppRow>
            );
          })}
        </Card>

        <Card>
          <CardHeader>
            <h2>My applications</h2>
            <a>All →</a>
          </CardHeader>
          {(me?.applications ?? []).length === 0 && (
            <div style={{ padding: 10, color: tokens.color.textSecondary, fontSize: 13 }}>
              You haven&apos;t applied to anything yet.
            </div>
          )}
          {(me?.applications ?? []).map((a, idx) => {
            const tone = appTone(a.status);
            const badge = appBadge(a.status);
            return (
              <div key={a.id} style={{ marginTop: idx === 0 ? 0 : 10 }}>
                <AppCard $tone={tone}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                      {a.city} · {a.department} · {a.role}
                    </div>
                    <Badge $tone={badge.tone}>{badge.label}</Badge>
                  </div>
                  <div style={{
                    color: a.status === 'approved' ? tokens.color.successText : tokens.color.warningText,
                    fontSize: 12, marginTop: 4,
                  }}>
                    {a.status === 'approved' && a.reportingInstructions
                      ? a.reportingInstructions
                      : `Submitted ${new Date(a.createdAt).toLocaleDateString()}`}
                  </div>
                </AppCard>
              </div>
            );
          })}
        </Card>
      </Grid>

    </>
  );
}
