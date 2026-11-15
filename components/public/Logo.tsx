'use client';

import styled from 'styled-components';
import { tokens } from '@/lib/tokens';

const Wrap = styled.div<{ $dark?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 12px;
`;

const Mark = styled.div<{ $dark?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: ${(p) => (p.$dark ? 'rgba(198,164,91,0.14)' : tokens.color.primary)};
  border: ${(p) => (p.$dark ? '1px solid rgba(198,164,91,0.35)' : 'none')};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Word = styled.span<{ $dark?: boolean }>`
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 16px;
  color: ${(p) => (p.$dark ? '#fff' : tokens.color.primary)};
  letter-spacing: -0.01em;
`;

export function Logo({ dark }: { dark?: boolean }) {
  return (
    <Wrap $dark={dark}>
      <Mark $dark={dark}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 20V10l8-6 8 6v10h-5v-6H9v6H4z"
            stroke={tokens.color.secondary}
            strokeWidth="1.8"
          />
        </svg>
      </Mark>
      <Word $dark={dark}>Church at the Stadiums</Word>
    </Wrap>
  );
}
