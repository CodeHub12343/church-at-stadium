'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

type DocDetail = {
  id: string; name: string; type: string; sizeKB: number; pages?: number;
  access: 'Team' | 'Restricted' | 'Public';
  eventSlug?: string; folderName?: string; description?: string;
  createdAt: string; updatedAt: string;
};

function fmtSize(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}


const Toolbar = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 18px;
  align-items: flex-start;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Preview = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 0;
  overflow: hidden;
`;

const PreviewBar = styled.div`
  padding: 12px 20px;
  background: ${tokens.color.surface};
  border-bottom: 1px solid ${tokens.color.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  color: ${tokens.color.textSecondary};
`;

const Page = styled.div`
  background: #fff;
  min-height: 720px;
  padding: 48px 56px;
  font-family: ${tokens.font.body};
  font-size: 14.5px;
  line-height: 1.75;
  color: ${tokens.color.textPrimary};
  p:first-child {
    font-family: ${tokens.font.display};
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 20px;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 28px 22px;
  }
`;

const Aside = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Panel = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 18px 20px;
  h3 {
    font-family: ${tokens.font.display};
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    margin-bottom: 12px;
  }
  dl {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
  }
  dt {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    font-weight: 700;
  }
  dd {
    margin: 2px 0 0;
    font-size: 13.5px;
    font-weight: 600;
  }
`;

const Version = styled.div`
  padding: 10px 0;
  border-top: 1px solid ${tokens.color.surface2};
  &:first-child {
    border-top: none;
    padding-top: 0;
  }
`;

const Comment = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid ${tokens.color.surface2};
  &:first-child {
    border-top: none;
    padding-top: 0;
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: ${tokens.color.primary};
  color: ${tokens.color.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
`;

const accessTone = (a: string): BadgeTone =>
  a === 'Restricted' ? 'warning' : a === 'Public' ? 'info' : 'success';

export default function DocumentViewerPage({ params }: { params: { id: string } }) {
  const [live, setLive] = useState<DocDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    fetch(`/api/me/documents/${encodeURIComponent(params.id)}`).then(async (r) => {
      if (!r.ok) { setStatus('missing'); return; }
      const d = await r.json();
      setLive(d.document);
      setStatus('ready');
    }).catch(() => setStatus('missing'));
  }, [params.id]);

  if (status === 'loading') return <div style={{ padding: 40, color: tokens.color.textSecondary }}>Loading document…</div>;
  if (status === 'missing' || !live) return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Document not found</h1>
      <Link href="/dashboard/documents" style={{ color: tokens.color.primary, marginTop: 8, display: 'inline-block' }}>Back to documents</Link>
    </div>
  );

  // Use real data for the header; keep decorative preview below using fallback mock values
  const doc = {
    name: live.name,
    type: live.type,
    pages: live.pages ?? 1,
    size: fmtSize(live.sizeKB),
    owner: 'You',
    access: live.access as 'Team' | 'Restricted' | 'Public',
    event: live.eventSlug || live.folderName || 'Your library',
    pageText: live.description ? [live.description] : ['This is a placeholder preview. The real file viewer is coming soon.'],
    summary: live.description || `${live.type} document · ${fmtSize(live.sizeKB)}`,
    modified: new Date(live.updatedAt).toLocaleString(),
    versions: [] as Array<{ v: string; when: string; author: string; note?: string }>,
    comments: [] as Array<{ author: string; body: string; when: string; initials: string }>,
  };

  return (
    <>
      <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
        <Link href="/dashboard/documents">← Back to documents</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <Eyebrow>{doc.event}</Eyebrow>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{doc.name}</h1>
          <div style={{ color: tokens.color.textSecondary, fontSize: 13, marginTop: 4 }}>
            {doc.type} · {doc.pages} pages · {doc.size} · owned by {doc.owner}
          </div>
        </div>
        <Badge $tone={accessTone(doc.access)}>{doc.access}</Badge>
      </div>

      <Toolbar>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button $variant="ghost" $size="sm">← Prev</Button>
          <span style={{ fontSize: 12.5, color: tokens.color.textSecondary }}>
            Page <strong style={{ color: tokens.color.primary }}>1</strong> of {doc.pages}
          </span>
          <Button $variant="ghost" $size="sm">Next →</Button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button $variant="secondary" $size="sm">Share</Button>
          <Button $variant="secondary" $size="sm">↓ Download</Button>
          <Button $size="sm">Open full screen</Button>
        </div>
      </Toolbar>

      <Grid>
        <Preview>
          <PreviewBar>
            <span>{doc.name}</span>
            <span>100% · Fit width</span>
          </PreviewBar>
          <Page>
            {doc.pageText.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </Page>
        </Preview>

        <Aside>
          <Panel>
            <h3>Summary</h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: tokens.color.textSecondary }}>{doc.summary}</p>
          </Panel>

          <Panel>
            <h3>Details</h3>
            <dl>
              <div>
                <dt>Owner</dt>
                <dd>{doc.owner}</dd>
              </div>
              <div>
                <dt>Modified</dt>
                <dd>{doc.modified}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>{doc.access}</dd>
              </div>
              <div>
                <dt>Event</dt>
                <dd>{doc.event}</dd>
              </div>
            </dl>
          </Panel>

          <Panel>
            <h3>Version history</h3>
            {doc.versions.map((v) => (
              <Version key={v.v}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{v.v}</div>
                <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {v.author} · {v.when}
                </div>
                <div style={{ fontSize: 12.5, marginTop: 4, color: tokens.color.textSecondary }}>{v.note}</div>
              </Version>
            ))}
          </Panel>

          <Panel>
            <h3>Comments ({doc.comments.length})</h3>
            {doc.comments.length === 0 ? (
              <p style={{ fontSize: 13, color: tokens.color.textSecondary }}>No comments yet.</p>
            ) : (
              doc.comments.map((c, i) => (
                <Comment key={i}>
                  <Avatar>{c.initials}</Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5 }}>
                      <strong>{c.author}</strong>{' '}
                      <span style={{ color: tokens.color.textSecondary }}>· {c.when}</span>
                    </div>
                    <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.55, color: tokens.color.textSecondary }}>
                      {c.body}
                    </div>
                  </div>
                </Comment>
              ))
            )}
          </Panel>
        </Aside>
      </Grid>
    </>
  );
}
