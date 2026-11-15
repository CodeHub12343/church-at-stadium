'use client';

import styled from 'styled-components';
import { tokens } from '@/lib/tokens';

// Keep page content centered within a 1440px design frame on wide monitors,
// matching the canvas artboard width. All public sections use this.
export const Container = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
  box-sizing: border-box;
  @media (max-width: ${tokens.bp.tablet}) {
    padding: 0 32px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 0 18px;
  }
  @media (max-width: 480px) {
    padding: 0 16px;
  }
`;

export const Section = styled.section<{ $surface?: boolean; $dark?: boolean }>`
  padding: 100px 0;
  background: ${(p) =>
    p.$dark
      ? tokens.color.primary
      : p.$surface
      ? tokens.color.surface
      : 'transparent'};
  color: ${(p) => (p.$dark ? '#fff' : 'inherit')};
  @media (max-width: ${tokens.bp.tablet}) {
    padding: 72px 0;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 48px 0;
  }
`;
