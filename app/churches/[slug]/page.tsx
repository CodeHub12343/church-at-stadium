'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Container, Section } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';
import type { MockChurchDirectory, MockEvent } from '@/lib/mockData';

const Hero = styled.section`
  background: linear-gradient(180deg, ${tokens.color.surface}, #fff);
  padding: 56px 0 48px;
`;

const Crumbs = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${tokens.color.textSecondary};
  font-size: 13px;
  a:hover {
    color: ${tokens.color.primary};
  }
`;

const HeroRow = styled.div`
  margin-top: 28px;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
  align-items: flex-start;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const AvatarBig = styled.div<{ $g: [string, string] }>`
  width: 84px;
  height: 84px;
  border-radius: 20px;
  background: ${(p) => `linear-gradient(135deg, ${p.$g[0]}, ${p.$g[1]})`};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 30px;
  flex-shrink: 0;
  box-shadow: ${tokens.shadow.md};
`;

const H1 = styled.h1`
  font-size: 40px;
  font-weight: 800;
  line-height: 1.08;
  margin-top: 4px;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 28px;
  }
`;

const MetaRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: ${tokens.color.textSecondary};
  font-size: 13.5px;
  span {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }
`;

const SidePanel = styled.aside`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 16px;
  padding: 20px 22px;
  box-shadow: ${tokens.shadow.sm};
`;

const StatList = styled.dl`
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  dt {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
    color: ${tokens.color.textSecondary};
  }
  dd {
    margin: 2px 0 0;
    font-size: 15px;
    font-weight: 600;
    color: ${tokens.color.textPrimary};
  }
`;

const SectionBlock = styled.section`
  padding: 56px 0;
`;

const Bio = styled.div`
  max-width: 760px;
  font-size: 16px;
  line-height: 1.75;
  color: ${tokens.color.textSecondary};
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const EventCard = styled(Link)`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.15s;
  &:hover {
    border-color: ${tokens.color.secondary};
    box-shadow: ${tokens.shadow.md};
    transform: translateY(-2px);
  }
`;

const EventBand = styled.div<{ $g: [string, string] }>`
  height: 6px;
  border-radius: 999px;
  background: ${(p) => `linear-gradient(90deg, ${p.$g[0]}, ${p.$g[1]})`};
`;

