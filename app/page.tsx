'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';
import { Container, Section } from '@/components/ui/Container';
import { EventCard } from '@/components/events/EventCard';
import { useEffect, useState } from 'react';
import type { MockEvent } from '@/lib/mockData';
import { Reveal, Stagger, MountFade } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';

/* ==========================================================================
   HERO  —  stadium backdrop + headline + featured event card
   ========================================================================== */

const HeroBg = styled.section`
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: ${tokens.color.primary};
`;

const HeroImage = styled.div`
  position: absolute;
  inset: 0;
  background-image: url('/images/18.jpg');
  background-size: cover;
  background-position: center 30%;
  z-index: -2;
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1200px 600px at 75% 15%, rgba(42, 62, 111, 0.55) 0%, transparent 70%),
    linear-gradient(135deg, rgba(11, 20, 40, 0.92) 0%, rgba(16, 27, 50, 0.88) 55%, rgba(23, 38, 74, 0.82) 100%);
  z-index: -1;
`;

const HeroInner = styled.div`
  padding: 60px 0 120px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 56px;
  align-items: start;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    padding: 40px 0 80px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 24px 0 56px;
    gap: 32px;
  }
`;

const H1 = styled.h1`
  font-size: 68px;
  font-weight: 800;
  line-height: 1.02;
  color: #fff;
  margin-top: 18px;
  @media (max-width: ${tokens.bp.tablet}) {
    font-size: 48px;
  }
`;

const Sub = styled.p`
  color: rgba(255, 255, 255, 0.84);
  font-size: 18px;
  line-height: 1.55;
  max-width: 560px;
  margin: 22px 0 0;
  @media (max-width: ${tokens.bp.tablet}) {
    font-size: 16px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 14px;
    margin-top: 16px;
  }
`;

const HeroActions = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 32px;
  flex-wrap: wrap;
`;

const HeroStats = styled.div`
  display: flex;
  gap: 42px;
  margin-top: 48px;
  flex-wrap: wrap;
  @media (max-width: ${tokens.bp.mobile}) {
    gap: 24px;
    margin-top: 32px;
  }
`;

const Stat = styled.div`
  .num {
    font-family: ${tokens.font.display};
    font-weight: 700;
    font-size: 32px;
    color: ${tokens.color.secondary};
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
  }
  .label {
    color: rgba(255, 255, 255, 0.72);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-top: 4px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    .num {
      font-size: 22px;
    }
    .label {
      font-size: 10.5px;
    }
  }
`;

const FeaturedCard = styled.div`
  background: rgba(16, 27, 50, 0.6);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  overflow: hidden;
  color: #fff;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
`;

const FeaturedCover = styled.div`
  height: 180px;
  position: relative;
  background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.75)), url('/images/14.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 16px 18px;
`;

/* ==========================================================================
   MOVEMENT COLLAGE  —  mosaic of real moments
   ========================================================================== */

const MovementBand = styled.section`
  padding: 72px 0 24px;
  background: #fff;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 40px 0 8px;
  }
`;

const MovementHead = styled.div`
  text-align: center;
  max-width: 720px;
  margin: 0 auto 40px;
  h2 {
    font-size: 40px;
    font-weight: 800;
    line-height: 1.1;
    margin-top: 10px;
  }
  p {
    color: ${tokens.color.textSecondary};
    font-size: 16.5px;
    line-height: 1.65;
    margin-top: 14px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    margin-bottom: 24px;
    h2 {
      font-size: 24px;
    }
    p {
      font-size: 14px;
      margin-top: 10px;
    }
  }
`;

const Mosaic = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 160px;
  gap: 12px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-auto-rows: 120px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-auto-rows: 70px;
    gap: 6px;
  }
`;

const Tile = styled.div<{ $img: string; $c: string; $r: string }>`
  grid-column: ${(p) => p.$c};
  grid-row: ${(p) => p.$r};
  background: url(${(p) => p.$img}) center / cover no-repeat;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: transform 0.4s ease;
  &:hover {
    transform: scale(1.02);
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(11, 20, 40, 0.45) 100%);
  }
  .caption {
    position: absolute;
    left: 14px;
    bottom: 12px;
    right: 14px;
    z-index: 1;
    color: #fff;
    font-family: ${tokens.font.display};
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.01em;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  }
  @media (max-width: ${tokens.bp.mobile}) {
    border-radius: 10px;
    .caption {
      font-size: 10px;
      font-weight: 700;
      left: 8px;
      bottom: 6px;
      right: 8px;
      letter-spacing: 0;
      line-height: 1.2;
    }
  }
`;

