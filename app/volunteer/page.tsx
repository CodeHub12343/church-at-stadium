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
    background: linear-gradient(135deg, rgba(11, 20, 40, 0.84) 0%, rgba(11, 20, 40, 0.72) 100%),
      url('/images/8.jpg') center / cover no-repeat;
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

const HeroCtas = styled.div`
  margin-top: 28px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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

const RolesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 36px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const RoleCard = styled.div<{ $img: string }>`
  position: relative;
  min-height: 300px;
  border-radius: 18px;
  overflow: hidden;
  color: #fff;
  background: url(${(p) => p.$img}) center / cover no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 22px;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(11, 20, 40, 0.1), rgba(11, 20, 40, 0.88));
  }
  & > * {
    position: relative;
    z-index: 1;
  }
  h3 {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
    margin-top: 10px;
  }
  .meta {
    color: rgba(255, 255, 255, 0.78);
    font-size: 13px;
    margin-top: 6px;
    line-height: 1.55;
  }
  .cap {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 5px 11px;
    background: rgba(198, 164, 91, 0.18);
    border: 1px solid rgba(198, 164, 91, 0.4);
    color: ${tokens.color.secondary};
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    border-radius: 999px;
    align-self: flex-start;
  }
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-top: 36px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Step = styled.div`
  padding: 24px 22px;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  .n {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${tokens.color.primary};
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 13px;
  }
  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-top: 12px;
  }
  p {
    font-size: 13.5px;
    line-height: 1.6;
    color: ${tokens.color.textSecondary};
    margin-top: 8px;
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
    background: linear-gradient(180deg, rgba(11, 20, 40, 0.78), rgba(11, 20, 40, 0.92)),
      url('/images/21.jpg') center / cover no-repeat;
    z-index: -1;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 56px 0;
  }
`;

const roles = [
  {
    img: '/images/10.jpg',
    tag: 'Hospitality',
    name: 'Welcome & guest services',
    meta: 'Greet attendees, direct arrivals, help families settle in — the first face people see at the gate.',
  },
  {
    img: '/images/12.jpg',
    tag: 'Operations',
    name: 'Stewards & crowd flow',
    meta: 'Section stewards, aisle guides, accessibility support, and safe-route stewards inside the venue.',
  },
  {
    img: '/images/7.jpg',
    tag: 'Prayer & care',
    name: 'Prayer teams & after-care',
    meta: 'Stand with attendees who respond during the night. Pray with them, listen, and connect them to a local church.',
  },
];

export default function VolunteerPage() {
  return (
    <>
      <HeroBg>
        <PublicNav dark />
        <Container>
          <Eyebrow>Volunteer</Eyebrow>
          <H1>Serve at a night the city won't forget.</H1>
          <Lead>
            Volunteering with Church at the Stadiums happens through specific events. Each open gathering publishes its
            own roles — hospitality, stewarding, prayer, logistics. Pick an event, pick a role, and apply through the
            event's team.
          </Lead>
          <HeroCtas>
            <Link href="/events">
              <Button $variant="gold">Browse open events →</Button>
            </Link>
            <Link href="/dashboard/volunteers">
              <Button
                as="span"
                style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}
              >
                My applications
              </Button>
            </Link>
          </HeroCtas>
        </Container>
      </HeroBg>

      <Section>
        <Container>
          <StoryGrid>
            <Img $img="/images/6.jpg" />
            <div>
              <Eyebrow>Why volunteer</Eyebrow>
              <h2 style={{ fontFamily: tokens.font.display, fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 12 }}>
                Every seat, every prayer, every welcome — someone makes it happen.
              </h2>
              <p style={{ color: tokens.color.textSecondary, fontSize: 16, lineHeight: 1.75, marginTop: 16 }}>
                A stadium gathering runs on hundreds of ordinary people quietly carrying one small piece of the night.
                Volunteers are how we keep the gate warm, the aisles safe, the prayer team present, and the hospitality
                real — not just for the first thousand through the door, but for the last.
              </p>
              <p style={{ color: tokens.color.textSecondary, fontSize: 16, lineHeight: 1.75, marginTop: 14 }}>
                You don't need stage experience. You need a willing yes, availability on the day, and a team that will
                brief you properly before you serve.
              </p>
            </div>
          </StoryGrid>
        </Container>
      </Section>

      <Section $surface>
        <Container>
          <div style={{ maxWidth: 680 }}>
            <Eyebrow>Roles you can apply for</Eyebrow>
            <h2 style={{ fontFamily: tokens.font.display, fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 10 }}>
              Three families of roles, many hands.
            </h2>
            <p style={{ color: tokens.color.textSecondary, fontSize: 15.5, lineHeight: 1.65, marginTop: 12 }}>
              Specific openings differ by event — each organiser publishes their own role list, counts, and schedule.
            </p>
          </div>
          <RolesGrid>
            {roles.map((r) => (
              <RoleCard key={r.name} $img={r.img}>
                <span className="cap">{r.tag}</span>
                <h3>{r.name}</h3>
                <div className="meta">{r.meta}</div>
              </RoleCard>
            ))}
          </RolesGrid>
        </Container>
      </Section>

      <Section>
        <Container>
          <div style={{ maxWidth: 680 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 style={{ fontFamily: tokens.font.display, fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 10 }}>
              Four steps from apply to serve.
            </h2>
          </div>
          <StepsGrid>
            <Step>
              <div className="n">1</div>
              <h3>Pick an event</h3>
              <p>Open the events page and choose a gathering you can attend in person.</p>
            </Step>
            <Step>
              <div className="n">2</div>
              <h3>Apply for a role</h3>
              <p>Tell the organising team your availability, experience, and a short note about yourself.</p>
            </Step>
            <Step>
              <div className="n">3</div>
              <h3>Get briefed</h3>
              <p>A supervisor reviews your application, confirms your slot, and shares the briefing pack.</p>
            </Step>
            <Step>
              <div className="n">4</div>
              <h3>Report & serve</h3>
              <p>On the day, report to the gate at the time on your briefing. The rest is in good hands.</p>
            </Step>
          </StepsGrid>
        </Container>
      </Section>

      <Section $surface>
        <Container>
          <StoryGrid>
            <div>
              <Eyebrow>Already applied?</Eyebrow>
              <h2 style={{ fontFamily: tokens.font.display, fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 10 }}>
                Track every application in one place.
              </h2>
              <p style={{ color: tokens.color.textSecondary, fontSize: 15.5, lineHeight: 1.75, marginTop: 14 }}>
                Your dashboard shows every volunteer application you've submitted, its status, and the next step the
                event team is expecting from you.
              </p>
              <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/dashboard/volunteers">
                  <Button>My volunteer applications</Button>
                </Link>
                <Link href="/register">
                  <Button $variant="secondary">Create an account</Button>
                </Link>
              </div>
            </div>
            <Img $img="/images/18.jpg" />
          </StoryGrid>
        </Container>
      </Section>

      <FinalCTA>
        <Container>
          <Eyebrow>Serve with us</Eyebrow>
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
            One yes. One role. One unforgettable night.
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
            Browse what's open, choose where you want to serve, and apply in minutes.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/events">
              <Button $variant="gold">Find an event →</Button>
            </Link>
            <Link href="/mission">
              <Button
                as="span"
                style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}
              >
                Read the mission
              </Button>
            </Link>
          </div>
        </Container>
      </FinalCTA>

      <PublicFooter />
    </>
  );
}
