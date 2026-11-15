'use client';

import { Children, isValidElement, ReactNode } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useInView } from './useInView';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: ReactNode;
  delay?: number;        // ms
  duration?: number;     // ms
  distance?: number;     // px
  direction?: Direction;
  className?: string;
}

function offsetFor(direction: Direction, distance: number): string {
  switch (direction) {
    case 'up':    return `translate3d(0, ${distance}px, 0)`;
    case 'down':  return `translate3d(0, -${distance}px, 0)`;
    case 'left':  return `translate3d(${distance}px, 0, 0)`;
    case 'right': return `translate3d(-${distance}px, 0, 0)`;
    default:      return 'none';
  }
}

const Wrapper = styled.div<{
  $in: boolean;
  $delay: number;
  $duration: number;
  $offset: string;
}>`
  opacity: ${(p) => (p.$in ? 1 : 0)};
  transform: ${(p) => (p.$in ? 'none' : p.$offset)};
  transition:
    opacity ${(p) => p.$duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${(p) => p.$delay}ms,
    transform ${(p) => p.$duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${(p) => p.$delay}ms;
  will-change: opacity, transform;

  @media (prefers-reduced-motion: reduce) {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
`;

export function Reveal({
  children,
  delay = 0,
  duration = 700,
  distance = 24,
  direction = 'up',
  className,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Wrapper
      ref={ref}
      className={className}
      $in={inView}
      $delay={delay}
      $duration={duration}
      $offset={offsetFor(direction, distance)}
    >
      {children}
    </Wrapper>
  );
}

// Staggers immediate children by `step` ms, each wrapped in a Reveal.
export function Stagger({
  children,
  step = 90,
  initialDelay = 0,
  duration,
  direction = 'up',
  distance,
}: {
  children: ReactNode;
  step?: number;
  initialDelay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
}) {
  const items = Children.toArray(children);
  return (
    <>
      {items.map((child, i) =>
        isValidElement(child) ? (
          <Reveal
            key={child.key ?? i}
            delay={initialDelay + i * step}
            duration={duration}
            direction={direction}
            distance={distance}
          >
            {child}
          </Reveal>
        ) : (
          child
        )
      )}
    </>
  );
}

// A one-shot hero animation that fires on mount (no scroll required).
const heroIn = keyframes`
  from { opacity: 0; transform: translate3d(0, 18px, 0); }
  to   { opacity: 1; transform: none; }
`;

export const MountFade = styled.div<{ $delay?: number; $duration?: number }>`
  animation: ${heroIn} ${(p) => p.$duration ?? 700}ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${(p) => p.$delay ?? 0}ms;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`;

// Subtle hover lift for cards (used in event list, etc).
export const LiftCard = css`
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s;
  will-change: transform;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -24px rgba(11, 20, 40, 0.3);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; box-shadow: none; }
  }
`;
