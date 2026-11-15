'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import type { MockEvent } from '@/lib/mockData';

const Card = styled.article`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${tokens.shadow.sm};
  display: flex;
  flex-direction: column;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${tokens.shadow.md};
  }
`;

const Cover = styled.div<{ $g: [string, string]; $img?: string }>`
  height: 200px;
  background: ${(p) =>
    p.$img
      ? `linear-gradient(180deg, rgba(11,20,40,0.05) 0%, rgba(11,20,40,0.55) 100%), url(${p.$img}) center / cover no-repeat`
      : `linear-gradient(135deg, ${p.$g[0]}, ${p.$g[1]})`};
  position: relative;
  padding: 16px;
  @media (max-width: ${tokens.bp.mobile}) {
    height: 120px;
    padding: 10px;
  }
`;

const CatPill = styled.span`
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 5px 10px;
  border-radius: 999px;
`;

const Body = styled.div`
  padding: 20px 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 12px 12px 14px;
    gap: 6px;
  }
`;

const Date = styled.div`
  color: ${tokens.color.secondary};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 10.5px;
    letter-spacing: 0.06em;
  }
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 15px;
    line-height: 1.25;
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${tokens.color.textSecondary};
  font-size: 13.5px;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 11.5px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${tokens.color.surface2};
  margin-top: auto;
`;

const Foot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${tokens.color.textSecondary};
  font-size: 13px;
  gap: 8px;
  a {
    color: ${tokens.color.primary};
    font-weight: 600;
    white-space: nowrap;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    font-size: 11.5px;
    gap: 6px;
  }
`;

export function EventCard({ event }: { event: MockEvent }) {
  return (
    <Card>
      <Cover $g={event.gradient} $img={event.image}>
        <CatPill>{event.category}</CatPill>
        <span
          title="10% of tickets are free for EBT holders"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            fontSize: 10.5,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 700,
            padding: '5px 9px',
            borderRadius: 999,
            background: 'rgba(198, 164, 91, 0.92)',
            color: '#101B32',
          }}
        >
          10% community free
        </span>
      </Cover>
      <Body>
        <Date>{event.dateLabel}</Date>
        <Title>{event.title}</Title>
        <Meta>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 22s-7-7-7-13a7 7 0 1114 0c0 6-7 13-7 13z"
              stroke={tokens.color.textSecondary}
              strokeWidth="1.8"
            />
            <circle cx="12" cy="9" r="2.5" stroke={tokens.color.textSecondary} strokeWidth="1.8" />
          </svg>
          {event.venue} · {event.city}
        </Meta>
        <Divider />
        <Foot>
          <span>
            {event.churches} churches · {event.expected} expected
          </span>
          <Link href={`/events/${event.slug}`}>Details →</Link>
        </Foot>
      </Body>
    </Card>
  );
}
