'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type Live = {
  article: { slug: string; title: string; body: string; categorySlug: string; categoryTitle?: string; readMinutes: number; views: number; updatedAt: string };
  related: Array<{ slug: string; title: string; readMinutes: number }>;
};

const BreadcrumbBg = styled.div`
  background: #fff;
  border-bottom: 1px solid ${tokens.color.border};
`;

const Breadcrumb = styled.div`
  padding: 14px 0;
  color: ${tokens.color.textSecondary};
  font-size: 12.5px;
  display: flex;
  gap: 8px;
  align-items: center;
  b { color: ${tokens.color.primary}; font-weight: 600; }
`;

const Body = styled.div`
  padding: 36px 0;
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  gap: 40px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
    padding: 28px 0;
  }
`;

const TOC = styled.aside`
  position: sticky;
  top: 20px;
  align-self: start;
  @media (max-width: ${tokens.bp.tablet}) {
    position: static;
  }
  .lbl {
    padding: 0 10px 10px;
    color: ${tokens.color.textSecondary};
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
  }
  a {
    display: block;
    padding: 7px 10px;
    border-radius: 7px;
    color: ${tokens.color.textSecondary};
    font-size: 13px;
    font-weight: 500;
    border-left: 2px solid transparent;
    cursor: pointer;
    &.on {
      background: ${tokens.color.secondarySoft};
      color: ${tokens.color.primary};
      font-weight: 700;
      border-left-color: ${tokens.color.secondary};
    }
    &:hover {
      background: ${tokens.color.surface};
      color: ${tokens.color.primary};
    }
  }
`;

const Article = styled.article`
  min-width: 0;
  h1 {
    font-size: 36px;
    font-weight: 800;
    margin-top: 14px;
    line-height: 1.1;
    @media (max-width: ${tokens.bp.mobile}) {
      font-size: 28px;
    }
  }
  h2 {
    font-size: 22px;
    font-weight: 700;
    margin-top: 32px;
  }
  p {
    color: ${tokens.color.textSecondary};
    font-size: 16px;
    line-height: 1.75;
    margin-top: 12px;
  }
  ul {
    color: ${tokens.color.textSecondary};
    font-size: 16px;
    line-height: 1.8;
    margin: 12px 0 0 22px;
  }
  .callout {
    margin-top: 20px;
    padding: 16px 18px;
    background: ${tokens.color.secondarySoft};
    border: 1px solid ${tokens.color.warningBorder};
    border-radius: 12px;
    color: ${tokens.color.warningText};
    display: flex;
    gap: 10px;
  }
  .toggleIllustration {
    margin-top: 14px;
    padding: 16px;
    background: #fbfbfd;
    border: 1px solid ${tokens.color.border};
    border-radius: 14px;
  }
`;

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Card = styled.div`
  padding: 18px;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
`;

