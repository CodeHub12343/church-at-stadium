'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';
import { submitJson, isValidEmail } from '@/lib/form';

type Thread = {
  id: string; title: string; otherName: string; otherInitials: string;
  lastMessageAt: string; lastSnippet: string; unread: boolean;
};

function timeShort(iso: string) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  if (sameDay) return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString();
}

const Layout = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  overflow: hidden;
  min-height: 640px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const List = styled.aside`
  border-right: 1px solid ${tokens.color.border};
  display: flex;
  flex-direction: column;
  @media (max-width: ${tokens.bp.tablet}) {
    border-right: none;
  }
`;

const ThreadWrap = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: ${tokens.bp.tablet}) {
    display: none;
  }
`;

const ListHead = styled.div`
  padding: 18px 18px 12px;
  border-bottom: 1px solid ${tokens.color.border};
`;

const Conv = styled.div<{ $active?: boolean }>`
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid ${tokens.color.surface2};
  cursor: pointer;
  align-items: flex-start;
  background: ${(p) => (p.$active ? tokens.color.secondarySoft : 'transparent')};
  border-left: 3px solid ${(p) => (p.$active ? tokens.color.secondary : 'transparent')};
  padding-left: ${(p) => (p.$active ? '13px' : '16px')};
  &:hover { background: #FBFBFD; }
`;

const Avatar = styled.div<{ $bg: string; $fg?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg ?? '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 13px;
  flex-shrink: 0;
`;

const Thread = ThreadWrap;

const ThreadHead = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${tokens.color.border};
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Messages = styled.div`
  flex: 1;
  padding: 22px 32px;
  background: ${tokens.color.surface};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Bubble = styled.div<{ $me?: boolean }>`
  align-self: ${(p) => (p.$me ? 'flex-end' : 'flex-start')};
  max-width: 70%;
  background: ${(p) => (p.$me ? tokens.color.primary : '#fff')};
  color: ${(p) => (p.$me ? '#fff' : tokens.color.textPrimary)};
  border: ${(p) => (p.$me ? 'none' : `1px solid ${tokens.color.border}`)};
  padding: 12px 15px;
  border-radius: ${(p) =>
    p.$me ? '14px 14px 4px 14px' : '14px 14px 14px 4px'};
  font-size: 13.5px;
  line-height: 1.55;
`;

const Composer = styled.div`
  padding: 14px 24px 18px;
  background: #fff;
  border-top: 1px solid ${tokens.color.border};
  display: flex;
  gap: 10px;
  align-items: center;
  input {
    flex: 1;
    border: 1px solid ${tokens.color.border};
    background: ${tokens.color.surface};
    border-radius: 12px;
    padding: 12px 16px;
    font-family: inherit;
    font-size: 14px;
    outline: none;
  }
`;

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newBody, setNewBody] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh() {
    const d = await fetch('/api/me/messages').then((r) => r.json());
    setThreads(d.threads ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function create() {
    setNotice(null);
    if (!isValidEmail(newRecipient)) { setNotice('Enter a valid recipient email.'); return; }
    setCreating(true);
    const res = await submitJson('/api/me/messages', {
      recipientEmail: newRecipient.trim(),
      body: newBody.trim(),
    });
    setCreating(false);
    if (!res.ok) { setNotice(res.error); return; }
    setShowNew(false);
    setNewRecipient('');
    setNewBody('');
    refresh();
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Eyebrow>Inbox</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>Messages</h1>
      </div>

      <Layout>
        <List>
          <ListHead>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 18 }}>
                Conversations
              </div>
              <Button $size="sm" onClick={() => setShowNew((v) => !v)}>+ New</Button>
            </div>
            {showNew && (
              <div style={{ marginTop: 12, padding: 12, background: tokens.color.surface, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="Recipient email"
                  style={{ padding: '8px 10px', border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontSize: 13 }}
                />
                <input
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Message (optional)"
                  style={{ padding: '8px 10px', border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontSize: 13 }}
                />
                <Button $size="sm" onClick={create} disabled={creating || !newRecipient.trim()}>
                  {creating ? 'Starting…' : 'Start conversation'}
                </Button>
                {notice && <div style={{ color: tokens.color.errorText, fontSize: 12 }}>{notice}</div>}
              </div>
            )}
            <div
              style={{
                marginTop: 12,
                display: 'flex',
                gap: 8,
                background: tokens.color.surface,
                border: `1px solid ${tokens.color.border}`,
                borderRadius: 10,
                padding: '8px 12px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke={tokens.color.textSecondary} strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke={tokens.color.textSecondary} strokeWidth="2" />
              </svg>
              <input
                placeholder="Search people, churches, events…"
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13 }}
              />
            </div>
          </ListHead>

          {loading && <div style={{ padding: 20, color: tokens.color.textSecondary, fontSize: 13 }}>Loading…</div>}
          {!loading && threads.length === 0 && (
            <div style={{ padding: 24, color: tokens.color.textSecondary, fontSize: 13, textAlign: 'center' }}>
              No conversations yet.<br />Click <strong>+ New</strong> to start one.
            </div>
          )}
          {threads.map((t) => (
            <Conv as={Link} key={t.id} href={`/dashboard/messages/${t.id}`}>
              <Avatar $bg={tokens.color.primary} $fg={tokens.color.secondary}>{t.otherInitials}</Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.otherName}</div>
                  <span style={{ color: tokens.color.textSecondary, fontSize: 11 }}>{timeShort(t.lastMessageAt)}</span>
                </div>
                <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.lastSnippet || <em>No messages yet</em>}
                </div>
                {t.unread && <div style={{ marginTop: 6, color: tokens.color.error, fontWeight: 800, fontSize: 11 }}>● New</div>}
              </div>
            </Conv>
          ))}
        </List>

        <Thread>
          <Messages>
            <div style={{ color: tokens.color.textSecondary, fontSize: 14, textAlign: 'center' }}>
              Select a conversation to open it.
            </div>
          </Messages>
        </Thread>
      </Layout>
    </>
  );
}
