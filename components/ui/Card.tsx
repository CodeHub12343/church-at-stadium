'use client';

import styled from 'styled-components';
import { tokens } from '@/lib/tokens';

export const Card = styled.div<{ $padded?: boolean }>`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: ${tokens.radius.lg};
  box-shadow: ${tokens.shadow.sm};
  padding: ${(p) => (p.$padded === false ? '0' : '24px 26px')};
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  h2, h3 {
    font-size: 17px;
    font-weight: 700;
  }
  a {
    color: ${tokens.color.primary};
    font-weight: 600;
    font-size: 13px;
  }
`;

export const Eyebrow = styled.div`
  color: ${tokens.color.secondary};
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;
