'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Loading } from '@/components/ui/Spinner';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { EventCard } from '@/components/events/EventCard';
import { Eyebrow } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import type { MockEvent, EventCategory } from '@/lib/mockData';
import { Reveal, Stagger, MountFade } from '@/components/motion/Reveal';

const Wrap = styled.div`
  background: #fff;
  min-height: 100vh;
`;

const HeaderBg = styled.section`
  position: relative;
  padding-bottom: 70px;
  color: #fff;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(11, 20, 40, 0.86) 0%, rgba(11, 20, 40, 0.72) 100%),
      url('/images/16.jpg') center / cover no-repeat;
    z-index: -1;
  }
  > ${Container} { padding-top: 70px; }
  @media (max-width: ${tokens.bp.mobile}) {
    padding-bottom: 44px;
    > ${Container} { padding-top: 28px; }
  }
`;

const HeadRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
  flex-wrap: wrap;
`;

const Search = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  padding: 6px 6px 6px 16px;
  width: 480px;
  box-shadow: ${tokens.shadow.sm};
  max-width: 100%;
  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14.5px;
    font-family: inherit;
    padding: 8px 4px;
    background: transparent;
  }
  button {
    background: ${tokens.color.primary};
    color: #fff;
    border: none;
    padding: 10px 18px;
    border-radius: 9px;
    font-weight: 600;
    font-size: 13.5px;
    cursor: pointer;
  }
`;

const H1 = styled.h1`
  font-size: 54px;
  font-weight: 800;
  margin-top: 10px;
  line-height: 1.05;
  color: #fff;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 34px;
  }
`;

const FiltersBg = styled.div`
  border-bottom: 1px solid ${tokens.color.border};
`;

const FiltersRow = styled.div`
  padding: 16px 0 24px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const Chip = styled.button<{ $active?: boolean }>`
  padding: 9px 14px;
  border-radius: 999px;
  background: ${(p) => (p.$active ? tokens.color.primary : '#fff')};
  border: 1px solid ${(p) => (p.$active ? tokens.color.primary : tokens.color.border)};
  color: ${(p) => (p.$active ? '#fff' : tokens.color.textPrimary)};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
`;

const Grid = styled.div`
  padding: 40px 0 80px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 24px 0 56px;
  }
`;

const EmptyState = styled.div`
  padding: 60px;
  text-align: center;
  color: ${tokens.color.textSecondary};
  grid-column: 1 / -1;
`;

const categories: ('All' | EventCategory)[] = [
  'All',
  'Stadium Worship',
  'United Prayer',
  'Gospel Crusade',
  'Conference',
  'Youth Gathering',
  'Outreach',
];

export default function EventsPage() {
  const [category, setCategory] = useState<'All' | EventCategory>('All');
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return events.filter((e) => {
      if (category !== 'All' && e.category !== category) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      );
    });
  }, [category, query, events]);

  return (
    <Wrap>
      <HeaderBg>
        <PublicNav dark />
        <Container>
          <HeadRow>
            <div>
              <MountFade $delay={0}><Eyebrow>Upcoming</Eyebrow></MountFade>
              <MountFade $delay={120}><H1>Find a gathering near you</H1></MountFade>
              <MountFade $delay={240}>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.6, marginTop: 14, maxWidth: 620 }}>
                  Stadium worship, united prayer, gospel crusades, and Christian conferences — browse everything coming up
                  across the network.
                </p>
              </MountFade>
            </div>
            <Search style={{ color: tokens.color.textPrimary }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke={tokens.color.textSecondary} strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke={tokens.color.textSecondary} strokeWidth="2" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, cities, stadiums…"
              />
              <button>Search</button>
            </Search>
          </HeadRow>
        </Container>
      </HeaderBg>

      <FiltersBg>
        <Container>
          <FiltersRow>
            <span
              style={{
                fontSize: 12,
                color: tokens.color.textSecondary,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 700,
                marginRight: 8,
              }}
            >
              Category
            </span>
            {categories.map((c) => (
              <Chip key={c} $active={c === category} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </FiltersRow>
        </Container>
      </FiltersBg>

      <Container>
        <Grid>
          {loading ? (
            <Loading label="Loading events…" />
          ) : filtered.length === 0 ? (
            <EmptyState>
              <strong>No events match that search.</strong>
              <br />
              Try removing a filter or searching for another city.
            </EmptyState>
          ) : (
            <Stagger step={70}>
              {filtered.map((e) => <EventCard key={e.slug} event={e} />)}
            </Stagger>
          )}
        </Grid>
      </Container>

      <PublicFooter />
    </Wrap>
  );
}
