'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';
import { submitJson } from '@/lib/form';

type Msg = { id: string; body: string; mine: boolean; senderName: string; createdAt: string };
type ThreadData = {
  thread: { id: string; title: string; otherName: string; otherEmail?: string; otherInitials: string };
  messages: Msg[];
};
type SideThread = { id: string; title: string; otherName: string; otherInitials: string; lastSnippet: string; lastMessageAt: string; unread: boolean };

const Layout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  overflow: hidden;
  min-height: 680px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Side = styled.aside`
  border-right: 1px solid ${tokens.color.border};
  display: flex;
  flex-direction: column;
  @media (max-width: ${tokens.bp.tablet}) {
    display: none;
  }
`;

const SideHead = styled.div`
  padding: 16px 18px;
  border-bottom: 1px solid ${tokens.color.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ConvLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid ${tokens.color.surface2};
  align-items: flex-start;
  background: ${(p) => (p.$active ? tokens.color.secondarySoft : 'transparent')};
  border-left: 3px solid ${(p) => (p.$active ? tokens.color.secondary : 'transparent')};
  padding-left: ${(p) => (p.$active ? '13px' : '16px')};
  &:hover {
    background: #fbfbfd;
  }
`;

const Avatar = styled.div<{ $bg: string; $fg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 13px;
  flex-shrink: 0;
`;

const BigAvatar = styled(Avatar)`
  width: 48px;
  height: 48px;
  font-size: 16px;
`;

const Thread = styled.div`
  display: flex;
  flex-direction: column;
`;

const ThreadHead = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${tokens.color.border};
  display: flex;
  align-items: center;
  gap: 14px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 12px 14px;
    gap: 10px;
  }
`;

const Messages = styled.div`
  flex: 1;
  padding: 26px 32px;
  background: ${tokens.color.surface};
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 420px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 18px 14px;
  }
`;

const Bubble = styled.div<{ $me?: boolean }>`
  align-self: ${(p) => (p.$me ? 'flex-end' : 'flex-start')};
  max-width: 68%;
  background: ${(p) => (p.$me ? tokens.color.primary : '#fff')};
  color: ${(p) => (p.$me ? '#fff' : tokens.color.textPrimary)};
  border: ${(p) => (p.$me ? 'none' : `1px solid ${tokens.color.border}`)};
  padding: 12px 15px;
  border-radius: ${(p) => (p.$me ? '14px 14px 4px 14px' : '14px 14px 14px 4px')};
  font-size: 14px;
  line-height: 1.55;
  @media (max-width: ${tokens.bp.mobile}) {
    max-width: 85%;
    padding: 10px 13px;
    font-size: 13.5px;
  }
`;

const TimeStamp = styled.div<{ $me?: boolean }>`
  align-self: ${(p) => (p.$me ? 'flex-end' : 'flex-start')};
  font-size: 11px;
  color: ${tokens.color.textSecondary};
  margin-top: -6px;
`;

const Composer = styled.div`
  padding: 14px 24px 18px;
  background: #fff;
  border-top: 1px solid ${tokens.color.border};
  display: flex;
  gap: 10px;
  align-items: center;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 10px 12px 12px;
    gap: 8px;
  }
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

const ToolbarBtn = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${tokens.color.surface};
  border: 1px solid ${tokens.color.border};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export default function MessageThreadPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<ThreadData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [sidebar, setSidebar] = useState<SideThread[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    const [threadRes, listRes] = await Promise.all([
      fetch(`/api/me/messages/${encodeURIComponent(params.id)}`),
      fetch('/api/me/messages'),
    ]);
    if (!threadRes.ok) { setStatus('missing'); return; }
    const d = await threadRes.json();
    setData(d);
    setStatus('ready');
    if (listRes.ok) {
      const l = await listRes.json();
      setSidebar(l.threads ?? []);
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params.id]);

  const [sendError, setSendError] = useState<string | null>(null);

  async function send() {
    setSendError(null);
    if (!draft.trim()) return;
    setSending(true);
    const body = draft;
    setDraft('');
    const res = await submitJson(`/api/me/messages/${encodeURIComponent(params.id)}`, { body });
    setSending(false);
    if (!res.ok) {
      setSendError(res.error);
      setDraft(body); // restore so user can retry
      return;
    }
    refresh();
  }

  if (status === 'loading') return <div style={{ padding: 40, color: tokens.color.textSecondary }}>Loading conversation…</div>;
  if (status === 'missing' || !data) return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Thread not found</h1>
      <Link href="/dashboard/messages" style={{ color: tokens.color.primary, marginTop: 8, display: 'inline-block' }}>Back to inbox</Link>
    </div>
  );

  const thread = {
    id: data.thread.id,
    name: data.thread.otherName,
    subtitle: data.thread.otherEmail ? `Direct message · ${data.thread.otherEmail}` : 'Direct message',
    initials: data.thread.otherInitials,
    bg: tokens.color.primary,
    fg: tokens.color.secondary,
    online: false,
    event: undefined as string | undefined,
    tags: [] as { label: string; tone: 'gold' | 'info' | 'success' | 'neutral' | 'warning' }[],
    messages: data.messages,
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
        <div>
          <Eyebrow>Inbox · {thread.name}</Eyebrow>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>Conversation</h1>
        </div>
        <Link href="/dashboard/messages" style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 13 }}>
          ← All conversations
        </Link>
      </div>

      <Layout>
        <Side>
          <SideHead>
            <div style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 15 }}>Conversations</div>
            <Button $size="sm">+ New</Button>
          </SideHead>
          {sidebar.map((t) => (
            <ConvLink key={t.id} href={`/dashboard/messages/${t.id}`} $active={t.id === thread.id}>
              <Avatar $bg={tokens.color.primary} $fg={tokens.color.secondary}>{t.otherInitials}</Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.otherName}</div>
                  <span style={{ color: tokens.color.textSecondary, fontSize: 11 }}>
                    {new Date(t.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
                <div
                  style={{
                    color: tokens.color.textSecondary,
                    fontSize: 12,
                    marginTop: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.lastSnippet || <em>No messages yet</em>}
                </div>
              </div>
            </ConvLink>
          ))}
        </Side>

        <Thread>
          <ThreadHead>
            <BigAvatar $bg={thread.bg} $fg={thread.fg}>{thread.initials}</BigAvatar>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 17 }}>{thread.name}</div>
                {thread.online ? <Badge $tone="success" $withDot>Online</Badge> : <Badge $tone="neutral">Offline</Badge>}
              </div>
              <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 2 }}>{thread.subtitle}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {thread.tags.map((t) => (
                  <Badge key={t.label} $tone={t.tone}>{t.label}</Badge>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <ToolbarBtn aria-label="Call">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tokens.color.textSecondary} strokeWidth="1.8">
                  <path d="M22 16.9v3a2 2 0 01-2.2 2 19.9 19.9 0 01-8.6-3.1 19.6 19.6 0 01-6-6A19.9 19.9 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7l.7 3a2 2 0 01-.6 2L7.8 10a16 16 0 006 6l1.3-1.3a2 2 0 012-.5l3 .7A2 2 0 0122 16.9z" />
                </svg>
              </ToolbarBtn>
              <ToolbarBtn aria-label="More">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tokens.color.textSecondary} strokeWidth="2">
                  <circle cx="5" cy="12" r="1.5" fill={tokens.color.textSecondary} />
                  <circle cx="12" cy="12" r="1.5" fill={tokens.color.textSecondary} />
                  <circle cx="19" cy="12" r="1.5" fill={tokens.color.textSecondary} />
                </svg>
              </ToolbarBtn>
            </div>
          </ThreadHead>

          <Messages>
            {thread.messages.length === 0 && (
              <div style={{ alignSelf: 'center', color: tokens.color.textSecondary, fontSize: 13 }}>
                No messages yet. Write the first one below.
              </div>
            )}
            {thread.messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.mine ? 'flex-end' : 'flex-start' }}>
                <Bubble $me={m.mine}>{m.body}</Bubble>
                <TimeStamp $me={m.mine}>
                  {new Date(m.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                </TimeStamp>
              </div>
            ))}
            <div ref={bottomRef} />
          </Messages>

          {sendError && (
            <div style={{ padding: '8px 14px', background: tokens.color.errorSurface, borderTop: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, fontSize: 13 }}>
              {sendError}
            </div>
          )}
          <Composer>
            <ToolbarBtn aria-label="Attach">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tokens.color.textSecondary} strokeWidth="1.8">
                <path d="M21 10l-9 9a5 5 0 01-7-7l9-9a3 3 0 014 4l-9 9a1 1 0 01-1.4-1.4L15 7" />
              </svg>
            </ToolbarBtn>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder={`Message ${thread.name}…`}
            />
            <Button onClick={send} disabled={sending || !draft.trim()}>{sending ? 'Sending…' : 'Send'}</Button>
          </Composer>
        </Thread>
      </Layout>
    </>
  );
}
