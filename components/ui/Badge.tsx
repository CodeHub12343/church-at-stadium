'use client';

import styled, { css } from 'styled-components';
import { tokens } from '@/lib/tokens';

export type BadgeTone =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'gold'
  | 'dark';

const tones: Record<BadgeTone, ReturnType<typeof css>> = {
  success: css`background: ${tokens.color.successBg}; color: ${tokens.color.successText};`,
  warning: css`background: ${tokens.color.warningBg}; color: ${tokens.color.warningText};`,
  error: css`background: ${tokens.color.errorBg}; color: ${tokens.color.errorText};`,
  info: css`background: ${tokens.color.infoBg}; color: ${tokens.color.infoText};`,
  neutral: css`background: ${tokens.color.surface2}; color: ${tokens.color.textPrimary};`,
  gold: css`background: ${tokens.color.secondarySoft}; color: ${tokens.color.warningText};`,
  dark: css`background: ${tokens.color.primary}; color: ${tokens.color.secondary};`,
};

export const Badge = styled.span<{ $tone?: BadgeTone; $withDot?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: ${tokens.radius.pill};
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.3;
  white-space: nowrap;
  ${(p) => tones[p.$tone ?? 'neutral']}

  ${(p) =>
    p.$withDot &&
    css`
      &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        flex-shrink: 0;
      }
    `}
`;
