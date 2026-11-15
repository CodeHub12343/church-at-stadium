'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import type { MockEvent } from '@/lib/mockData';
import { Reveal, MountFade } from '@/components/motion/Reveal';

// ── Breadcrumb ────────────────────────────────────────────────
const BreadcrumbBg = styled.div`
  background: ${tokens.color.surface};
  border-bottom: 1px solid ${tokens.color.border};
`;

const Breadcrumb = styled.div`
  padding: 14px 0;
  color: ${tokens.color.textSecondary};
  font-size: 13px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  b {
    color: ${tokens.color.primary};
    font-weight: 600;
    max-width: 55vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// ── Hero ──────────────────────────────────────────────────────
const HeroBg = styled.section<{ $g: [string, string]; $img?: string }>`
  position: relative;
  color: #fff;
  overflow: hidden;
  min-height: 460px;
  display: flex;
  align-items: flex-end;
  background:
    linear-gradient(180deg, rgba(5,10,24,0.1) 0%, rgba(5,10,24,0.55) 60%, rgba(5,10,24,0.92) 100%),
    ${(p) =>
      p.$img
        ? `url(${p.$img}) center / cover no-repeat`
        : `linear-gradient(135deg, ${p.$g[0]} 0%, ${p.$g[1]} 100%)`};
  @media (max-width: ${tokens.bp.tablet}) {
    min-height: 420px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    min-height: 360px;
  }
`;

const HeroInner = styled.div`
  padding: 48px 0 32px;
  width: 100%;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 36px 0 22px;
  }
`;

const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 18px;
`;

const H1 = styled.h1`
  color: #fff;
  font-family: ${tokens.font.display};
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.015em;
  font-size: clamp(32px, 6vw, 60px);
  overflow-wrap: anywhere;
  text-transform: capitalize;
`;

const HeroMeta = styled.div`
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14.5px;
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  align-items: center;
  .pipe {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.35);
  }
`;

// ── Fact strip ────────────────────────────────────────────────
const FactStrip = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: -32px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  box-shadow: 0 20px 60px -30px rgba(11, 20, 40, 0.3);
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
    margin-top: -24px;
  }
`;

const Fact = styled.div`
  padding: 18px 22px;
  border-left: 1px solid ${tokens.color.border};
  &:first-child { border-left: none; }
  .lbl {
    color: ${tokens.color.textSecondary};
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .val {
    margin-top: 6px;
    font-family: ${tokens.font.display};
    font-weight: 700;
    font-size: 16px;
    color: ${tokens.color.primary};
    overflow-wrap: anywhere;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    border-left: none;
    border-top: 1px solid ${tokens.color.border};
    &:first-child { border-top: none; }
    padding: 14px 18px;
  }
`;

// ── Body ──────────────────────────────────────────────────────
const Body = styled.div`
  padding: 40px 0 72px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 40px;
  align-items: start;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 30px 0 48px;
  }
`;

const Section = styled.section`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 16px;
  padding: 26px 28px;
  & + & { margin-top: 20px; }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 22px 18px;
  }
`;

const SectionHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  .eyebrow {
    color: ${tokens.color.secondary};
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  h2 {
    font-family: ${tokens.font.display};
    font-size: 22px;
    font-weight: 700;
    margin-top: 4px;
    letter-spacing: -0.01em;
  }
`;

