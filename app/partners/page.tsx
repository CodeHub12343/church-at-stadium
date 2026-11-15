'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Card';

const HeroBg = styled.section`
  position: relative;
  overflow: hidden;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(11, 20, 40, 0.88), rgba(16, 27, 50, 0.82)),
      url('/images/7.jpg') center / cover no-repeat;
    z-index: -1;
  }
`;

const HeroInner = styled.div`
  padding: 60px 0 100px;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) 380px;
  gap: 56px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    padding: 40px 0 80px;
  }
`;

const H1 = styled.h1`
  font-size: 68px;
  font-weight: 800;
  line-height: 1.02;
  color: #fff;
  margin-top: 18px;
  @media (max-width: ${tokens.bp.tablet}) {
    font-size: 48px;
  }
`;

const Sub = styled.p`
  color: rgba(255, 255, 255, 0.84);
  font-size: 18px;
  line-height: 1.55;
  max-width: 620px;
  margin: 22px 0 0;
  @media (max-width: ${tokens.bp.tablet}) {
    font-size: 16px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 14px;
    margin-top: 16px;
  }
`;

const SideCard = styled.div`
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 28px;
  color: #fff;
`;

const Tracks = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Track = styled.div<{ $featured?: boolean }>`
  background: ${(p) => (p.$featured ? 'linear-gradient(180deg,#FEFAF0,#fff)' : '#fff')};
  border: 1px solid ${(p) => (p.$featured ? tokens.color.secondary : tokens.color.border)};
  border-radius: 16px;
  padding: 28px 26px;
  box-shadow: ${(p) => (p.$featured ? tokens.shadow.md : 'none')};
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MostCommon = styled.span`
  position: absolute;
  top: -14px;
  left: 28px;
  background: ${tokens.color.secondary};
  color: ${tokens.color.primary};
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
`;

const ProcessBand = styled.div`
  margin-top: 36px;
  padding: 28px 32px;
  background: ${tokens.color.primary};
  border-radius: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  color: #fff;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
`;

const StepNum = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${tokens.color.secondary};
  color: ${tokens.color.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: ${tokens.font.display};
  font-size: 13px;
`;

