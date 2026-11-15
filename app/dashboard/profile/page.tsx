'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, Eyebrow } from '@/components/ui/Card';
import { Input, Label, Select, Textarea, FieldGroup, Hint } from '@/components/ui/Input';
import { submitJson, isValidEmail, required } from '@/lib/form';

type Profile = {
  firstName: string; lastName: string; email: string; secondaryEmail: string;
  phone: string; displayName: string; pronouns: 'she' | 'he' | 'they' | 'x';
  language: string; bio: string; country: string; churchName: string;
  role: string; memberSince: string; verified: boolean;
};

const Head = styled.div`
  margin-bottom: 20px;
`;

const Hero = styled.div`
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  border: 1px solid ${tokens.color.border};
`;

const HeroBanner = styled.div`
  height: 140px;
  background:
    radial-gradient(1200px 300px at 20% 20%, rgba(198,164,91,0.35), transparent 60%),
    linear-gradient(135deg, #0b1428, ${tokens.color.primary} 55%, #1b2e55);
  @media (max-width: ${tokens.bp.mobile}) {
    height: 110px;
  }
`;

const HeroInner = styled.div`
  padding: 0 28px 24px;
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: end;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 0 18px 20px;
    grid-template-columns: 1fr;
    gap: 14px;
    justify-items: start;
  }
`;

const Avatar = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 24px;
  background: linear-gradient(135deg, ${tokens.color.secondary}, ${tokens.color.secondaryDeep});
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 38px;
  border: 4px solid #fff;
  box-shadow: 0 10px 30px rgba(11, 20, 40, 0.18);
  margin-top: -52px;
  flex-shrink: 0;
  @media (max-width: ${tokens.bp.mobile}) {
    width: 86px;
    height: 86px;
    font-size: 30px;
    border-radius: 20px;
    margin-top: -40px;
  }
`;

const HeroMeta = styled.div`
  min-width: 0;
  padding-top: 14px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding-top: 0;
    width: 100%;
  }
  h1 {
    font-family: ${tokens.font.display};
    font-weight: 800;
    font-size: clamp(22px, 4.5vw, 28px);
    line-height: 1.15;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
  }
  .sub {
    color: ${tokens.color.textSecondary};
    font-size: 13.5px;
    margin-top: 6px;
    overflow-wrap: anywhere;
  }
`;

const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const HeroActions = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 14px;
  @media (max-width: ${tokens.bp.mobile}) {
    width: 100%;
    padding-top: 2px;
    button, a { flex: 1; }
  }
`;

const Row2 = styled.div`
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 18px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const SideCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 20px;
  & + & { margin-top: 14px; }
`;

const Danger = styled.div`
  padding: 16px;
  background: ${tokens.color.errorSurface};
  border: 1px solid ${tokens.color.errorBorder};
  border-radius: 12px;
  margin-top: 14px;
`;

const SectionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 22px;
  margin-bottom: 10px;
  &:first-child { margin-top: 0; }
  h3 {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    font-weight: 700;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: ${tokens.color.border};
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  overflow: hidden;
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCell = styled.div`
  background: #fff;
  padding: 14px 16px;
  .lbl {
    color: ${tokens.color.textSecondary};
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .val {
    color: ${tokens.color.textPrimary};
    font-size: 14.5px;
    font-weight: 600;
    overflow-wrap: anywhere;
    line-height: 1.4;
  }
  .val.muted { color: ${tokens.color.textSecondary}; font-weight: 500; font-style: italic; }
`;

const BioBlock = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  padding: 16px 18px;
  color: ${tokens.color.textPrimary};
  font-size: 14px;
  line-height: 1.6;
  &.muted { color: ${tokens.color.textSecondary}; font-style: italic; }
`;

const PRONOUN_LABEL: Record<Profile['pronouns'], string> = {
  she: 'she / her',
  he: 'he / him',
  they: 'they / them',
  x: 'Prefer not to say',
};

const LANG_LABEL: Record<string, string> = {
  'en-GB': 'English (UK)',
  'en-US': 'English (US)',
  'pt-BR': 'Português (BR)',
};

function fallback(v: string | undefined, placeholder = 'Not set'): { text: string; muted: boolean } {
  const s = (v ?? '').trim();
  return s ? { text: s, muted: false } : { text: placeholder, muted: true };
}

export default function ProfilePage() {
  const router = useRouter();
  const [p, setP] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function requestDeletion() {
    setDeleteError(null);
    if (!deletePassword) { setDeleteError('Password required'); return; }
    if (deleteConfirm !== 'DELETE') { setDeleteError('Type DELETE to confirm'); return; }
    setDeleting(true);
    const res = await submitJson('/api/me/delete', { password: deletePassword, confirm: deleteConfirm });
    setDeleting(false);
    if (!res.ok) { setDeleteError(res.error); return; }
    await signOut({ callbackUrl: '/' });
    router.push('/');
  }

  useEffect(() => {
    fetch('/api/me/profile').then((r) => r.json()).then((d) => setP(d.profile));
  }, []);

  function startEdit() {
    if (!p) return;
    setDraft({ ...p });
    setEditing(true);
    setNotice(null);
  }

  function cancelEdit() {
    setDraft(null);
    setEditing(false);
    setNotice(null);
  }

  function setField<K extends keyof Profile>(k: K, v: Profile[K]) {
    setDraft((prev) => (prev ? { ...prev, [k]: v } : prev));
  }

  async function save() {
    if (!draft) return;
    setNotice(null);
    if (!required(draft.firstName)) { setNotice('First name is required.'); return; }
    if (!required(draft.lastName)) { setNotice('Last name is required.'); return; }
    if (draft.secondaryEmail && !isValidEmail(draft.secondaryEmail)) {
      setNotice('Secondary email is not a valid address.'); return;
    }
    setSaving(true);
    const res = await submitJson('/api/me/profile', {
      firstName: draft.firstName.trim(), lastName: draft.lastName.trim(), displayName: draft.displayName.trim(),
      pronouns: draft.pronouns, secondaryEmail: draft.secondaryEmail.trim(), phone: draft.phone.trim(),
      language: draft.language, bio: draft.bio.trim(), country: draft.country.trim(), churchName: draft.churchName.trim(),
    }, { method: 'PATCH' });
    setSaving(false);
    if (res.ok) {
      setP(draft);
      setEditing(false);
      setDraft(null);
      setNotice('Profile saved');
    } else {
      setNotice(res.error);
    }
  }

  if (!p) {
    return <div style={{ padding: 40, color: tokens.color.textSecondary }}>Loading profile…</div>;
  }

  const initials = ((p.firstName[0] || '') + (p.lastName[0] || '')).toUpperCase() || 'U';
  const since = new Date(p.memberSince).toLocaleString('en', { month: 'short', year: 'numeric' });
  const displayName = p.displayName?.trim() || `${p.firstName} ${p.lastName}`.trim() || p.email;

  return (
    <>
      <Head>
        <Eyebrow>Settings · account</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>Your profile</h1>
      </Head>

      <Hero>
        <HeroBanner />
        <HeroInner>
          <Avatar>{initials}</Avatar>
          <HeroMeta>
            <h1>{displayName}</h1>
            <div className="sub">
              {p.churchName || 'Independent'} · Member since {since}
            </div>
            <ChipRow>
              {p.verified
                ? <Badge $tone="success">✓ Email verified</Badge>
                : <Badge $tone="warning">⚠ Email not verified</Badge>}
              <Badge $tone="gold">{p.role.replace('_', ' ')}</Badge>
              {p.country && <Badge $tone="neutral">{p.country}</Badge>}
            </ChipRow>
          </HeroMeta>
          <HeroActions>
            {editing ? (
              <>
                <Button $variant="secondary" $size="sm" onClick={cancelEdit} disabled={saving}>Cancel</Button>
                <Button $size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
              </>
            ) : (
              <>
                <Button $variant="secondary" $size="sm" onClick={() => signOut({ callbackUrl: '/' })}>Sign out</Button>
                <Button $size="sm" onClick={startEdit}>Edit profile</Button>
              </>
            )}
          </HeroActions>
        </HeroInner>
      </Hero>

      {notice && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: tokens.color.successBg, color: tokens.color.successText, border: `1px solid ${tokens.color.success}33`, borderRadius: 10, fontSize: 13 }}>
          {notice}
        </div>
      )}

      <Row2>
        <Card>
          <CardHeader>
            <h2>{editing ? 'Edit details' : 'Personal details'}</h2>
            {!editing && (
              <button
                onClick={startEdit}
                style={{ background: 'none', border: 'none', color: tokens.color.primary, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Edit →
              </button>
            )}
          </CardHeader>

          {!editing ? (
            // ── VIEW MODE ─────────────────────────────────────────────
            <div>
              <SectionTitle><h3>Identity</h3></SectionTitle>
              <InfoGrid>
                <InfoCell>
                  <div className="lbl">First name</div>
                  <div className={`val ${fallback(p.firstName).muted ? 'muted' : ''}`}>{fallback(p.firstName).text}</div>
                </InfoCell>
                <InfoCell>
                  <div className="lbl">Last name</div>
                  <div className={`val ${fallback(p.lastName).muted ? 'muted' : ''}`}>{fallback(p.lastName).text}</div>
                </InfoCell>
                <InfoCell>
                  <div className="lbl">Display name</div>
                  <div className={`val ${fallback(p.displayName).muted ? 'muted' : ''}`}>{fallback(p.displayName).text}</div>
                </InfoCell>
                <InfoCell>
                  <div className="lbl">Pronouns</div>
                  <div className="val">{PRONOUN_LABEL[p.pronouns]}</div>
                </InfoCell>
              </InfoGrid>

              <SectionTitle><h3>Contact</h3></SectionTitle>
              <InfoGrid>
                <InfoCell>
                  <div className="lbl">Primary email</div>
                  <div className="val">{p.email}</div>
                </InfoCell>
                <InfoCell>
                  <div className="lbl">Secondary email</div>
                  <div className={`val ${fallback(p.secondaryEmail).muted ? 'muted' : ''}`}>{fallback(p.secondaryEmail, 'None').text}</div>
                </InfoCell>
                <InfoCell>
                  <div className="lbl">Telephone</div>
                  <div className={`val ${fallback(p.phone).muted ? 'muted' : ''}`}>{fallback(p.phone, 'Not provided').text}</div>
                </InfoCell>
                <InfoCell>
                  <div className="lbl">Country</div>
                  <div className={`val ${fallback(p.country).muted ? 'muted' : ''}`}>{fallback(p.country).text}</div>
                </InfoCell>
              </InfoGrid>

              <SectionTitle><h3>Preferences</h3></SectionTitle>
              <InfoGrid>
                <InfoCell>
                  <div className="lbl">Language</div>
                  <div className="val">{LANG_LABEL[p.language] ?? p.language}</div>
                </InfoCell>
                <InfoCell>
                  <div className="lbl">Church</div>
                  <div className={`val ${fallback(p.churchName).muted ? 'muted' : ''}`}>{fallback(p.churchName, 'Independent').text}</div>
                </InfoCell>
              </InfoGrid>

              <SectionTitle><h3>About</h3></SectionTitle>
              <BioBlock className={p.bio?.trim() ? '' : 'muted'}>
                {p.bio?.trim() || 'No bio yet. Add a short description to introduce yourself to your church’s team.'}
              </BioBlock>
            </div>
          ) : (
            // ── EDIT MODE ─────────────────────────────────────────────
            draft && (
              <FieldGroup $cols={2}>
                <div><Label>First name</Label><Input value={draft.firstName} onChange={(e) => setField('firstName', e.target.value)} /></div>
                <div><Label>Last name</Label><Input value={draft.lastName} onChange={(e) => setField('lastName', e.target.value)} /></div>
                <div><Label>Display name</Label><Input value={draft.displayName} onChange={(e) => setField('displayName', e.target.value)} /><Hint>Shown to other representatives and volunteers.</Hint></div>
                <div><Label>Pronouns</Label>
                  <Select value={draft.pronouns} onChange={(e) => setField('pronouns', e.target.value as Profile['pronouns'])}>
                    <option value="she">she / her</option>
                    <option value="he">he / him</option>
                    <option value="they">they / them</option>
                    <option value="x">Prefer not to say</option>
                  </Select>
                </div>
                <div><Label>Primary email</Label><Input type="email" value={draft.email} disabled /></div>
                <div><Label>Secondary email</Label><Input type="email" value={draft.secondaryEmail} onChange={(e) => setField('secondaryEmail', e.target.value)} /></div>
                <div><Label>Telephone</Label><Input value={draft.phone} onChange={(e) => setField('phone', e.target.value)} /></div>
                <div><Label>Language</Label>
                  <Select value={draft.language} onChange={(e) => setField('language', e.target.value)}>
                    <option value="en-GB">English (UK)</option>
                    <option value="en-US">English (US)</option>
                    <option value="pt-BR">Português (BR)</option>
                  </Select>
                </div>
                <div><Label>Country</Label><Input value={draft.country} onChange={(e) => setField('country', e.target.value)} /></div>
                <div><Label>Church (optional)</Label><Input value={draft.churchName} onChange={(e) => setField('churchName', e.target.value)} /></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Label>About you</Label>
                  <Textarea rows={3} value={draft.bio} onChange={(e) => setField('bio', e.target.value)} />
                  <Hint>A short bio shown on your church’s team page.</Hint>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                  <Button $variant="secondary" $size="sm" onClick={cancelEdit} disabled={saving}>Cancel</Button>
                  <Button $size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
                </div>
              </FieldGroup>
            )
          )}
        </Card>

        <aside>
          <SideCard>
            <div style={{ color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
              Account status
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {p.verified ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F3FBF6', border: '1px solid #BFE4CE', borderRadius: 10 }}>
                  <span style={{ color: '#0E4A2A', fontWeight: 600 }}>✓ Email verified</span>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: tokens.color.warningSurface, border: `1px solid ${tokens.color.warningBorder}`, borderRadius: 10 }}>
                  <span style={{ color: tokens.color.warningText, fontWeight: 600 }}>⚠ Email not verified</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: tokens.color.surface, border: `1px solid ${tokens.color.border}`, borderRadius: 10 }}>
                <span style={{ color: tokens.color.textSecondary }}>Role</span>
                <span style={{ fontWeight: 600 }}>{p.role.replace('_', ' ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: tokens.color.surface, border: `1px solid ${tokens.color.border}`, borderRadius: 10 }}>
                <span style={{ color: tokens.color.textSecondary }}>Member since</span>
                <span style={{ fontWeight: 600 }}>{since}</span>
              </div>
            </div>
          </SideCard>

          <Danger>
            <div style={{ color: tokens.color.errorText, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
              Danger zone
            </div>
            <div style={{ marginTop: 8, fontSize: 12.5, color: tokens.color.errorText, lineHeight: 1.55 }}>
              Deletion is permanent. Your account, registrations, volunteer applications,
              church memberships, messages, documents and tasks are removed. This cannot be undone.
            </div>
            {!showDelete ? (
              <Button $variant="danger" $size="sm" style={{ marginTop: 12 }} onClick={() => { setShowDelete(true); setDeleteError(null); }}>
                Delete my account
              </Button>
            ) : (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <Label>Confirm your password</Label>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Type DELETE to confirm</Label>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
                {deleteError && (
                  <div style={{ fontSize: 12.5, color: tokens.color.errorText, fontWeight: 600 }}>
                    {deleteError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button $variant="danger" $size="sm" onClick={requestDeletion} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Permanently delete'}
                  </Button>
                  <Button $variant="secondary" $size="sm" onClick={() => { setShowDelete(false); setDeletePassword(''); setDeleteConfirm(''); setDeleteError(null); }} disabled={deleting}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Danger>
        </aside>
      </Row2>
    </>
  );
}
