'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';
import { submitJson, required } from '@/lib/form';

type Announcement = {
  id: string; title: string; body: string;
  status: 'draft' | 'scheduled' | 'sent';
  audience: 'all' | 'church_reps' | 'volunteers' | 'organizers' | 'attendees';
  eventSlug?: string;
  scheduledFor?: string; sentAt?: string;
  recipientCount: number;
  createdAt: string;
};

const audienceLabel: Record<Announcement['audience'], string> = {
  all: 'All users', church_reps: 'Church reps', volunteers: 'Volunteers',
  organizers: 'Organizers', attendees: 'Attendees',
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(iso).toLocaleDateString();
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

const Row = styled.article<{ $tone: 'warn' | 'ok' | 'draft' | 'err' }>`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-left: 4px solid ${(p) =>
    p.$tone === 'ok'
      ? tokens.color.success
      : p.$tone === 'warn'
      ? tokens.color.warning
      : p.$tone === 'err'
      ? tokens.color.error
      : tokens.color.textMuted};
  border-radius: 14px;
  padding: 20px 22px;
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 24px;
  align-items: flex-start;
  & + & { margin-top: 12px; }
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const MetaRow = styled.div`
  display: flex;
  gap: 16px;
  color: ${tokens.color.textSecondary};
  font-size: 12px;
  margin-top: 10px;
`;

const Side = styled.div<{ $bg: string; $border: string }>`
  padding: 16px;
  background: ${(p) => p.$bg};
  border: 1px solid ${(p) => p.$border};
  border-radius: 11px;
`;

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [forbidden, setForbidden] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' as Announcement['audience'] });
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch('/api/admin/announcements');
    if (r.status === 403) { setForbidden(true); return; }
    const d = await r.json();
    setItems(d.announcements ?? []);
  }
  useEffect(() => { refresh(); }, []);

  const [createError, setCreateError] = useState<string | null>(null);

  async function create(send: boolean) {
    setCreateError(null);
    if (!required(form.title)) { setCreateError('Title is required.'); return; }
    if (!required(form.body)) { setCreateError('Body is required.'); return; }
    setSubmitting(true);
    const res = await submitJson('/api/admin/announcements', {
      title: form.title.trim(), body: form.body.trim(), audience: form.audience, send,
    });
    setSubmitting(false);
    if (!res.ok) { setCreateError(res.error); return; }
    setShowNew(false);
    setForm({ title: '', body: '', audience: 'all' });
    refresh();
  }

  async function sendOne(id: string) {
    setSending(id);
    await submitJson(`/api/admin/announcements/${id}`, { action: 'send' }, { method: 'PATCH' });
    setSending(null);
    refresh();
  }

  async function remove(id: string) {
    if (!confirm('Delete this announcement?')) return;
    await submitJson(`/api/admin/announcements/${id}`, null, { method: 'DELETE' });
    refresh();
  }

  if (forbidden) return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;

  const counts = {
    sent: items.filter((i) => i.status === 'sent').length,
    scheduled: items.filter((i) => i.status === 'scheduled').length,
    drafts: items.filter((i) => i.status === 'draft').length,
    totalRecipients: items.reduce((s, i) => s + (i.recipientCount || 0), 0),
  };

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Communications</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Announcements</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            Drafts, scheduled, and sent messages across your users.
          </p>
        </div>
        <Button onClick={() => setShowNew((v) => !v)}>+ New announcement</Button>
      </Head>

      {showNew && (
        <div style={{ background: '#fff', border: `1px solid ${tokens.color.border}`, borderRadius: 14, padding: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            style={{ padding: '10px 14px', border: `1px solid ${tokens.color.border}`, borderRadius: 10, fontSize: 14, fontFamily: 'inherit' }}
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Body"
            rows={3}
            style={{ padding: '10px 14px', border: `1px solid ${tokens.color.border}`, borderRadius: 10, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value as Announcement['audience'] })}
              style={{ padding: '10px 14px', border: `1px solid ${tokens.color.border}`, borderRadius: 10, fontSize: 13, background: '#fff' }}
            >
              <option value="all">All users</option>
              <option value="church_reps">Church reps</option>
              <option value="volunteers">Volunteers</option>
              <option value="organizers">Organizers</option>
              <option value="attendees">Attendees</option>
            </select>
            <div style={{ flex: 1 }} />
            <Button $variant="secondary" onClick={() => create(false)} disabled={submitting || !form.title.trim() || !form.body.trim()}>Save draft</Button>
            <Button onClick={() => create(true)} disabled={submitting || !form.title.trim() || !form.body.trim()}>
              {submitting ? 'Sending…' : 'Send now'}
            </Button>
          </div>
          {createError && (
            <div style={{ padding: '10px 12px', background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, borderRadius: 10, fontSize: 13 }}>
              {createError}
            </div>
          )}
        </div>
      )}

      <Kpis>
        <Kpi><div className="l">Sent</div><div className="v" style={{ color: tokens.color.primary }}>{counts.sent}</div></Kpi>
        <Kpi><div className="l">Scheduled</div><div className="v" style={{ color: tokens.color.warningText }}>{counts.scheduled}</div></Kpi>
        <Kpi><div className="l">Drafts</div><div className="v" style={{ color: tokens.color.textSecondary }}>{counts.drafts}</div></Kpi>
        <Kpi><div className="l">Total recipients</div><div className="v" style={{ color: tokens.color.successText }}>{counts.totalRecipients.toLocaleString()}</div></Kpi>
      </Kpis>

      {items.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', border: `1px dashed ${tokens.color.border}`, borderRadius: 14, background: '#fff', color: tokens.color.textSecondary }}>
          No announcements yet. Click <strong>+ New announcement</strong> to create one.
        </div>
      )}

      {items.map((a) => {
        const tone: 'warn' | 'ok' | 'draft' | 'err' =
          a.status === 'sent' ? 'ok' : a.status === 'scheduled' ? 'warn' : 'draft';
        return (
          <Row key={a.id} $tone={tone}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {a.status === 'sent' && <Badge $tone="success" $withDot>Sent</Badge>}
                {a.status === 'scheduled' && <Badge $tone="warning" $withDot>Scheduled</Badge>}
                {a.status === 'draft' && <Badge $tone="neutral">Draft</Badge>}
                <Badge $tone="gold">{audienceLabel[a.audience]}</Badge>
                {a.eventSlug && <span style={{ color: tokens.color.textSecondary, fontSize: 12 }}>{a.eventSlug}</span>}
              </div>
              <Link href={`/admin/announcements/${a.id}`} style={{ display: 'block' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 10, color: tokens.color.textPrimary }}>{a.title}</h3>
              </Link>
              <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 6, lineHeight: 1.55 }}>{a.body}</p>
              <MetaRow>
                <span>Created {timeAgo(a.createdAt)}</span>
                {a.sentAt && <span>Sent {timeAgo(a.sentAt)}</span>}
                {a.recipientCount > 0 && <span>{a.recipientCount.toLocaleString()} recipients</span>}
              </MetaRow>
            </div>
            <Side
              $bg={a.status === 'sent' ? tokens.color.surface : a.status === 'scheduled' ? tokens.color.warningSurface : tokens.color.surface}
              $border={a.status === 'scheduled' ? tokens.color.warningBorder : tokens.color.border}
            >
              {a.status === 'sent' && (
                <>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Delivery</div>
                  <div style={{ marginTop: 10, fontSize: 13, color: tokens.color.successText }}>
                    {a.recipientCount.toLocaleString()} in-app notifications delivered
                  </div>
                </>
              )}
              {a.status === 'draft' && (
                <>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 11 }}>Not yet sent.</div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                    <Button $size="sm" style={{ flex: 1 }} onClick={() => sendOne(a.id)} disabled={sending === a.id}>
                      {sending === a.id ? '…' : 'Send'}
                    </Button>
                    <Button $size="sm" $variant="danger" style={{ flex: 1 }} onClick={() => remove(a.id)}>Delete</Button>
                  </div>
                </>
              )}
              {a.status === 'scheduled' && (
                <>
                  <div style={{ color: tokens.color.warningText, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Scheduled for</div>
                  <div style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 14, color: tokens.color.primary, marginTop: 4 }}>
                    {a.scheduledFor ? new Date(a.scheduledFor).toLocaleString() : '—'}
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                    <Button $size="sm" style={{ flex: 1 }} onClick={() => sendOne(a.id)} disabled={sending === a.id}>
                      {sending === a.id ? '…' : 'Send now'}
                    </Button>
                    <Button $size="sm" $variant="danger" style={{ flex: 1 }} onClick={() => remove(a.id)}>Delete</Button>
                  </div>
                </>
              )}
            </Side>
          </Row>
        );
      })}
    </>
  );
}
