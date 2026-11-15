'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type AdminChurch = {
  slug: string; name: string; initials: string; city: string; country: string;
  denomination: string; established: number; verified: boolean; size: string;
  submittedAt: string;
  representatives: Array<{ id: string; name: string; email?: string; status: string }>;
};

const Head = styled.div`
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  overflow: hidden;
  th {
    text-align: left;
    font-size: 11px;
    color: ${tokens.color.textSecondary};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
    padding: 14px 20px;
    border-bottom: 1px solid ${tokens.color.border};
    background: ${tokens.color.surface};
  }
  td {
    padding: 16px 20px;
    font-size: 13.5px;
    border-bottom: 1px solid ${tokens.color.surface2};
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #FBFBFD; }
`;

const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: ${tokens.color.secondarySoft};
  color: ${tokens.color.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 12px;
  flex-shrink: 0;
`;

export default function AdminChurchesPage() {
  const [churches, setChurches] = useState<AdminChurch[]>([]);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'all'>('pending');
  const [acting, setActing] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  async function refresh() {
    const r = await fetch(`/api/admin/churches?status=${filter}`);
    if (r.status === 403) { setForbidden(true); return; }
    const d = await r.json();
    setChurches(d.churches ?? []);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  async function act(slug: string, action: 'approve' | 'reject') {
    setActing(slug);
    await fetch(`/api/admin/churches/${encodeURIComponent(slug)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setActing(null);
    refresh();
  }

  if (forbidden) return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;

  return (
    <>
      <Head>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Eyebrow>Verification queue</Eyebrow>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Church applications</h1>
            <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
              {churches.length} shown · {filter === 'all' ? 'all statuses' : filter}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['pending', 'verified', 'all'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: `1px solid ${filter === s ? tokens.color.primary : tokens.color.border}`,
                  background: filter === s ? tokens.color.primary : '#fff',
                  color: filter === s ? '#fff' : tokens.color.textPrimary,
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Head>

      <Table>
        <thead>
          <tr>
            <th>Church</th>
            <th>Denomination</th>
            <th>Country · City</th>
            <th>Size</th>
            <th>Representative</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {churches.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', color: tokens.color.textSecondary }}>Nothing here.</td></tr>
          )}
          {churches.map((c) => {
            const rep = c.representatives[0];
            return (
              <tr key={c.slug}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar>{c.initials}</Avatar>
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ color: tokens.color.textSecondary, fontSize: 12 }}>
                        Est. {c.established} · Submitted {new Date(c.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ color: tokens.color.textSecondary }}>{c.denomination}</td>
                <td style={{ color: tokens.color.textSecondary }}>{c.country} · {c.city}</td>
                <td style={{ fontWeight: 600 }} className="mono">{c.size}</td>
                <td style={{ color: tokens.color.textSecondary, fontSize: 12.5 }}>
                  {rep ? <>{rep.name}<br /><span style={{ fontSize: 11 }}>{rep.email}</span></> : '—'}
                </td>
                <td>
                  {c.verified ? <Badge $tone="success">✓ Verified</Badge> : <Badge $tone="warning">Pending</Badge>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {!c.verified && (
                      <Button $size="sm" onClick={() => act(c.slug, 'approve')} disabled={acting === c.slug}>
                        {acting === c.slug ? '…' : 'Approve'}
                      </Button>
                    )}
                    {c.verified && (
                      <Button $size="sm" $variant="secondary" onClick={() => act(c.slug, 'reject')} disabled={acting === c.slug}>
                        Revoke
                      </Button>
                    )}
                    <Link href={`/admin/churches/${c.slug}`} style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 12.5, alignSelf: 'center' }}>
                      Open
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
