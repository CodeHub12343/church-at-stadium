'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, Eyebrow } from '@/components/ui/Card';

type Detail = {
  membership: { role: string; status: string; submittedAt: string };
  church: {
    slug: string; name: string; initials: string; city: string; country: string;
    denomination: string; established: number; verified: boolean; gradient: [string, string];
    website?: string; email?: string; pastor?: string; bio?: string; size?: string; branches?: number;
    image?: string;
    upcoming?: string[];
  };
  upcomingEvents: Array<{ slug: string; title: string; dateLabel: string; city: string; venue: string; gradient: [string, string] }>;
};

const Hero = styled.div`
  position: relative;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 16px;
  overflow: hidden;
`;

const Banner = styled.div<{ $grad: string; $img?: string }>`
  height: 140px;
  background: ${(p) => (p.$img ? `url(${p.$img}) center/cover no-repeat` : p.$grad)};
  position: relative;
  @media (max-width: ${tokens.bp.mobile}) {
    height: 110px;
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(10,14,26,0) 40%, rgba(10,14,26,0.4) 100%);
  }
`;

const HeroInner = styled.div`
  padding: 0 24px 22px;
  position: relative;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 0 16px 18px;
  }
`;

const HeroActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
  @media (max-width: ${tokens.bp.mobile}) {
    a, button {
      flex: 1;
    }
  }
`;

const Avatar = styled.div`
  width: 92px;
  height: 92px;
  border-radius: 20px;
  background: linear-gradient(135deg, ${tokens.color.secondary}, ${tokens.color.secondaryDeep});
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 30px;
  flex-shrink: 0;
  margin-top: -48px;
  box-shadow: 0 4px 18px rgba(10, 14, 26, 0.18);
  border: 3px solid #fff;
  overflow: hidden;
  @media (max-width: ${tokens.bp.mobile}) {
    width: 72px;
    height: 72px;
    font-size: 24px;
    border-radius: 18px;
    margin-top: -38px;
  }
`;

const AvatarImg = styled.div<{ $img: string }>`
  width: 100%;
  height: 100%;
  background: url(${(p) => p.$img}) center/cover no-repeat;
`;

const Tabs = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 28px;
  border-bottom: 1px solid ${tokens.color.border};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  a {
    padding: 10px 0;
    color: ${tokens.color.textSecondary};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    &.active {
      border-bottom: 2.5px solid ${tokens.color.primary};
      color: ${tokens.color.primary};
      font-weight: 700;
    }
  }
  @media (max-width: ${tokens.bp.mobile}) {
    margin-top: 16px;
    gap: 20px;
  }
`;

const Row = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const FactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  margin-top: 14px;
  background: ${tokens.color.border};
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  overflow: hidden;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Fact = styled.div`
  min-width: 0;
  background: #fff;
  padding: 14px 16px;
  .lbl {
    font-size: 10.5px;
    color: ${tokens.color.textSecondary};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .val {
    font-size: 14.5px;
    color: ${tokens.color.textPrimary};
    margin-top: 6px;
    font-weight: 600;
    overflow-wrap: anywhere;
    word-break: break-word;
    line-height: 1.4;
  }
`;

const EventRow = styled(Link)`
  display: grid;
  grid-template-columns: 70px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 0;
  border-top: 1px solid ${tokens.color.surface2};
  text-decoration: none;
  color: inherit;
  &:first-of-type {
    border-top: none;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 56px 1fr;
    gap: 12px;
  }
`;

const DateChip = styled.div`
  padding: 8px 0;
  background: ${tokens.color.surface};
  border-radius: 10px;
  text-align: center;
  .m {
    color: ${tokens.color.secondary};
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .d {
    font-family: ${tokens.font.display};
    font-weight: 800;
    font-size: 19px;
    color: ${tokens.color.primary};
  }
`;

const TeamMember = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid ${tokens.color.surface2};
  &:first-of-type {
    border-top: none;
  }
`;

const MemberAvatar = styled.div<{ $bg: string; $fg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 12px;
  flex-shrink: 0;
`;

