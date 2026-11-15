'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Container, Section } from '@/components/ui/Container';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Eyebrow } from '@/components/ui/Card';

type Kind = 'all' | 'events' | 'churches' | 'articles';

interface Result {
  kind: Exclude<Kind, 'all'>;
  title: string;
  description: string;
  href: string;
  meta: string;
  tag: string;
  tagTone: BadgeTone;
  score: number;
}

const Hero = styled.section`
  background: linear-gradient(180deg, ${tokens.color.surface}, #fff);
  padding: 48px 0 32px;
`;

const SearchBar = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: ${tokens.shadow.sm};
  input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 16px;
  }
`;

const Filters = styled.div`
  padding: 20px 0 24px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 1px solid ${tokens.color.border};
`;

const Chip = styled.button<{ $on?: boolean }>`
  padding: 8px 14px;
  border-radius: 999px;
  background: ${(p) => (p.$on ? tokens.color.primary : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : tokens.color.textPrimary)};
  border: 1px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.border)};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  margin-top: 24px;
  align-items: flex-start;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ResultCard = styled(Link)`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  padding: 18px 22px;
  display: block;
  transition: all 0.15s;
  &:hover {
    border-color: ${tokens.color.secondary};
    box-shadow: ${tokens.shadow.sm};
    transform: translateY(-1px);
  }
`;

const Side = styled.aside`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  padding: 18px 22px;
  h3 {
    font-family: ${tokens.font.display};
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    margin-bottom: 12px;
  }
`;

const RelatedChip = styled(Link)`
  display: inline-block;
  padding: 6px 12px;
  margin: 2px 6px 2px 0;
  background: ${tokens.color.surface};
  border: 1px solid ${tokens.color.border};
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  color: ${tokens.color.textPrimary};
  &:hover {
    border-color: ${tokens.color.secondary};
  }
`;

const highlight = (text: string, q: string) => {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: tokens.color.secondarySoft, color: tokens.color.primary, fontWeight: 700, padding: '0 2px', borderRadius: 3 }}>
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
};

