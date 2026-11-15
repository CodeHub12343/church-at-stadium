'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Container } from '../ui/Container';

const Foot = styled.footer`
  background: ${tokens.color.primaryDeep};
  color: rgba(255, 255, 255, 0.72);
  padding: 60px 0 32px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.6fr repeat(4, 1fr);
  gap: 40px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13.5px;
  a {
    transition: color 0.15s;
  }
  a:hover {
    color: ${tokens.color.secondary};
  }
`;

const Heading = styled.div`
  color: ${tokens.color.secondary};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 15px;
`;

const BrandBlurb = styled.p`
  font-size: 13.5px;
  line-height: 1.6;
  max-width: 320px;
  margin: 0;
`;

const Bottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 40px;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.5);
  @media (max-width: ${tokens.bp.mobile}) {
    flex-direction: column;
    gap: 8px;
  }
`;

export function PublicFooter() {
  return (
    <Foot>
      <Container>
        <Grid>
          <Col>
            <Brand>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(198,164,91,0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 20V10l8-6 8 6v10h-5v-6H9v6H4z" stroke={tokens.color.secondary} strokeWidth="1.8" />
                </svg>
              </div>
              Church at the Stadiums
            </Brand>
            <BrandBlurb>
              An international collaboration platform for churches organizing and participating in large-scale Christian
              gatherings.
            </BrandBlurb>
          </Col>
          <Col>
            <Heading>Platform</Heading>
            <Link href="/events">Events</Link>
            <Link href="/churches">Churches</Link>
            <Link href="/volunteer">Volunteer</Link>
            <Link href="/partners">Partners</Link>
          </Col>
          <Col>
            <Heading>About</Heading>
            <Link href="/mission">Our Mission</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/community-access">Community Access · 10% Free</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </Col>
          <Col>
            <Heading>Legal</Heading>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <Link href="/cookies">Cookies</Link>
          </Col>
          <Col>
            <Heading>Coming soon</Heading>
            <span style={{ opacity: 0.55 }}>Meeting Global Needs</span>
            <span style={{ opacity: 0.55 }}>Partying at the Stadiums</span>
          </Col>
        </Grid>
        <Bottom>
          <span>© 2026 Church at the Stadiums. ChurchAtTheStadiums.com</span>
          <span>Built for the gathered Church.</span>
        </Bottom>
      </Container>
    </Foot>
  );
}