/* ==========================================================================
   MISSION
   ========================================================================== */

const MissionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 80px;
  align-items: start;
  & > * {
    min-width: 0;
  }
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const MissionH = styled.h2`
  font-size: 44px;
  font-weight: 700;
  line-height: 1.08;
  margin-top: 16px;
  @media (max-width: ${tokens.bp.tablet}) {
    font-size: 32px;
  }
`;

const Four = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 40px;
  position: relative;

  /* Zig-zag on desktop: push the 2nd and 4th cards down for rhythm */
  & > :nth-child(2) { transform: translateY(32px); }
  & > :nth-child(4) { transform: translateY(32px); }

  @media (max-width: ${tokens.bp.mobile}) {
    display: flex;
    grid-template-columns: none;
    gap: 14px;
    margin-top: 28px;
    overflow-x: auto;
    max-width: 100%;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding: 4px 4px 20px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    & > * {
      transform: none !important;
      flex: 0 0 84%;
      scroll-snap-align: start;
    }
  }
`;

const FourItem = styled.div`
  position: relative;
  padding: 26px 24px 24px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfaf4 100%);
  border: 1px solid ${tokens.color.border};
  border-left: 3px solid ${tokens.color.secondary};
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(11, 20, 40, 0.04);
  overflow: hidden;
  isolation: isolate;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 12px 28px rgba(11, 20, 40, 0.1);
  }

  .num {
    position: absolute;
    top: -14px;
    right: 10px;
    font-family: ${tokens.font.display};
    font-weight: 800;
    font-size: 86px;
    line-height: 1;
    color: ${tokens.color.secondary};
    opacity: 0.14;
    letter-spacing: -0.04em;
    user-select: none;
    pointer-events: none;
    z-index: -1;
  }

  h3 {
    font-size: 19px;
    margin-top: 14px;
    font-weight: 700;
  }
  p {
    font-size: 14.5px;
    line-height: 1.6;
    color: ${tokens.color.textSecondary};
    margin-top: 6px;
  }
`;

const IconTile = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${tokens.color.secondarySoft};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SwipeHint = styled.div`
  display: none;
  @media (max-width: ${tokens.bp.mobile}) {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 14px;
    padding-left: 2px;
    font-size: 11.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    font-weight: 600;
    opacity: 0.7;
  }
`;

/* ==========================================================================
   SIGNATURE VENUES  —  cinematic stadium cards
   ========================================================================== */

const VenuesHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 32px;
  h2 {
    font-size: 36px;
    margin-top: 10px;
    font-weight: 700;
    max-width: 580px;
    line-height: 1.1;
  }
`;

const VenuesGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  grid-auto-rows: 380px;
  gap: 16px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: 300px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
    grid-auto-rows: 240px;
    gap: 10px;
  }
`;

const VenueCard = styled(Link)<{ $img: string }>`
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  color: #fff;
  background: url(${(p) => p.$img}) center / cover no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(11, 20, 40, 0.15) 30%, rgba(11, 20, 40, 0.88) 100%);
  }
  & > * {
    position: relative;
    z-index: 1;
  }
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 30px 50px rgba(0, 0, 0, 0.3);
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 18px;
    border-radius: 14px;
  }
`;

const VenueBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  background: rgba(198, 164, 91, 0.2);
  border: 1px solid rgba(198, 164, 91, 0.45);
  color: ${tokens.color.secondary};
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  border-radius: 999px;
  align-self: flex-start;
`;

/* ==========================================================================
   STORIES  —  pastoral testimonials
   ========================================================================== */

const StoriesBand = styled.section`
  padding: 100px 0;
  background: ${tokens.color.primary};
  color: #fff;
  @media (max-width: ${tokens.bp.tablet}) {
    padding: 72px 0;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 48px 0;
  }
`;

const StoriesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-top: 44px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StoryCard = styled.article`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  &:hover {
    border-color: rgba(198, 164, 91, 0.35);
  }
`;

