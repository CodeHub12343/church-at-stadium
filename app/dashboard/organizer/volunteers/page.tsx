'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, Eyebrow } from '@/components/ui/Card';
import { Input, Label, Textarea, FieldGroup, Hint } from '@/components/ui/Input';
import { submitJson } from '@/lib/form';

type Opp = { id: string; department: string; role: string; filled: number; total: number; supervisor?: string; requirements?: string };
type App = { id: string; opportunityId: string; department: string; role: string; status: 'submitted' | 'under_review' | 'approved' | 'declined' | 'withdrawn'; createdAt: string; applicantName: string; applicantEmail: string };
type EventBlock = { slug: string; title: string; dateLabel: string; city: string; country: string; opportunities: Opp[]; applications: App[] };

const Head = styled.div`
  margin-bottom: 20px;
`;

const EventCard = styled.section`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 16px;
  padding: 24px 26px;
  margin-top: 16px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 18px;
  }
`;

const EventHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  flex-wrap: wrap;
  padding-bottom: 14px;
  border-bottom: 1px solid ${tokens.color.surface2};
  margin-bottom: 16px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div`
  .colTitle {
    color: ${tokens.color.textSecondary};
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
`;

const Row = styled.div`
  padding: 12px 14px;
  background: ${tokens.color.surface};
  border: 1px solid ${tokens.color.border};
  border-radius: 10px;
  & + & { margin-top: 8px; }
`;

const AppRow = styled(Row)`
  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const Empty = styled.div`
  padding: 14px;
  color: ${tokens.color.textSecondary};
  font-size: 13px;
  border: 1px dashed ${tokens.color.border};
  border-radius: 10px;
  text-align: center;
`;

const AddBtn = styled.button`
  background: none;
  border: 1px dashed ${tokens.color.borderStrong};
  color: ${tokens.color.primary};
  font-weight: 600;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
  font-size: 13px;
  &:hover { background: ${tokens.color.surface}; }
