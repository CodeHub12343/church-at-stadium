'use client';

import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from './PublicNav';
import { PublicFooter } from './PublicFooter';
import { Container } from '../ui/Container';
import { Eyebrow } from '../ui/Card';

const HeroBg = styled.section`
  padding: 80px 0 48px;
  background: linear-gradient(180deg, ${tokens.color.surface}, #fff);
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 48px 0 32px;
  }
`;

const H1 = styled.h1`
  font-size: 48px;
  font-weight: 800;
  line-height: 1.05;
  margin-top: 14px;
  max-width: 820px;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 34px;
  }
`;

const Body = styled.div`
  padding: 48px 0 96px;
  max-width: 820px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 24px 0 56px;
  }
  p {
    font-size: 17px;
    line-height: 1.75;
    color: ${tokens.color.textSecondary};
    margin: 0 0 18px;
  }
  h2 {
    font-size: 26px;
    margin: 42px 0 14px;
    font-weight: 700;
  }
  h3 {
    font-size: 18px;
    margin: 28px 0 10px;
    font-weight: 700;
  }
  ul {
    margin: 0 0 18px 22px;
    padding: 0;
  }
  li {
    color: ${tokens.color.textSecondary};
    font-size: 16px;
    line-height: 1.75;
  }
`;

export function StaticPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNav />
      <HeroBg>
        <Container>
          <Eyebrow>{eyebrow}</Eyebrow>
          <H1>{title}</H1>
        </Container>
      </HeroBg>
      <Container>
        <Body>{children}</Body>
      </Container>
      <PublicFooter />
    </>
  );
}