const Quote = styled.p`
  font-size: 17px;
  line-height: 1.65;
  color: #fff;
  font-weight: 500;
  flex: 1;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 14.5px;
  }
`;

const StoryAuthor = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const StoryAvatar = styled.div<{ $img: string }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: url(${(p) => p.$img}) center / cover no-repeat;
  flex-shrink: 0;
`;

/* ==========================================================================
   FIVE WAYS TO JOIN
   ========================================================================== */

const WaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-top: 36px;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const WayCard = styled(Link)<{ $img: string }>`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  min-height: 340px;
  background: url(${(p) => p.$img}) center / cover no-repeat;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 22px;
  transition: transform 0.3s ease;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(11, 20, 40, 0.05) 0%, rgba(11, 20, 40, 0.85) 100%);
  }
  & > * {
    position: relative;
    z-index: 1;
  }
  h3 {
    color: #fff;
    font-size: 22px;
    font-weight: 700;
    margin-top: 12px;
  }
  p {
    font-size: 13.5px;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.78);
    margin: 10px 0 14px;
  }
  .arrow {
    color: ${tokens.color.secondary};
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  &:hover {
    transform: translateY(-3px);
  }
  @media (max-width: ${tokens.bp.mobile}) {
    min-height: 240px;
    padding: 18px;
  }
`;

const WayIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tokens.color.secondary};
`;

/* ==========================================================================
   UPCOMING EVENTS
   ========================================================================== */

const EventsHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 36px;
  gap: 16px;
  flex-wrap: wrap;
  h2 {
    font-size: 36px;
    margin-top: 10px;
    font-weight: 700;
  }
  a {
    color: ${tokens.color.primary};
    font-weight: 600;
    font-size: 14.5px;
    border-bottom: 1.5px solid ${tokens.color.secondary};
    padding-bottom: 2px;
  }
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;

/* ==========================================================================
   NETWORK STEPS
   ========================================================================== */

const NetworkGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  position: relative;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const NetworkH = styled.h2`
  color: #fff;
  font-size: 40px;
  margin-top: 14px;
  line-height: 1.1;
  font-weight: 700;
  @media (max-width: ${tokens.bp.tablet}) {
    font-size: 30px;
  }
`;

const NetworkSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const StepCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 18px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const StepNum = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: ${tokens.color.secondary};
  color: ${tokens.color.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: ${tokens.font.display};
  flex-shrink: 0;
`;

/* ==========================================================================
   BEHIND THE SCENES  —  volunteer departments + photo mosaic
   ========================================================================== */

const BehindGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const BehindPhotos = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 14px;
  min-height: 460px;
  @media (max-width: ${tokens.bp.mobile}) {
    min-height: 300px;
    gap: 10px;
  }
`;

const BehindTile = styled.div<{ $img: string; $big?: boolean }>`
  background: url(${(p) => p.$img}) center / cover no-repeat;
  border-radius: 16px;
  grid-row: ${(p) => (p.$big ? 'span 2' : 'auto')};
  box-shadow: 0 10px 30px rgba(11, 20, 40, 0.15);
`;

const DeptRow = styled.div`
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const DeptPill = styled.span`
  padding: 9px 14px;
  border-radius: 999px;
  background: ${tokens.color.surface2};
  color: ${tokens.color.textPrimary};
  font-size: 13.5px;
  font-weight: 600;
`;

/* ==========================================================================
   IMPACT STRIPE  —  dark stats band
   ========================================================================== */

const ImpactBand = styled.section`
  position: relative;
  padding: 100px 0;
  color: #fff;
  overflow: hidden;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(11, 20, 40, 0.88), rgba(11, 20, 40, 0.82)),
      url('/images/15.jpg') center / cover no-repeat;
    z-index: -1;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 56px 0;
  }
`;

const ImpactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 40px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ImpactStat = styled.div`
  text-align: center;
  padding: 24px 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  .num {
    font-family: ${tokens.font.display};
    font-weight: 800;
    font-size: 48px;
    color: ${tokens.color.secondary};
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .lbl {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.72);
    margin-top: 10px;
    letter-spacing: 0.03em;
  }
