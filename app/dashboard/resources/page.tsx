'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

const Panel = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 24px 26px;
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

export default function ResourcesPage() {
  return (
    <>
      <div style={{ marginBottom: 22 }}>
        <Eyebrow>Resources</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Event resources</h1>
        <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6, maxWidth: 640 }}>
          A shared inventory of equipment, transport and logistics items for event planning isn’t wired
          up yet. When it is, you’ll request kit, track assignments to events, and see what’s available
          here.
        </p>
      </div>

      <Panel>
        <h3>In the meantime</h3>
        <p style={{ fontSize: 13.5, color: tokens.color.textSecondary, lineHeight: 1.6 }}>
          For anything you need for an upcoming event, contact the event organiser directly or the
          admin team. Documents your church has already uploaded live in your documents library.
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/dashboard/documents"><Button>My documents</Button></Link>
          <Link href="/dashboard/events"><Button $variant="secondary">My events</Button></Link>
        </div>
      </Panel>

      <Panel style={{ marginTop: 16 }}>
        <h3>Planned — resource inventory</h3>
        <p style={{ fontSize: 13.5, color: tokens.color.textSecondary, lineHeight: 1.6 }}>
          A future update will add a resources collection (equipment, transport, catering, hospitality)
          with per-event assignment, request-and-approve flow, and usage history. The data model, API,
          and admin controls still need to be built before this page can show real items.
        </p>
      </Panel>
    </>
  );
}
