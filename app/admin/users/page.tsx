'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type AdminUser = {
  id: string; email: string; firstName: string; lastName: string; role: string;
  country?: string; churchName?: string; verified: boolean; createdAt: string;
};

const roleTone = (r: string): BadgeTone => {
  if (r === 'admin') return 'error';
  if (r === 'organizer') return 'warning';
  if (r === 'church_rep') return 'gold';
  if (r === 'volunteer') return 'info';
  return 'neutral';
};

const roleLabel = (r: string) => r.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function initialsOf(u: AdminUser) {
  return ((u.firstName[0] || '') + (u.lastName[0] || '')).toUpperCase() || '?';
}
function colorOf(email: string) {
  const colors = ['#C6A45B', '#101B32', '#3975CC', '#16A36A', '#8E2DE2', '#DC4545'];
  let h = 0;
  for (const c of email) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
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
    padding: 14px 20px;
    font-size: 13.5px;
    border-bottom: 1px solid ${tokens.color.surface2};
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fbfbfd; }
`;

const Avatar = styled.div<{ $bg: string; $fg: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 11px;
`;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  async function refresh() {
    const r = await fetch(`/api/admin/users?${roleFilter !== 'All' ? `role=${roleFilter}&` : ''}${query ? `q=${encodeURIComponent(query)}` : ''}`);
    if (r.status === 403) { setForbidden(true); setLoading(false); return; }
    const d = await r.json();
    setUsers(d.users ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [roleFilter, query]);

  const counts = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    volunteers: users.filter((u) => u.role === 'volunteer').length,
  }), [users]);

  if (forbidden) return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;

  return (
    <>
      <Head>
        <div>
          <Eyebrow>People</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Users</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            {counts.total} shown · {counts.admins} admins · {counts.volunteers} volunteers
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            style={{ padding: '8px 12px', border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontSize: 13, minWidth: 220 }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '8px 12px', border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontSize: 13, background: '#fff' }}
          >
            <option>All</option>
            <option value="admin">Admins</option>
            <option value="organizer">Organizers</option>
            <option value="church_rep">Church reps</option>
            <option value="volunteer">Volunteers</option>
            <option value="attendee">Attendees</option>
          </select>
          <Link href="/admin/users/invite">
            <Button>+ Invite user</Button>
          </Link>
        </div>
      </Head>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Church</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: tokens.color.textSecondary }}>Loading…</td></tr>
          )}
          {!loading && users.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: tokens.color.textSecondary }}>No users match.</td></tr>
          )}
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <Link href={`/admin/users/${u.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar $bg={colorOf(u.email)} $fg="#fff">{initialsOf(u)}</Avatar>
                  <div style={{ fontWeight: 600, color: tokens.color.textPrimary }}>
                    {u.firstName} {u.lastName}
                    {!u.verified && <span style={{ color: tokens.color.warningText, fontSize: 11, marginLeft: 6 }}>· unverified</span>}
                  </div>
                </Link>
              </td>
              <td style={{ color: tokens.color.textSecondary }}>{u.email}</td>
              <td><Badge $tone={roleTone(u.role)}>{roleLabel(u.role)}</Badge></td>
              <td style={{ color: tokens.color.textSecondary }}>{u.churchName || '—'}</td>
              <td style={{ color: tokens.color.textSecondary }}>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <Link href={`/admin/users/${u.id}`} style={{ color: tokens.color.primary, fontWeight: 600, fontSize: 12.5 }}>
                  Manage →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
