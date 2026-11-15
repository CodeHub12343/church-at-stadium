'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, Eyebrow } from '@/components/ui/Card';

type CalEvent = {
  slug: string; title: string; dateLabel: string; start: string; end: string;
  city: string; venue: string; gradient: [string, string]; status: string;
  reference: string; partySize: number;
};

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const Chip = styled.button<{ $on?: boolean }>`
  padding: 7px 12px;
  border-radius: 8px;
  background: ${(p) => (p.$on ? tokens.color.primary : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : tokens.color.textPrimary)};
  border: 1px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.border)};
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Cal = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  overflow: hidden;
`;

const WeekHead = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: ${tokens.color.surface};
  border-bottom: 1px solid ${tokens.color.border};
  div {
    padding: 10px 12px;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    font-weight: 700;
    text-align: center;
  }
  .dow-short {
    display: none;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    div {
      padding: 6px 2px;
      font-size: 11px;
      letter-spacing: 0.04em;
    }
    .dow-full {
      display: none;
    }
    .dow-short {
      display: inline;
    }
  }
`;

const Days = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 120px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-auto-rows: 92px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-auto-rows: 54px;
  }
`;

const Cell = styled.div<{ $muted?: boolean; $today?: boolean }>`
  border-right: 1px solid ${tokens.color.surface2};
  border-bottom: 1px solid ${tokens.color.surface2};
  padding: 8px;
  color: ${(p) => (p.$muted ? tokens.color.textMuted : tokens.color.textPrimary)};
  background: ${(p) =>
    p.$today ? 'linear-gradient(180deg,#F8F4EA,#fff)' : 'transparent'};
  outline: ${(p) => (p.$today ? `2px solid ${tokens.color.secondary}` : 'none')};
  outline-offset: -2px;
  position: relative;
  min-width: 0;
  .n {
    font-size: 12.5px;
    font-weight: 700;
  }
  .ev {
    display: block;
    padding: 4px 7px;
    border-radius: 5px;
    font-size: 10.5px;
    font-weight: 600;
    line-height: 1.3;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 3px;
    color: #fff;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 4px 3px;
    .n {
      font-size: 11px;
    }
    .ev {
      padding: 0;
      margin-top: 2px;
      height: 4px;
      width: 100%;
      border-radius: 2px;
      font-size: 0;
      line-height: 0;
      color: transparent;
    }
  }
`;

const TodayDot = styled.div`
  width: 22px;
  height: 22px;
  background: ${tokens.color.primary};
  color: ${tokens.color.secondary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: ${tokens.font.display};
  font-size: 11.5px;
  @media (max-width: ${tokens.bp.mobile}) {
    width: 18px;
    height: 18px;
    font-size: 10px;
  }
`;

const DetailCard = styled.div`
  padding: 14px;
  border: 1px solid ${tokens.color.border};
  border-left: 3px solid ${tokens.color.primary};
  border-radius: 11px;
  & + & {
    margin-top: 10px;
  }
`;