const Para = styled.p`
  color: ${tokens.color.textSecondary};
  font-size: 15px;
  line-height: 1.7;
  overflow-wrap: anywhere;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: ${tokens.color.border};
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  overflow: hidden;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DetailCell = styled.div`
  background: #fff;
  padding: 14px 16px;
  .lbl {
    color: ${tokens.color.textSecondary};
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .val {
    font-size: 14.5px;
    font-weight: 600;
    color: ${tokens.color.textPrimary};
    overflow-wrap: anywhere;
    line-height: 1.4;
  }
`;

// ── Sidebar ───────────────────────────────────────────────────
const Side = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (min-width: 1024px) {
    position: sticky;
    top: 24px;
  }
`;

const RegCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 10px 30px -20px rgba(11, 20, 40, 0.3);
`;

const CapacityBar = styled.div<{ $pct: number }>`
  height: 8px;
  border-radius: 999px;
  background: ${tokens.color.surface2};
  overflow: hidden;
  &::after {
    content: '';
    display: block;
    width: ${(p) => Math.min(100, Math.max(0, p.$pct))}%;
    height: 100%;
    background: linear-gradient(90deg, ${tokens.color.secondary}, ${tokens.color.primary});
    transition: width 0.4s ease;
  }
`;

const VenueCard = styled.div`
  background: linear-gradient(135deg, #0b1428, ${tokens.color.primary});
  color: #fff;
  border-radius: 18px;
  padding: 22px 24px;
`;

function formatDateRange(startIso: string, endIso: string, fallback: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime())) return fallback;
  const fmt = (d: Date) =>
    d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
  if (Number.isNaN(e.getTime()) || s.toDateString() === e.toDateString()) return fmt(s);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()} – ${e.getDate()} ${s.toLocaleString('en', { month: 'short', year: 'numeric' })}`;
  }
  return `${fmt(s)} – ${fmt(e)}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
}

function daysUntil(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Math.ceil((d.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return diff;
}

export default function EventDetail({ params }: { params: { slug: string } }) {
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'missing'>('loading');

  useEffect(() => {
    fetch(`/api/events/${encodeURIComponent(params.slug)}`)
      .then(async (r) => {
        if (r.status === 404) { setStatus('missing'); return; }
        const d = await r.json();
        setEvent(d.event);
        setStatus('found');
      })
      .catch(() => setStatus('missing'));
  }, [params.slug]);

  if (status === 'loading') {
    return (
      <>
        <PublicNav />
        <Container><div style={{ padding: '80px 0', color: tokens.color.textSecondary }}>Loading event…</div></Container>
      </>
    );
  }

  if (status === 'missing' || !event) {
    return (
      <>
        <PublicNav />
        <Container>
          <div style={{ padding: '80px 0' }}>
            <h1 style={{ fontSize: 32, fontWeight: 700 }}>Event not found</h1>
            <p style={{ color: tokens.color.textSecondary, marginTop: 8 }}>
              We couldn&apos;t find that gathering.{' '}
              <Link href="/events" style={{ color: tokens.color.primary, fontWeight: 600 }}>Back to all events</Link>
            </p>
          </div>
        </Container>
      </>
    );
  }

  const dateRange = formatDateRange(event.start, event.end, event.dateLabel);
  const time = formatTime(event.start);
  const days = daysUntil(event.start);
  const upcoming = days != null && days >= 0;
  const expected = event.expected?.trim() || '—';
  const capacityPct = Number(event.capacityPct) || 0;

  return (
    <>
      <PublicNav />

      <BreadcrumbBg>
        <Container>
          <Breadcrumb>
            <Link href="/events">Events</Link>
            <span>/</span>
            <Link href={`/events?category=${encodeURIComponent(event.category)}`}>{event.category}</Link>
            <span>/</span>
            <b>{event.title}</b>
          </Breadcrumb>
        </Container>
      </BreadcrumbBg>

      <HeroBg $g={event.gradient} $img={event.image}>
        <Container>
          <HeroInner>
            <MountFade $delay={0}>
            <ChipRow>
              <Badge $tone="gold">{event.category}</Badge>
              {event.status === 'Open' && <Badge $tone="success">● Registration open</Badge>}
              {event.status === 'Invitation' && <Badge $tone="info">By invitation</Badge>}
              {event.status === 'Draft' && <Badge $tone="warning">Draft</Badge>}
              {upcoming && days != null && days <= 60 && (
                <Badge $tone="neutral">
                  {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
                </Badge>
              )}
            </ChipRow>
            </MountFade>
            <MountFade $delay={140}><H1>{event.title}</H1></MountFade>
            <MountFade $delay={300}>
              <HeroMeta>
                <span>📅 {dateRange}{time ? ` · ${time}` : ''}</span>
                <span className="pipe" />
                <span>📍 {event.venue}, {event.city}</span>
              </HeroMeta>
            </MountFade>
          </HeroInner>
        </Container>
      </HeroBg>

      <Container>
        <Reveal distance={32}>
        <FactStrip>
          <Fact>
            <div className="lbl">When</div>
            <div className="val">{dateRange}</div>
          </Fact>
          <Fact>
            <div className="lbl">Where</div>
            <div className="val">{event.venue} · {event.city}, {event.country}</div>
          </Fact>
          <Fact>
            <div className="lbl">Expected attendance</div>
            <div className="val">{expected}</div>
          </Fact>
        </FactStrip>
        </Reveal>

        <Body>
          <div>
            <Reveal delay={60}>
            <Section>
              <SectionHead>
                <div>
                  <div className="eyebrow">About this gathering</div>
                  <h2>{event.title}</h2>
                </div>
              </SectionHead>
              <Para>
                A {event.category.toLowerCase()} hosted at <strong style={{ color: tokens.color.textPrimary }}>{event.venue}</strong> in {event.city}, {event.country}
                {time ? <> on <strong style={{ color: tokens.color.textPrimary }}>{dateRange} at {time}</strong></> : <> on <strong style={{ color: tokens.color.textPrimary }}>{dateRange}</strong></>}.
                {expected !== '—' && <> Around {expected} expected.</>} Registration is open to anyone — invite your friends and travel together with your church.
              </Para>
            </Section>
            </Reveal>

            <Reveal delay={120}>
            <Section>
              <SectionHead>
                <div>
                  <div className="eyebrow">Details</div>
                  <h2>At a glance</h2>
                </div>
              </SectionHead>
              <DetailGrid>
                <DetailCell>
                  <div className="lbl">Category</div>
                  <div className="val">{event.category}</div>
                </DetailCell>
                <DetailCell>
                  <div className="lbl">Status</div>
                  <div className="val">{event.status}</div>
                </DetailCell>
                <DetailCell>
                  <div className="lbl">Start</div>
                  <div className="val">
                    {new Date(event.start).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </DetailCell>
                <DetailCell>
                  <div className="lbl">End</div>
                  <div className="val">
                    {new Date(event.end).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </DetailCell>
                <DetailCell>
                  <div className="lbl">Venue</div>
                  <div className="val">{event.venue}</div>
                </DetailCell>
                <DetailCell>
                  <div className="lbl">Location</div>
                  <div className="val">{event.city}, {event.country}</div>
                </DetailCell>
                <DetailCell>
                  <div className="lbl">Participating churches</div>
                  <div className="val">{event.churches || '—'}</div>
                </DetailCell>
                <DetailCell>
                  <div className="lbl">Expected</div>
                  <div className="val">{expected}</div>
                </DetailCell>
              </DetailGrid>
            </Section>
            </Reveal>
          </div>

          <Side>
            <RegCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Registration
                  </div>
                  <div style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 24, color: tokens.color.primary, marginTop: 4, lineHeight: 1.1 }}>
                    Free · Open
                  </div>
                </div>
                {event.status === 'Open'
                  ? <Badge $tone="success" $withDot>Available</Badge>
                  : <Badge $tone="neutral">Closed</Badge>}
              </div>

              {capacityPct > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                    <span style={{ color: tokens.color.textSecondary }}>Capacity</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{capacityPct}% filled</span>
                  </div>
                  <CapacityBar $pct={capacityPct} />
                </div>
              )}

              <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {event.status === 'Open' ? (
                  <>
                    <Link href={`/events/${event.slug}/register`}><Button $block>Register now</Button></Link>
                    <Link href={`/events/${event.slug}/register`}><Button $variant="secondary" $block>Register a group</Button></Link>
                  </>
                ) : (
                  <Button $block disabled>Registration closed</Button>
                )}
              </div>

              <div style={{ marginTop: 16, fontSize: 12, color: tokens.color.textSecondary, lineHeight: 1.5 }}>
                Registering reserves your spot. Attendance is confirmed by on-site check-in.
              </div>

              <div style={{
                marginTop: 18,
                padding: '14px 16px',
                borderRadius: 12,
                background: tokens.color.secondarySoft,
                border: `1px solid ${tokens.color.secondary}33`,
              }}>
                <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: tokens.color.primary }}>
                  Community access · 10% free
                </div>
                <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.55, color: tokens.color.textPrimary }}>
                  Free tickets for EBT holders — verified with ID at entry. Mother + child pair: one free child ticket.
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link href={`/events/${event.slug}/community-ticket`}>
                    <Button $size="sm">Request community ticket</Button>
                  </Link>
                  <Link href="/community-access" style={{ color: tokens.color.info, fontSize: 12.5, fontWeight: 600, alignSelf: 'center' }}>
                    How it works →
                  </Link>
                </div>
              </div>
            </RegCard>

            <VenueCard>
              <div style={{ color: tokens.color.secondary, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Venue
              </div>
              <div style={{ marginTop: 8, fontFamily: tokens.font.display, fontWeight: 700, fontSize: 18 }}>
                {event.venue}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13.5, marginTop: 4 }}>
                {event.city}, {event.country}
              </div>
              <div style={{ marginTop: 14 }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.city} ${event.country}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: tokens.color.secondary, fontSize: 13, fontWeight: 600 }}
                >
                  Open in maps →
                </a>
              </div>
            </VenueCard>
          </Side>
        </Body>
      </Container>

      <PublicFooter />
    </>
  );
}
