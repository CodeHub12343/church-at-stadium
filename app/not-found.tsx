'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

const Hero = styled.section`
  background: linear-gradient(180deg, ${tokens.color.surface}, #fff);
  padding: 100px 0 80px;
  min-height: 60vh;
  display: flex;
  align-items: center;
`;

const Inner = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  .big {
    font-family: ${tokens.font.display};
    font-weight: 800;
    font-size: 96px;
    color: ${tokens.color.primary};
    line-height: 1;
    letter-spacing: -0.03em;
  }
`;

export default function NotFound() {
  return (
    <>
      <PublicNav />
      <Hero>
        <Container>
          <Inner>
            <Eyebrow>404 · page not found</Eyebrow>
            <div className="big">404</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 14 }}>
              That gathering has already ended
            </h1>
            <p style={{ color: tokens.color.textSecondary, fontSize: 16, lineHeight: 1.65, marginTop: 10 }}>
              The page you're looking for isn't on the platform. Try the upcoming events list, or head back to the home
              page.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/events"><Button>Upcoming events →</Button></Link>
              <Link href="/"><Button $variant="secondary">Back to home</Button></Link>
            </div>
          </Inner>
        </Container>
      </Hero>
      <PublicFooter />
    </>
  );
}
