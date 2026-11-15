'use client';

import styled, { keyframes } from 'styled-components';
import { tokens } from '@/lib/tokens';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

interface SpinnerProps {
  $size?: number;
  $thickness?: number;
  $color?: string;
  $track?: string;
}

export const Spinner = styled.span<SpinnerProps>`
  display: inline-block;
  width: ${(p) => p.$size ?? 20}px;
  height: ${(p) => p.$size ?? 20}px;
  border-radius: 50%;
  border: ${(p) => p.$thickness ?? 2.5}px solid ${(p) => p.$track ?? 'rgba(11, 20, 40, 0.1)'};
  border-top-color: ${(p) => p.$color ?? tokens.color.secondary};
  animation: ${spin} 0.7s linear infinite;
  flex-shrink: 0;
`;

const Wrap = styled.div<{ $pad?: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: ${(p) => p.$pad ?? 40}px 20px;
  color: ${tokens.color.textSecondary};
  font-size: 13.5px;
  letter-spacing: 0.01em;
`;

interface LoadingProps {
  label?: string;
  size?: number;
  pad?: number;
  color?: string;
}

export function Loading({ label = 'Loading…', size = 26, pad, color }: LoadingProps) {
  return (
    <Wrap $pad={pad} role="status" aria-live="polite">
      <Spinner $size={size} $color={color} />
      <span>{label}</span>
    </Wrap>
  );
}

const Row = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${tokens.color.textSecondary};
`;

export function InlineLoading({ label = 'Loading…', size = 14 }: { label?: string; size?: number }) {
  return (
    <Row role="status" aria-live="polite">
      <Spinner $size={size} $thickness={2} />
      <span>{label}</span>
    </Row>
  );
}
