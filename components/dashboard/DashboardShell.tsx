'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled, { css } from 'styled-components';
import { tokens } from '@/lib/tokens';
import { VerifiedBanner } from './VerifiedBanner';

type Role = 'admin' | 'church_rep' | 'organizer' | 'volunteer' | 'attendee';

const ALL_ROLES: Role[] = ['admin', 'church_rep', 'organizer', 'volunteer', 'attendee'];

const navItems: { href: string; label: string; icon: string; roles: Role[] }[] = [
  { href: '/dashboard', label: 'Overview', icon: 'grid', roles: ALL_ROLES },
  { href: '/dashboard/churches', label: 'My Churches', icon: 'home', roles: ['church_rep', 'admin'] },
  { href: '/dashboard/events', label: 'Available Events', icon: 'calendar', roles: ['church_rep', 'volunteer', 'attendee', 'organizer', 'admin'] },
  { href: '/dashboard/my-events', label: 'My Events', icon: 'star', roles: ALL_ROLES },
  { href: '/dashboard/community-tickets', label: 'Community Tickets', icon: 'star', roles: ALL_ROLES },
  { href: '/dashboard/calendar', label: 'Calendar', icon: 'calendar', roles: ['church_rep', 'organizer', 'volunteer', 'admin'] },
  { href: '/dashboard/volunteers', label: 'Volunteer Portal', icon: 'people', roles: ['volunteer', 'admin'] },
  { href: '/dashboard/organizer/volunteers', label: 'Volunteer Applications', icon: 'people', roles: ['organizer', 'admin'] },
  { href: '/dashboard/tasks', label: 'Tasks', icon: 'check', roles: ['church_rep', 'organizer', 'admin'] },
  { href: '/dashboard/resources', label: 'Resources', icon: 'doc', roles: ['church_rep', 'organizer', 'volunteer', 'admin'] },
  { href: '/dashboard/messages', label: 'Messages', icon: 'mail', roles: ['church_rep', 'organizer', 'volunteer', 'admin'] },
  { href: '/dashboard/documents', label: 'Documents', icon: 'doc', roles: ['church_rep', 'organizer', 'admin'] },
  { href: '/dashboard/notifications', label: 'Notifications', icon: 'mail', roles: ALL_ROLES },
];

const Layout = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: ${tokens.color.surface};
`;

const Side = styled.aside<{ $open?: boolean }>`
  width: 248px;
  background: ${tokens.color.primaryDeep};
  color: rgba(255, 255, 255, 0.78);
  padding: 22px 14px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
  position: sticky;
  top: 0;
  z-index: 40;

  @media (max-width: ${tokens.bp.tablet}) {
    position: fixed;
    inset: 0 auto 0 0;
    width: 280px;
    transform: translateX(${(p) => (p.$open ? '0' : '-100%')});
    transition: transform 0.25s ease;
    box-shadow: ${(p) => (p.$open ? '0 20px 50px rgba(0,0,0,0.3)' : 'none')};
  }
