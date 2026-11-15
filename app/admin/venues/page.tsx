'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type Venue = {
  id: string; name: string; city: string; country: string;
  capacity: number; type: 'Indoor' | 'Outdoor'; verified: boolean;
  booking: 'confirmed' | 'pending' | 'available' | 'unverified';
  bookingDate?: string; upcoming: number; initials: string;
};

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const Stat = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 16px 18px;
  .l {
    color: ${tokens.color.textSecondary};
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .v {
    font-family: ${tokens.font.display};
    font-weight: 800;
    font-size: 26px;
    margin-top: 2px;
    font-variant-numeric: tabular-nums;
  }
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
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fbfbfd; }
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
  font-size: 11px;
  flex-shrink: 0;
`;

const bookingBadge = (b: string): { tone: BadgeTone; label: string } => {
  if (b === 'confirmed') return { tone: 'success', label: 'Confirmed' };
  if (b === 'pending') return { tone: 'warning', label: 'Pending' };
  if (b === 'unverified') return { tone: 'error', label: 'Unverified' };
  return { tone: 'neutral', label: 'Available' };
};

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [forbidden, setForbidden] = useState(false);

  async function refresh() {
    const r = await fetch('/api/admin/venues');
    if (r.status === 403) { setForbidden(true); return; }
    const d = await r.json();
    setVenues(d.venues ?? []);
  }
  useEffect(() => { refresh(); }, []);

  if (forbidden) return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;

  const confirmed = venues.filter((v) => v.booking === 'confirmed').length;
  const pending = venues.filter((v) => v.booking === 'pending').length;
  const available = venues.filter((v) => v.booking === 'available').length;
  const unverified = venues.filter((v) => !v.verified).length;

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Infrastructure</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Stadium directory</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            {venues.length} venues in your network.{' '}
            <span style={{ color: tokens.color.warningText, fontWeight: 600 }}>
              Listing in the directory does not imply a confirmed booking.
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button $variant="secondary">Import CSV</Button>
          <Button>+ Add venue</Button>
        </div>
      </Head>

      <Stats>
        <Stat><div className="l">Total</div><div className="v" style={{ color: tokens.color.primary }}>{venues.length}</div></Stat>
        <Stat><div className="l">Confirmed</div><div className="v" style={{ color: tokens.color.successText }}>{confirmed}</div></Stat>
        <Stat><div className="l">Pending</div><div className="v" style={{ color: tokens.color.warningText }}>{pending}</div></Stat>
        <Stat><div className="l">Available</div><div className="v" style={{ color: tokens.color.primary }}>{available}</div></Stat>
        <Stat><div className="l">Unverified</div><div className="v" style={{ color: tokens.color.errorText }}>{unverified}</div></Stat>
      </Stats>

      <Table>
        <thead>
          <tr>
            <th>Stadium</th>
            <th>Country · city</th>
            <th>Capacity</th>
            <th>Type</th>
            <th>Verification</th>
            <th>Booking</th>
            <th>Events</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {venues.map((v) => {
            const b = bookingBadge(v.booking);
            return (
              <tr key={v.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar>{v.initials}</Avatar>
                    <div>
                      <div style={{ fontWeight: 700 }}>{v.name}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: tokens.color.textSecondary }}>
                  {v.country} · {v.city}
                </td>
                <td className="mono" style={{ fontWeight: 600 }}>{v.capacity.toLocaleString()}</td>
                <td style={{ color: tokens.color.textSecondary }}>{v.type}</td>
                <td>
                  {v.verified ? (
                    <Badge $tone="success">✓ Verified</Badge>
                  ) : (
                    <Badge $tone="error">Unverified</Badge>
                  )}
                </td>
                <td>
                  <Badge $tone={b.tone} $withDot>
                    {b.label}
                    {v.bookingDate && ` · ${v.bookingDate}`}
                  </Badge>
                </td>
                <td style={{ color: tokens.color.textSecondary }}>{v.upcoming} upcoming</td>
                <td>
                  <Link href={`/admin/venues/${v.id}`} style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 12.5 }}>
                    Open →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