export default function HelpArticlePage({ params }: { params: { slug: string } }) {
  const [live, setLive] = useState<Live | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    fetch(`/api/help/articles/${encodeURIComponent(params.slug)}`).then(async (r) => {
      if (!r.ok) { setStatus('missing'); return; }
      setLive(await r.json());
      setStatus('ready');
    }).catch(() => setStatus('missing'));
  }, [params.slug]);

  if (status === 'loading') return <><PublicNav /><div style={{ padding: 60, textAlign: 'center', color: tokens.color.textSecondary }}>Loading article…</div></>;
  if (status === 'missing' || !live) {
    return (
      <>
        <PublicNav />
        <Container>
          <div style={{ padding: '80px 0' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>Article not found</h1>
            <Link href="/help" style={{ color: tokens.color.primary, marginTop: 8, display: 'inline-block' }}>Back to Help</Link>
          </div>
        </Container>
      </>
    );
  }
  const a = live.article;

  return (
    <>
      <PublicNav />
      <BreadcrumbBg>
        <Container>
          <Breadcrumb>
            <Link href="/help">Help</Link>
            <span>/</span>
            {a.categoryTitle && (
              <>
                <Link href={`/help/categories/${a.categorySlug}`}>{a.categoryTitle}</Link>
                <span>/</span>
              </>
            )}
            <b>{a.title}</b>
          </Breadcrumb>
        </Container>
      </BreadcrumbBg>

      <Container>
        <Body>
          <TOC>
            <div className="lbl">In this topic</div>
            {live.related.length === 0 && <div style={{ color: tokens.color.textSecondary, fontSize: 12 }}>No related articles.</div>}
            {live.related.map((r) => (
              <Link key={r.slug} href={`/help/articles/${r.slug}`} style={{ color: tokens.color.textSecondary, fontSize: 13 }}>{r.title}</Link>
            ))}
          </TOC>

          <Article>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {a.categoryTitle && <Badge $tone="info">{a.categoryTitle}</Badge>}
              <span style={{ color: tokens.color.textSecondary, fontSize: 12.5 }}>
                {a.readMinutes} min read · {a.views.toLocaleString()} views
              </span>
            </div>
            <h1>{a.title}</h1>
            {a.body.split('\n\n').map((para, i) => (
              <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{para}</p>
            ))}

            <div className="callout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="9" stroke={tokens.color.warningText} strokeWidth="1.8" />
                <path d="M12 8v5M12 16h.01" stroke={tokens.color.warningText} strokeWidth="2" />
              </svg>
              <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                <strong>Church coaches of 20+?</strong> Ask your representative to coordinate from the church dashboard
                — one bulk roster is faster than several group registrations.
              </div>
            </div>

            <h2>Before you start</h2>
            <p>
              You'll need an account on the platform and, for each group member you add, their name and email. Children
              under 16 are added under a responsible adult — no separate account needed.
            </p>

            <h2>Step 1 · Open the event you want</h2>
            <p>
              From the public Events page or your dashboard, open the event's detail page. Tap <strong>Register</strong>
              at the top of the sidebar. On the registration screen, switch the toggle from <strong>Individual</strong>{' '}
              to <strong>Group (2+)</strong>.
            </p>
            <div className="toggleIllustration">
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  background: '#fff',
                  border: `1px solid ${tokens.color.border}`,
                  borderRadius: 11,
                  padding: 5,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: 11,
                    borderRadius: 7,
                    background: tokens.color.surface2,
                    color: tokens.color.textSecondary,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Individual
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: 11,
                    borderRadius: 7,
                    background: tokens.color.primary,
                    color: '#fff',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                    position: 'relative',
                  }}
                >
                  Group registration (2+)
                  <span
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -6,
                      background: tokens.color.secondary,
                      color: tokens.color.primary,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    tap this
                  </span>
                </div>
              </div>
            </div>

            <h2>Step 2 · Add your group members</h2>
            <p>Your details are pre-filled as the lead attendee. For each additional person tap <strong>+ Add member</strong>, then fill in:</p>
            <ul>
              <li>First and last name (required)</li>
              <li>Email, or a phone number if they don't use email</li>
              <li>Adult or child under 16 — children must be linked to a responsible adult</li>
              <li>Any accessibility notes for the hospitality team (optional, private)</li>
            </ul>

            <h2>Step 3 · Pick days attending</h2>
            <p>Each member can attend different days — for a two-evening event, tick the days by name.</p>

            <h2>Step 4 · Review and confirm</h2>
            <p>
              The review screen shows your whole group, days, and gate information. Tapping{' '}
              <strong>Confirm registration</strong> sends a ticket to every member with the group reference.
            </p>

            <div
              style={{
                marginTop: 36,
                padding: '18px 22px',
                background: '#fff',
                border: `1px solid ${tokens.color.border}`,
                borderRadius: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 15 }}>
                  Was this article helpful?
                </div>
                <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 2 }}>
                  Your feedback goes to the help team.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button $variant="secondary" $size="sm">👍 Yes, thanks</Button>
                <Button $variant="secondary" $size="sm">👎 Needs work</Button>
              </div>
            </div>
          </Article>

          <Aside>
            <Card>
              <div style={{ color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Article details
              </div>
              <div style={{ marginTop: 14, fontSize: 12.5, color: tokens.color.textSecondary, lineHeight: 1.7 }}>
                Updated{' '}
                <strong style={{ color: tokens.color.primary }}>
                  {live?.article.updatedAt
                    ? new Date(live.article.updatedAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </strong>
                <div>{live?.article.readMinutes ?? '—'} min read</div>
                <div>{live?.article.categoryTitle || live?.article.categorySlug || 'Help centre'}</div>
              </div>
            </Card>

            <Card>
              <div style={{ color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Still stuck?
              </div>
              <div style={{ marginTop: 8, fontSize: 12.5, color: tokens.color.textSecondary, lineHeight: 1.6 }}>
                We usually reply within one working day.
              </div>
              <Link href="/help/support" style={{ marginTop: 12, display: 'block' }}>
                <Button $variant="secondary" $block>Contact support</Button>
              </Link>
            </Card>
          </Aside>
        </Body>
      </Container>

      <PublicFooter />
    </>
  );
}
