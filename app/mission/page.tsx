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
      url('/images/17.jpg') center / cover no-repeat;
    z-index: -1;
  }
  > ${Container} { padding-top: 80px; }
  @media (max-width: ${tokens.bp.mobile}) {
    padding-bottom: 44px;
    > ${Container} { padding-top: 32px; }
  }
`;

const H1 = styled.h1`
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

const PullQuote = styled.blockquote`
  margin: 0;
  padding: 36px 32px;
  background: linear-gradient(135deg, #faf6ec, #fff);
  border: 1px solid ${tokens.color.border};
  border-left: 4px solid ${tokens.color.secondary};
  border-radius: 0 16px 16px 0;
  font-family: ${tokens.font.display};
  font-weight: 600;
  font-size: 24px;
  line-height: 1.35;
  color: ${tokens.color.primary};
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 24px 22px;
    font-size: 18px;
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

const VenuesGrid = styled.div`
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

const VenueCard = styled.div<{ $img: string }>`
  position: relative;
  min-height: 320px;
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
    font-size: 22px;
    font-weight: 700;
    margin-top: 10px;
  }
  .meta {
    color: rgba(255, 255, 255, 0.78);
    font-size: 13px;
    margin-top: 6px;
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

const PillarsGrid = styled.div`
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

const Pillar = styled.div`
  padding: 24px 22px;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  h3 {
    font-size: 17px;
    font-weight: 700;
    margin-top: 8px;
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
      url('/images/15.jpg') center / cover no-repeat;
    z-index: -1;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 56px 0;
  }
`;

const venues = [
  { img: '/images/14.jpg', name: 'Wembley Stadium', city: 'London, UK', capacity: '90,000', tag: 'Flagship' },
  { img: '/images/19.jpg', name: 'Mercedes-Benz Stadium', city: 'Atlanta, USA', capacity: '71,000', tag: 'Americas hub' },
  { img: '/images/15.jpg', name: 'Lucas Oil Stadium', city: 'Indianapolis, USA', capacity: '67,000', tag: 'Americas' },
];

const pillars = [
  { t: 'Visible unity', d: 'The gathered Church, made visible â€” louder, together, than any one of us alone.' },
  { t: 'Local first', d: 'Every event is carried by local churches. We just connect the hands.' },
  { t: 'Shared logistics', d: 'One shared workspace for venues, volunteers, tasks, and communications.' },
  { t: 'For the city', d: 'Each gathering serves the city around it â€” not just the people inside the stadium.' },
];

export default function MissionPage() {
  return (
    <>
      <HeroBg>
        <PublicNav dark />
        <Container>
          <Eyebrow>Our mission</Eyebrow>
          <H1>The work of the gathered Church, made visible.</H1>
          <Lead>
            We connect ministries across borders to coordinate what no single congregation could carry alone: shared
            worship in the world&apos;s great venues, logistics across thousands of volunteers, and hospitality for
            everyone who comes.
          </Lead>
        </Container>
      </HeroBg>

      <Section>
        <Container>
          <StoryGrid>
            <Img $img="/images/4.jpg" />
            <div>
              <Eyebrow>Mission statement</Eyebrow>
              <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 12 }}>
                Operational connective tissue for the gathered Church.
              </h2>
              <p style={{ color: tokens.color.textSecondary, fontSize: 16, lineHeight: 1.75, marginTop: 16 }}>
                To make it possible for congregations of any size, anywhere, to stand together in stadium venues â€” without
                any one of them having to carry the whole weight.
              </p>
              <PullQuote style={{ marginTop: 22 }}>
                &ldquo;A visible, international Church that gathers often, serves locally, and coordinates globally â€” using
                its shared voice to magnify worship and to open doors for the gospel.&rdquo;
              </PullQuote>
            </div>
          </StoryGrid>
        </Container>
      </Section>

      <Section $surface>
        <Container>
          <div style={{ maxWidth: 680 }}>
            <Eyebrow>Signature venues</Eyebrow>
            <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 10 }}>
              Stadiums built for 60,000 â€” carrying a gospel bigger than any of them.
            </h2>
            <p style={{ color: tokens.color.textSecondary, fontSize: 15.5, lineHeight: 1.65, marginTop: 12 }}>
              A growing list of signature venues standing with the movement.
            </p>
          </div>
          <VenuesGrid>
            {venues.map((v) => (
              <VenueCard key={v.name} $img={v.img}>
                <span className="cap">{v.tag}</span>
                <h3>{v.name}</h3>
                <div className="meta">
                  {v.city} Â· {v.capacity} capacity
                </div>
              </VenueCard>
            ))}
          </VenuesGrid>
        </Container>
      </Section>

      <Section>
        <Container>
          <div style={{ maxWidth: 680 }}>
            <Eyebrow>Why we exist</Eyebrow>
            <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 10 }}>
              Four convictions that shape every gathering.
            </h2>
          </div>
          <PillarsGrid>
            {pillars.map((p) => (
              <Pillar key={p.t}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: tokens.color.secondarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.color.secondary, fontWeight: 800 }}>
                  âœ¦
                </div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </Pillar>
            ))}
          </PillarsGrid>
        </Container>
      </Section>

      <Section $surface>
        <Container>
          <StoryGrid>
            <div>
              <Eyebrow>The purpose of stadium gatherings</Eyebrow>
              <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 10 }}>
                Not a spectacle. A service.
              </h2>
              <p style={{ color: tokens.color.textSecondary, fontSize: 15.5, lineHeight: 1.75, marginTop: 14 }}>
                Stadium gatherings exist to make the unity of the Church visible enough to encourage its members, loud
                enough to reach the city around them, and well-run enough to be a real act of service to everyone who
                comes.
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 14, color: tokens.color.textSecondary, lineHeight: 1.75, fontSize: 15 }}>
                <li>No single congregation can fill a 70,000-seat stadium alone.</li>
                <li>Coordination across churches multiplies volunteers, hospitality, and after-care.</li>
                <li>Shared logistics free each church to focus on its calling.</li>
                <li>Visibility encourages churches that are small or far from the centre.</li>
              </ul>
            </div>
            <Img $img="/images/18.jpg" />
          </StoryGrid>
        </Container>
      </Section>

      <FinalCTA>
        <Container>
          <Eyebrow>Gather with us</Eyebrow>
          <h2 style={{ color: '#fff', fontSize: 54, fontWeight: 800, lineHeight: 1.05, marginTop: 12, maxWidth: 720, margin: '12px auto 0' }}>
            Many congregations. One voice. One mission.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16.5, lineHeight: 1.65, marginTop: 18, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            Join the network that is quietly coordinating the loudest nights of worship the world has ever seen.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/register">
              <Button $variant="gold">Apply to join â†’</Button>
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

