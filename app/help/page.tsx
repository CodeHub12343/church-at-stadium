'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Loading } from '@/components/ui/Spinner';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Container, Section } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const HeroBg = styled.section`
  position: relative;
  padding-bottom: 80px;
  color: #fff;
  overflow: hidden;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(11, 20, 40, 0.9), rgba(27, 46, 85, 0.82)),
      url('/images/11.jpg') center / cover no-repeat;
    z-index: -1;
  }
  > ${Container} { padding-top: 48px; }
`;

const HeroInner = styled.div`
  max-width: 820px;
  margin: 0 auto;
  text-align: center;
  position: relative;
`;

const SearchBar = styled.div`
  margin-top: 28px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border-radius: 14px;
  padding: 8px 10px 8px 20px;
  box-shadow: 0 12px 32px rgba(11, 20, 40, 0.3);
  max-width: 620px;
  margin-left: auto;
  margin-right: auto;
  input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-family: inherit;
    font-size: 15px;
    padding: 10px 0;
    color: ${tokens.color.textPrimary};
  }
`;

const Chips = styled.div`
  margin-top: 14px;
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Chip = styled(Link)`
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  font-size: 12.5px;
  font-weight: 600;
`;

const Cats = styled.div`
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

const Cat = styled(Link)`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.15s;
  &:hover {
    border-color: ${tokens.color.secondary};
    box-shadow: ${tokens.shadow.md};
    transform: translateY(-1px);
  }
  h3 {
    font-size: 16px;
    font-weight: 700;
  }
`;

const IconTile = styled.div<{ $bg: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(p) => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 28px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const PopList = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 28px 30px;
`;

const PopItem = styled(Link)`
  padding: 16px 0;
  border-top: 1px solid ${tokens.color.surface2};
  display: flex;
  align-items: flex-start;
  gap: 14px;
  cursor: pointer;
  &:first-of-type { border-top: none; }
`;

const RankChip = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: ${tokens.color.secondarySoft};
  color: ${tokens.color.warningText};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 11px;
`;

type LiveCat = { slug: string; title: string; count: number; bg?: string; icon?: string; description?: string };
type LivePop = { slug: string; title: string; categorySlug: string; readMinutes: number; views: number };

export default function HelpCenterPage() {
  const [categories, setCategories] = useState<LiveCat[]>([]);
  const [popular, setPopular] = useState<LivePop[]>([]);

  useEffect(() => {
    (async () => {
      const [c, a] = await Promise.all([
        fetch('/api/help/categories').then((r) => r.json()),
        fetch('/api/help/articles').then((r) => r.json()),
      ]);
      setCategories(c.categories ?? []);
      setPopular((a.articles ?? []).slice(0, 5));
    })();
  }, []);

  return (
    <>
      <HeroBg>
        <PublicNav dark />
        <Container>
          <HeroInner>
            <div style={{ color: tokens.color.secondary, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>
              Help center
            </div>
            <h1 style={{ color: '#fff', fontSize: 42, fontWeight: 800, marginTop: 12 }}>
              How can we help you?
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15.5, lineHeight: 1.6, marginTop: 12, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
              Guides, answers, and contact — for churches, organizers, volunteers, and attendees.
            </p>
            <SearchBar>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke={tokens.color.textSecondary} strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke={tokens.color.textSecondary} strokeWidth="2" />
              </svg>
              <input placeholder="Search for a topic, question, or keyword…" />
              <Button>Search</Button>
            </SearchBar>
            <Chips>
              {['Register church', 'Change gate', 'Volunteer withdraw', 'Group registration', 'Password reset'].map((q) => (
                <Chip key={q} href={`/help/articles/${q.toLowerCase().replace(/\s/g, '-')}`}>
                  {q}
                </Chip>
              ))}
            </Chips>
          </HeroInner>
        </Container>
      </HeroBg>

      <Section>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Browse by topic</h2>
            <Link href="/help/articles" style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 14 }}>
              See all articles →
            </Link>
          </div>
          <Cats>
            {categories.map((c) => (
              <Cat key={c.slug} href={`/help/categories/${c.slug}`}>
                <IconTile $bg={c.bg ?? tokens.color.surface2} style={{ fontSize: 22 }}>{c.icon ?? '📚'}</IconTile>
                <div>
                  <h3>{c.title}</h3>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 4 }}>
                    {c.count} article{c.count === 1 ? '' : 's'}
                  </div>
                </div>
              </Cat>
            ))}
          </Cats>
        </Container>
      </Section>

      <Section $surface>
        <Container>
          <Row>
            <PopList>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Popular right now</h2>
                <span style={{ color: tokens.color.textSecondary, fontSize: 12.5 }}>Updated 7 Nov</span>
              </div>
              <div style={{ marginTop: 18 }}>
                {popular.length === 0 && (
                  <Loading pad={24} />
                )}
                {popular.map((p, i) => (
                  <PopItem key={p.slug} href={`/help/articles/${p.slug}`}>
                    <RankChip>{String(i + 1).padStart(2, '0')}</RankChip>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{p.title}</div>
                      <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 3 }}>
                        {p.readMinutes} min read · {p.views.toLocaleString()} views
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: 8 }} aria-hidden="true">
                      <path d="M9 6l6 6-6 6" stroke={tokens.color.textSecondary} strokeWidth="1.9" />
                    </svg>
                  </PopItem>
                ))}
              </div>
            </PopList>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  background: `linear-gradient(135deg, ${tokens.color.primaryDeep}, ${tokens.color.primarySoft})`,
                  borderRadius: 14,
                  padding: '22px 24px',
                  color: '#fff',
                }}
              >
                <div style={{ color: tokens.color.secondary, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Still need help?
                </div>
                <div style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 22, marginTop: 6, lineHeight: 1.15 }}>
                  We're small, but we read every message.
                </div>
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
                  Typical reply: <b style={{ color: tokens.color.secondary }}>under 1 working day</b>.
                </div>
                <Link href="/help/support" style={{ marginTop: 16, display: 'inline-block' }}>
                  <Button $variant="gold">Contact support →</Button>
                </Link>
              </div>

              <Badge style={{ display: 'none' }} />

              <div style={{ padding: 18, background: '#fff', border: `1px solid ${tokens.color.border}`, borderRadius: 14 }}>
                <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 13.5 }}>
                  Email us
                </div>
                <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 2 }}>
                  help@churchatthestadiums.com
                </div>
              </div>
              <div style={{ padding: 18, background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, borderRadius: 14 }}>
                <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 13.5, color: tokens.color.errorText }}>
                  Safeguarding concern
                </div>
                <div style={{ color: tokens.color.errorText, fontSize: 12.5, marginTop: 2 }}>
                  Confidential · Report via a separate team
                </div>
              </div>
            </div>
          </Row>
        </Container>
      </Section>

      <PublicFooter />
    </>
  );
}
