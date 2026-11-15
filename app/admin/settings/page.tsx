'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, Eyebrow } from '@/components/ui/Card';
import { Label, Input, Select, FieldGroup } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

type Settings = {
  platformName: string; supportEmail: string;
  maintenanceMode: boolean; allowRegistrations: boolean; requireChurchVerification: boolean;
  defaultTimezone: string; brandPrimary: string; brandSecondary: string;
};

const Head = styled.div`
  margin-bottom: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Nav = styled.nav`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: fit-content;
  a {
    padding: 10px 12px;
    border-radius: 9px;
    font-size: 13.5px;
    font-weight: 600;
    color: ${tokens.color.textSecondary};
    cursor: pointer;
    &.active {
      background: ${tokens.color.secondarySoft};
      color: ${tokens.color.primary};
      font-weight: 700;
    }
  }
`;

const Role = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  padding: 14px;
  border: 1px solid ${tokens.color.border};
  border-radius: 11px;
  align-items: center;
  & + & { margin-top: 10px; }
`;

export default function AdminSettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/admin/settings');
      if (r.status === 403) { setForbidden(true); return; }
      const d = await r.json();
      setS(d.settings);
    })();
  }, []);

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS((prev) => (prev ? { ...prev, [k]: v } : prev));
  }

  async function save() {
    if (!s) return;
    setSaving(true);
    setNotice(null);
    const r = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    });
    setSaving(false);
    setNotice(r.ok ? 'Settings saved' : 'Could not save');
  }

  if (forbidden) return <div style={{ padding: 40 }}><h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin only</h1></div>;
  if (!s) return <div style={{ padding: 40, color: tokens.color.textSecondary }}>Loading settings…</div>;

  return (
    <>
      <Head>
        <Eyebrow>Platform</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Settings</h1>
      </Head>

      {notice && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: tokens.color.successBg, color: tokens.color.successText, border: `1px solid ${tokens.color.success}33`, borderRadius: 10, fontSize: 13 }}>
          {notice}
        </div>
      )}

      <Grid>
        <Nav>
          <a className="active">Organization</a>
          <a>Roles &amp; permissions</a>
          <a>Branding</a>
          <a>Security</a>
        </Nav>

        <div>
          <Card>
            <CardHeader>
              <h2>Organization</h2>
            </CardHeader>
            <FieldGroup $cols={2}>
              <div><Label>Platform name</Label><Input value={s.platformName} onChange={(e) => set('platformName', e.target.value)} /></div>
              <div><Label>Support email</Label><Input type="email" value={s.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} /></div>
              <div><Label>Default time zone</Label>
                <Select value={s.defaultTimezone} onChange={(e) => set('defaultTimezone', e.target.value)}>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/Sao_Paulo">America/São Paulo</option>
                  <option value="Asia/Mumbai">Asia/Mumbai</option>
                </Select>
              </div>
              <div><Label>Brand primary</Label><Input value={s.brandPrimary} onChange={(e) => set('brandPrimary', e.target.value)} /></div>
              <div><Label>Brand secondary</Label><Input value={s.brandSecondary} onChange={(e) => set('brandSecondary', e.target.value)} /></div>
            </FieldGroup>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={s.allowRegistrations} onChange={(e) => set('allowRegistrations', e.target.checked)} style={{ accentColor: tokens.color.primary, width: 16, height: 16 }} />
                Allow new user registrations
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={s.requireChurchVerification} onChange={(e) => set('requireChurchVerification', e.target.checked)} style={{ accentColor: tokens.color.primary, width: 16, height: 16 }} />
                Require admin verification for new churches
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={s.maintenanceMode} onChange={(e) => set('maintenanceMode', e.target.checked)} style={{ accentColor: tokens.color.primary, width: 16, height: 16 }} />
                Maintenance mode (limits public writes)
              </label>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save organization'}</Button>
            </div>
          </Card>

          <div style={{ height: 16 }} />

          <Card>
            <CardHeader>
              <h2>Roles &amp; permissions</h2>
              <Button $size="sm">+ New role</Button>
            </CardHeader>
            <Role>
              <div>
                <div style={{ fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
                  Super Admin <Badge $tone="error">System</Badge>
                </div>
                <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                  Full platform control · granted by another Super Admin · 2 users
                </div>
              </div>
              <span style={{ color: tokens.color.textSecondary, fontSize: 12 }}>42 / 42 perms</span>
              <a style={{ color: tokens.color.info, fontWeight: 600, fontSize: 12.5 }}>Manage</a>
            </Role>
            <Role>
              <div>
                <div style={{ fontWeight: 700 }}>Platform Admin</div>
                <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                  Manage users, churches, events, platform settings &amp; approvals · 6 users
                </div>
              </div>
              <span style={{ color: tokens.color.textSecondary, fontSize: 12 }}>38 / 42</span>
              <a style={{ color: tokens.color.info, fontWeight: 600, fontSize: 12.5 }}>Manage</a>
            </Role>
            <Role>
              <div>
                <div style={{ fontWeight: 700 }}>Event Director</div>
                <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                  Oversee event planning &amp; approvals within a region · 4 users
                </div>
              </div>
              <span style={{ color: tokens.color.textSecondary, fontSize: 12 }}>28 / 42</span>
              <a style={{ color: tokens.color.info, fontWeight: 600, fontSize: 12.5 }}>Manage</a>
            </Role>
            <Role>
              <div>
                <div style={{ fontWeight: 700 }}>Church Representative</div>
                <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                  Manage a specific church's information and event participation · 1,186 users
                </div>
              </div>
              <span style={{ color: tokens.color.textSecondary, fontSize: 12 }}>14 / 42</span>
              <a style={{ color: tokens.color.info, fontWeight: 600, fontSize: 12.5 }}>Manage</a>
            </Role>
          </Card>
        </div>
      </Grid>
    </>
  );
}
