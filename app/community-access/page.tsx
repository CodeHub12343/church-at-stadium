'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Eyebrow } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Container';
import { MountFade, Reveal, Stagger } from '@/components/motion/Reveal';

const HeroBg = styled.section`
  position: relative;
  padding-bottom: 80px;
  color: #fff;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(11, 20, 40, 0.88) 0%, rgba(11, 20, 40, 0.78) 100%),
      url('/images/20.jpg') center / cover no-repeat;
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

const Lede = styled.p`
  color: rgba(255,255,255,0.86);
  font-size: 17px;
  line-height: 1.6;
  margin-top: 16px;
  max-width: 680px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: start;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    gap: 28px;
  }
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 16px;
  padding: 28px 30px;
  @media (max-width: ${tokens.bp.mobile}) { padding: 22px 18px; }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 14px;
`;

const Stat = styled.div`
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  padding: 14px 16px;
  .l { font-size: 11.5px; color: ${tokens.color.textSecondary}; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .v { font-size: 22px; font-weight: 800; margin-top: 4px; color: ${tokens.color.textPrimary}; }
`;

const BulletList = styled.ul`
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  display: flex; flex-direction: column; gap: 10px;
  li {
    position: relative;
    padding-left: 22px;
    font-size: 14.5px;
    line-height: 1.6;
    color: ${tokens.color.textSecondary};
    &::before {
      content: ''; position: absolute; left: 0; top: 7px;
      width: 10px; height: 10px; border-radius: 50%;
      background: ${tokens.color.secondary};
    }
    b { color: ${tokens.color.textPrimary}; font-weight: 700; }
  }
`;

const Promise = styled.div`
  margin-top: 20px;
  padding: 18px 20px;
  border-radius: 12px;
  background: ${tokens.color.secondarySoft};
  border: 1px solid ${tokens.color.secondary}33;
  font-size: 13.5px;
  line-height: 1.6;
  color: ${tokens.color.textPrimary};
  b { color: ${tokens.color.primary}; }
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 22px;
  @media (max-width: ${tokens.bp.tablet}) { grid-template-columns: 1fr 1fr; }
  @media (max-width: ${tokens.bp.mobile}) { grid-template-columns: 1fr; }
`;

const Step = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 20px;
  .n {
    width: 30px; height: 30px; border-radius: 50%;
    background: ${tokens.color.primary}; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px;
    margin-bottom: 10px;
  }
  .t { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
  .d { font-size: 13px; color: ${tokens.color.textSecondary}; line-height: 1.55; }
`;

const Banner = styled.div`
  background: ${tokens.color.primary};
  color: #fff;
  padding: 36px;
  border-radius: 16px;
  text-align: center;
  .k {
    font-size: 11.5px; letter-spacing: 0.16em; text-transform: uppercase;
    color: ${tokens.color.secondary}; font-weight: 700;
  }
  h3 { font-size: 30px; font-weight: 800; margin-top: 6px; }
  p { color: rgba(255,255,255,0.82); font-size: 15px; margin-top: 10px; line-height: 1.55; max-width: 620px; margin-left: auto; margin-right: auto; }
  @media (max-width: ${tokens.bp.mobile}) { padding: 24px 18px; h3 { font-size: 22px; } }
`;

export default function CommunityAccessPage() {
  return (
    <>
      <PublicNav />
      <HeroBg>
        <Container>
          <MountFade>
            <div style={{ color: tokens.color.secondary, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
              Community access policy
            </div>
          </MountFade>
          <MountFade $delay={120}>
            <H1>Every family deserves a seat.</H1>
          </MountFade>
          <MountFade $delay={240}>
            <Lede>
              At Church at the Stadiums, we believe financial hardship should never prevent families from gathering with
              their community. 10% of all event tickets are reserved — free of charge — for qualifying low-income
              individuals and families.
            </Lede>
          </MountFade>
        </Container>
      </HeroBg>

      <Section>
        <Container>
          <Reveal>
            <Grid>
              <Card>
                <Eyebrow>The policy</Eyebrow>
                <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>10% reserved. Free. First come, first served.</h2>
                <BulletList>
                  <li><b>10% reservation.</b> Every participating event reserves at least 10% of its ticket inventory for eligible low-income attendees.</li>
                  <li><b>Free of charge.</b> Reserved tickets are free. Nothing to pay at request and nothing at the gate.</li>
                  <li><b>EBT verified at entry.</b> Bring your government-issued ID and your EBT card (or other accepted proof of low-income eligibility) when you arrive. We do not collect or store your EBT card number online.</li>
                  <li><b>First come, first served.</b> Reserved tickets are available until the community allocation is exhausted.</li>
                  <li><b>Same event, same rules.</b> Approved ticket holders enter under the same venue and safety rules as every other attendee.</li>
                </BulletList>
                <Promise>
                  <b>Privacy promise:</b> we never ask for or store EBT card numbers, SNAP case numbers, or other
                  sensitive benefit identifiers. Verification happens in person at entry.
                </Promise>
              </Card>

              <Card>
                <Eyebrow>Special benefit</Eyebrow>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>Mother &amp; child — one free child ticket</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: tokens.color.textSecondary, marginTop: 8 }}>
                  A mother with a valid EBT card who attends with her child receives <b style={{ color: tokens.color.textPrimary }}>one free child ticket</b> as part of the community allocation. The mother and child together count as <b style={{ color: tokens.color.textPrimary }}>two ticket holders</b> toward the 10% pool, subject to availability.
                </p>

                <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 20 }}>Example — 20,000-ticket stadium event</div>
                <StatRow>
                  <Stat><div className="l">Total capacity</div><div className="v">20,000</div></Stat>
                  <Stat><div className="l">Reserved (10%)</div><div className="v">2,000</div></Stat>
                  <Stat><div className="l">500 mother + 500 child pairs</div><div className="v">1,000</div></Stat>
                  <Stat><div className="l">Remaining community seats</div><div className="v">1,000</div></Stat>
                </StatRow>
              </Card>
            </Grid>
          </Reveal>

          <Reveal>
            <div style={{ marginTop: 56 }}>
              <Eyebrow>How it works</Eyebrow>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>Four steps, one seat.</h2>
            </div>
          </Reveal>

          <Stagger step={80}>
            <StepsGrid>
              <Step>
                <div className="n">1</div>
                <div className="t">Find your event</div>
                <div className="d">Open the event you want to attend from the Events page.</div>
              </Step>
              <Step>
                <div className="n">2</div>
                <div className="t">Request a seat</div>
                <div className="d">Tap <b>Community ticket</b> and tell us your name, email, and whether a child will join you.</div>
              </Step>
              <Step>
                <div className="n">3</div>
                <div className="t">Get your reference</div>
                <div className="d">You'll get a unique reference by email — keep it with your ID and EBT card.</div>
              </Step>
              <Step>
                <div className="n">4</div>
                <div className="t">Verify at the gate</div>
                <div className="d">Show your ID and valid EBT card (or accepted proof of low-income eligibility) and walk in.</div>
              </Step>
            </StepsGrid>
          </Stagger>

          <Reveal>
            <div style={{ marginTop: 64 }}>
              <Banner>
                <div className="k">Together we rise · Together we celebrate</div>
                <h3>Every family deserves a seat.</h3>
                <p>
                  Reserved community tickets are already open on participating events. Browse what's coming and claim yours while the allocation lasts.
                </p>
                <div style={{ marginTop: 20, display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Link href="/events"><Button $size="lg">Browse events →</Button></Link>
                  <Link href="/faq"><Button $variant="secondary" $size="lg">Read the FAQ</Button></Link>
                </div>
              </Banner>
            </div>
          </Reveal>

          <Reveal>
            <p style={{ color: tokens.color.textSecondary, fontSize: 12.5, lineHeight: 1.6, marginTop: 36, maxWidth: 820 }}>
              The 10% community reservation is a platform-wide policy. It may be adjusted per event where required by
              local laws, venue agreements, or a partner's own accessibility program. Verification standards and
              accepted proofs of eligibility are set by the hosting event in line with applicable law.
            </p>
          </Reveal>
        </Container>
      </Section>

      <PublicFooter />
    </>
  );
}
