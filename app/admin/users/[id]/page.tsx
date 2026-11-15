'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type UserApiResponse = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    country?: string;
    churchName?: string;
    phone?: string;
    bio?: string;
    displayName?: string;
    language?: string;
    verified: boolean;
    createdAt: string;
  };
  counts: {
    registrations: number;
    volunteerApplications: number;
    churchMemberships: number;
  };
  churches: Array<{ churchSlug: string; role: string; status: string }>;
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 18px;
  align-items: flex-start;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: ${tokens.color.primary};
  color: ${tokens.color.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 26px;
  flex-shrink: 0;
`;

const Panel = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 20px 22px;
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

const DL = styled.dl`
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px 20px;
  margin: 0;
  dt {
    font-size: 11.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    font-weight: 700;
    align-self: center;
  }
  dd {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
`;

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  church_rep: 'Church rep',
  organizer: 'Organizer',
  volunteer: 'Volunteer',
  attendee: 'Attendee',
};

const roleTone = (role: string): BadgeTone => {
  switch (role) {
    case 'admin': return 'error';
    case 'organizer': return 'warning';
    case 'church_rep': return 'info';
    case 'volunteer': return 'success';
    default: return 'neutral';
  }
};

function initialsOf(firstName: string, lastName: string, email: string): string {
  const a = firstName?.[0] ?? '';
  const b = lastName?.[0] ?? '';
  const out = (a + b).toUpperCase();
  return out || email.slice(0, 2).toUpperCase() || '·';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<UserApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/users/${params.id}`)
      .then(async (r) => {
        if (r.status === 404) {
          setError('User not found');
          return null;
        }
        if (r.status === 403) {
          setError('Admin access required');
          return null;
        }
        if (!r.ok) {
          setError('Failed to load user');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.user) setData(d as UserApiResponse);
      })
      .catch(() => setError('Failed to load user'));
  }, [params.id]);

  if (error) {
    return (
      <>
        <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
          <Link href="/admin/users">← Back to users</Link>
        </div>
        <Panel>
          <h3>Unavailable</h3>
          <p style={{ fontSize: 14, color: tokens.color.textSecondary }}>{error}</p>
        </Panel>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
          <Link href="/admin/users">← Back to users</Link>
        </div>
        <Panel>
          <h3>Loading…</h3>
          <p style={{ fontSize: 14, color: tokens.color.textSecondary }}>Fetching user details.</p>
        </Panel>
      </>
    );
  }

  const u = data.user;
  const fullName = u.displayName?.trim() || `${u.firstName} ${u.lastName}`.trim() || u.email;
  const church = u.churchName?.trim() || '—';
  const location = u.country?.trim() || '—';
  const roleLabel = ROLE_LABEL[u.role] ?? u.role;

  return (
    <>
      <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
        <Link href="/admin/users">← Back to users</Link>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          marginBottom: 22,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <Avatar>{initialsOf(u.firstName, u.lastName, u.email)}</Avatar>
          <div>
            <Eyebrow>{church}</Eyebrow>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{fullName}</h1>
            <div style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
              {u.email}
              {location !== '—' && <> · {location}</>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Badge $tone={roleTone(u.role)}>{roleLabel}</Badge>
              <Badge $tone={u.verified ? 'success' : 'warning'}>
                {u.verified ? 'Email verified' : 'Not verified'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Grid>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Panel>
            <h3>Profile</h3>
            {u.bio && (
              <p style={{ fontSize: 14, lineHeight: 1.7, color: tokens.color.textSecondary, marginBottom: 20 }}>
                {u.bio}
              </p>
            )}
            <DL>
              <dt>Full name</dt>
              <dd>{`${u.firstName} ${u.lastName}`.trim() || '—'}</dd>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${u.email}`} style={{ color: tokens.color.primary }}>
                  {u.email}
                </a>
              </dd>
              <dt>Phone</dt>
              <dd>{u.phone?.trim() || '—'}</dd>
              <dt>Church / team</dt>
              <dd>{church}</dd>
              <dt>Country</dt>
              <dd>{location}</dd>
              <dt>Joined</dt>
              <dd>{formatDate(u.createdAt)}</dd>
              <dt>Role</dt>
              <dd>{roleLabel}</dd>
            </DL>
          </Panel>

          <Panel>
            <h3>Church memberships</h3>
            {data.churches.length === 0 ? (
              <p style={{ fontSize: 13, color: tokens.color.textSecondary }}>
                No church memberships recorded.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.churches.map((c) => (
                  <Link
                    key={c.churchSlug}
                    href={`/admin/churches/${c.churchSlug}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      border: `1px solid ${tokens.color.border}`,
                      borderRadius: 10,
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.churchSlug}</div>
                      <div style={{ color: tokens.color.textSecondary, fontSize: 12 }}>
                        {c.role} · {c.status}
                      </div>
                    </div>
                    <span style={{ color: tokens.color.primary, fontSize: 12.5 }}>Open →</span>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <Panel>
          <h3>Activity counts</h3>
          <DL>
            <dt>Event registrations</dt>
            <dd>{data.counts.registrations}</dd>
            <dt>Volunteer applications</dt>
            <dd>{data.counts.volunteerApplications}</dd>
            <dt>Church memberships</dt>
            <dd>{data.counts.churchMemberships}</dd>
          </DL>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/admin/registrations">
              <Button $block>View registrations →</Button>
            </Link>
            <Link href="/admin/audit-logs">
              <Button $block $variant="secondary">View audit log →</Button>
            </Link>
          </div>
        </Panel>
      </Grid>
    </>
  );
}
