'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, Eyebrow } from '@/components/ui/Card';

type Role = 'admin' | 'church_rep' | 'organizer' | 'volunteer' | 'attendee';

type TaskData = {
  id: string; number: number; title: string; department: string;
  status: 'not_started' | 'in_progress' | 'review' | 'done'; due?: string;
  eventSlug?: string;
};

type MeData = {
  user: { firstName: string; lastName: string; email: string; role: Role; churchName: string; verified: boolean };
  stats: { upcomingCount: number; attendedCount: number; groupCount: number; approvedApps: number; pendingApps: number; unreadNotifications: number };
  upcoming: Array<{
    reference: string; partySize: number; mode: string; checkInStatus: string;
    event: { slug: string; title: string; dateLabel: string; start: string; city: string; venue: string; gradient: [string, string]; image?: string; status: string; churches: number; expected: string };
  }>;
};

const PageHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
`;

const H1 = styled.h1`
  font-size: 30px;
  font-weight: 700;
  margin-top: 6px;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 22px;
  }
`;

const VerifiedBanner = styled.div`
  margin-top: 20px;
  background: linear-gradient(135deg, #E6F5EC, #F3FBF6);
  border: 1px solid #BFE4CE;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Check = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: ${tokens.color.success};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
`;

const Stats = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
`;

const Grid = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const EventRow = styled.div`
  display: grid;
  grid-template-columns: 70px 1fr auto auto;
  gap: 14px;
  align-items: center;
  padding: 14px 0;
  border-top: 1px solid ${tokens.color.surface2};
  &:first-child { border-top: none; }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 56px 1fr;
    gap: 10px 12px;
    > :nth-child(3), > :nth-child(4) {
      grid-column: 2;
      justify-self: start;
    }
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

const TaskRow = styled.div`
  padding: 14px;
  border: 1px solid ${tokens.color.border};
  border-radius: 11px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  & + & { margin-top: 10px; }
  &.done { opacity: 0.6; .title { text-decoration: line-through; } }
`;

const AnnounceRow = styled.div`
  padding: 12px 0;
  display: flex;
  gap: 12px;
  border-top: 1px solid ${tokens.color.surface2};
  &:first-of-type { border-top: none; }
`;

const IconDot = styled.div<{ $bg: string; $fg: string }>`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 700;
`;

const RoleHero = styled.div`
  margin-top: 20px;
  background: linear-gradient(135deg, #0b1428, ${tokens.color.primary} 55%, #1b2e55);
  border-radius: 14px;
  padding: 22px 24px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 20px;
  }
`;

const taskTone = (t: TaskData): 'error' | 'warning' | 'neutral' => {
  if (t.status === 'done') return 'neutral';
  if (t.due && new Date(t.due).getTime() < Date.now()) return 'error';
  if (t.status === 'in_progress' || t.status === 'review') return 'warning';
  return 'neutral';
};

const taskLabel = (t: TaskData) => {
  if (t.status === 'done') return 'Done';
  if (t.due && new Date(t.due).getTime() < Date.now()) return 'Overdue';
  if (t.status === 'in_progress') return 'In progress';
  if (t.status === 'review') return 'Review';
  return 'Not started';
};

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  tag?: string;
  link?: string;
  icon?: string;
  bg?: string;
  fg?: string;
  unread: boolean;
  createdAt: string;
};

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  if (Number.isNaN(diffMs)) return '';
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? '' : 's'} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
  return d.toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ROLE_GREETING: Record<Role, { eyebrow: string; sub: string }> = {
  admin:      { eyebrow: 'Admin workspace',    sub: 'Oversee the platform, people and events.' },
  church_rep: { eyebrow: 'Church workspace',   sub: 'Manage your church presence and gatherings.' },
  organizer:  { eyebrow: 'Organizer workspace',sub: 'Run your events: teams, tasks and venues.' },
  volunteer:  { eyebrow: 'Volunteer portal',   sub: 'Apply for roles and see your next assignment.' },
  attendee:   { eyebrow: 'Welcome',            sub: 'Register for upcoming gatherings near you.' },
};

export default function DashboardPage() {
  const [me, setMe] = useState<MeData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then((d) => { if (d?.user) setMe(d); });
    fetch('/api/me/tasks').then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.tasks) setTasks(d.tasks.slice(0, 4));
    });
    fetch('/api/me/notifications')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.notifications) setNotifications(d.notifications.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }, []);

  // Skeleton while profile is still loading — avoids the "Welcome back, friend"
  // flash and the full staff-nav defaulting to show-all before we know the role.
  if (!me) {
    return (
      <>
        <PageHead>
          <div>
            <Eyebrow>Loading…</Eyebrow>
            <H1 style={{ color: 'transparent', background: tokens.color.surface2, borderRadius: 8, maxWidth: 320 }}>Welcome back</H1>
            <div style={{ height: 14, marginTop: 10, borderRadius: 6, background: tokens.color.surface2, maxWidth: 260 }} />
          </div>
        </PageHead>
        <Stats>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ height: 96, background: '#fff', border: `1px solid ${tokens.color.border}`, borderRadius: 14 }} />
          ))}
        </Stats>
      </>
    );
  }

  const name = me.user.firstName || 'friend';
  const church = me.user.churchName || '';
  const verified = me.user.verified;
  const role: Role = me.user.role ?? 'attendee';
  const greeting = ROLE_GREETING[role];

  // Role-specific primary + secondary header actions.
  const headerActions = (() => {
    switch (role) {
      case 'church_rep':
        return (
          <>
            <Link href="/dashboard/churches"><Button $variant="secondary" $size="sm">My churches</Button></Link>
            <Link href="/dashboard/churches/new"><Button $size="sm">+ Add church</Button></Link>
          </>
        );
      case 'organizer':
        return (
          <>
            <Link href="/dashboard/tasks"><Button $variant="secondary" $size="sm">Open tasks</Button></Link>
            <Link href="/dashboard/events/new"><Button $size="sm">+ New event</Button></Link>
          </>
        );
      case 'volunteer':
        return (
          <>
            <Link href="/dashboard/profile"><Button $variant="secondary" $size="sm">Availability</Button></Link>
            <Link href="/dashboard/volunteers"><Button $size="sm">Browse roles →</Button></Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Link href="/dashboard/profile"><Button $variant="secondary" $size="sm">Profile</Button></Link>
            <Link href="/admin"><Button $size="sm">Admin console →</Button></Link>
          </>
        );
      default: // attendee
        return (
          <>
            <Link href="/dashboard/my-events"><Button $variant="secondary" $size="sm">My tickets</Button></Link>
            <Link href="/events"><Button $size="sm">+ Browse events</Button></Link>
          </>
        );
    }
  })();

  // Role-specific stat tiles.
  const statTiles = (() => {
    const upcoming = <StatCard label="Upcoming events" value={String(me?.stats.upcomingCount ?? 0)} foot="On your calendar" />;
    const attended = <StatCard label="Attended" value={String(me?.stats.attendedCount ?? 0)} foot="Confirmed check-ins" />;
    const notifs = <StatCard label="Notifications" value={String(me?.stats.unreadNotifications ?? 0)} foot="Unread" badge={me?.stats.unreadNotifications ? { text: 'New', tone: 'warning' } : undefined} />;
    const vol = <StatCard label="Approved volunteering" value={String(me?.stats.approvedApps ?? 0)} foot={`${me?.stats.pendingApps ?? 0} pending`} />;

    switch (role) {
      case 'church_rep':
        return <>{upcoming}{vol}{attended}{notifs}</>;
      case 'organizer':
        return <>{upcoming}<StatCard label="Open tasks" value={String(tasks.filter((t) => t.status !== 'done').length)} foot="Across your events" />{attended}{notifs}</>;
      case 'volunteer':
        return <>{vol}{upcoming}{attended}{notifs}</>;
      case 'attendee':
        return <>{upcoming}{attended}{notifs}<StatCard label="Followed churches" value={String(me?.stats.groupCount ?? 0)} foot="You follow" /></>;
      default: // admin
        return <>{upcoming}{vol}{attended}{notifs}</>;
    }
  })();

  // Right-side card content per role.
  const sideCard = (() => {
    if (role === 'volunteer') {
      return (
        <Card>
          <CardHeader>
            <h2>Your applications</h2>
            <Link href="/dashboard/volunteers">Open portal →</Link>
          </CardHeader>
          <div style={{ padding: 16, color: tokens.color.textSecondary, fontSize: 13, lineHeight: 1.5 }}>
            Browse open roles and apply from the Volunteer portal. Approved assignments show up here and on your next-shift card.
          </div>
        </Card>
      );
    }
    if (role === 'attendee') {
      return (
        <Card>
          <CardHeader>
            <h2>Churches you follow</h2>
            <Link href="/churches">Discover →</Link>
          </CardHeader>
          <div style={{ padding: 16, color: tokens.color.textSecondary, fontSize: 13, lineHeight: 1.5 }}>
            Follow partner churches to see their events and announcements first.
          </div>
        </Card>
      );
    }
    // church_rep, organizer, admin — show tasks
    return (
      <Card>
        <CardHeader>
          <h2>Open tasks</h2>
          <Link href="/dashboard/tasks">View board →</Link>
        </CardHeader>
        {tasks.length === 0 && (
          <div style={{ padding: 16, color: tokens.color.textSecondary, fontSize: 13 }}>
            No tasks yet. <Link href="/dashboard/tasks" style={{ color: tokens.color.primary, fontWeight: 600 }}>Add one →</Link>
          </div>
        )}
        {tasks.map((t) => (
          <TaskRow key={t.id} className={t.status === 'done' ? 'done' : ''}>
            <input type="checkbox" defaultChecked={t.status === 'done'} style={{ marginTop: 2, width: 18, height: 18, accentColor: tokens.color.primary }} />
            <div style={{ flex: 1 }}>
              <div className="title" style={{ fontWeight: 600, fontSize: 13.5 }}>{t.title}</div>
              <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                {t.department}{t.eventSlug ? ` · ${t.eventSlug}` : ''}
              </div>
            </div>
            <Badge $tone={taskTone(t)}>{taskLabel(t)}</Badge>
          </TaskRow>
        ))}
      </Card>
    );
  })();

  return (
    <>
      <PageHead>
        <div>
          <Eyebrow>{church || greeting.eyebrow}</Eyebrow>
          <H1>Welcome back, {name}</H1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 4 }}>
            {greeting.sub}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{headerActions}</div>
      </PageHead>

      {verified ? (
        <VerifiedBanner>
          <Check>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </Check>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#0E4A2A' }}>Your account is active</div>
            <div style={{ color: '#2F6B4A', fontSize: 13, marginTop: 2 }}>
              {role === 'volunteer' && 'You can apply to any open role and track your shifts here.'}
              {role === 'church_rep' && 'You can register your church and submit gatherings for publication.'}
              {role === 'organizer' && 'You can create events, build tasks and manage your team.'}
              {role === 'attendee' && 'You can register for any open event and follow churches you love.'}
              {role === 'admin' && 'Full admin access — the console is in the sidebar.'}
            </div>
          </div>
        </VerifiedBanner>
      ) : (
        <VerifiedBanner style={{ background: tokens.color.warningSurface, borderColor: tokens.color.warningBorder }}>
          <Check style={{ background: tokens.color.warning }}>⚠</Check>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: tokens.color.warningText }}>Verify your email</div>
            <div style={{ color: tokens.color.warningText, fontSize: 13, marginTop: 2 }}>
              Check your inbox for a verification link. Your account is limited until verified.
            </div>
          </div>
        </VerifiedBanner>
      )}

      <Stats>{statTiles}</Stats>

      <Grid>
        <Card>
          <CardHeader>
            <h2>{role === 'volunteer' ? 'Upcoming shifts' : role === 'organizer' ? 'Events you run' : 'Upcoming events'}</h2>
            <Link href="/dashboard/my-events">See all →</Link>
          </CardHeader>
          {(me?.upcoming ?? []).length === 0 && (
            <div style={{ padding: 16, color: tokens.color.textSecondary, fontSize: 13 }}>
              {role === 'volunteer'
                ? <>No approved assignments yet. <Link href="/dashboard/volunteers" style={{ color: tokens.color.primary, fontWeight: 600 }}>Browse roles →</Link></>
                : role === 'organizer'
                ? <>No events on your calendar yet. <Link href="/dashboard/events/new" style={{ color: tokens.color.primary, fontWeight: 600 }}>Create one →</Link></>
                : <>You haven&apos;t registered for anything yet. <Link href="/events" style={{ color: tokens.color.primary, fontWeight: 600 }}>Browse events →</Link></>}
            </div>
          )}
          {(me?.upcoming ?? []).map((u) => {
            const d = new Date(u.event.start);
            return (
              <EventRow key={u.reference}>
                <DateChip>
                  <div className="m">{d.toLocaleString('en', { month: 'short' })}</div>
                  <div className="d">{d.getDate()}</div>
                </DateChip>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{u.event.title}</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 2 }}>
                    {u.event.city} · {u.partySize} {u.partySize === 1 ? 'attendee' : 'attendees'} · Ref {u.reference}
                  </div>
                </div>
                <Badge $tone={u.checkInStatus === 'in' ? 'success' : 'info'}>
                  {u.checkInStatus === 'in' ? 'Checked in' : 'Confirmed'}
                </Badge>
                <Link href={`/events/${u.event.slug}`} style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 12.5 }}>
                  Open →
                </Link>
              </EventRow>
            );
          })}
        </Card>

        {sideCard}
      </Grid>

      <RoleHero style={{ marginTop: 20 }}>
        <div>
          <Eyebrow style={{ color: tokens.color.secondary }}>Recent announcements</Eyebrow>
          <div style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 19, marginTop: 6 }}>
            {notifications.length} new {notifications.length === 1 ? 'update' : 'updates'} for you
          </div>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 4 }}>
            Stay on top of event changes, approvals and messages.
          </div>
        </div>
        <Link href="/dashboard/notifications">
          <Button $variant="gold" $size="sm">Open inbox →</Button>
        </Link>
      </RoleHero>

      <Card style={{ marginTop: 20 }}>
        <CardHeader>
          <h2>Latest activity</h2>
          <Link href="/dashboard/notifications">All →</Link>
        </CardHeader>
        {notifLoading && (
          <div style={{ color: tokens.color.textSecondary, fontSize: 13 }}>Loading…</div>
        )}
        {!notifLoading && notifications.length === 0 && (
          <div style={{ color: tokens.color.textSecondary, fontSize: 13 }}>
            No announcements yet. Platform updates will appear here.
          </div>
        )}
        {notifications.map((n) => (
          <AnnounceRow key={n.id}>
            <IconDot $bg={n.bg ?? tokens.color.surface2} $fg={n.fg ?? tokens.color.textPrimary}>
              {n.icon ?? '●'}
            </IconDot>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{n.title}</div>
              <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                {n.body ? `${n.body.slice(0, 80)}${n.body.length > 80 ? '…' : ''} · ` : ''}
                {relativeTime(n.createdAt)}
              </div>
            </div>
          </AnnounceRow>
        ))}
      </Card>
    </>
  );
}
