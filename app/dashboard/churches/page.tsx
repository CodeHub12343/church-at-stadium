'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type Membership = {
  churchSlug: string;
  role: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  church: {
    slug: string; name: string; initials: string; city: string; country: string;
    established: number; verified: boolean; gradient: [string, string]; upcoming: string[];
  } | null;
};

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Row = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 22px;
  display: flex;
  gap: 16px;
  align-items: center;
  min-width: 0;

  @media (max-width: ${tokens.bp.mobile}) {
    display: grid;
    grid-template-columns: 52px 1fr;
    grid-template-areas:
      'avatar body'
      'cta cta';
    gap: 14px 14px;
    padding: 18px;
    align-items: flex-start;
    box-shadow: ${tokens.shadow.sm};

    > :nth-child(1) {
      grid-area: avatar;
    }
    > :nth-child(2) {
      grid-area: body;
      min-width: 0;
    }
    > :nth-child(3) {
      grid-area: cta;
      width: 100%;
    }
    > :nth-child(3) a,
    > :nth-child(3) button {
      width: 100%;
    }
  }
`;

const RowTitleWrap = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const RowTitle = styled.div`
  font-family: ${tokens.font.display};
  font-weight: 700;
  font-size: 18px;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 16px;
  }
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, ${tokens.color.secondary}, ${tokens.color.secondaryDeep});
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 18px;
  flex-shrink: 0;
`;

export default function MyChurchesPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me/churches').then((r) => r.json()).then((d) => {
      setMemberships(d.memberships ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Head>
        <div>
          <Eyebrow>My network</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>My churches</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 4 }}>
            Churches you represent. You can link more than one.
          </p>
        </div>
        <Link href="/dashboard/churches/new"><Button>+ Register a church</Button></Link>
      </Head>

      {loading && <div style={{ padding: 24, color: tokens.color.textSecondary }}>Loading your churches…</div>}
      {!loading && memberships.length === 0 && (
        <div style={{ padding: 28, textAlign: 'center', border: `1px dashed ${tokens.color.border}`, borderRadius: 14, background: '#fff' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>No churches linked yet</div>
          <div style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 6 }}>
            Register the church you represent so you can apply for events and recruit volunteers.
          </div>
          <Link href="/dashboard/churches/new" style={{ display: 'inline-block', marginTop: 14 }}>
            <Button>+ Register a church</Button>
          </Link>
        </div>
      )}

      {!loading && memberships.length > 0 && (
        <Grid>
          {memberships.map((m) => {
            const c = m.church;
            if (!c) return null;
            const grad = `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})`;
            return (
              <Row key={c.slug}>
                <Avatar style={{ background: grad }}>{c.initials}</Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <RowTitleWrap>
                    <RowTitle>{c.name}</RowTitle>
                    {c.verified ? <Badge $tone="success">Verified</Badge> : <Badge $tone="warning">Pending verification</Badge>}
                  </RowTitleWrap>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 13, marginTop: 4 }}>
                    {c.city} · {c.country} · Est. {c.established} · {c.upcoming?.length || 0} upcoming events
                  </div>
                </div>
                <Link href={`/dashboard/churches/${c.slug}`}>
                  <Button $variant="secondary" $size="sm">Manage</Button>
                </Link>
              </Row>
            );
          })}
        </Grid>
      )}
    </>
  );
}