`;

/* ==========================================================================
   PARTNERS LOGO STRIPE
   ========================================================================== */

const LogoStripe = styled.section`
  padding: 56px 0;
  background: #fff;
  border-top: 1px solid ${tokens.color.border};
  border-bottom: 1px solid ${tokens.color.border};
`;

const LogosRow = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  align-items: center;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Logo = styled.div`
  padding: 16px 18px;
  text-align: center;
  background: ${tokens.color.surface};
  border: 1px solid ${tokens.color.border};
  border-radius: 10px;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 13.5px;
  color: ${tokens.color.primary};
  letter-spacing: 0.02em;
  text-transform: uppercase;
  opacity: 0.82;
  transition: opacity 0.2s;
  &:hover {
    opacity: 1;
  }
`;

/* ==========================================================================
   FINAL CTA
   ========================================================================== */

const FinalCTA = styled.section`
  position: relative;
  color: #fff;
  padding: 120px 0;
  isolation: isolate;
  text-align: center;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(11, 20, 40, 0.7) 0%, rgba(11, 20, 40, 0.92) 100%),
      url('/images/17.jpg') center / cover no-repeat;
    z-index: -1;
  }
  h2 {
    color: #fff;
    font-size: 54px;
    line-height: 1.05;
    font-weight: 800;
    margin: 18px auto 0;
    max-width: 820px;
  }
  p {
    color: rgba(255, 255, 255, 0.82);
    font-size: 18px;
    line-height: 1.6;
    margin: 20px auto 0;
    max-width: 640px;
  }
  @media (max-width: ${tokens.bp.tablet}) {
    padding: 80px 0;
    h2 {
      font-size: 36px;
    }
    p {
      font-size: 16px;
    }
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 56px 0;
    h2 {
      font-size: 26px;
    }
    p {
      font-size: 14px;
      margin-top: 14px;
    }
  }
`;

const CTABtns = styled.div`
  display: flex;
  gap: 14px;
  justify-content: center;
  margin-top: 36px;
  flex-wrap: wrap;
`;

/* ==========================================================================
   NEWSLETTER
   ========================================================================== */

const NewsBand = styled.section`
  padding: 72px 0;
  background: ${tokens.color.surface};
  border-top: 1px solid ${tokens.color.border};
  border-bottom: 1px solid ${tokens.color.border};
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 48px 0;
  }
`;

const NewsInner = styled.div`
  display: flex;
  gap: 48px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  h2 {
    font-size: 28px;
    font-weight: 700;
  }
  p {
    color: ${tokens.color.textSecondary};
    font-size: 15.5px;
    margin-top: 8px;
    max-width: 480px;
  }
`;

const NewsForm = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  input {
    padding: 13px 16px;
    border: 1px solid ${tokens.color.borderStrong};
    border-radius: 10px;
    width: 300px;
    max-width: 100%;
    font-family: inherit;
    font-size: 14px;
    background: #fff;
    &:focus {
      outline: none;
      border-color: ${tokens.color.secondary};
      box-shadow: 0 0 0 3px rgba(198, 164, 91, 0.2);
    }
  }
  @media (max-width: ${tokens.bp.mobile}) {
    width: 100%;
    input {
      flex: 1;
      width: auto;
    }
  }
`;

/* ==========================================================================
   DATA
   ========================================================================== */

const venues: Array<{ slug: string; img: string; name: string; city: string; capacity: string; tag: string; date?: string; big?: boolean }> = [
  {
    slug: 'wembley-stadium',
    img: '/images/14.jpg',
    name: 'Wembley Stadium',
    city: 'London, United Kingdom',
    capacity: '90,000',
    tag: 'Signature venue',
    big: true,
  },
  {
    slug: 'mercedes-benz-stadium',
    img: '/images/19.jpg',
    name: 'Mercedes-Benz Stadium',
    city: 'Atlanta, USA',
    capacity: '71,000',
    tag: 'Partner venue',
  },
  {
    slug: 'lucas-oil',
    img: '/images/15.jpg',
    name: 'Lucas Oil Stadium',
    city: 'Indianapolis, USA',
    capacity: '67,000',
    tag: 'Partner venue',
  },
];


