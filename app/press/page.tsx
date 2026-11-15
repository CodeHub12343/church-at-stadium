'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';

const Page = styled.div`
  min-height: 100vh;
  background: #fff;
`;

const Hero = styled.section`
  padding: 110px 40px 60px;
  max-width: 980px;
  margin: 0 auto;
  text-align: center;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 80px 20px 40px;
  }
`;

const Eye = styled.div`
  color: ${tokens.color.secondary};
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const H1 = styled.h1`
  font-family: ${tokens.font.display};
  font-size: 68px;
  font-weight: 800;
  line-height: 1.02;
  margin-top: 18px;
  letter-spacing: -0.02em;
  @media (max-width: ${tokens.bp.tablet}) {
    font-size: 48px;
  }
`;

const Lead = styled.p`
  font-size: 17px;
  line-height: 1.65;
  color: ${tokens.color.textSecondary};
  max-width: 720px;
  margin: 20px auto 0;
`;

const Section = styled.section`
  max-width: 820px;
  margin: 0 auto;
  padding: 24px 40px 80px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 20px 20px 60px;
  }
`;

const Panel = styled.div`
  background: ${tokens.color.surface};
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 24px 26px;
  margin-top: 16px;
  h3 {
    font-family: ${tokens.font.display};
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    margin-bottom: 10px;
  }
  p {
    font-size: 14.5px;
    line-height: 1.7;
    color: ${tokens.color.textPrimary};
  }
`;

export default function PressPage() {
  return (
    <Page>
      <Hero>
        <Eye>Press</Eye>
        <H1>Press &amp; media</H1>
        <Lead>
          News, announcements and resources for journalists covering Church at the Stadiums.
        </Lead>
      </Hero>

      <Section>
        <Panel>
          <h3>Press releases</h3>
          <p>
            There are no press releases to share yet. When CATS publishes official announcements,
            they will appear here, each dated and attributable to a named spokesperson.
          </p>
        </Panel>

        <Panel>
          <h3>Press inquiries</h3>
          <p>
            For media requests, interviews or event accreditation, please get in touch through the
            contact options on the help page. A press kit with logos, imagery and fact sheets will
            be added here once prepared.
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/help"><Button>Contact &amp; help</Button></Link>
            <Link href="/about"><Button $variant="secondary">About CATS</Button></Link>
          </div>
        </Panel>
      </Section>
    </Page>
  );
}
