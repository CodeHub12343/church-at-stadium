'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, Eyebrow } from '@/components/ui/Card';
import { submitJson } from '@/lib/form';

const Head = styled.div`
  margin-bottom: 20px;
`;

const Table = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  overflow: hidden;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 110px 110px 110px 110px;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 22px;
  background: ${tokens.color.surface};
  border-bottom: 1px solid ${tokens.color.border};
  .col {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    font-weight: 700;
    text-align: center;
    &.first { text-align: left; }
  }
  @media (max-width: ${tokens.bp.mobile}) {
    display: none;
  }
`;

const Group = styled.div`
  padding: 16px 22px;
  background: #fbfbfd;
  border-bottom: 1px solid ${tokens.color.border};
  color: ${tokens.color.primary};
  font-weight: 700;
  font-size: 12.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-family: ${tokens.font.display};
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 12px 16px;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 110px 110px 110px 110px;
  gap: 12px;
  align-items: center;
  padding: 14px 22px;
  border-bottom: 1px solid ${tokens.color.surface2};
  &:last-child {
    border-bottom: none;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    display: block;
    padding: 14px 16px;
  }
`;

const ChannelGrid = styled.div`
  display: contents;
  @media (max-width: ${tokens.bp.mobile}) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed ${tokens.color.surface2};
  }
`;

const ChannelCell = styled.div`
  display: flex;
  justify-content: center;
  @media (max-width: ${tokens.bp.mobile}) {
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    background: ${tokens.color.surface};
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: ${tokens.color.textSecondary};
  }
`;

const ChannelLabel = styled.span`
  display: none;
  @media (max-width: ${tokens.bp.mobile}) {
    display: inline;
  }
`;

const QuietCard = styled.div`
  margin-top: 16px;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 22px 24px;
  display: flex;
  gap: 28px;
  align-items: center;
  flex-wrap: wrap;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 16px;
    gap: 14px;
  }
`;

const QuietControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  @media (max-width: ${tokens.bp.mobile}) {
    width: 100%;
    justify-content: space-between;
    select {
      flex: 1;
    }
  }
`;

const SaveBar = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  @media (max-width: ${tokens.bp.mobile}) {
    justify-content: stretch;
  }