const ways = [
  {
    href: '/register',
    img: '/images/12.jpg',
    label: 'Churches',
    icon: '⛪',
    desc: 'Register, verify, and apply to co-host gatherings across continents.',
    cta: 'Apply to join →',
  },
  {
    href: '/volunteer',
    img: '/images/9.jpg',
    label: 'Volunteers',
    icon: '🤝',
    desc: 'Find a department that fits — ushering, prayer, media, hospitality, medical.',
    cta: 'Browse roles →',
  },
  {
    href: '/events',
    img: '/images/10.jpg',
    label: 'Attendees',
    icon: '🎫',
    desc: 'Register for yourself or your group. Digital passes, group check-in, zero cost.',
    cta: 'Find an event →',
  },
  {
    href: '/partners',
    img: '/images/7.jpg',
    label: 'Partners',
    icon: '🏟',
    desc: 'Venues, producers, suppliers — power the gatherings behind the scenes.',
    cta: 'Become a partner →',
  },
  {
    href: '/mission',
    img: '/images/11.jpg',
    label: 'Prayer teams',
    icon: '🙏',
    desc: 'Intercessors and prayer walkers form the heartbeat of every event.',
    cta: 'Join a team →',
  },
];

const mosaicTiles = [
  { img: '/images/19.jpg', col: 'span 7', row: 'span 2', caption: 'Stadium worship' },
  { img: '/images/20.jpg', col: 'span 5', row: 'span 2', caption: 'On the main stage' },
  { img: '/images/21.jpg', col: 'span 3', row: 'span 2', caption: 'Hands raised in praise' },
  { img: '/images/6.jpg', col: 'span 5', row: 'span 2', caption: 'Churches together' },
  { img: '/images/12.jpg', col: 'span 4', row: 'span 2', caption: 'Sunday worship' },
];

const partnerLogos = [
  'WEMBLEY',
  'TESLIM BALOGUN',
  'ALLIANZ PARQUE',
  'WANKHEDE',
  'KASARANI',
  'OLYMPIASTADION',
];

/* ==========================================================================
   PAGE
   ========================================================================== */

type PublicStats = {
  partnerChurches: number | null;
  countries: number | null;
  attendees: number | null;
  events: number | null;
};

