'use client';

import styled, { css } from 'styled-components';
import { tokens } from '@/lib/tokens';

const fieldBase = css`
  width: 100%;
  box-sizing: border-box;
  padding: 11px 14px;
  border: 1px solid ${tokens.color.borderStrong};
  border-radius: ${tokens.radius.md};
  background: #fff;
  color: ${tokens.color.textPrimary};
  font-family: ${tokens.font.body};
  font-size: 14px;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    outline: none;
    border-color: ${tokens.color.secondary};
    box-shadow: 0 0 0 3px rgba(198, 164, 91, 0.18);
  }

  &::placeholder {
    color: ${tokens.color.textMuted};
  }
`;

export const Input = styled.input`
  ${fieldBase}
`;

export const Select = styled.select`
  ${fieldBase}
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'><path d='M6 9l6 6 6-6' stroke='%23667085' stroke-width='2'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
`;

export const Textarea = styled.textarea`
  ${fieldBase}
  resize: vertical;
  min-height: 90px;
  line-height: 1.55;
`;

export const Label = styled.label`
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: ${tokens.color.textPrimary};
  margin-bottom: 6px;
`;

export const Hint = styled.div`
  font-size: 11.5px;
  color: ${tokens.color.textSecondary};
  margin-top: 6px;
`;

export const FieldGroup = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: ${(p) => `repeat(${p.$cols ?? 1}, 1fr)`};
  gap: 14px;
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
  }
`;
