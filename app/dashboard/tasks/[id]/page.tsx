'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type TaskStatus = 'not_started' | 'in_progress' | 'review' | 'done';

type TaskApi = {
  id: string;
  number: number;
  title: string;
  department: string;
  eventSlug?: string;
  status: TaskStatus;
  due?: string;
  completedAt?: string;
  description?: string;
  createdAt: string;
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
  grid-template-columns: 150px 1fr;
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

const STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  review: 'In review',
  done: 'Done',
};

const STATUS_ORDER: TaskStatus[] = ['not_started', 'in_progress', 'review', 'done'];

function statusTone(t: TaskApi): BadgeTone {
  if (t.status === 'done') return 'success';
  if (t.due && new Date(t.due).getTime() < Date.now()) return 'error';
  if (t.status === 'in_progress' || t.status === 'review') return 'warning';
  return 'neutral';
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<TaskApi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/me/tasks/${params.id}`)
      .then(async (r) => {
        if (r.status === 404) {
          setError('Task not found');
          return null;
        }
        if (r.status === 401) {
          setError('Sign in to view this task');
          return null;
        }
        if (!r.ok) {
          setError('Failed to load task');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.task) setTask(d.task as TaskApi);
      })
      .catch(() => setError('Failed to load task'));
  }, [params.id]);

  async function setStatus(next: TaskStatus) {
    if (!task || saving || task.status === next) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/me/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        const refreshed = await fetch(`/api/me/tasks/${task.id}`).then((r) => r.json());
        if (refreshed?.task) setTask(refreshed.task as TaskApi);
      }
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <>
        <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
          <Link href="/dashboard/tasks">← Back to tasks</Link>
        </div>
        <Panel>
          <h3>Unavailable</h3>
          <p style={{ fontSize: 14, color: tokens.color.textSecondary }}>{error}</p>
        </Panel>
      </>
    );
  }

  if (!task) {
    return (
      <>
        <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
          <Link href="/dashboard/tasks">← Back to tasks</Link>
        </div>
        <Panel>
          <h3>Loading…</h3>
          <p style={{ fontSize: 14, color: tokens.color.textSecondary }}>Fetching task details.</p>
        </Panel>
      </>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
        <Link href="/dashboard/tasks">← Back to tasks</Link>
      </div>

      <div style={{ marginBottom: 22 }}>
        <Eyebrow>
          {task.department} {task.eventSlug ? `· ${task.eventSlug}` : ''}
        </Eyebrow>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>#{task.number} · {task.title}</h1>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <Badge $tone={statusTone(task)}>{STATUS_LABEL[task.status]}</Badge>
          {task.due && <Badge $tone="neutral">Due {formatDate(task.due)}</Badge>}
        </div>
      </div>

      <Grid>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Panel>
            <h3>Description</h3>
            {task.description ? (
              <div style={{ fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: tokens.color.textPrimary }}>
                {task.description}
              </div>
            ) : (
              <p style={{ fontSize: 13.5, color: tokens.color.textSecondary }}>
                No description was added to this task.
              </p>
            )}
          </Panel>

          <Panel>
            <h3>Update status</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STATUS_ORDER.map((s) => (
                <Button
                  key={s}
                  $size="sm"
                  $variant={s === task.status ? 'primary' : 'secondary'}
                  onClick={() => setStatus(s)}
                  disabled={saving}
                >
                  {STATUS_LABEL[s]}
                </Button>
              ))}
            </div>
          </Panel>
        </div>

        <Panel>
          <h3>Details</h3>
          <DL>
            <dt>Status</dt>
            <dd>{STATUS_LABEL[task.status]}</dd>
            <dt>Department</dt>
            <dd>{task.department}</dd>
            <dt>Event</dt>
            <dd>{task.eventSlug ?? '—'}</dd>
            <dt>Due</dt>
            <dd>{formatDate(task.due)}</dd>
            <dt>Completed</dt>
            <dd>{formatDate(task.completedAt)}</dd>
            <dt>Created</dt>
            <dd>{formatDate(task.createdAt)}</dd>
          </DL>
        </Panel>
      </Grid>
    </>
  );
}
