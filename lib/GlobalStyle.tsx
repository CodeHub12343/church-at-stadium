'use client';

import { createGlobalStyle } from 'styled-components';
import { tokens } from './tokens';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; overflow-x: hidden; }
  body {
    font-family: ${tokens.font.body};
    color: ${tokens.color.textPrimary};
    background: ${tokens.color.bg};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 15px;
    line-height: 1.55;
  }
  h1, h2, h3, h4, h5 {
    font-family: ${tokens.font.display};
    color: ${tokens.color.primary};
    letter-spacing: -0.015em;
    margin: 0;
  }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; cursor: pointer; }
  input, textarea, select { font-family: inherit; }
  img, svg, video { max-width: 100%; height: auto; }
  .mono { font-variant-numeric: tabular-nums; }
  :focus-visible { outline: 2px solid ${tokens.color.secondary}; outline-offset: 2px; }

  /* Mobile typography pass — caps any oversized heading (including inline-styled ones) so */
  /* pages that were authored at desktop sizes don't shout on a phone. !important lets us */
  /* override the many legacy inline style={{fontSize:…}} props without touching each one. */
  @media (max-width: ${tokens.bp.mobile}) {
    body {
      font-size: 14.5px;
      line-height: 1.6;
    }
    h1 {
      font-size: clamp(28px, 8.4vw, 40px) !important;
      line-height: 1.1 !important;
    }
    h2 {
      font-size: clamp(20px, 5.8vw, 26px) !important;
      line-height: 1.18 !important;
    }
    h3 {
      font-size: clamp(16px, 4.4vw, 19px) !important;
      line-height: 1.25 !important;
    }
    h4 {
      font-size: 15px !important;
      line-height: 1.3 !important;
    }
    main p {
      font-size: 14px;
      line-height: 1.65;
    }
    main table {
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    /* Common oversize-display-number class conventions used across pages. */
    /* Cap them on mobile so hero/stat numbers don't dwarf their labels or headings. */
    .num,
    .stat-num,
    .big-num,
    .kpi-val,
    .v {
      font-size: clamp(20px, 6vw, 28px) !important;
      line-height: 1.1 !important;
    }
  }

  @media (max-width: 480px) {
    body {
      font-size: 14px;
    }
  }
`;