export default function ChurchProfilePage({ params }: { params: { slug: string } }) {
  const [church, setChurch] = useState<MockChurchDirectory | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<MockEvent[]>([]);
  const [status, setStatus] = useState<'loading' | 'found' | 'missing'>('loading');

  useEffect(() => {
    fetch(`/api/churches/${encodeURIComponent(params.slug)}`)
      .then(async (r) => {
        if (r.status === 404) {
          setStatus('missing');
          return;
        }
        const d = await r.json();
        setChurch(d.church);
        setUpcomingEvents(d.upcomingEvents ?? []);
        setStatus('found');
      })
      .catch(() => setStatus('missing'));
  }, [params.slug]);

  if (status === 'loading') {
    return (
      <>
        <PublicNav />
        <Container><div style={{ padding: '80px 0', color: tokens.color.textSecondary }}>Loading church…</div></Container>
      </>
    );
  }
  if (status === 'missing' || !church) {
    return (
      <>
        <PublicNav />
        <Container>
          <div style={{ padding: '80px 0' }}>
            <h1 style={{ fontSize: 32, fontWeight: 700 }}>Church not found</h1>
            <p style={{ color: tokens.color.textSecondary, marginTop: 8 }}>
              <Link href="/churches" style={{ color: tokens.color.primary, fontWeight: 600 }}>Back to the directory</Link>
            </p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <PublicNav />

      <Hero>
        <Container>
          <Crumbs>
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/churches">Churches</Link>
            <span>/</span>
            <strong style={{ color: tokens.color.primary }}>{church.name}</strong>
          </Crumbs>

          <HeroRow>
            <div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <AvatarBig $g={church.gradient}>{church.initials}</AvatarBig>
                <div>
                  <Eyebrow>{church.region} · {church.denomination}</Eyebrow>
                  <H1>{church.name}</H1>
                </div>
              </div>

              <MetaRow>
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 22s7-7.58 7-13a7 7 0 10-14 0c0 5.42 7 13 7 13z"
                      stroke={tokens.color.textSecondary}
                      strokeWidth="1.8"
                    />
                    <circle cx="12" cy="9" r="2.4" stroke={tokens.color.textSecondary} strokeWidth="1.8" />
                  </svg>
                  {church.city}, {church.country}
                </span>
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M4 20V10l8-6 8 6v10h-5v-6H9v6H4z" stroke={tokens.color.textSecondary} strokeWidth="1.8" />
                  </svg>
                  {church.branches} branches
                </span>
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke={tokens.color.textSecondary} strokeWidth="1.8" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={tokens.color.textSecondary} strokeWidth="1.8" />
                  </svg>
                  ~{church.size} members
                </span>
                <span>Established {church.established}</span>
              </MetaRow>

              <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                {church.verified ? (
                  <Badge $tone="success">✓ Verified church</Badge>
                ) : (
                  <Badge $tone="warning">Pending verification</Badge>
                )}
                <Badge $tone="neutral">{church.denomination}</Badge>
                <Badge $tone="neutral">{church.region}</Badge>
              </div>
            </div>

            <SidePanel>
              <StatList>
                <div>
                  <dt>Lead pastor</dt>
                  <dd>{church.pastor}</dd>
                </div>
                <div>
                  <dt>Website</dt>
                  <dd>
                    <a href={`https://${church.website}`} target="_blank" rel="noopener noreferrer" style={{ color: tokens.color.primary }}>
                      {church.website}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Contact</dt>
                  <dd>
                    <a href={`mailto:${church.email}`} style={{ color: tokens.color.primary }}>
                      {church.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Upcoming events</dt>
                  <dd>{upcomingEvents.length}</dd>
                </div>
              </StatList>

              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button $block>Contact church</Button>
                <Button $variant="secondary" $block>
                  Share profile
                </Button>
              </div>
            </SidePanel>
          </HeroRow>
        </Container>
      </Hero>

      <SectionBlock>
        <Container>
          <Eyebrow>About</Eyebrow>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginTop: 10, marginBottom: 16 }}>Who we are</h2>
          <Bio>{church.bio}</Bio>
        </Container>
      </SectionBlock>

      <SectionBlock style={{ background: tokens.color.surface }}>
        <Container>
          <Eyebrow>Participating in</Eyebrow>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginTop: 10 }}>Upcoming events</h2>
          <p style={{ color: tokens.color.textSecondary, fontSize: 14.5, marginTop: 6, maxWidth: 560 }}>
            Gatherings {church.name} has committed to.
          </p>

          {upcomingEvents.length === 0 ? (
            <div
              style={{
                marginTop: 24,
                padding: 32,
                background: '#fff',
                border: `1px dashed ${tokens.color.border}`,
                borderRadius: 14,
                color: tokens.color.textSecondary,
                textAlign: 'center',
              }}
            >
              No public events announced yet. Check back soon.
            </div>
          ) : (
            <EventsGrid>
              {upcomingEvents.map((e) => (
                <EventCard key={e.slug} href={`/events/${e.slug}`}>
                  <EventBand $g={e.gradient} />
                  <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 18 }}>{e.title}</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 13 }}>
                    {e.dateLabel} · {e.venue}, {e.city}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Badge $tone="neutral">{e.category}</Badge>
                    <Badge $tone="info">{e.churches} churches</Badge>
                  </div>
                </EventCard>
              ))}
            </EventsGrid>
          )}
        </Container>
      </SectionBlock>

      <Section $dark>
        <Container>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <Eyebrow>Join the network</Eyebrow>
            <h2 style={{ color: '#fff', fontSize: 32, fontWeight: 800, marginTop: 10 }}>
              Represent your own church on the platform.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, lineHeight: 1.65, marginTop: 12 }}>
              Collaborate with {church.name} and 120+ other verified churches worldwide.
            </p>
            <Link href="/register" style={{ display: 'inline-block', marginTop: 18 }}>
              <Button $variant="gold">Apply to join →</Button>
            </Link>
          </div>
        </Container>
      </Section>

      <PublicFooter />
    </>
  );
}
