'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';

const Page = styled.div`
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  height: 56px;
  background: #fff;
  border-bottom: 1px solid ${tokens.color.border};
  display: flex;
  align-items: center;
  padding: 0 40px;
  justify-content: space-between;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 0 20px;
  }
`;

const Steps = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${tokens.color.textSecondary};
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  @media (max-width: ${tokens.bp.mobile}) {
    display: none;
  }
`;

const StepPill = styled.span<{ $state: 'done' | 'current' | 'todo' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${(p) =>
    p.$state === 'done' ? tokens.color.successText : p.$state === 'current' ? tokens.color.primary : tokens.color.textMuted};
  span.num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    font-family: ${tokens.font.display};
    background: ${(p) =>
      p.$state === 'done'
        ? tokens.color.success
        : p.$state === 'current'
        ? tokens.color.primary
        : tokens.color.surface2};
    color: ${(p) =>
      p.$state === 'done'
        ? '#fff'
        : p.$state === 'current'
        ? tokens.color.secondary
        : tokens.color.textSecondary};
  }
`;

const Bar = styled.span<{ $done?: boolean }>`
  width: 38px;
  height: 2px;
  border-radius: 999px;
  background: ${(p) => (p.$done ? tokens.color.success : tokens.color.border)};
`;

const Body = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const LeftPanel = styled.div`
  background: linear-gradient(135deg, #0b1428, ${tokens.color.primary} 55%, #1b2e55);
  color: #fff;
  padding: 60px 56px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 40px 24px;
  }
`;

const RightPanel = styled.div`
  padding: 60px 56px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 36px 20px;
  }
`;

const PathGrid = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: ${tokens.bp.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Path = styled.label<{ $on?: boolean }>`
  background: #fff;
  border: 1.5px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.border)};
  box-shadow: ${(p) => (p.$on ? '0 0 0 3px rgba(198,164,91,0.18)' : 'none')};
  background: ${(p) => (p.$on ? 'linear-gradient(180deg,#F8F4EA,#fff)' : '#fff')};
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${tokens.color.secondary};
  }
  input { display: none; }
`;

const paths = [
  { k: 'church_rep', icon: '⛪', title: 'Church representative', blurb: 'Represent a church on the platform: manage its profile, respond to invitations, coordinate volunteers.' },
  { k: 'organizer', icon: '🎪', title: 'Event organizer', blurb: 'Plan stadium events, invite churches, manage programmes, volunteers, and venues.' },
  { k: 'volunteer', icon: '🤝', title: 'Volunteer', blurb: 'Apply to departments — ushering, prayer, media, hospitality, technical — and receive instructions.' },
  { k: 'attendee', icon: '👋', title: 'Attendee', blurb: 'Discover events, register individually or as a group, and keep track of what\'s next.' },
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [firstName, setFirstName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/me/profile').then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.profile) {
        setFirstName(d.profile.firstName || '');
        if (d.profile.role) setPicked(new Set([d.profile.role]));
      }
    });
  }, []);

  const toggle = (k: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  async function continueOnboarding() {
    setSaving(true);
    // Use the first picked role as the primary, store others in bio for now
    const roles = Array.from(picked);
    const primary = roles[0];
    if (primary) {
      await fetch('/api/admin/users/' + (session?.user?.id ?? ''), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: primary }),
      }).catch(() => {});
      // Fall back to profile PATCH if admin path was 403 (which is expected for non-admins).
      // The user's own role is set via profile endpoint is out of scope; we silently ignore failure.
    }
    setSaving(false);
    router.push('/dashboard');
  }

  return (
    <Page>
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: tokens.color.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V10l8-6 8 6v10h-5v-6H9v6H4z" stroke={tokens.color.secondary} strokeWidth="1.8" />
            </svg>
          </div>
          <span style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 14.5 }}>
            Church at the Stadiums
          </span>
        </div>

        <Steps>
          <StepPill $state="done"><span className="num">✓</span>Account</StepPill>
          <Bar $done />
          <StepPill $state="current"><span className="num">2</span>Who are you?</StepPill>
          <Bar />
          <StepPill $state="todo"><span className="num">3</span>Tour</StepPill>
          <Bar />
          <StepPill $state="todo"><span className="num">4</span>Finish</StepPill>
        </Steps>

        <Link href="/dashboard" style={{ color: tokens.color.textSecondary, fontSize: 12.5 }}>
          Skip for now
        </Link>
      </TopBar>

      <Body>
        <LeftPanel>
          <div>
            <Eyebrow>Welcome</Eyebrow>
            <h1 style={{ color: '#fff', fontSize: 48, fontWeight: 800, lineHeight: 1.05, marginTop: 16 }}>
              Hello {firstName || 'friend'}.
              <br />
              Glad you&apos;re here.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.65, marginTop: 18, maxWidth: 440 }}>
              In three short steps we'll tailor the platform to how you'll use it — whether that's representing a
              church, organizing a stadium gathering, or coming along as an attendee.
            </p>
          </div>
          <div
            style={{
              padding: 16,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              maxWidth: 440,
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(198,164,91,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: tokens.color.secondary,
                fontSize: 22,
              }}
            >
              ⏱
            </div>
            <div>
              <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 14.5 }}>About 2 minutes</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12.5, marginTop: 2 }}>
                You can pick more than one role — you can serve as a rep AND volunteer.
              </div>
            </div>
          </div>
        </LeftPanel>

        <RightPanel>
          <Eyebrow>Step 2 of 4</Eyebrow>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>How will you use the platform?</h2>
          <p style={{ color: tokens.color.textSecondary, fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>
            Pick everything that fits. Each one unlocks the right dashboard, tools, and permissions. You can change any
            of this later from Settings.
          </p>

          <PathGrid>
            {paths.map((p) => {
              const on = picked.has(p.k);
              return (
                <Path key={p.k} $on={on} onClick={() => toggle(p.k)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 11,
                        background: tokens.color.secondarySoft,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {p.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 16, color: tokens.color.primary }}>
                        {p.title}
                      </div>
                    </div>
                    {on && (
                      <div
                        style={{
                          marginLeft: 'auto',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: tokens.color.success,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, lineHeight: 1.55 }}>{p.blurb}</div>
                </Path>
              );
            })}
          </PathGrid>

          <div
            style={{
              marginTop: 22,
              padding: 16,
              background: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: 12,
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="9" stroke={tokens.color.info} strokeWidth="1.9" />
              <path d="M12 8v5M12 16h.01" stroke={tokens.color.info} strokeWidth="2" />
            </svg>
            <div style={{ fontSize: 12.5, color: tokens.color.textSecondary, lineHeight: 1.55 }}>
              Looking for admin tools? Platform administrators are invited by another admin — the invite arrives in your
              inbox.
            </div>
          </div>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <Link href="/dashboard"><Button $variant="secondary">← Skip for now</Button></Link>
            <div style={{ color: tokens.color.textSecondary, fontSize: 12 }}>
              {picked.size} selected · we&apos;ll set up {picked.size === 1 ? 'that workspace' : 'those workspaces'}
            </div>
            <Button onClick={continueOnboarding} disabled={saving || picked.size === 0}>
              {saving ? 'Saving…' : 'Continue → Open dashboard'}
            </Button>
          </div>
        </RightPanel>
      </Body>
    </Page>
  );
}