`;

const Scrim = styled.div<{ $on: boolean }>`
  display: none;
  @media (max-width: ${tokens.bp.tablet}) {
    display: ${(p) => (p.$on ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(11, 20, 40, 0.5);
    z-index: 35;
    animation: fade 0.2s ease;
  }
  @keyframes fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const BrandMark = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(198, 164, 91, 0.14);
  border: 1px solid rgba(198, 164, 91, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BrandName = styled.div`
  font-family: ${tokens.font.display};
  font-weight: 800;
  color: #fff;
  font-size: 13.5px;
  line-height: 1.2;
`;

const BrandSub = styled.div`
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.04em;
`;

const Group = styled.div`
  padding: 16px 10px 8px;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 9px;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 2px;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: rgba(198, 164, 91, 0.1);
    color: ${tokens.color.secondary};
  }

  ${(p) =>
    p.$active &&
    css`
      background: linear-gradient(90deg, rgba(198, 164, 91, 0.18), transparent);
      color: ${tokens.color.secondary};
      font-weight: 600;
    `}
`;

const UserCard = styled.div`
  margin-top: auto;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${tokens.color.secondary};
  color: ${tokens.color.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: ${tokens.font.display};
  flex-shrink: 0;
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
`;

const Topbar = styled.header`
  height: 64px;
  background: #fff;
  border-bottom: 1px solid ${tokens.color.border};
  display: flex;
  justify-content: center;
  @media (max-width: ${tokens.bp.mobile}) {
    height: 56px;
  }
`;

const TopbarInner = styled.div`
  flex: 1;
  max-width: 1280px;
  display: flex;
  align-items: center;
  padding: 0 40px;
  gap: 16px;
  min-width: 0;
  @media (max-width: ${tokens.bp.tablet}) {
    padding: 0 24px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 0 12px;
    gap: 10px;
  }
`;

const Burger = styled.button`
  display: none;
  @media (max-width: ${tokens.bp.tablet}) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 9px;
    background: ${tokens.color.surface};
    border: 1px solid ${tokens.color.border};
    cursor: pointer;
    flex-shrink: 0;
  }
`;

const Crumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${tokens.color.textSecondary};
  font-size: 13px;
  min-width: 0;
  overflow: hidden;
  b {
    color: ${tokens.color.primary};
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 12.5px;
  }
`;

const Search = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${tokens.color.surface};
  border: 1px solid ${tokens.color.border};
  border-radius: 9px;
  padding: 7px 12px;
  width: 320px;
  @media (max-width: ${tokens.bp.tablet}) {
    display: none;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 13.5px;
`;

const RightCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  @media (max-width: ${tokens.bp.tablet}) {
    margin-left: auto;
  }
`;

const IconBtn = styled.button`
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: ${tokens.color.surface};
  border: 1px solid ${tokens.color.border};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Dot = styled.span`
  position: absolute;
  top: 8px;
  right: 9px;
  width: 7px;
  height: 7px;
  background: ${tokens.color.error};
  border-radius: 50%;
  border: 1.5px solid ${tokens.color.surface};
`;

const TopAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${tokens.color.primary};
  color: ${tokens.color.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: ${tokens.font.display};
  font-size: 13px;
  flex-shrink: 0;
`;

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const ContentInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 40px 60px;
  @media (max-width: ${tokens.bp.tablet}) {
    padding: 24px 24px 48px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 18px 14px 40px;
  }
`;

function Icon({ name }: { name: string }) {
  const iconMap: Record<string, JSX.Element> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    home: <path d="M4 20V10l8-6 8 6v10h-5v-6H9v6H4z" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 3v4M16 3v4" />
      </>
    ),
    star: <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />,
    people: (
      <>
        <path d="M17 20h5v-2a3 3 0 00-5.4-1.8M7 20H2v-2a3 3 0 015.4-1.8M12 14a4 4 0 100-8 4 4 0 000 8z" />
      </>
    ),
    check: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 11l3 3 5-6" />
      </>
    ),
    mail: <path d="M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l2-2h14l2 2" />,
    doc: (
      <>
        <path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
        <path d="M14 2v6h6" />
      </>
    ),
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {iconMap[name]}
    </svg>
  );
}

type MeProfile = {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  role: string;
  churchName: string;
};

function initialsFor(p: MeProfile | null): string {
  if (!p) return '…';
  const first = (p.firstName || p.displayName || '').trim();
  const last = (p.lastName || '').trim();
  const a = first[0] ?? '';
  const b = last[0] ?? (first[1] ?? '');
  return (a + b).toUpperCase() || '·';
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  church_rep: 'Church rep',
  organizer: 'Organizer',
  volunteer: 'Volunteer',
  attendee: 'Attendee',
};

function displayNameFor(p: MeProfile | null): string {
  if (!p) return 'Loading…';
  return p.displayName?.trim() || `${p.firstName} ${p.lastName}`.trim() || p.email;
}

function subtitleFor(p: MeProfile | null): string {
  if (!p) return '';
  const role = ROLE_LABEL[p.role] ?? p.role;
  const church = p.churchName?.trim();
  return church ? `${church} · ${role}` : role;
}

export function DashboardShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<MeProfile | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/me/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.profile) return;
        setMe(d.profile as MeProfile);
      })
      .catch(() => {
        /* silent — card shows neutral placeholder on failure */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <Scrim $on={open} onClick={() => setOpen(false)} aria-hidden />
      <Side $open={open}>
        <Brand>
          <BrandMark>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V10l8-6 8 6v10h-5v-6H9v6H4z" stroke={tokens.color.secondary} strokeWidth="1.8" />
            </svg>
          </BrandMark>
          <div>
            <BrandName>CATS</BrandName>
            <BrandSub>Church portal</BrandSub>
          </div>
        </Brand>

        <Group>Workspace</Group>
        {me ? (
          <>
            {navItems
              .filter((it) => it.roles.includes(me.role as Role))
              .map((it) => (
                <NavLink
                  key={it.href}
                  href={it.href}
                  $active={pathname === it.href || (it.href !== '/dashboard' && pathname?.startsWith(it.href))}
                >
                  <Icon name={it.icon} />
                  {it.label}
                </NavLink>
              ))}
          </>
        ) : (
          // Skeleton while profile loads — prevents showing every nav item to every role.
          [0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                margin: '6px 12px',
                height: 32,
                borderRadius: 9,
                background: 'rgba(255,255,255,0.05)',
              }}
            />
          ))
        )}

        <Group>Account</Group>
        <NavLink href="/dashboard/profile" $active={pathname === '/dashboard/profile'}>
          <Icon name="people" /> Profile
        </NavLink>
        <NavLink href="/dashboard/settings" $active={pathname === '/dashboard/settings'}>
          <Icon name="doc" /> Settings
        </NavLink>

        <UserCard>
          <Avatar>{initialsFor(me)}</Avatar>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayNameFor(me)}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {subtitleFor(me)}
            </div>
          </div>
        </UserCard>
      </Side>

      <Main>
        <Topbar>
          <TopbarInner>
            <Burger onClick={() => setOpen(true)} aria-label="Open menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tokens.color.textPrimary} strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Burger>
            <Crumbs>
              <Link href="/dashboard">Dashboard</Link>
              {title && (
                <>
                  <span>/</span>
                  <b>{title}</b>
                </>
              )}
            </Crumbs>
            <Search>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke={tokens.color.textSecondary} strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke={tokens.color.textSecondary} strokeWidth="2" />
              </svg>
              <SearchInput placeholder="Search events, people, resources…" />
            </Search>
            <RightCluster>
              <IconBtn aria-label="Notifications">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"
                    stroke={tokens.color.textSecondary}
                    strokeWidth="1.8"
                  />
                </svg>
                <Dot />
              </IconBtn>
              <TopAvatar>{initialsFor(me)}</TopAvatar>
            </RightCluster>
          </TopbarInner>
        </Topbar>
        <VerifiedBanner />
        <Content>
          <ContentInner>{children}</ContentInner>
        </Content>
      </Main>
    </Layout>
  );
}