`;

const Toggle = styled.button<{ $on?: boolean }>`
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background: ${(p) => (p.$on ? tokens.color.primary : tokens.color.borderStrong)};
  cursor: pointer;
  transition: background 0.15s;
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${(p) => (p.$on ? '19px' : '3px')};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.15s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  }
`;

const notificationCategories = [
  {
    group: 'Church & verification',
    items: [
      { k: 'church-app', t: 'Church application status', d: 'When your application moves between states or is approved.', defaults: [true, true, false, false] },
      { k: 'church-part', t: 'Church participation requests', d: 'When a church applies to an event you organize.', defaults: [true, true, false, false] },
    ],
  },
  {
    group: 'Events & registrations',
    items: [
      { k: 'ev-invites', t: 'New event invitations', d: 'When an organizer invites your church.', defaults: [true, true, false, false] },
      { k: 'ev-change', t: 'Schedule & gate changes', d: 'Important updates before and during an event.', defaults: [true, true, false, false], critical: true },
      { k: 'ev-reg', t: 'Registration confirmations & reminders', d: 'Your ticket, reference, and reminders.', defaults: [true, true, false, false] },
    ],
  },
  {
    group: 'Tasks & volunteers',
    items: [
      { k: 'tasks', t: 'Task assignments & due dates', d: "When you're assigned work or a deadline is approaching.", defaults: [true, true, false, false] },
      { k: 'vol-app', t: 'Volunteer application status', d: 'Approved, under review, or waitlisted.', defaults: [true, true, false, false] },
      { k: 'mentions', t: 'Direct messages & mentions', d: 'Someone writes to you or @-mentions you.', defaults: [false, true, false, false] },
    ],
  },
  {
    group: 'Platform & news',
    items: [
      { k: 'digest', t: 'Monthly network digest', d: 'New events, partner churches, feature updates.', defaults: [true, false, false, false] },
      { k: 'tips', t: 'Product tips & partner offers', d: 'Occasional emails about new tools and partner ministries.', defaults: [false, false, false, false] },
    ],
  },
];

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean[]>>(() => {
    const out: Record<string, boolean[]> = {};
    for (const g of notificationCategories) for (const it of g.items) out[it.k] = [...it.defaults];
    return out;
  });
  const [quiet, setQuiet] = useState({ start: '22:00', end: '07:00', enabled: true });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/me/preferences').then((r) => r.json()).then((d) => {
      if (d.notificationPrefs && Object.keys(d.notificationPrefs).length) {
        setPrefs((cur) => ({ ...cur, ...d.notificationPrefs }));
      }
      if (d.quietHours) setQuiet(d.quietHours);
    });
  }, []);

  const toggle = (k: string, idx: number) =>
    setPrefs((p) => ({ ...p, [k]: p[k].map((v, i) => (i === idx ? !v : v)) }));

  async function save() {
    setSaving(true);
    setNotice(null);
    const res = await submitJson('/api/me/preferences',
      { notificationPrefs: prefs, quietHours: quiet },
      { method: 'PATCH' },
    );
    setSaving(false);
    setNotice(res.ok ? 'Preferences saved' : res.error);
  }

  return (
    <>
      <Head>
        <Eyebrow>Account · notifications</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>How we reach you</h1>
        <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 4, maxWidth: 720, lineHeight: 1.55 }}>
          Choose which updates land in your inbox, your app, and — when enabled — your phone. Critical safety messages
          always deliver by email.
        </p>
      </Head>

      <Table>
        <Header>
          <div className="col first">Category</div>
          <div className="col">Email</div>
          <div className="col">In-app</div>
          <div className="col">
            Push
            <div><Badge $tone="warning" style={{ marginTop: 4 }}>Coming</Badge></div>
          </div>
          <div className="col">
            SMS / WhatsApp
            <div><Badge $tone="warning" style={{ marginTop: 4 }}>Coming</Badge></div>
          </div>
        </Header>

        {notificationCategories.map((g) => (
          <div key={g.group}>
            <Group>{g.group}</Group>
            {g.items.map((it) => (
              <Row key={it.k}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{it.t}</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>{it.d}</div>
                  {it.critical && (
                    <div style={{ marginTop: 4, color: tokens.color.errorText, fontSize: 11, fontWeight: 600 }}>
                      Always on for safety-critical changes.
                    </div>
                  )}
                </div>
                <ChannelGrid>
                  {prefs[it.k].map((on, i) => {
                    const label = ['Email', 'In-app', 'Push', 'SMS'][i];
                    return (
                      <ChannelCell key={i}>
                        <ChannelLabel>{label}</ChannelLabel>
                        <Toggle
                          $on={on}
                          onClick={() => toggle(it.k, i)}
                          aria-label={`Toggle ${label}`}
                          disabled={i >= 2}
                          style={i >= 2 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                        />
                      </ChannelCell>
                    );
                  })}
                </ChannelGrid>
              </Row>
            ))}
          </div>
        ))}
      </Table>

      <QuietCard>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Quiet hours</h2>
          <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 4 }}>
            Pause non-critical notifications during these hours in your local time zone.
          </div>
        </div>
        <QuietControls>
          <input
            type="time"
            value={quiet.start}
            onChange={(e) => setQuiet({ ...quiet, start: e.target.value })}
            style={{ padding: '9px 14px', border: `1px solid ${tokens.color.borderStrong}`, borderRadius: 9, fontFamily: 'inherit', fontSize: 13, background: '#fff' }}
          />
          <span style={{ color: tokens.color.textSecondary, fontSize: 13 }}>to</span>
          <input
            type="time"
            value={quiet.end}
            onChange={(e) => setQuiet({ ...quiet, end: e.target.value })}
            style={{ padding: '9px 14px', border: `1px solid ${tokens.color.borderStrong}`, borderRadius: 9, fontFamily: 'inherit', fontSize: 13, background: '#fff' }}
          />
          <Toggle $on={quiet.enabled} onClick={() => setQuiet({ ...quiet, enabled: !quiet.enabled })} />
        </QuietControls>
      </QuietCard>

      {notice && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: tokens.color.successBg, color: tokens.color.successText, border: `1px solid ${tokens.color.success}33`, borderRadius: 10, fontSize: 13 }}>
          {notice}
        </div>
      )}

      <SaveBar>
        <Button $block onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save preferences'}</Button>
      </SaveBar>
    </>
  );
}
