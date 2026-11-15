'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Eyebrow } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';

const HeroBg = styled.section`
  position: relative;
  padding-bottom: 80px;
  color: #fff;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(11, 20, 40, 0.86) 0%, rgba(11, 20, 40, 0.74) 100%),
      url('/images/13.jpg') center / cover no-repeat;
    z-index: -1;
  }
  > ${Container} { padding-top: 80px; }
  @media (max-width: ${tokens.bp.mobile}) {
    padding-bottom: 44px;
    > ${Container} { padding-top: 32px; }
  }
`;

const H1 = styled.h1`
  font-family: ${tokens.font.display};
  color: #fff;
  font-size: 68px;
  font-weight: 800;
  line-height: 1.02;
  margin-top: 18px;
  max-width: 820px;
  @media (max-width: ${tokens.bp.tablet}) {
    font-size: 48px;
  }
`;

const Lead = styled.p`
  color: rgba(255, 255, 255, 0.84);
  font-size: 18px;
  line-height: 1.55;
  margin-top: 22px;
  max-width: 680px;
  @media (max-width: ${tokens.bp.tablet}) {
    font-size: 16px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 14px;
  }
`;

const StoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const Img = styled.div<{ $img: string }>`
  height: 440px;
  background: url(${(p) => p.$img}) center / cover no-repeat;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(11, 20, 40, 0.18);
  @media (max-width: ${tokens.bp.mobile}) {
    height: 260px;
    border-radius: 14px;
  }
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 36px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Value = styled.div`
  padding: 26px 24px;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 16px;
  h3 {
    font-size: 18px;
    font-weight: 700;
    margin-top: 10px;
  }
  p {
    font-size: 14px;
    line-height: 1.65;
    color: ${tokens.color.textSecondary};
    margin-top: 10px;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 40px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Stat = styled.div`
  padding: 24px 20px;
  background: ${tokens.color.primary};
  color: #fff;
  border-radius: 14px;
  text-align: center;
  .n {
    font-family: ${tokens.font.display};
    font-size: 36px;
    font-weight: 800;
    color: ${tokens.color.secondary};
  }
  .l {
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 6px;
    color: rgba(255, 255, 255, 0.78);
  }
`;

const FinalCTA = styled.section`
  position: relative;
  padding: 100px 0;
  color: #fff;
  text-align: center;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(11, 20, 40, 0.8), rgba(11, 20, 40, 0.92)),
      url('/images/16.jpg') center / cover no-repeat;
    z-index: -1;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 56px 0;
  }
`;

const values = [
  {
    t: 'Unity across borders',
    d: 'Congregations of every size and tradition stand together — denominational walls lower around a shared gospel and a shared city.',
  },
  {
    t: 'Service, not spectacle',
    d: 'Every gathering exists to serve the people who come and the city around the stadium — hospitality before production.',
  },
  {
    t: 'Transparent operations',
    d: 'Shared dashboards for churches, volunteers, and organisers. No hidden lists. No parallel tracks.',
  },
];

export default function AboutPage() {
  return (
    <>
      <HeroBg>
        <PublicNav dark />
        <Container>
          <Eyebrow>About</Eyebrow>
          <H1>A platform for the gathered Church.</H1>
          <Lead>
            Church at the Stadiums is an international collaboration platform for congregations organising and
            participating in large, cross-denominational stadium gatherings. One shared workspace for venues,
            volunteers, logistics, and hospitality — so every local church can stand with every other.
          </Lead>
        </Container>
      </HeroBg>

      <Section>
        <Container>
          <StoryGrid>
            <Img $img="/images/5.jpg" />
            <div>
              <Eyebrow>Our story</Eyebrow>
              <h2 style={{ fontFamily: tokens.font.display, fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 12 }}>
                Built for nights too big for any one church to carry alone.
              </h2>
              <p style={{ color: tokens.color.textSecondary, fontSize: 16, lineHeight: 1.75, marginTop: 16 }}>
                Stadium-size gatherings used to be the privilege of a handful of ministries. We built Church at the
                Stadiums so that any local church — a congregation of fifty or five thousand — can take a real part in
                filling a 70,000-seat venue with worship, hospitality, and after-care that looks and feels like home.
              </p>
              <p style={{ color: tokens.color.textSecondary, fontSize: 16, lineHeight: 1.75, marginTop: 14 }}>
                The platform coordinates the operational weight — venues, volunteers, registrations, communications —
                so pastors and teams can focus on the people they serve.
              </p>
            </div>
          </StoryGrid>
        </Container>
      </Section>

      <Section $surface>
        <Container>
          <div style={{ maxWidth: 680 }}>
            <Eyebrow>What we value</Eyebrow>
            <h2 style={{ fontFamily: tokens.font.display, fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 10 }}>
              Three convictions we keep on the table.
            </h2>
          </div>
          <ValuesGrid>
            {values.map((v) => (
              <Value key={v.t}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: tokens.color.secondarySoft,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tokens.color.secondary,
                    fontWeight: 800,
                  }}
                >
                  ✦
                </div>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </Value>
            ))}
          </ValuesGrid>
        </Container>
      </Section>

      <Section>
        <Container>
          <StoryGrid>
            <div>
              <Eyebrow>By the numbers</Eyebrow>
              <h2 style={{ fontFamily: tokens.font.display, fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 10 }}>
                A growing network, measured honestly.
              </h2>
              <p style={{ color: tokens.color.textSecondary, fontSize: 15.5, lineHeight: 1.75, marginTop: 14 }}>
                The counts below are the live state of the platform — the churches that have joined, the countries they
                are in, and the events that are open for registration today. We'd rather publish the real number than
                round it.
              </p>
              <StatsRow>
                <Stat>
                  <div className="n">100+</div>
                  <div className="l">Churches</div>
                </Stat>
                <Stat>
                  <div className="n">20+</div>
                  <div className="l">Countries</div>
                </Stat>
                <Stat>
                  <div className="n">8</div>
                  <div className="l">Signature venues</div>
                </Stat>
                <Stat>
                  <div className="n">10%</div>
                  <div className="l">Reserved free</div>
                </Stat>
              </StatsRow>
            </div>
            <Img $img="/images/9.jpg" />
          </StoryGrid>
        </Container>
      </Section>

      <Section $surface>
        <Container>
          <StoryGrid>
            <Img $img="/images/11.jpg" />
            <div>
              <Eyebrow>Who we serve</Eyebrow>
              <h2 style={{ fontFamily: tokens.font.display, fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 10 }}>
                Congregations, volunteers, and the families who come through the gate.
              </h2>
              <ul
                style={{
                  paddingLeft: 20,
                  marginTop: 14,
                  color: tokens.color.textSecondary,
                  lineHeight: 1.85,
                  fontSize: 15,
                }}
              >
                <li>
                  <b style={{ color: tokens.color.textPrimary }}>Churches</b> — one profile, many events. Verified once,
                  invited everywhere.
                </li>
                <li>
                  <b style={{ color: tokens.color.textPrimary }}>Volunteers</b> — one application, assigned by role,
                  briefed by the event.
                </li>
                <li>
                  <b style={{ color: tokens.color.textPrimary }}>Attendees</b> — including the 10% of every event
                  reserved — free — for low-income families.
                </li>
                <li>
                  <b style={{ color: tokens.color.textPrimary }}>Event organisers</b> — a shared cockpit for venues,
                  partners, tasks, and communications.
                </li>
              </ul>
            </div>
          </StoryGrid>
        </Container>
      </Section>

      <FinalCTA>
        <Container>
          <Eyebrow>Gather with us</Eyebrow>
          <h2
            style={{
              fontFamily: tokens.font.display,
              color: '#fff',
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.05,
              marginTop: 12,
              maxWidth: 720,
              margin: '12px auto 0',
            }}
          >
            Every congregation has a seat at the table.
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.82)',
              fontSize: 16.5,
              lineHeight: 1.65,
              marginTop: 18,
              maxWidth: 600,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Apply for your church, browse upcoming events, or talk to the team about a gathering in your city.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/register">
              <Button $variant="gold">Apply to join →</Button>
            </Link>
            <Link href="/events">
              <Button
                as="span"
                style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}
              >
                See upcoming events
              </Button>
            </Link>
          </div>
        </Container>
      </FinalCTA>

      <PublicFooter />
    </>
  );
}