function formatCount(n: number | null): string {
  if (n == null || n === 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K+`;
  if (n >= 1_000) return n.toLocaleString();
  return String(n);
}

export default function HomePage() {
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);
  useEffect(() => {
    fetch('/api/events').then((r) => r.json()).then((d) => setEvents(d.events ?? []));
    fetch('/api/stats/public')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d as PublicStats))
      .catch(() => {});
  }, []);
  const featured = events.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <HeroBg>
        <HeroImage />
        <HeroOverlay />
        <PublicNav dark />

        <Container>
          <HeroInner>
            <div>
              <MountFade $delay={0}>
                <Eyebrow>An international movement</Eyebrow>
              </MountFade>
              <MountFade $delay={120}>
                <H1>
                  One Church.
                  <br />
                  Many Stadiums.
                </H1>
              </MountFade>
              <MountFade $delay={260}>
                <Sub>
                  A collaborative platform where churches, event organizers, venues, volunteers, and attendees come
                  together to shape large-scale Christian gatherings — from first invitation to final worship.
                </Sub>
              </MountFade>
              <MountFade $delay={380}>
                <HeroActions>
                  <Link href="/events">
                    <Button $variant="gold">Explore Events →</Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      as="span"
                      style={{
                        background: 'transparent',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.4)',
                      }}
                    >
                      Join Our Church Network
                    </Button>
                  </Link>
                </HeroActions>
              </MountFade>
              <HeroStats>
                <Stat>
                  <div className="num">{formatCount(stats?.partnerChurches ?? null)}</div>
                  <div className="label">Partner churches</div>
                </Stat>
                <Stat>
                  <div className="num">{formatCount(stats?.countries ?? null)}</div>
                  <div className="label">Countries</div>
                </Stat>
                <Stat>
                  <div className="num">{formatCount(stats?.attendees ?? null)}</div>
                  <div className="label">Registered attendees</div>
                </Stat>
              </HeroStats>
            </div>

            <FeaturedCard>
              <FeaturedCover>
                <div>
                  <div
                    style={{
                      color: tokens.color.secondary,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Featured · Stadium worship
                  </div>
                  <div
                    style={{
                      fontFamily: tokens.font.display,
                      fontWeight: 800,
                      fontSize: 26,
                      color: '#fff',
                      marginTop: 4,
                      textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                    }}
                  >
                    The gathered Church
                  </div>
                </div>
              </FeaturedCover>
              <div style={{ padding: 20 }}>
                <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
                  Worship, prayer and teaching across participating congregations — see which gatherings are
                  open for registration right now.
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <Link href="/events" style={{ flex: 1 }}>
                    <Button $variant="gold" $block>
                      Browse events
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      style={{
                        background: 'transparent',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.4)',
                      }}
                    >
                      Join
                    </Button>
                  </Link>
                </div>
              </div>
            </FeaturedCard>
          </HeroInner>
        </Container>
      </HeroBg>

      {/* MOVEMENT PHOTO MOSAIC */}
      <MovementBand>
        <Container>
          <MovementHead>
            <Eyebrow>The movement, in photos</Eyebrow>
            <h2>The gathered Church, made visible.</h2>
            <p>
              From a packed stadium under bright lights to a candlelit prayer circle in Wembley&apos;s undercroft — these
              are the people who make it possible.
            </p>
          </MovementHead>
          <Mosaic>
            {mosaicTiles.map((t, i) => (
              <Tile key={i} $img={t.img} $c={t.col} $r={t.row}>
                <span className="caption">{t.caption}</span>
              </Tile>
            ))}
          </Mosaic>
        </Container>
      </MovementBand>

      {/* MISSION */}
      <Section>
        <Container>
          <Reveal>
          <MissionGrid>
            <div>
              <Eyebrow>Our mission</Eyebrow>
              <MissionH>
                The work of the
                <br /> gathered Church,
                <br /> made visible.
              </MissionH>
            </div>
            <div>
              <p style={{ fontSize: 18, lineHeight: 1.65, color: tokens.color.textSecondary, maxWidth: 620, margin: 0 }}>
                We connect ministries across borders to coordinate what no single congregation could carry alone: shared
                worship in the world&apos;s great venues, logistics across thousands of volunteers, and hospitality for
                everyone who comes.
              </p>
              <Four>
                {[
                  { t: 'Connect', d: 'Churches discover one another and apply to co-host events that match their mission and region.' },
                  { t: 'Coordinate', d: 'Organizers plan the stadium, program, volunteer teams, and resources from one shared workspace.' },
                  { t: 'Volunteer', d: 'Teams across ushering, prayer, media, hospitality and logistics are matched to real responsibilities.' },
                  { t: 'Gather', d: "Attendees find events, register for themselves and their groups, and keep track of what's next." },
                ].map((x, i) => (
                  <FourItem key={x.t}>
                    <span className="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <IconTile>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" stroke={tokens.color.secondary} strokeWidth="1.8" />
                      </svg>
                    </IconTile>
                    <h3>{x.t}</h3>
                    <p>{x.d}</p>
                  </FourItem>
                ))}
              </Four>
              <SwipeHint aria-hidden="true">
                <span>Swipe to explore</span>
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 5h13m0 0L10 1m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </SwipeHint>
            </div>
          </MissionGrid>
          </Reveal>
        </Container>
      </Section>

      {/* SIGNATURE VENUES */}
      <Section $surface>
        <Container>
          <Reveal>
          <VenuesHead>
            <div>
              <Eyebrow>Signature venues</Eyebrow>
              <h2>Stadiums built for 60,000 — carrying a gospel bigger than any of them.</h2>
            </div>
            <Link href="/mission" style={{ color: tokens.color.primary, fontWeight: 600, borderBottom: `1.5px solid ${tokens.color.secondary}`, paddingBottom: 2 }}>
              View all venues →
            </Link>
          </VenuesHead>
          <VenuesGrid>
            {venues.map((v, i) => (
              <VenueCard key={v.slug} href="/mission" $img={v.img} style={i === 0 ? { gridRow: 'span 2' } : undefined}>
                <VenueBadge>{v.tag}</VenueBadge>
                <div style={{ marginTop: 'auto' }}>
                  <div
                    style={{
                      fontFamily: tokens.font.display,
                      fontWeight: 800,
                      fontSize: i === 0 ? 32 : 22,
                      lineHeight: 1.1,
                      marginTop: 10,
                    }}
                  >
                    {v.name}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>{v.city}</div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 14,
                      marginTop: 14,
                      fontSize: 12.5,
                      color: 'rgba(255,255,255,0.8)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>👥 {v.capacity} capacity</span>
                    {v.date && <span>📅 {v.date}</span>}
                  </div>
                </div>
              </VenueCard>
            ))}
          </VenuesGrid>
          </Reveal>
        </Container>
      </Section>

      {/* UPCOMING EVENTS */}
      <Section>
        <Container>
          <Reveal>
          <EventsHead>
            <div>
              <Eyebrow>Upcoming</Eyebrow>
              <h2>Featured stadium gatherings</h2>
            </div>
            <Link href="/events">View all events →</Link>
          </EventsHead>
          <EventsGrid>
            <Stagger step={90}>
              {featured.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </Stagger>
          </EventsGrid>
          </Reveal>
        </Container>
      </Section>

      {/* WAYS TO JOIN */}
      <Section $surface>
        <Container>
          <div style={{ maxWidth: 680 }}>
            <Eyebrow>Find your place</Eyebrow>
            <h2 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.1, marginTop: 12 }}>
              Five ways to join the gathering.
            </h2>
            <p style={{ color: tokens.color.textSecondary, fontSize: 16.5, lineHeight: 1.65, marginTop: 14 }}>
              There is a seat at this table whether you lead a congregation, serve from the back of house, or come as a
              seeker for the first time.
            </p>
          </div>
          <WaysGrid>
            {ways.map((w) => (
              <WayCard key={w.href} href={w.href} $img={w.img}>
                <WayIcon>
                  <span style={{ fontSize: 22 }}>{w.icon}</span>
                </WayIcon>
                <h3>{w.label}</h3>
                <p>{w.desc}</p>
                <span className="arrow">{w.cta}</span>
              </WayCard>
            ))}
          </WaysGrid>
        </Container>
      </Section>

      {/* NETWORK HOW IT WORKS */}
      <Section $dark>
        <Container>
          <NetworkGrid>
            <div>
              <Eyebrow>The network</Eyebrow>
              <NetworkH>Your congregation does not have to carry this alone.</NetworkH>
              <p
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 17,
                  lineHeight: 1.65,
                  maxWidth: 520,
                  marginTop: 20,
                }}
              >
                Register your church, be verified by our team, and apply to participate in any event where your calling
                aligns. You keep your identity. We handle the logistics in common.
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 28, flexWrap: 'wrap' }}>
                <Link href="/register">
                  <Button $variant="gold">Apply to join</Button>
                </Link>
                <Link href="/about">
                  <Button
                    as="span"
                    style={{
                      background: 'transparent',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.4)',
                    }}
                  >
                    How participation works
                  </Button>
                </Link>
              </div>
            </div>
            <NetworkSteps>
              {[
                { n: 1, t: 'Register your church', d: 'Share your leadership, history, and congregation profile through a guided five-step application.' },
                { n: 2, t: 'Be verified', d: 'Our review team confirms your authorization and leadership. You stay informed at every step.' },
                { n: 3, t: 'Apply to participate', d: 'Discover stadium events, respond to invitations, and commit volunteers and resources that fit.' },
                { n: 4, t: 'Gather together', d: 'Coordinate tasks, communications, and teams through your dedicated workspace.' },
              ].map((s) => (
                <StepCard key={s.n}>
                  <StepNum>{s.n}</StepNum>
                  <div>
                    <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 16, color: '#fff' }}>
                      {s.t}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13.5, marginTop: 4, lineHeight: 1.55 }}>
                      {s.d}
                    </div>
                  </div>
                </StepCard>
              ))}
            </NetworkSteps>
          </NetworkGrid>
        </Container>
      </Section>

      {/* BEHIND THE SCENES */}
      <Section>
        <Container>
          <BehindGrid>
            <BehindPhotos>
              <BehindTile $img="/images/7.jpg" $big />
              <BehindTile $img="/images/9.jpg" />
              <BehindTile $img="/images/10.jpg" />
            </BehindPhotos>
            <div>
              <Eyebrow>Behind every gathering</Eyebrow>
              <MissionH style={{ fontSize: 36 }}>A stadium is built by thousands of hands.</MissionH>
              <p style={{ fontSize: 16, color: tokens.color.textSecondary, lineHeight: 1.65, marginTop: 18, maxWidth: 520 }}>
                Join a department that matches your gifts — from prayer and hospitality to media, logistics, and medical
                coordination. Supervisors, instructions, and schedules are provided in your volunteer portal.
              </p>
              <DeptRow>
                {['Ushering', 'Prayer Team', 'Media', 'Technical', 'Hospitality', 'Logistics', 'Security Coordination', 'Medical Coordination'].map((d) => (
                  <DeptPill key={d}>{d}</DeptPill>
                ))}
              </DeptRow>
              <div style={{ marginTop: 28 }}>
                <Link href="/register">
                  <Button>See open opportunities</Button>
                </Link>
              </div>
            </div>
          </BehindGrid>
        </Container>
      </Section>

      {/* IMPACT STRIPE */}
      <ImpactBand>
        <Container>
          <Reveal>
          <div style={{ maxWidth: 700 }}>
            <Eyebrow>By the numbers</Eyebrow>
            <h2 style={{ color: '#fff', fontSize: 40, fontWeight: 700, lineHeight: 1.1, marginTop: 12 }}>
              Where the movement stands today.
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.72)',
                fontSize: 16,
                lineHeight: 1.65,
                marginTop: 14,
              }}
            >
              Live counts across partner churches, participating countries, open events, and registered attendees.
            </p>
          </div>
          <ImpactGrid>
            <Stagger step={110}>
              <ImpactStat>
                <div className="num"><CountUp to={stats?.partnerChurches ?? null} format={formatCount} /></div>
                <div className="lbl">Partner churches</div>
              </ImpactStat>
              <ImpactStat>
                <div className="num"><CountUp to={stats?.countries ?? null} format={formatCount} /></div>
                <div className="lbl">Countries represented</div>
              </ImpactStat>
              <ImpactStat>
                <div className="num"><CountUp to={stats?.events ?? null} format={formatCount} /></div>
                <div className="lbl">Events on the platform</div>
              </ImpactStat>
              <ImpactStat>
                <div className="num"><CountUp to={stats?.attendees ?? null} format={formatCount} /></div>
                <div className="lbl">Registered attendees</div>
              </ImpactStat>
            </Stagger>
          </ImpactGrid>
          </Reveal>
        </Container>
      </ImpactBand>

      {/* PARTNER LOGOS */}
      <LogoStripe>
        <Container>
          <div style={{ textAlign: 'center' }}>
            <Eyebrow>Hosted at</Eyebrow>
            <div style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 10 }}>
              A growing list of signature venues standing with the movement.
            </div>
          </div>
          <LogosRow>
            {partnerLogos.map((p) => (
              <Logo key={p}>{p}</Logo>
            ))}
          </LogosRow>
        </Container>
      </LogoStripe>

      {/* FINAL CTA */}
      <FinalCTA>
        <Container>
          <Eyebrow>Gather with us</Eyebrow>
          <h2>The next invitation is already open.</h2>
          <p>
            Whether you&apos;re a lead pastor, a volunteer, or coming to pray — your seat is being saved by thousands
            who are already on their way.
          </p>
          <CTABtns>
            <Link href="/events">
              <Button $variant="gold">Find an event near you →</Button>
            </Link>
            <Link href="/register">
              <Button
                as="span"
                style={{
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.4)',
                }}
              >
                Register your church
              </Button>
            </Link>
          </CTABtns>
        </Container>
      </FinalCTA>

      {/* NEWSLETTER */}
      <NewsBand>
        <Container>
          <NewsInner>
            <div>
              <h2>Stay close to the movement</h2>
              <p>
                Monthly updates on upcoming stadium gatherings, new participating churches, and open volunteer
                opportunities.
              </p>
            </div>
            <NewsForm>
              <input type="email" placeholder="you@yourchurch.org" />
              <Button>Subscribe</Button>
            </NewsForm>
          </NewsInner>
        </Container>
      </NewsBand>

      <PublicFooter />
    </>
  );
}
