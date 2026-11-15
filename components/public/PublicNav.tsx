'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { Logo } from './Logo';

const Bar = styled.nav<{ $dark?: boolean }>`
  position: relative;
  z-index: 10;
  width: 100%;
  background: ${(p) => (p.$dark ? 'transparent' : '#fff')};
  border-bottom: ${(p) => (p.$dark ? 'none' : `1px solid ${tokens.color.border}`)};
`;

const Inner = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 20px;
  gap: 24px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding-top: 14px;
    padding-bottom: 14px;
    gap: 10px;
  }
`;

const Links = styled.div<{ $dark?: boolean }>`
  display: flex;
  gap: 28px;
  font-size: 14px;
  font-weight: 500;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.8)' : tokens.color.textSecondary)};
  @media (max-width: ${tokens.bp.tablet}) {
    display: none;
  }
  a {
    transition: color 0.15s;
    &:hover {
      color: ${(p) => (p.$dark ? tokens.color.secondary : tokens.color.primary)};
    }
  }
`;

const Active = css`
  color: ${tokens.color.primary};
  font-weight: 700;
  border-bottom: 2px solid ${tokens.color.secondary};
  padding-bottom: 4px;
`;

const NavLink = styled(Link)<{ $active?: boolean; $dark?: boolean }>`
  ${(p) =>
    p.$active &&
    (p.$dark
      ? css`
          color: ${tokens.color.secondary};
          font-weight: 600;
        `
      : Active)}
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  @media (max-width: ${tokens.bp.mobile}) {
    gap: 8px;
  }
`;

const SignIn = styled(Link)<{ $dark?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.85)' : tokens.color.textPrimary)};
  @media (max-width: ${tokens.bp.tablet}) {
    display: none;
  }
`;

const JoinLabel = styled.span`
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 12.5px;
  }
`;

const DesktopCta = styled.span`
  @media (max-width: ${tokens.bp.tablet}) {
    display: none;
  }
`;

const Burger = styled.button<{ $dark?: boolean; $open?: boolean }>`
  display: none;
  @media (max-width: ${tokens.bp.tablet}) {
    display: inline-flex;
  }
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  background: ${(p) =>
    p.$open
      ? p.$dark
        ? 'rgba(255,255,255,0.12)'
        : tokens.color.surface
      : 'transparent'};
  border: 1px solid
    ${(p) =>
      p.$dark ? 'rgba(255,255,255,0.22)' : tokens.color.border};
  border-radius: 10px;
  color: ${(p) => (p.$dark ? '#fff' : tokens.color.textPrimary)};
  cursor: pointer;
  padding: 0;
  transition: background 0.15s;
  &:hover {
    background: ${(p) => (p.$dark ? 'rgba(255,255,255,0.08)' : tokens.color.surface)};
  }
`;

const Scrim = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 26, 0.45);
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? 'auto' : 'none')};
  transition: opacity 0.2s ease;
  z-index: 50;
  @media (min-width: calc(${tokens.bp.tablet} + 1px)) {
    display: none;
  }
`;

const Drawer = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  width: min(360px, 88vw);
  background: #fff;
  z-index: 60;
  transform: translateX(${(p) => (p.$open ? '0' : '100%')});
  transition: transform 0.25s ease;
  display: flex;
  flex-direction: column;
  box-shadow: -18px 0 40px rgba(10, 14, 26, 0.18);
  @media (min-width: calc(${tokens.bp.tablet} + 1px)) {
    display: none;
  }
`;

const DrawerHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${tokens.color.border};
`;

const CloseBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid ${tokens.color.border};
  background: transparent;
  color: ${tokens.color.textPrimary};
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  &:hover {
    background: ${tokens.color.surface};
  }
`;

const DrawerLinks = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  gap: 2px;
  flex: 1;
  overflow-y: auto;
`;

const DrawerLink = styled(Link)<{ $active?: boolean }>`
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 15.5px;
  font-weight: ${(p) => (p.$active ? 700 : 500)};
  color: ${(p) => (p.$active ? tokens.color.primary : tokens.color.textPrimary)};
  background: ${(p) => (p.$active ? tokens.color.secondarySoft : 'transparent')};
  border-left: 3px solid ${(p) => (p.$active ? tokens.color.secondary : 'transparent')};
  &:hover {
    background: ${tokens.color.surface};
  }
`;

const DrawerFoot = styled.div`
  padding: 16px 18px 22px;
  border-top: 1px solid ${tokens.color.border};
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const items = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/churches', label: 'Churches' },
  { href: '/volunteer', label: 'Volunteer' },
  { href: '/partners', label: 'Partners' },
  { href: '/help', label: 'Help' },
  { href: '/about', label: 'About' },
];

export function PublicNav({ dark }: { dark?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && !!pathname?.startsWith(href));

  return (
    <>
      <Bar $dark={dark}>
        <Inner>
          <Link href="/" aria-label="Church at the Stadiums home">
            <Logo dark={dark} />
          </Link>
          <Links $dark={dark}>
            {items.map((it) => (
              <NavLink
                key={it.href}
                href={it.href}
                $active={isActive(it.href)}
                $dark={dark}
              >
                {it.label}
              </NavLink>
            ))}
          </Links>
          <Actions>
            <SignIn href="/login" $dark={dark}>
              Sign In
            </SignIn>
            <DesktopCta>
              <Link href="/register">
                <Button $variant="gold" $size="sm">
                  <JoinLabel>Join Our Network</JoinLabel>
                </Button>
              </Link>
            </DesktopCta>
            <Burger
              type="button"
              $dark={dark}
              $open={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="public-mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </Burger>
          </Actions>
        </Inner>
      </Bar>

      <Scrim $open={open} onClick={() => setOpen(false)} aria-hidden={!open} />
      <Drawer
        id="public-mobile-nav"
        $open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <DrawerHead>
          <Logo />
          <CloseBtn type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
            ×
          </CloseBtn>
        </DrawerHead>
        <DrawerLinks>
          {items.map((it) => (
            <DrawerLink key={it.href} href={it.href} $active={isActive(it.href)}>
              {it.label}
            </DrawerLink>
          ))}
        </DrawerLinks>
        <DrawerFoot>
          <Link href="/login">
            <Button $variant="secondary" $block>Sign In</Button>
          </Link>
          <Link href="/register">
            <Button $variant="gold" $block>Join Our Network</Button>
          </Link>
        </DrawerFoot>
      </Drawer>
    </>
  );
}