export default function ChurchProfilePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<Detail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    fetch(`/api/me/churches/${encodeURIComponent(params.id)}`).then(async (r) => {
      if (!r.ok) { setStatus('missing'); return; }
      const d = await r.json();
      setData(d);
      setStatus('ready');
    }).catch(() => setStatus('missing'));
  }, [params.id]);

  if (status === 'loading') return <div style={{ padding: 40, color: tokens.color.textSecondary }}>Loading church…</div>;
  if (status === 'missing' || !data) return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Church not found</h1>
      <Link href="/dashboard/churches" style={{ color: tokens.color.primary, marginTop: 8, display: 'inline-block' }}>Back to my churches</Link>
    </div>
  );

  const c = data.church;
  const grad = `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})`;

  return (
    <>
      <Hero>
        <Banner $grad={grad} $img={c.image || undefined} />
        <HeroInner>
          <Avatar style={!c.image ? { background: grad } : undefined}>
            {c.image ? <AvatarImg $img={c.image} /> : c.initials}
          </Avatar>
          <h1
            style={{
              fontSize: 'clamp(22px, 5.5vw, 28px)',
              fontWeight: 700,
              marginTop: 14,
              overflowWrap: 'anywhere',
              lineHeight: 1.2,
            }}
          >
            {c.name}
          </h1>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {c.verified
              ? <Badge $tone="success">✓ Verified</Badge>
              : <Badge $tone="warning">Pending verification</Badge>}
            <Badge $tone="gold">{data.membership.role.toUpperCase()}</Badge>
            {c.denomination && <Badge $tone="neutral">{c.denomination}</Badge>}
          </div>
          <div
            style={{
              color: tokens.color.textSecondary,
              fontSize: 13.5,
              marginTop: 10,
              overflowWrap: 'anywhere',
              lineHeight: 1.5,
            }}
          >
            {c.city}, {c.country} · Est. {c.established} · {data.upcomingEvents.length} upcoming event{data.upcomingEvents.length === 1 ? '' : 's'}
          </div>
          <HeroActions>
            <Link href={`/churches/${c.slug}`} style={{ display: 'contents' }}>
              <Button $variant="secondary">View as public</Button>
            </Link>
            <Button>Edit profile</Button>
          </HeroActions>
        </HeroInner>
      </Hero>

      <Tabs>
        <a className="active">Overview</a>
        <a>Team &amp; representatives</a>
        <a>Events</a>
        <a>Volunteers</a>
        <a>Documents</a>
        <a>Activity</a>
      </Tabs>

      <Row>
        <Card>
          <CardHeader>
            <h2>Church information</h2>
          </CardHeader>
          <FactGrid>
            <Fact>
              <div className="lbl">Official name</div>
              <div className="val">{c.name}</div>
            </Fact>
            <Fact>
              <div className="lbl">Denomination</div>
              <div className="val">{c.denomination || '—'}</div>
            </Fact>
            <Fact>
              <div className="lbl">Year established</div>
              <div className="val">{c.established || '—'}</div>
            </Fact>
            <Fact>
              <div className="lbl">Country</div>
              <div className="val">{c.country || '—'}</div>
            </Fact>
            <Fact>
              <div className="lbl">City</div>
              <div className="val">{c.city || '—'}</div>
            </Fact>
            <Fact>
              <div className="lbl">Branches</div>
              <div className="val">{c.branches ?? '—'}</div>
            </Fact>
            <Fact>
              <div className="lbl">Website</div>
              <div className="val" style={{ color: c.website ? tokens.color.info : undefined }}>
                {c.website || '—'}
              </div>
            </Fact>
            <Fact>
              <div className="lbl">Email</div>
              <div className="val">{c.email || '—'}</div>
            </Fact>
            <Fact>
              <div className="lbl">Congregation</div>
              <div className="val">{c.size || '—'}</div>
            </Fact>
          </FactGrid>
          {c.bio && (
            <p style={{ marginTop: 16, fontSize: 13.5, lineHeight: 1.65, color: tokens.color.textSecondary }}>
              {c.bio}
            </p>
          )}
          {c.pastor && (
            <div style={{ marginTop: 10, fontSize: 13, color: tokens.color.textSecondary }}>
              Senior pastor: <strong style={{ color: tokens.color.textPrimary }}>{c.pastor}</strong>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <h2>Your role</h2>
          </CardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
            <div>
              <div style={{ color: tokens.color.textSecondary, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Role
              </div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{data.membership.role}</div>
            </div>
            <div>
              <div style={{ color: tokens.color.textSecondary, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Membership status
              </div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{data.membership.status}</div>
            </div>
            <div>
              <div style={{ color: tokens.color.textSecondary, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Joined
              </div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>
                {new Date(data.membership.submittedAt).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </Card>
      </Row>

      <Row>
        <Card>
          <CardHeader>
            <h2>Upcoming events</h2>
            <Link href="/dashboard/events">All →</Link>
          </CardHeader>
          {data.upcomingEvents.length === 0 ? (
            <p style={{ fontSize: 13.5, color: tokens.color.textSecondary }}>
              No upcoming events linked to this church yet.
            </p>
          ) : (
            data.upcomingEvents.map((ev) => {
              const d = new Date(ev.dateLabel);
              const dateObj = Number.isNaN(d.getTime()) ? null : d;
              return (
                <EventRow key={ev.slug} href={`/events/${ev.slug}`}>
                  <DateChip>
                    <div className="m">
                      {dateObj ? dateObj.toLocaleString('en', { month: 'short' }) : '—'}
                    </div>
                    <div className="d">{dateObj ? dateObj.getDate() : '—'}</div>
                  </DateChip>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{ev.title}</div>
                    <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 2 }}>
                      {ev.city} · {ev.venue}
                    </div>
                  </div>
                </EventRow>
              );
            })
          )}
        </Card>
      </Row>
    </>
  );
}
