'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';
import { submitJson } from '@/lib/form';

type T = {
  id: string; number: number; title: string; department: string; eventSlug?: string;
  status: 'not_started' | 'in_progress' | 'review' | 'done'; due?: string;
};

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div`
  background: ${tokens.color.surface2};
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 300px;
`;

const ColHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  div.l {
    display: flex;
    gap: 8px;
    align-items: center;
    font-family: ${tokens.font.display};
    font-weight: 700;
    font-size: 13.5px;
    color: ${tokens.color.primary};
  }
  span.c {
    padding: 2px 7px;
    border-radius: 999px;
    background: #fff;
    color: ${tokens.color.textSecondary};
    font-size: 11px;
    font-weight: 700;
  }
  span.dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }
`;

const Task = styled.div<{ $tone?: 'overdue' | 'high' | 'done' }>`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-left: 3px solid
    ${(p) =>
      p.$tone === 'overdue'
        ? tokens.color.error
        : p.$tone === 'high'
        ? tokens.color.warning
        : tokens.color.border};
  border-radius: 11px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: ${tokens.shadow.sm};
  cursor: grab;
  ${(p) => p.$tone === 'done' && 'opacity: 0.6;'}
`;

const columns = [
  { key: 'not_started' as T['status'], label: 'Not started', dot: tokens.color.textMuted },
  { key: 'in_progress' as T['status'], label: 'In progress', dot: tokens.color.info },
  { key: 'review' as T['status'], label: 'Awaiting review', dot: tokens.color.secondary },
  { key: 'done' as T['status'], label: 'Completed', dot: tokens.color.success },
] as { key: T['status']; label: string; dot: string }[];

function renderTone(t: T): 'overdue' | 'high' | 'done' | undefined {
  if (t.status === 'done') return 'done';
  if (t.due && new Date(t.due).getTime() < Date.now()) return 'overdue';
  return undefined;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<T[]>([]);
  const [stats, setStats] = useState({ open: 0, overdue: 0, completed: 0 });
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  async function refresh() {
    const d = await fetch('/api/me/tasks').then((r) => r.json());
    setTasks(d.tasks ?? []);
    setStats(d.stats ?? { open: 0, overdue: 0, completed: 0 });
  }
  useEffect(() => { refresh(); }, []);

  const [createError, setCreateError] = useState<string | null>(null);

  async function createTask() {
    setCreateError(null);
    if (!newTitle.trim()) { setCreateError('Add a title.'); return; }
    setCreating(true);
    const res = await submitJson('/api/me/tasks', { title: newTitle.trim(), department: 'General', status: 'not_started' });
    setCreating(false);
    if (!res.ok) { setCreateError(res.error); return; }
    setNewTitle('');
    refresh();
  }

  async function advance(t: T) {
    const order: T['status'][] = ['not_started', 'in_progress', 'review', 'done'];
    const next = order[Math.min(order.length - 1, order.indexOf(t.status) + 1)];
    await submitJson(`/api/me/tasks/${t.id}`, { status: next }, { method: 'PATCH' });
    refresh();
  }

  return (
    <>
      <Head>
        <div>
          <Eyebrow>My tasks</Eyebrow>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>Task board</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            {stats.open} open · {stats.overdue} overdue · {stats.completed} completed
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New task title"
            style={{ padding: '8px 12px', border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontFamily: 'inherit', fontSize: 13, minWidth: 220 }}
            onKeyDown={(e) => { if (e.key === 'Enter') createTask(); }}
          />
          <Button $size="sm" onClick={createTask} disabled={creating || !newTitle.trim()}>+ Add</Button>
        </div>
      </Head>
      {createError && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, borderRadius: 10, fontSize: 13 }}>
          {createError}
        </div>
      )}

      <Board>
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <Col key={col.key}>
              <ColHead>
                <div className="l">
                  <span className="dot" style={{ background: col.dot }} />
                  {col.label}
                </div>
                <span className="c">{colTasks.length}</span>
              </ColHead>
              {colTasks.map((t) => (
                <Link key={t.id} href={`/dashboard/tasks/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Task $tone={renderTone(t)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Badge $tone="gold">{t.department}</Badge>
                      <span style={{ color: tokens.color.textSecondary, fontSize: 11 }}>#{t.number}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</div>
                    {t.due && (
                      <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>
                        Due {new Date(t.due).toLocaleDateString()}
                      </div>
                    )}
                    {col.key !== 'done' && (
                      <Button $variant="ghost" $size="sm" onClick={(e) => { e.preventDefault(); advance(t); }}>
                        Move →
                      </Button>
                    )}
                  </Task>
                </Link>
              ))}
              {colTasks.length === 0 && (
                <div style={{ color: tokens.color.textSecondary, fontSize: 12, padding: 8 }}>
                  No tasks here
                </div>
              )}
            </Col>
          );
        })}
      </Board>
    </>
  );
}