type ApiResponse = {
  q: string;
  totals: { events: number; churches: number; articles: number };
  results: {
    events: Array<{ slug: string; title: string; category: string; dateLabel: string; city: string; venue: string }>;
    churches: Array<{ slug: string; name: string; city: string; country: string; denomination: string; verified: boolean }>;
    articles: Array<{ slug: string; title: string; categorySlug: string; readMinutes: number }>;
  };
};

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<Kind>('all');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qq = q.trim();
    if (!qq) { setData(null); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(qq)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }, 250);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [q]);

  const results: Result[] = useMemo(() => {
    if (!data) return [];
    const out: Result[] = [];
    if (kind === 'all' || kind === 'events') {
      for (const e of data.results.events) {
        out.push({
          kind: 'events', title: e.title,
          description: `${e.category} · ${e.dateLabel} · ${e.venue}, ${e.city}`,
          href: `/events/${e.slug}`,
          meta: e.city, tag: e.category, tagTone: 'gold', score: 100,
        });
      }
    }
    if (kind === 'all' || kind === 'churches') {
      for (const c of data.results.churches) {
        out.push({
          kind: 'churches', title: c.name,
          description: `${c.denomination} · ${c.city}, ${c.country}`,
          href: `/churches/${c.slug}`,
          meta: c.country, tag: c.verified ? 'Verified' : 'Pending', tagTone: c.verified ? 'success' : 'warning', score: 80,
        });
      }
    }
    if (kind === 'all' || kind === 'articles') {
      for (const a of data.results.articles) {
        out.push({
          kind: 'articles', title: a.title,
          description: `Help · ${a.categorySlug} · ${a.readMinutes} min read`,
          href: `/help/articles/${a.slug}`,
          meta: a.categorySlug, tag: 'Help', tagTone: 'info', score: 60,
        });
      }
    }
    return out;
  }, [data, kind]);

  const counts: Record<Kind, number> = useMemo(() => {
    const t = data?.totals;
    const total = (t?.events ?? 0) + (t?.churches ?? 0) + (t?.articles ?? 0);
    return {
      all: total,
      events: t?.events ?? 0,
      churches: t?.churches ?? 0,
      articles: t?.articles ?? 0,
    };
  }, [data]);

  return (
    <>
      <PublicNav />
      <Hero>
        <Container>
          <Eyebrow>Search</Eyebrow>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 8, lineHeight: 1.1 }}>
            Search across events, churches &amp; help
          </h1>
          <SearchBar>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke={tokens.color.textSecondary} strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke={tokens.color.textSecondary} strokeWidth="2" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try ‘Wembley’, ‘volunteer’, or a church name…"
              autoFocus
            />
            {q && (
              <button
                onClick={() => setQ('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: tokens.color.textSecondary,
                  cursor: 'pointer',
                  padding: 6,
                }}
                aria-label="Clear"
              >
                ✕
              </button>
            )}
          </SearchBar>
        </Container>
      </Hero>

      <Section>
        <Container>
          <Filters>
            {([
              ['all', 'All'],
              ['events', 'Events'],
              ['churches', 'Churches'],
              ['articles', 'Help'],
            ] as [Kind, string][]).map(([v, label]) => (
              <Chip key={v} $on={v === kind} onClick={() => setKind(v)}>
                {label} <span style={{ opacity: 0.7, marginLeft: 6 }}>{counts[v]}</span>
              </Chip>
            ))}
            <div style={{ marginLeft: 'auto', color: tokens.color.textSecondary, fontSize: 13 }}>
              {results.length} {results.length === 1 ? 'result' : 'results'}{q && <> for <strong style={{ color: tokens.color.primary }}>"{q}"</strong></>}
            </div>
          </Filters>

          <Grid>
            <ResultList>
              {results.length === 0 ? (
                <div
                  style={{
                    padding: 48,
                    background: '#fff',
                    border: `1px dashed ${tokens.color.border}`,
                    borderRadius: 14,
                    textAlign: 'center',
                    color: tokens.color.textSecondary,
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🔎</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: tokens.color.textPrimary }}>No results for "{q}"</div>
                  <p style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.6, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
                    Check spelling or try a shorter query. Still stuck? Try our{' '}
                    <Link href="/help" style={{ color: tokens.color.primary, fontWeight: 600 }}>
                      help centre
                    </Link>{' '}
                    or <Link href="/help/support" style={{ color: tokens.color.primary, fontWeight: 600 }}>contact support</Link>.
                  </p>
                </div>
              ) : (
                results.map((r) => (
                  <ResultCard key={`${r.kind}-${r.href}`} href={r.href}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                      <Badge $tone={r.tagTone}>{r.tag}</Badge>
                      <span style={{ color: tokens.color.textSecondary, fontSize: 12 }}>{r.meta}</span>
                    </div>
                    <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 17, color: tokens.color.textPrimary }}>
                      {highlight(r.title, q)}
                    </div>
                    <div style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 6, lineHeight: 1.65 }}>
                      {highlight(r.description, q)}
                    </div>
                    <div style={{ color: tokens.color.primary, fontSize: 12.5, marginTop: 10, fontFamily: 'ui-monospace, Consolas, monospace' }}>
                      {r.href.startsWith('http') ? r.href : `churchatthestadiums.org${r.href}`}
                    </div>
                  </ResultCard>
                ))
              )}
            </ResultList>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Side>
                <h3>Browse</h3>
                <RelatedChip href="/events">All events</RelatedChip>
                <RelatedChip href="/churches">Partner churches</RelatedChip>
                <RelatedChip href="/help">Help centre</RelatedChip>
              </Side>

              <Side>
                <h3>Can&apos;t find it?</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: tokens.color.textSecondary }}>
                  Reach out to our team through the help centre.
                </p>
                <Link
                  href="/help/support"
                  style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 13.5, marginTop: 12, display: 'inline-block' }}
                >
                  Contact support →
                </Link>
              </Side>

              <Side>
                <h3>Search tips</h3>
                <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, margin: 0, fontSize: 13, color: tokens.color.textSecondary, lineHeight: 1.55 }}>
                  <li>Try a city name</li>
                  <li>Try an event or church name</li>
                  <li>Combine terms for a narrower result</li>
                </ul>
              </Side>
            </div>
          </Grid>
        </Container>
      </Section>
      <PublicFooter />
    </>
  );
}
