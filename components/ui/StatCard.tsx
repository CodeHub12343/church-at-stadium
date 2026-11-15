'use client';

import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from './Badge';

const Wrap = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: ${tokens.radius.lg};
  padding: 18px 20px;
  min-width: 0;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 14px 14px;
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Label = styled.div`
  color: ${tokens.color.textSecondary};
  font-size: 12.5px;
  font-weight: 600;
  min-width: 0;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 11.5px;
  }
`;

const Value = styled.div`
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 30px;
  color: ${tokens.color.primary};
  margin-top: 6px;
  font-variant-numeric: tabular-nums;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 24px;
  }
`;

const Foot = styled.div`
  color: ${tokens.color.textSecondary};
  font-size: 12px;
  margin-top: 2px;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 11px;
  }
`;

interface StatCardProps {
  label: string;
  value: string;
  foot?: string;
  badge?: { text: string; tone: BadgeTone };
}

export function StatCard({ label, value, foot, badge }: StatCardProps) {
  return (
    <Wrap>
      <Row>
        <Label>{label}</Label>
        {badge && <Badge $tone={badge.tone}>{badge.text}</Badge>}
      </Row>
      <Value>{value}</Value>
      {foot && <Foot>{foot}</Foot>}
    </Wrap>
  );
}