export default function PartnersPage() {
  return (
    <>
      <HeroBg>
        <PublicNav dark />
        <Container>
          <HeroInner>
            <div>
              <Eyebrow>Become a Partner</Eyebrow>
              <H1>Carry the work<br />alongside us.</H1>
              <Sub>
                Church at the Stadiums gathers congregations across borders — but gatherings on this scale need people
                and organizations who serve the Church well: media and worship ministries, hospitality providers, venue
                operators, foundations, and ministries supporting the host cities we come to.
              </Sub>
              <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
                <Link href="/partners/apply"><Button $variant="gold">Apply to partner →</Button></Link>
                <Button
                  as="span"
                  style={{
                    background: 'transparent',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.4)',
                  }}
                >
                  Download partner brief
                </Button>
              </div>
              <div style={{ marginTop: 46, display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                {[
                  { n: '28', l: 'Active partners' },
                  { n: '15', l: 'Countries' },
                  { n: '42K+', l: 'People served in 2026' },
                ].map((s) => (
                  <div key={s.l}>
                    <div
                      className="mono"
                      style={{
                        fontFamily: tokens.font.display,
                        fontWeight: 700,
                        fontSize: 38,
                        color: tokens.color.secondary,
                      }}
                    >
                      {s.n}
                    </div>
                    <div
                      style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: 13,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SideCard>
              <div style={{ color: tokens.color.secondary, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                A short word
              </div>
              <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 21, marginTop: 8, lineHeight: 1.3 }}>
                We're a small team doing something that only works when many hands help.
              </div>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.65, marginTop: 14 }}>
                If what you do serves the gathered Church, we'd love to meet. Partnerships are shaped case by case; we
                don't do form responses.
              </p>
            </SideCard>
          </HeroInner>
        </Container>
      </HeroBg>

      <Section $surface>
        <Container>
          <div style={{ marginBottom: 44 }}>
            <Eyebrow>Partnership tracks</Eyebrow>
            <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginTop: 10 }}>Four ways to stand with us</h2>
          </div>

          <Tracks>
            {[
              { eye: 'Ministry partner', title: 'Worship, teaching, prayer', desc: 'Worship collectives, speakers, intercession teams, youth and children\'s ministries serving on-stage and off.' },
              { eye: 'Operations partner', title: 'Venue & event services', desc: 'Stadiums, production, staging, media, translation, security coordination, catering, transport.', featured: true },
              { eye: 'Hospitality partner', title: 'Housing, meals, local care', desc: 'Host churches, hotels, meal providers, and medical/pastoral care in host cities.' },
              { eye: 'Foundation & sponsors', title: 'Funding & travel grants', desc: 'Foundations, individuals, and businesses that fund venues, travel for churches, and after-care.' },
            ].map((t) => (
              <Track key={t.title} $featured={t.featured}>
                {t.featured && <MostCommon>Most common</MostCommon>}
                <div style={{ color: tokens.color.secondary, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t.eye}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700 }}>{t.title}</h3>
                <div style={{ color: tokens.color.textSecondary, fontSize: 14, lineHeight: 1.6 }}>{t.desc}</div>
              </Track>
            ))}
          </Tracks>

          <ProcessBand>
            {[
              { n: 1, t: 'Tell us your fit', d: 'A short enquiry form — 5 minutes.' },
              { n: 2, t: 'A real conversation', d: 'We talk, in your time zone, within a week.' },
              { n: 3, t: 'A clear scope', d: 'Written agreement — what you bring, what we hold.' },
              { n: 4, t: 'Walk into a gathering', d: 'We brief, debrief, and keep the relationship honest.' },
            ].map((s) => (
              <div key={s.n}>
                <StepNum>{s.n}</StepNum>
                <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 16, marginTop: 10 }}>
                  {s.t}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4, lineHeight: 1.55 }}>
                  {s.d}
                </div>
              </div>
            ))}
          </ProcessBand>
        </Container>
      </Section>

      <Section>
        <Container>
          <div style={{ maxWidth: 680 }}>
            <Eyebrow>In the field</Eyebrow>
            <h2 style={{ fontSize: 40, fontWeight: 800, marginTop: 10, lineHeight: 1.1 }}>
              What partnership looks like, on the night.
            </h2>
            <p style={{ color: tokens.color.textSecondary, fontSize: 15.5, lineHeight: 1.65, marginTop: 12 }}>
              Media crews, hospitality teams, worship collectives, sound engineers, host-city volunteers — each gathering
              is a thousand hands made visible.
            </p>
          </div>
          <div
            style={{
              marginTop: 32,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {[
              { img: '/images/7.jpg', label: 'Production & media' },
              { img: '/images/9.jpg', label: 'Hospitality teams' },
              { img: '/images/12.jpg', label: 'Worship collectives' },
              { img: '/images/10.jpg', label: 'Registration & logistics' },
            ].map((p) => (
              <div
                key={p.label}
                style={{
                  position: 'relative',
                  minHeight: 240,
                  borderRadius: 14,
                  overflow: 'hidden',
                  color: '#fff',
                  background: `linear-gradient(180deg, rgba(11,20,40,0.05) 40%, rgba(11,20,40,0.85) 100%), url(${p.img}) center / cover no-repeat`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 18,
                }}
              >
                <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 15 }}>{p.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section $dark>
        <Container>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <Eyebrow>We'd love to meet</Eyebrow>
            <h2 style={{ color: '#fff', fontSize: 54, fontWeight: 800, marginTop: 14, lineHeight: 1.05 }}>
              If what you do serves the gathered Church,
              <br />
              bring it to the stadium.
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: 16.5,
                lineHeight: 1.65,
                marginTop: 18,
                maxWidth: 620,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Fill in a short enquiry and we'll be in touch — in your time zone, with a real person.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/partners/apply"><Button $variant="gold">Apply to partner →</Button></Link>
            </div>
            <div style={{ marginTop: 36, color: 'rgba(255,255,255,0.55)', fontSize: 12.5 }}>
              partnerships@churchatthestadiums.com · we read every message
            </div>
          </div>
        </Container>
      </Section>

      <PublicFooter />
    </>
  );
}
