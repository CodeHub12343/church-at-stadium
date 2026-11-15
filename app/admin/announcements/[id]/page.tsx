'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type AnnouncementApi = {
  id: string;
  title: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sent';
  audience: 'all' | 'church_reps' | 'volunteers' | 'organizers' | 'attendees';
  eventSlug?: string;
  scheduledFor?: string;
  sentAt?: string;
  recipientCount: number;
  createdAt: string;
  updatedAt: string;
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 18px;
  align-items: flex-start;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 22px 24px;
  h3 {
    font-family: ${tokens.font.display};
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    margin-bottom: 12px;
  }
`;

const DL = styled.dl`
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 12px 20px;
  margin: 0;
  dt {
    font-size: 11.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    font-weight: 700;
    align-self: center;
  }
  dd {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
`;

const AUDIENCE_LABEL: Record<AnnouncementApi['audience'], string> = {
  all: 'All users',
  church_reps: 'Church reps',
  volunteers: 'Volunteers',
  organizers: 'Organizers',
  attendees: 'Attendees',
};

const STATUS_LABEL: Record<AnnouncementApi['status'], string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sent: 'Sent',
};

const statusTone = (s: AnnouncementApi['status']): BadgeTone =>
  s === 'sent' ? 'success' : s === 'scheduled' ? 'info' : 'neutral';

function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function AdminAnnouncementDetailPage({ params }: { params: { id: string } }) {
  const [a, setA] = useState<AnnouncementApi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/announcements/${params.id}`)
      .then(async (r) => {
        if (r.status === 404) {
          setError('Announcement not found');
          return null;
        }
        if (r.status === 403) {
          setError('Admin access required');
          return null;
        }
        if (!r.ok) {
          setError('Failed to load announcement');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.announcement) setA(d.announcement as AnnouncementApi);
      })
      .catch(() => setError('Failed to load announcement'));
  }, [params.id]);

  async function sendNow() {
    if (!a) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/announcements/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send' }),
      });
      if (res.ok) {
        const refreshed = await fetch(`/api/admin/announcements/${a.id}`).then((r) => r.json());
        if (refreshed?.announcement) setA(refreshed.announcement as AnnouncementApi);
      }
    } finally {
      setSending(false);
    }
  }

  if (error) {
    return (
      <>
        <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
          <Link href="/admin/announcements">← Back to announcements</Link>
        </div>
        <Panel>
          <h3>Unavailable</h3>
          <p style={{ fontSize: 14, color: tokens.color.textSecondary }}>{error}</p>
        </Panel>
      </>
    );
  }

  if (!a) {
    return (
      <>
        <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
          <Link href="/admin/announcements">← Back to announcements</Link>
        </div>
        <Panel>
          <h3>Loading…</h3>
          <p style={{ fontSize: 14, color: tokens.color.textSecondary }}>
            Fetching announcement details.
          </p>
        </Panel>
      </>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
        <Link href="/admin/announcements">← Back to announcements</Link>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          marginBottom: 22,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Eyebrow>Announcement</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{a.title}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Badge $tone={statusTone(a.status)}>{STATUS_LABEL[a.status]}</Badge>
            <Badge $tone="neutral">{AUDIENCE_LABEL[a.audience]}</Badge>
            {a.eventSlug && <Badge $tone="info">Event: {a.eventSlug}</Badge>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {a.status !== 'sent' && (
            <Button onClick={sendNow} disabled={sending}>
              {sending ? 'Sending…' : 'Send now'}
            </Button>
          )}
        </div>
      </div>

      <Grid>
        <Panel>
          <h3>Message</h3>
          <div style={{ fontSize: 14.5, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: tokens.color.textPrimary }}>
            {a.body}
          </div>
        </Panel>

        <Panel>
          <h3>Details</h3>
          <DL>
            <dt>Status</dt>
            <dd>{STATUS_LABEL[a.status]}</dd>
            <dt>Audience</dt>
            <dd>{AUDIENCE_LABEL[a.audience]}</dd>
            <dt>Event</dt>
            <dd>{a.eventSlug ?? '—'}</dd>
            <dt>Created</dt>
            <dd>{formatDateTime(a.createdAt)}</dd>
            <dt>Scheduled for</dt>
            <dd>{formatDateTime(a.scheduledFor)}</dd>
            <dt>Sent at</dt>
            <dd>{formatDateTime(a.sentAt)}</dd>
            <dt>Recipients</dt>
            <dd>{a.recipientCount.toLocaleString()}</dd>
          </DL>
        </Panel>
      </Grid>
    </>
  );
}