`;

const appTone = (s: App['status']) =>
  s === 'approved' ? 'success' : s === 'declined' ? 'error' : s === 'withdrawn' ? 'neutral' : 'warning';

export default function OrganizerVolunteersPage() {
  const [data, setData] = useState<EventBlock[] | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch('/api/organizer/volunteer-queue');
    if (!r.ok) { setData([]); return; }
    const d = await r.json();
    setData(d.events ?? []);
  }

  useEffect(() => { refresh(); }, []);

  async function createOpportunity(eventSlug: string, form: { department: string; role: string; total: number; supervisor: string; requirements: string }) {
    setNotice(null);
    const res = await submitJson('/api/organizer/opportunities', { eventSlug, ...form });
    if (!res.ok) { setNotice(res.error); return; }
    setAdding(null);
    setNotice('Opportunity added');
    await refresh();
  }

  async function updateApp(id: string, status: 'approved' | 'declined' | 'under_review') {
    setActing(id);
    setNotice(null);
    const res = await submitJson(`/api/organizer/applications/${encodeURIComponent(id)}`, { status }, { method: 'PATCH' });
    setActing(null);
    if (!res.ok) { setNotice(res.error); return; }
    setNotice(status === 'approved' ? 'Volunteer approved' : status === 'declined' ? 'Application declined' : 'Marked under review');
    await refresh();
  }

  if (data === null) {
    return <div style={{ padding: 40, color: tokens.color.textSecondary }}>Loading your events…</div>;
  }

  return (
    <>
      <Head>
        <Eyebrow>Organizer</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>Volunteer applications</h1>
        <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6, maxWidth: 580, lineHeight: 1.55 }}>
          Add volunteer opportunities to your events, then approve or decline the people who apply.
        </p>
      </Head>

      {notice && (
        <div style={{ padding: '10px 14px', background: tokens.color.successBg, color: tokens.color.successText, border: `1px solid ${tokens.color.success}33`, borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
          {notice}
        </div>
      )}

      {data.length === 0 && (
        <Card>
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>No events yet</h2>
            <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 6 }}>
              Create an event first — then add volunteer roles and review applications here.
            </p>
            <div style={{ marginTop: 14 }}>
              <Link href="/dashboard/events/new"><Button $size="sm">+ Create event</Button></Link>
            </div>
          </div>
        </Card>
      )}

      {data.map((ev) => (
        <EventCard key={ev.slug}>
          <EventHead>
            <div>
              <div style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 18 }}>{ev.title}</div>
              <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 2 }}>
                {ev.dateLabel} · {ev.city}, {ev.country}
              </div>
            </div>
            <Link href={`/events/${ev.slug}`} style={{ color: tokens.color.primary, fontSize: 12.5, fontWeight: 600 }}>
              View event →
            </Link>
          </EventHead>

          <Grid>
            {/* Opportunities */}
            <Col>
              <div className="colTitle">Opportunities</div>
              {ev.opportunities.length === 0 && (
                <Empty>No opportunities yet. Add one so volunteers can apply.</Empty>
              )}
              {ev.opportunities.map((o) => (
                <Row key={o.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{o.department} · {o.role}</div>
                      <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                        {o.filled} of {o.total} filled
                        {o.supervisor && <> · Supervisor: {o.supervisor}</>}
                      </div>
                    </div>
                    <Badge $tone={o.filled >= o.total ? 'success' : 'neutral'}>{o.filled >= o.total ? 'Full' : 'Open'}</Badge>
                  </div>
                </Row>
              ))}
              <div style={{ marginTop: 10 }}>
                {adding === ev.slug ? (
                  <OpportunityForm
                    onCancel={() => setAdding(null)}
                    onSubmit={(f) => createOpportunity(ev.slug, f)}
                  />
                ) : (
                  <AddBtn onClick={() => setAdding(ev.slug)}>+ Add opportunity</AddBtn>
                )}
              </div>
            </Col>

            {/* Applications */}
            <Col>
              <div className="colTitle">Applications ({ev.applications.length})</div>
              {ev.applications.length === 0 && <Empty>No applications yet.</Empty>}
              {ev.applications.map((a) => (
                <AppRow key={a.id}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, overflowWrap: 'anywhere' }}>
                      {a.applicantName} · {a.department}/{a.role}
                    </div>
                    <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2, overflowWrap: 'anywhere' }}>
                      {a.applicantEmail} · Submitted {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge $tone={appTone(a.status)}>{a.status.replace('_', ' ')}</Badge>
                  {(a.status === 'submitted' || a.status === 'under_review') && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button $size="sm" onClick={() => updateApp(a.id, 'approved')} disabled={acting === a.id}>
                        Approve
                      </Button>
                      <Button $size="sm" $variant="secondary" onClick={() => updateApp(a.id, 'declined')} disabled={acting === a.id}>
                        Decline
                      </Button>
                    </div>
                  )}
                </AppRow>
              ))}
            </Col>
          </Grid>
        </EventCard>
      ))}
    </>
  );
}

function OpportunityForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (f: { department: string; role: string; total: number; supervisor: string; requirements: string }) => Promise<void>;
}) {
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [total, setTotal] = useState(5);
  const [supervisor, setSupervisor] = useState('');
  const [requirements, setRequirements] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!department.trim() || !role.trim()) return;
    setBusy(true);
    await onSubmit({ department: department.trim(), role: role.trim(), total, supervisor, requirements });
    setBusy(false);
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${tokens.color.border}`, borderRadius: 10, padding: 14 }}>
      <FieldGroup $cols={2}>
        <div>
          <Label>Department *</Label>
          <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Media" />
        </div>
        <div>
          <Label>Role *</Label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Camera operator" />
        </div>
        <div>
          <Label>Slots</Label>
          <Input type="number" min={1} max={500} value={total} onChange={(e) => setTotal(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        <div>
          <Label>Supervisor</Label>
          <Input value={supervisor} onChange={(e) => setSupervisor(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Label>Requirements</Label>
          <Textarea rows={2} value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="e.g. Must bring own DSLR, arrive 2h before." />
          <Hint>Shown to applicants.</Hint>
        </div>
      </FieldGroup>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
        <Button $size="sm" $variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button $size="sm" onClick={submit} disabled={busy}>{busy ? 'Adding…' : 'Add'}</Button>
      </div>
    </div>
  );
}
