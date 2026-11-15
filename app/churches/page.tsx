'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Container, Section } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';
import type { MockChurchDirectory } from '@/lib/mockData';

const Hero = styled.section`
  position: relative;
  padding-bottom: 70px;
  color: #fff;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(11, 20, 40, 0.86), rgba(11, 20, 40, 0.72)),
      url('/images/6.jpg') center / cover no-repeat;
    z-index: -1;
  }
  > ${Container} { padding-top: 70px; }
  @media (max-width: ${tokens.bp.mobile}) {
    padding-bottom: 44px;
    > ${Container} { padding-top: 28px; }
  }
`;

const H1 = styled.h1`
  font-size: 68px;
  font-weight: 800;
  line-height: 1.05;
  margin-top: 14px;
  color: #fff;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 48px;
  }
`;

const Search = styled.div`
  margin-top: 24px;
  display: flex;
  gap: 10px;
  align-items: center;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  padding: 6px 6px 6px 16px;
  width: 520px;
  max-width: 100%;
  box-shadow: ${tokens.shadow.sm};
  input {
    flex: 1;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: 14.5px;
    padding: 8px 4px;
    background: transparent;
  }
`;

const Filters = styled.div`
  padding: 16px 0 24px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 1px solid ${tokens.color.border};
`;

const Chip = styled.button<{ $on?: boolean }>`
  padding: 9px 14px;
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
  padding: 40px 0 80px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const ChurchCard = styled.article`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.15s;
  &:hover {
    border-color: ${tokens.color.secondary};
    box-shadow: ${tokens.shadow.md};
    transform: translateY(-2px);
  }
`;

const Avatar = styled.div<{ $bg: string }>`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: ${(p) => p.$bg};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 17px;
  flex-shrink: 0;
`;

const regions = ['All', 'Europe', 'Africa', 'Americas', 'Asia'];

export default function ChurchesDirectoryPage() {
  const [region, setRegion] = useState('All');
  const [q, setQ] = useState('');
  const [churchDirectory, setChurchDirectory] = useState<MockChurchDirectory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/churches')
      .then((r) => r.json())
      .then((d) => setChurchDirectory(d.churches ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const qq = q.toLowerCase().trim();
    return churchDirectory.filter((c) => {
      if (region !== 'All' && c.region !== region) return false;
      if (!qq) return true;
      return (
        c.name.toLowerCase().includes(qq) ||
        c.city.toLowerCase().includes(qq) ||
        c.country.toLowerCase().includes(qq)
      );
    });
  }, [region, q, churchDirectory]);

  return (
    <>
      <Hero>
        <PublicNav dark />
        <Container>
          <Eyebrow>Church network</Eyebrow>
          <H1>Congregations gathering together.</H1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.6, marginTop: 14, maxWidth: 620 }}>
            Verified churches on the platform — from across the UK, Europe, Africa, the Americas, and Asia. Join the
            network to be listed.
          </p>
          <Search>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke={tokens.color.textSecondary} strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke={tokens.color.textSecondary} strokeWidth="2" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by church, city, or country…"
            />
            <Link href="/register">
              <Button>Apply to join</Button>
            </Link>
          </Search>
        </Container>
      </Hero>

      <Container>
        <Filters>
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
            Region
          </span>
          {regions.map((r) => (
            <Chip key={r} $on={r === region} onClick={() => setRegion(r)}>
              {r}
            </Chip>
          ))}
          <div style={{ marginLeft: 'auto', color: tokens.color.textSecondary, fontSize: 12.5 }}>
            Showing <strong style={{ color: tokens.color.primary }}>{filtered.length}</strong> of {churchDirectory.length}
          </div>
        </Filters>

        <Grid>
          {loading && (
            <div style={{ gridColumn: '1 / -1', padding: 40, color: tokens.color.textSecondary }}>
              Loading churches…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 40, color: tokens.color.textSecondary }}>
              No churches match that search.
            </div>
          )}
          {filtered.map((c) => (
            <ChurchCard key={c.slug}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <Avatar $bg={`linear-gradient(135deg,${c.gradient[0]},${c.gradient[1]})`}>{c.initials}</Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: tokens.font.display,
                      fontWeight: 700,
                      fontSize: 17,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 2 }}>
                    {c.city}, {c.country}
                  </div>
                </div>
                {c.verified ? <Badge $tone="success">✓ Verified</Badge> : <Badge $tone="warning">Pending</Badge>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge $tone="neutral">{c.denomination}</Badge>
                <Badge $tone="neutral">~{c.size} members</Badge>
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 12,
                  borderTop: `1px solid ${tokens.color.surface2}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: tokens.color.textSecondary, fontSize: 12.5 }}>
                  {c.region} · Est. {c.established}
                </span>
                <Link
                  href={`/churches/${c.slug}`}
                  style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 13 }}
                >
                  View profile →
                </Link>
              </div>
            </ChurchCard>
          ))}
        </Grid>
      </Container>

      <Section $dark>
        <Container>
          <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
            <Eyebrow>Join the network</Eyebrow>
            <h2 style={{ color: '#fff', fontSize: 54, fontWeight: 800, lineHeight: 1.05, marginTop: 12 }}>
              Represent your church on the platform.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15.5, lineHeight: 1.65, marginTop: 14 }}>
              A guided five-step application takes about 15 minutes. Verification typically within 48 hours.
            </p>
            <Link href="/register" style={{ marginTop: 22, display: 'inline-block' }}>
              <Button $variant="gold">Apply to join →</Button>
            </Link>
          </div>
        </Container>
      </Section>

      <PublicFooter />
    </>
  );
}
