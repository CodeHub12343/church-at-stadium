'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Eyebrow } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const Panel = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 22px 24px;
  h3 {
    font-family: ${tokens.font.display};
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    margin-bottom: 12px;
  }
`;

export default function VolunteerDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
        <Link href="/dashboard/volunteers">← Back to volunteers</Link>
      </div>

      <div style={{ marginBottom: 22 }}>
        <Eyebrow>Volunteer</Eyebrow>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>Volunteer profile</h1>
        <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6, maxWidth: 640 }}>
          A detailed per-volunteer profile view isn’t wired up yet. Volunteer records exist in the database as
          applications against specific opportunities — use the pages below to review them.
        </p>
      </div>

      <Panel>
        <h3>Where to find volunteer data</h3>
        <p style={{ fontSize: 13.5, lineHeight: 1.65, color: tokens.color.textSecondary }}>
          Reference: <code>{params.id}</code>
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/dashboard/volunteers">
            <Button>My volunteer applications</Button>
          </Link>
          <Link href="/admin/volunteers">
            <Button $variant="secondary">Admin: review applications</Button>
          </Link>
        </div>
      </Panel>

      <Panel style={{ marginTop: 16 }}>
        <h3>Planned</h3>
        <p style={{ fontSize: 13.5, color: tokens.color.textSecondary, lineHeight: 1.6 }}>
          A future update will pull the volunteer’s profile, qualifications, availability and assignment history
          from the <code>VolunteerApplication</code> collection and render it here. The supporting API endpoint
          still needs to be built before this page can show real data.
        </p>
      </Panel>
    </>
  );
}
