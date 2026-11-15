'use client';

import styled, { css } from 'styled-components';
import { tokens } from '@/lib/tokens';

type Variant = 'primary' | 'gold' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  $variant?: Variant;
  $size?: Size;
  $block?: boolean;
}

const sizes = {
  sm: css`padding: 8px 14px; font-size: 12.5px;`,
  md: css`padding: 11px 20px; font-size: 14px;`,
  lg: css`padding: 14px 24px; font-size: 15px;`,
};

const variants = {
  primary: css`
    background: ${tokens.color.primary};
    color: #fff;
    border: none;
    &:hover { background: ${tokens.color.primaryDeep}; }
  `,
  gold: css`
    background: ${tokens.color.secondary};
    color: ${tokens.color.primary};
    border: none;
    &:hover { background: ${tokens.color.secondaryDeep}; color: #fff; }
  `,
  secondary: css`
    background: #fff;
    color: ${tokens.color.primary};
    border: 1px solid ${tokens.color.borderStrong};
    &:hover { background: ${tokens.color.surface}; }
  `,
  ghost: css`
    background: transparent;
    color: ${tokens.color.info};
    border: none;
    padding-left: 12px;
    padding-right: 12px;
  `,
  danger: css`
    background: #fff;
    color: ${tokens.color.errorText};
    border: 1px solid ${tokens.color.error};
    &:hover { background: ${tokens.color.errorSurface}; }
  `,
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${tokens.radius.md};
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  ${(p) => sizes[p.$size ?? 'md']}
  ${(p) => variants[p.$variant ?? 'primary']}
  ${(p) => p.$block && 'width: 100%;'}
  &:disabled {
    background: ${tokens.color.surface2};
    color: ${tokens.color.textMuted};
    border: none;
    cursor: not-allowed;
  }
`;
