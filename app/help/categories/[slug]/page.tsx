'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Container, Section } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Spinner';

interface Category {
  slug: string;
  title: string;
  icon: string;
  bg: string;
  intro: string;
  articles: { slug: string; title: string; read: string; tag?: string }[];
}

const categories: Record<string, Category> = {
  churches: {
    slug: 'churches',
    title: 'Churches & verification',
    icon: '⛪',
    bg: tokens.color.secondarySoft,
    intro:
      'Everything about getting your church onto the platform — from the application process to the documents we need, verification turnaround and what verification unlocks.',
    articles: [
      { slug: 'verification-docs', title: 'What documents does our church need to be verified?', read: '6 min read', tag: 'Most read' },
      { slug: 'verification-timeline', title: 'How long does verification usually take?', read: '2 min read' },
      { slug: 'who-can-represent', title: 'Who in our church can be a representative?', read: '3 min read' },
      { slug: 'multi-branch', title: 'We have multiple branches — how do we register them?', read: '4 min read' },
      { slug: 'change-pastor', title: 'How do I update the lead pastor on our profile?', read: '2 min read' },
      { slug: 'verification-denied', title: 'Our verification was denied — what now?', read: '5 min read' },
      { slug: 'denomination-choice', title: 'What if my denomination is not listed?', read: '2 min read' },
      { slug: 'overseas-churches', title: "We're overseas — can we still join?", read: '3 min read' },
    ],
  },
  events: {
    slug: 'events',
    title: 'Events & registration',
    icon: '🎫',
    bg: tokens.color.infoBg,
    intro: 'How events work for attendees — registration, confirmations, tickets, groups, and what happens at the gate.',
    articles: [
      { slug: 'group-registration', title: 'How do I register for an event with my family or group?', read: '4 min read', tag: 'Most read' },
      { slug: 'registration-vs-attendance', title: "What's the difference between registration and attendance?", read: '3 min read' },
      { slug: 'digital-pass', title: 'Where do I find my digital pass?', read: '2 min read' },
      { slug: 'cancel-registration', title: 'Can I cancel my registration?', read: '3 min read' },
      { slug: 'free-events', title: 'Are events free? Will I be charged?', read: '2 min read' },
      { slug: 'under-18', title: 'Can my children attend?', read: '3 min read' },
      { slug: 'accessibility', title: 'Accessibility at the venue', read: '4 min read' },
    ],
  },
  volunteer: {
    slug: 'volunteer',
    title: 'Volunteering',
    icon: '🤝',
    bg: tokens.color.successBg,
    intro: 'Guides for volunteers — applying, reporting on the day, qualifications, and what each role actually does.',
    articles: [
      { slug: 'volunteer-reporting', title: "I'm a volunteer — how do I know when and where to show up?", read: '5 min read', tag: 'Most read' },
      { slug: 'volunteer-apply', title: 'How do I apply for a volunteer role?', read: '3 min read' },
      { slug: 'volunteer-withdraw', title: 'How do I withdraw from a volunteer assignment?', read: '2 min read' },
      { slug: 'first-aid-cert', title: 'Do I need a first-aid certificate?', read: '3 min read' },
      { slug: 'dbs-check', title: 'What is a DBS check and when do I need one?', read: '4 min read' },
    ],
  },
  organizers: {
    slug: 'organizers',
    title: 'Event organizers',
    icon: '🎪',
    bg: tokens.color.warningBg,
    intro: 'For church reps, directors, and coordinators running events on the platform.',
    articles: [
      { slug: 'propose-event', title: 'How do I propose a new event?', read: '5 min read' },
      { slug: 'invite-volunteers', title: 'Inviting volunteers to your event', read: '4 min read' },
      { slug: 'venue-partners', title: 'Working with venue partners', read: '6 min read' },
      { slug: 'crowd-plan', title: 'Submitting your crowd plan', read: '5 min read', tag: 'Required' },
      { slug: 'media-kit', title: 'Using the event media kit', read: '3 min read' },
    ],
  },
  account: {
    slug: 'account',
    title: 'Account & access',
    icon: '🔐',
    bg: tokens.color.surface2,
    intro: 'Sign-in, two-factor, roles, and privacy for your account.',
    articles: [
      { slug: 'password-reset', title: 'Password reset not arriving', read: '2 min read' },
      { slug: 'two-factor', title: 'Set up two-factor authentication', read: '3 min read', tag: 'Recommended' },
      { slug: 'change-email', title: 'Change the email on my account', read: '2 min read' },
      { slug: 'delete-account', title: 'Delete my account', read: '3 min read' },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy & safety',
    icon: '🛡',
    bg: tokens.color.errorBg,
    intro: 'How we handle your data, safeguarding, and reporting concerns.',
    articles: [
      { slug: 'data-we-hold', title: 'What data do we hold about you?', read: '4 min read' },
      { slug: 'report-safeguarding', title: 'Reporting a safeguarding concern', read: '3 min read', tag: 'Important' },
      { slug: 'cookies', title: 'Cookies and tracking', read: '3 min read' },
    ],
  },
  messaging: {
    slug: 'messaging',
    title: 'Messaging',
    icon: '✉',
    bg: '#F3E6FB',
    intro: 'How in-platform messages work, what gets delivered by email, and notification preferences.',
    articles: [
      { slug: 'notifications-settings', title: 'Managing notification preferences', read: '3 min read' },
      { slug: 'email-not-arriving', title: "My emails aren't arriving", read: '4 min read' },
    ],
  },
  venues: {
    slug: 'venues',
    title: 'Venues',
    icon: '🏟',
    bg: tokens.color.secondarySoft,
    intro: 'What each venue is like on event day — gates, facilities, and arrival.',
    articles: [
      { slug: 'wembley-arrival', title: 'Arriving at Wembley · gates and parking', read: '5 min read' },
      { slug: 'sofi-arrival', title: 'Arriving at SoFi Stadium · gates and parking', read: '4 min read' },
    ],
  },
};

const findCategory = (slug: string) => categories[slug];

const Hero = styled.section`
  background: linear-gradient(180deg, ${tokens.color.surface}, #fff);
  padding: 56px 0 32px;
`;

const Crumbs = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${tokens.color.textSecondary};
  font-size: 13px;
  margin-bottom: 18px;
  a:hover {
    color: ${tokens.color.primary};
  }
`;

const IconTile = styled.div<{ $bg: string }>`
  width: 68px;
  height: 68px;
  border-radius: 18px;
  background: ${(p) => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
`;

const ArticleRow = styled(Link)`
  display: grid;
  grid-template-columns: 1fr 100px 20px;
  gap: 16px;
  padding: 18px 22px;
  background: #fff;
  border-bottom: 1px solid ${tokens.color.surface2};
  align-items: center;
  transition: background 0.15s;
  &:hover {
    background: ${tokens.color.surface};
  }
  &:last-child {
    border-bottom: none;
  }
`;

const RowsWrap = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  overflow: hidden;
`;

const OtherCats = styled.div`
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const OtherChip = styled(Link)`
  padding: 12px 14px;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  &:hover {
    border-color: ${tokens.color.secondary};
  }
`;

type LiveCategory = { slug: string; title: string; description?: string; icon?: string; bg?: string };
type LiveArticle = { slug: string; title: string; readMinutes: number; views: number; updatedAt: string };

export default function HelpCategoryPage({ params }: { params: { slug: string } }) {
  const [cat, setCat] = useState<LiveCategory | null>(null);
  const [articles, setArticles] = useState<LiveArticle[]>([]);
  const [others, setOthers] = useState<LiveCategory[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/help/categories/${encodeURIComponent(params.slug)}`);
      if (!r.ok) { setStatus('missing'); return; }
      const d = await r.json();
      setCat(d.category);
      setArticles(d.articles ?? []);
      const all = await fetch('/api/help/categories').then((x) => x.json());
      setOthers((all.categories ?? []).filter((c: LiveCategory) => c.slug !== params.slug));
      setStatus('ready');
    })();
  }, [params.slug]);

  if (status === 'loading') return <><PublicNav /><Loading pad={60} /></>;
  if (status === 'missing' || !cat) return <><PublicNav /><div style={{ padding: 60, textAlign: 'center' }}><h1>Category not found</h1><Link href="/help" style={{ color: tokens.color.primary }}>Back to Help</Link></div></>;

  return (
    <>
      <PublicNav />
      <Hero>
        <Container>
          <Crumbs>
            <Link href="/help">Help center</Link>
            <span>/</span>
            <strong style={{ color: tokens.color.primary }}>{cat.title}</strong>
          </Crumbs>
          <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
            <IconTile $bg={cat.bg ?? tokens.color.surface2}>{cat.icon ?? '📚'}</IconTile>
            <div>
              <Eyebrow>Help topic</Eyebrow>
              <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 8, lineHeight: 1.1 }}>{cat.title}</h1>
              <p style={{ color: tokens.color.textSecondary, fontSize: 15, lineHeight: 1.65, marginTop: 10, maxWidth: 640 }}>
                {cat.description}
              </p>
              <div style={{ marginTop: 12 }}>
                <Badge $tone="neutral">{articles.length} articles</Badge>
              </div>
            </div>
          </div>
        </Container>
      </Hero>

      <Section>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Articles in this topic</h2>
            <span style={{ color: tokens.color.textSecondary, fontSize: 13 }}>Sorted by relevance</span>
          </div>
          <RowsWrap>
            {articles.length === 0 && (
              <div style={{ padding: 20, color: tokens.color.textSecondary, fontSize: 13 }}>No articles in this topic yet.</div>
            )}
            {articles.map((a) => (
              <ArticleRow key={a.slug} href={`/help/articles/${a.slug}`}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: tokens.color.textPrimary }}>{a.title}</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 4 }}>
                    {a.readMinutes} min read · {a.views.toLocaleString()} views
                  </div>
                </div>
                <span style={{ color: tokens.color.textSecondary, fontSize: 12.5 }}>{cat.title}</span>
                <span style={{ color: tokens.color.primary, fontWeight: 700 }}>→</span>
              </ArticleRow>
            ))}
          </RowsWrap>

          <div style={{ marginTop: 44 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Browse other topics</h2>
            <OtherCats>
              {others.map((o) => (
                <OtherChip key={o.slug} href={`/help/categories/${o.slug}`}>
                  <span style={{ fontSize: 18 }}>{o.icon ?? '•'}</span>
                  <span>{o.title}</span>
                </OtherChip>
              ))}
            </OtherCats>
          </div>

          <div
            style={{
              marginTop: 48,
              padding: 28,
              background: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: 14,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 20,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: 540 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>Didn't find your answer?</h3>
              <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6, lineHeight: 1.6 }}>
                Our support team replies to {cat.title.toLowerCase()} questions within one business day.
              </p>
            </div>
            <Link href="/help/support">
              <Button>Contact support →</Button>
            </Link>
          </div>
        </Container>
      </Section>
      <PublicFooter />
    </>
  );
}
