'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Eyebrow } from '../ui/Card';

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Side = styled.aside`
  background: linear-gradient(180deg, ${tokens.color.primaryDeep} 0%, ${tokens.color.primary} 100%);
  padding: 36px 28px;
  color: #fff;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media (max-width: ${tokens.bp.mobile}) {
    display: none;
  }
`;

const Form = styled.div`
  padding: 48px 52px;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 32px 20px;
  }
`;

export function AuthShell({
  eyebrow,
  headline,
  blurb,
  topLink,
  children,
}: {
  eyebrow: string;
  headline: string;
  blurb: string;
  topLink?: { label: string; href: string; prefix?: string };
  children: React.ReactNode;
}) {
  return (
    <Page>
      <Side>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(198,164,91,0.14)',
              border: '1px solid rgba(198,164,91,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V10l8-6 8 6v10h-5v-6H9v6H4z" stroke={tokens.color.secondary} strokeWidth="1.8" />
            </svg>
          </div>
          <span style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 14 }}>CATS</span>
        </Link>
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginTop: 12 }}>{headline}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5, lineHeight: 1.6, marginTop: 14 }}>{blurb}</p>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11.5, lineHeight: 1.5 }}>
          © 2026 Church at the Stadiums
          <br />
          ChurchAtTheStadiums.com
        </div>
      </Side>
      <Form>
        {topLink && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', color: tokens.color.textSecondary, fontSize: 13 }}>
            {topLink.prefix || ''}{' '}
            <Link href={topLink.href} style={{ fontWeight: 600, marginLeft: 6, color: tokens.color.info }}>
              {topLink.label}
            </Link>
          </div>
        )}
        {children}
      </Form>
    </Page>
  );
}
