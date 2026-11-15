'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type Notif = {
  id: string;
  title: string; body: string; tag: string;
  link?: string; icon?: string; bg?: string; fg?: string;
  unread: boolean; createdAt: string;
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} days ago`;
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

const Filters = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $on?: boolean }>`
  padding: 8px 14px;
  border-radius: 9px;
  background: ${(p) => (p.$on ? tokens.color.primary : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : tokens.color.textPrimary)};
  border: 1px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.border)};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
`;

const List = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  overflow: hidden;
`;

const Item = styled.div<{ $unread?: boolean }>`
  padding: 16px 22px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  border-bottom: 1px solid ${tokens.color.surface2};
  background: ${(p) => (p.$unread ? '#fbfaf2' : '#fff')};
  &:last-child {
    border-bottom: none;
  }
`;

const Dot = styled.div<{ $bg: string; $fg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 700;
`;

const Unread = styled.span`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${tokens.color.error};
  flex-shrink: 0;
  margin-top: 6px;
`;

const tabs = ['All', 'Unread', 'Events', 'Tasks', 'Account'];

export default function NotificationsPage() {
  const [tab, setTab] = useState('All');
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const d = await fetch('/api/me/notifications').then((r) => r.json());
    setNotifications(d.notifications ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  const visible = notifications.filter((n) => {
    if (tab === 'All') return true;
    if (tab === 'Unread') return n.unread;
    if (tab === 'Events') return n.tag === 'Event update' || n.tag === 'Invitation';
    if (tab === 'Tasks') return n.tag === 'Task';
    if (tab === 'Account') return n.tag === 'Account' || n.tag === 'Verification';
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  async function markAll() {
    await fetch('/api/me/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-all-read' }),
    });
    await refresh();
  }
  async function markOne(id: string) {
    await fetch('/api/me/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-read', id }),
    });
    await refresh();
  }

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Inbox</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Notifications</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            {unreadCount} unread · updates from your events, tasks, and account
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button $variant="secondary" onClick={markAll} disabled={unreadCount === 0}>Mark all read</Button>
          <Link href="/dashboard/settings">
            <Button>Preferences</Button>
          </Link>
        </div>
      </Head>

      <Filters>
        {tabs.map((t) => (
          <Tab key={t} $on={t === tab} onClick={() => setTab(t)}>
            {t}
            {t === 'Unread' && unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  padding: '1px 7px',
                  borderRadius: 999,
                  background: tab === t ? tokens.color.secondary : tokens.color.errorBg,
                  color: tab === t ? tokens.color.primary : tokens.color.errorText,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {unreadCount}
              </span>
            )}
          </Tab>
        ))}
      </Filters>

      <List>
        {loading && <div style={{ padding: 22, color: tokens.color.textSecondary }}>Loading notifications…</div>}
        {!loading && visible.length === 0 && (
          <div style={{ padding: 22, color: tokens.color.textSecondary }}>Nothing here yet.</div>
        )}
        {visible.map((n) => (
          <Item key={n.id} $unread={n.unread}>
            <Dot $bg={n.bg ?? tokens.color.surface2} $fg={n.fg ?? tokens.color.textSecondary}>
              {n.icon ?? '•'}
            </Dot>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                {n.link ? (
                  <Link href={n.link} onClick={() => n.unread && markOne(n.id)} style={{ fontWeight: 700, fontSize: 14.5 }}>
                    {n.title}
                  </Link>
                ) : (
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{n.title}</span>
                )}
                <span style={{ color: tokens.color.textSecondary, fontSize: 11.5, whiteSpace: 'nowrap' }}>{timeAgo(n.createdAt)}</span>
              </div>
              <div style={{ color: tokens.color.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 1.55 }}>
                {n.body}
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge $tone="neutral">{n.tag}</Badge>
                {n.unread && (
                  <button
                    onClick={() => markOne(n.id)}
                    style={{ background: 'transparent', border: 'none', color: tokens.color.info, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
            {n.unread && <Unread />}
          </Item>
        ))}
      </List>
    </>
  );
}
