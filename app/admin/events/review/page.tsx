'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type QueueEvent = {
  slug: string; title: string; category: string; status: string;
  dateLabel: string; venue: string; city: string;
  churches: number; registrations: number;
};

const Head = styled.div`
  margin-bottom: 22px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
`;

const Meta = styled.div`
  display: flex;
  gap: 16px;
  color: ${tokens.color.textSecondary};
  font-size: 12.5px;
  flex-wrap: wrap;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid ${tokens.color.surface2};
`;

export default function EventApprovalQueue() {
  const [queue, setQueue] = useState<QueueEvent[]>([]);
  const [acting, setActing] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  async function refresh() {
    const r = await fetch('/api/admin/events?status=Draft');
    if (r.status === 403) { setForbidden(true); return; }
    const d = await r.json();
    setQueue(d.events ?? []);
  }
  useEffect(() => { refresh(); }, []);

  async function approve(slug: string) {
    setActing(slug);
    await fetch(`/api/admin/events/${encodeURIComponent(slug)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Open' }),
    });
    setActing(null);
    refresh();
  }

  if (forbidden) return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;

  return (
    <>
      <Head>
        <Eyebrow>Approval queue</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Event approvals</h1>
        <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
          {queue.length} events need attention · newest first
        </p>
      </Head>

      <Grid>
        {queue.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: tokens.color.textSecondary, background: '#fff', border: `1px dashed ${tokens.color.border}`, borderRadius: 14 }}>
            Nothing waiting for review.
          </div>
        )}
        {queue.map((e) => (
          <Card key={e.slug}>
            <Row>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge $tone="warning">Pending approval</Badge>
                  <Badge $tone="gold">{e.category}</Badge>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 10 }}>{e.title}</h3>
                <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 4 }}>
                  {e.venue} · {e.city} · {e.dateLabel}
                </div>
              </div>
            </Row>
            <Meta>
              <span><strong style={{ color: tokens.color.primary }}>{e.churches}</strong> churches</span>
              <span><strong style={{ color: tokens.color.primary }}>{e.registrations.toLocaleString()}</strong> registrations</span>
            </Meta>
            <Actions>
              <Link href={`/admin/events/${e.slug}`} style={{ marginRight: 'auto' }}>
                <Button $variant="secondary" $size="sm">Open event</Button>
              </Link>
              <Button $size="sm" onClick={() => approve(e.slug)} disabled={acting === e.slug}>
                {acting === e.slug ? 'Approving…' : 'Approve & publish'}
              </Button>
            </Actions>
          </Card>
        ))}
      </Grid>
    </>
  );
}
