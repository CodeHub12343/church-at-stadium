'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled, { css } from 'styled-components';
import { tokens } from '@/lib/tokens';

const items = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/churches', label: 'Churches', badge: '1,204' },
  { href: '/admin/churches?tab=review', label: 'Church Applications', badge: '18', badgeTone: 'warning' as const },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/events/review', label: 'Event Approvals', badge: '6', badgeTone: 'warning' as const },
  { href: '/admin/venues', label: 'Venues' },
  { href: '/admin/registrations', label: 'Registrations' },
  { href: '/admin/volunteers', label: 'Volunteers' },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/audit-logs', label: 'Audit Logs' },
  { href: '/admin/settings', label: 'Settings' },
];

const Layout = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: ${tokens.color.surfaceAdmin};
`;

const Side = styled.aside<{ $open?: boolean }>`
  width: 260px;
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
  background: ${tokens.color.secondary};
  color: ${tokens.color.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 12px;
  flex-shrink: 0;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
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

const Badge = styled.span<{ $tone?: 'warning' | 'neutral' }>`
  margin-left: auto;
  background: ${(p) => (p.$tone === 'warning' ? tokens.color.warning : 'rgba(255,255,255,0.12)')};
  color: ${(p) => (p.$tone === 'warning' ? tokens.color.primary : '#fff')};
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
`;

const Topbar = styled.header`
  height: 56px;
  background: ${tokens.color.primaryDeep};
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 12px;
  font-size: 13.5px;
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
    width: 38px;
    height: 38px;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    flex-shrink: 0;
  }
`;

const Crumbs = styled.div`
  margin-left: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 0;
  overflow: hidden;
  b {
    color: ${tokens.color.secondary};
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    margin-left: 0;
    font-size: 12.5px;
  }
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

const BrandLabel = styled.span`
  margin-left: 8px;
  font-family: ${tokens.font.display};
  font-weight: 700;
  color: #fff;
  @media (max-width: ${tokens.bp.mobile}) {
    display: none;
  }
`;

export function AdminShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <Layout>
      <Scrim $on={open} onClick={() => setOpen(false)} aria-hidden />
      <Side $open={open}>
        <Brand>
          <BrandMark>A</BrandMark>
          <div>
            <div style={{ fontFamily: tokens.font.display, fontWeight: 800, color: '#fff', fontSize: 13.5 }}>
              Admin Console
            </div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)' }}>Super Administrator</div>
          </div>
        </Brand>
        {items.map((it) => (
          <NavLink key={it.href} href={it.href.split('?')[0]} $active={pathname === it.href.split('?')[0]}>
            {it.label}
            {it.badge && <Badge $tone={it.badgeTone}>{it.badge}</Badge>}
          </NavLink>
        ))}
      </Side>

      <Main>
        <Topbar>
          <Burger onClick={() => setOpen(true)} aria-label="Open menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Burger>
          <BrandMark style={{ width: 26, height: 26, fontSize: 11 }}>A</BrandMark>
          <BrandLabel>Admin Console</BrandLabel>
          <Crumbs>
            <Link href="/admin">Admin</Link>
            {title && (
              <>
                <span>/</span>
                <b>{title}</b>
              </>
            )}
          </Crumbs>
        </Topbar>
        <Content>
          <ContentInner>{children}</ContentInner>
        </Content>
      </Main>
    </Layout>
  );
}
