'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';

type AdminChurchDetail = {
  slug: string; name: string; initials: string; city: string; country: string;
  denomination: string; established: number; verified: boolean;
  size: string; pastor?: string; email?: string; website?: string;
  submittedAt: string;
  representatives: Array<{ id: string; name: string; email?: string; role: string; status: string }>;
};

const Hero = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
`;

const Avatar = styled.div`
  width: 84px;
  height: 84px;
  border-radius: 14px;
  background: linear-gradient(135deg, ${tokens.color.secondary}, ${tokens.color.secondaryDeep});
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 28px;
  flex-shrink: 0;
`;

const Grid = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 24px 28px;
  & + & {
    margin-top: 18px;
  }
`;

const Fact = styled.div`
  .lbl {
    font-size: 11px;
    color: ${tokens.color.textSecondary};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .val {
    font-size: 14px;
    color: ${tokens.color.textPrimary};
    margin-top: 4px;
    font-weight: 500;
  }
`;

const FactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-top: 18px;
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const DocRow = styled.div`
  display: flex;
  gap: 11px;
  align-items: center;
  padding: 12px;
  border: 1px solid ${tokens.color.border};
  border-radius: 10px;
`;

const DocType = styled.div`
  width: 34px;
  height: 34px;
  background: ${tokens.color.errorBg};
  color: ${tokens.color.errorText};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
`;

export default function ChurchReviewPage({ params }: { params: { id: string } }) {
  const [church, setChurch] = useState<AdminChurchDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'forbidden'>('loading');
  const [acting, setActing] = useState(false);

  async function refresh() {
    const r = await fetch('/api/admin/churches?status=all');
    if (r.status === 403) { setStatus('forbidden'); return; }
    const d = await r.json();
    const c = (d.churches ?? []).find((x: AdminChurchDetail) => x.slug === params.id);
    if (!c) { setStatus('missing'); return; }
    setChurch(c);
    setStatus('ready');
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params.id]);

  async function act(action: 'approve' | 'reject') {
    setActing(true);
    await fetch(`/api/admin/churches/${encodeURIComponent(params.id)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setActing(false);
    refresh();
  }

  if (status === 'forbidden') return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;
  if (status === 'loading') return <div style={{ padding: 40, color: tokens.color.textSecondary }}>Loading church…</div>;
  if (status === 'missing' || !church) return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Church not found</h1>
      <Link href="/admin/churches" style={{ color: tokens.color.primary, marginTop: 8, display: 'inline-block' }}>Back to churches</Link>
    </div>
  );

  const primaryRep = church.representatives[0];

  return (
    <>
      <Hero>
        <Avatar>{church.initials}</Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 26, fontWeight: 700 }}>{church.name}</h1>
            {church.verified
              ? <Badge $tone="success" $withDot>Verified</Badge>
              : <Badge $tone="warning" $withDot>Pending review</Badge>}
            <Badge $tone="neutral">{church.slug}</Badge>
          </div>
          <div style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 6 }}>
            {church.denomination} · Est. {church.established} · {church.city}, {church.country} · Submitted{' '}
            {new Date(church.submittedAt).toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {church.verified ? (
            <Button $variant="danger" onClick={() => act('reject')} disabled={acting}>
              {acting ? '…' : 'Revoke verification'}
            </Button>
          ) : (
            <Button style={{ background: tokens.color.success }} onClick={() => act('approve')} disabled={acting}>
              {acting ? '…' : '✓ Approve church'}
            </Button>
          )}
        </div>
      </Hero>

      <Grid>
        <div>
          <Section>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Church information</h2>
            <FactGrid>
              <Fact>
                <div className="lbl">Official name</div>
                <div className="val">{church.name}</div>
              </Fact>
              <Fact>
                <div className="lbl">Denomination</div>
                <div className="val">{church.denomination}</div>
              </Fact>
              <Fact>
                <div className="lbl">Year established</div>
                <div className="val">{church.established}</div>
              </Fact>
              <Fact>
                <div className="lbl">Country</div>
                <div className="val">{church.country}</div>
              </Fact>
              <Fact>
                <div className="lbl">City</div>
                <div className="val">{church.city}</div>
              </Fact>
              <Fact>
                <div className="lbl">Website</div>
                <div className="val" style={{ color: tokens.color.info }}>
                  {church.website || '—'}
                </div>
              </Fact>
              <Fact>
                <div className="lbl">Official email</div>
                <div className="val">{church.email || '—'}</div>
              </Fact>
              <Fact>
                <div className="lbl">Congregation size</div>
                <div className="val">{church.size}</div>
              </Fact>
            </FactGrid>
          </Section>

          <Section>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Leadership</h2>
            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ padding: 18, background: tokens.color.surface, borderRadius: 11 }}>
                <div className="lbl" style={{ fontSize: 11, color: tokens.color.textSecondary, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Senior pastor
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: tokens.color.primary, marginTop: 6 }}>
                  {church.pastor || '—'}
                </div>
                <div style={{ fontSize: 13, color: tokens.color.textSecondary, marginTop: 2 }}>
                  {church.email || '—'}
                </div>
              </div>
              <div style={{ padding: 18, background: tokens.color.secondarySoft, borderRadius: 11, border: `1px solid ${tokens.color.warningBorder}` }}>
                <div className="lbl" style={{ fontSize: 11, color: tokens.color.textSecondary, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Primary representative
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: tokens.color.primary, marginTop: 6 }}>
                  {primaryRep?.name || '—'}
                </div>
                <div style={{ fontSize: 12.5, color: tokens.color.warningText, marginTop: 10 }}>
                  {primaryRep?.email || 'No representative on record yet.'}
                </div>
              </div>
            </div>
          </Section>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Section style={{ margin: 0, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 700 }}>Supporting documents</h3>
              <span style={{ color: tokens.color.textSecondary, fontSize: 12 }}>
                Not yet uploaded
              </span>
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'Pastor authorization letter.pdf', meta: '184 KB · signed 11 Nov' },
                { name: 'Certificate of registration.pdf', meta: '620 KB · official' },
                { name: 'Statement of faith.pdf', meta: '88 KB' },
              ].map((d) => (
                <DocRow key={d.name}>
                  <DocType>PDF</DocType>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.name}
                    </div>
                    <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>{d.meta}</div>
                  </div>
                  <Link href="#" style={{ color: tokens.color.info, fontSize: 12, fontWeight: 600 }}>
                    Preview
                  </Link>
                </DocRow>
              ))}
            </div>
          </Section>

          <Section style={{ margin: 0, padding: 22 }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 700 }}>Reviewer note</h3>
            <Textarea
              rows={4}
              placeholder="Add a note for the next reviewer or request changes from the applicant…"
              style={{ marginTop: 10 }}
            />
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
                <input type="checkbox" style={{ accentColor: tokens.color.primary }} /> Share with applicant
              </label>
              <Button $size="sm">Save note</Button>
            </div>
          </Section>
        </aside>
      </Grid>
    </>
  );
}