function keyFor(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(keyFor(today));

  useEffect(() => {
    fetch('/api/me/events').then((r) => r.json()).then((d) => {
      const items: CalEvent[] = [...(d.upcoming ?? []), ...(d.past ?? [])].map((u: {
        reference: string; partySize: number;
        event: { slug: string; title: string; dateLabel: string; start: string; end: string; city: string; venue: string; gradient: [string, string]; status: string };
      }) => ({
        slug: u.event.slug, title: u.event.title, dateLabel: u.event.dateLabel,
        start: u.event.start, end: u.event.end, city: u.event.city, venue: u.event.venue,
        gradient: u.event.gradient, status: u.event.status, reference: u.reference, partySize: u.partySize,
      }));
      setEvents(items);
    });
  }, []);

  // Build map of day -> events (expanding start → end inclusive)
  const byDay = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    for (const ev of events) {
      const start = new Date(ev.start);
      const end = new Date(ev.end || ev.start);
      for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
        const k = keyFor(d);
        m.set(k, [...(m.get(k) ?? []), ev]);
      }
    }
    return m;
  }, [events]);

  // Build month grid
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const offset = (monthStart.getDay() + 6) % 7; // Mon-first
  const cells: Array<{ date: Date; muted: boolean }> = [];
  for (let i = 0; i < offset; i++) {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - (offset - i));
    cells.push({ date: d, muted: true });
  }
  for (let i = 1; i <= monthEnd.getDate(); i++) {
    cells.push({ date: new Date(cursor.getFullYear(), cursor.getMonth(), i), muted: false });
  }
  while (cells.length % 7 !== 0 || cells.length < 35) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, muted: d.getMonth() !== cursor.getMonth() });
    if (cells.length >= 42) break;
  }

  const selectedEvents = byDay.get(selected) ?? [];
  const monthLabel = cursor.toLocaleString('en', { month: 'long', year: 'numeric' });
  const monthCountries = new Set(
    Array.from(byDay.entries())
      .filter(([k]) => k.startsWith(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`))
      .flatMap(([, list]) => list.map((e) => e.city))
  ).size;
  const monthEventCount = Array.from(byDay.entries())
    .filter(([k]) => k.startsWith(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`))
    .length;

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Calendar</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{monthLabel}</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            {monthEventCount} {monthEventCount === 1 ? 'day' : 'days'} with events {monthCountries > 0 && `· ${monthCountries} ${monthCountries === 1 ? 'city' : 'cities'}`}
          </p>
        </div>
        <Toolbar>
          <Chip $on>Month</Chip>
          <Button $variant="secondary" $size="sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</Button>
          <Button $size="sm" onClick={() => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(keyFor(today)); }}>Today</Button>
          <Button $variant="secondary" $size="sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</Button>
        </Toolbar>
      </Head>

      <Grid>
        <Cal>
          <WeekHead>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d}>
                <span className="dow-full">{d}</span>
                <span className="dow-short">{d[0]}</span>
              </div>
            ))}
          </WeekHead>
          <Days>
            {cells.map((c, i) => {
              const k = keyFor(c.date);
              const dayEvents = byDay.get(k) ?? [];
              const isToday = keyFor(today) === k;
              return (
                <Cell
                  key={i}
                  $muted={c.muted}
                  $today={isToday}
                  onClick={() => setSelected(k)}
                  style={{ cursor: 'pointer', outline: selected === k && !isToday ? `2px solid ${tokens.color.info}` : undefined, outlineOffset: -2 }}
                >
                  {isToday ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <TodayDot>{c.date.getDate()}</TodayDot>
                      <span style={{ fontSize: 9, color: tokens.color.secondary, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>Today</span>
                    </div>
                  ) : (
                    <div className="n">{c.date.getDate()}</div>
                  )}
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.reference} className="ev" style={{ background: e.gradient[0] }}>
                      {e.title}
                    </span>
                  ))}
                </Cell>
              );
            })}
          </Days>
        </Cal>

        <aside>
          <Card>
            <div style={{ color: tokens.color.secondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
              {new Date(selected).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>
              {selectedEvents.length === 0
                ? 'Nothing scheduled'
                : `${selectedEvents.length} ${selectedEvents.length === 1 ? 'event' : 'events'} scheduled`}
            </h3>

            <div style={{ marginTop: 14 }}>
              {selectedEvents.map((e) => (
                <DetailCard key={e.reference} style={{ borderLeftColor: e.gradient[0] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 11, color: tokens.color.textSecondary, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {e.dateLabel}
                    </span>
                    <Badge $tone="success">Confirmed</Badge>
                  </div>
                  <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 15, marginTop: 6 }}>
                    {e.title}
                  </div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 3 }}>
                    {e.venue} · {e.city} · Ref {e.reference}
                  </div>
                </DetailCard>
              ))}
              {selectedEvents.length === 0 && (
                <div style={{ color: tokens.color.textSecondary, fontSize: 13 }}>
                  Pick another day, or head to <a href="/events" style={{ color: tokens.color.primary, fontWeight: 600 }}>events</a> to register.
                </div>
              )}
            </div>
          </Card>
        </aside>
      </Grid>
    </>
  );
}
