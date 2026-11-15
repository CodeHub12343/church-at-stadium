'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled, { css } from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea, FieldGroup, Hint } from '@/components/ui/Input';
import { required, isValidEmail } from '@/lib/form';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

const COUNTRY_CODES = [
  { code: '+44', label: 'UK' },
  { code: '+1',  label: 'US/CA' },
  { code: '+55', label: 'BR' },
  { code: '+91', label: 'IN' },
  { code: '+49', label: 'DE' },
  { code: '+27', label: 'ZA' },
  { code: '+254', label: 'KE' },
  { code: '+233', label: 'GH' },
];

const COUNTRIES = ['United Kingdom','United States','Brazil','India','Germany','Ghana','Kenya','South Africa','Other'] as const;

const INTEREST_OPTIONS = [
  'Stadium Worship',
  'United Prayer',
  'Gospel Crusade',
  'Youth Gathering',
  'Outreach',
  'Conference',
  'Hosting churches',
  'Mobilizing volunteers',
];

const Page = styled.div`
  background: ${tokens.color.surface};
  min-height: 100vh;
`;

const Top = styled.div`
  background: #fff;
  border-bottom: 1px solid ${tokens.color.border};
  padding: 14px 32px;
  display: flex; justify-content: space-between; align-items: center;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 12px 16px;
  }
`;

const Brand = styled.div`
  display: flex; align-items: center; gap: 10px;
  font-family: ${tokens.font.display};
  font-weight: 800;
  font-size: 14.5px;
`;

const Shell = styled.div`
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 28px;
  padding: 32px 40px 60px;
  max-width: 1120px;
  margin: 0 auto;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    padding: 20px 16px 48px;
  }
`;

const Sidebar = styled.aside`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 22px 20px;
  height: fit-content;
  position: sticky; top: 24px;
  @media (max-width: 960px) {
    position: static;
  }
`;

const Eyebrow = styled.div`
  color: ${tokens.color.secondary};
  font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700;
`;

const SidebarH = styled.h2`
  font-size: 18px; font-weight: 700; margin-top: 6px;
`;

const StepNum = styled.div<{ $state: 'done' | 'active' | 'todo' }>`
  width: 28px; height: 28px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  flex-shrink: 0;
  ${(p) =>
    p.$state === 'done' &&
    css`background: ${tokens.color.primary}; color: #fff;`}
  ${(p) =>
    p.$state === 'active' &&
    css`background: ${tokens.color.primary}; color: #fff;`}
  ${(p) =>
    p.$state === 'todo' &&
    css`background: ${tokens.color.surface}; color: ${tokens.color.textSecondary}; border: 1px solid ${tokens.color.border};`}
`;

const StepList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: flex; flex-direction: column;
`;

const StepItem = styled.li<{ $state: 'done' | 'active' | 'todo' }>`
  display: flex; gap: 12px; padding: 10px 6px; cursor: pointer; align-items: flex-start;
  border-radius: 10px;
  .t {
    font-size: 13.5px; font-weight: 700;
    color: ${(p) => (p.$state === 'todo' ? tokens.color.textSecondary : tokens.color.textPrimary)};
  }
  .d {
    font-size: 11.5px; color: ${tokens.color.textSecondary}; margin-top: 2px;
  }
  &:hover { background: ${tokens.color.surface}; }
`;

const Autosave = styled.div`
  margin-top: 22px;
  padding: 12px 14px;
  background: ${tokens.color.secondarySoft};
  border: 1px solid ${tokens.color.secondary}33;
  border-radius: 11px;
  font-size: 12px;
  color: ${tokens.color.textPrimary};
  .h { font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
`;

const Main = styled.section`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 32px 36px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 22px 18px;
  }
`;

const StepLabel = styled.div`
  color: ${tokens.color.textSecondary};
  font-size: 11.5px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700;
`;

const StepH1 = styled.h1`
  font-size: 24px; font-weight: 700; margin-top: 4px;
`;

const StepSub = styled.p`
  color: ${tokens.color.textSecondary}; font-size: 13.5px; margin-top: 6px; line-height: 1.55;
`;

const Divider = styled.div`
  border-top: 1px solid ${tokens.color.surface2};
  margin: 24px 0 22px;
`;

const SubHead = styled.div`
  font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 10px;
  .badge { font-size: 10.5px; font-weight: 700; color: ${tokens.color.secondary};
    background: ${tokens.color.secondarySoft};
    padding: 3px 8px; border-radius: 999px; letter-spacing: 0.08em; text-transform: uppercase; }
`;

const SubSub = styled.p`
  font-size: 12.5px; color: ${tokens.color.textSecondary}; margin: 4px 0 14px; line-height: 1.5;
`;

const PhoneWrap = styled.div`
  display: grid; grid-template-columns: 90px 1fr; gap: 8px;
`;

const Attachment = styled.div`
  border: 1px solid ${tokens.color.border};
  border-radius: 11px;
  padding: 12px 14px;
  display: flex; align-items: center; gap: 12px;
  font-size: 13px;
  .icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: ${tokens.color.surface2};
    color: ${tokens.color.textSecondary};
    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px;
  }
  .name { font-weight: 600; }
  .meta { font-size: 11.5px; color: ${tokens.color.textSecondary}; margin-top: 2px; }
  .actions { margin-left: auto; display: flex; gap: 12px; font-size: 12.5px; }
  .actions a, .actions button {
    color: ${tokens.color.info}; font-weight: 600; cursor: pointer;
    background: transparent; border: 0; padding: 0;
  }
`;

const ContactRow = styled.div`
  border: 1px solid ${tokens.color.border};
  border-radius: 11px;
  padding: 12px 14px;
  display: flex; align-items: center; gap: 12px;
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: ${tokens.color.surface2};
    color: ${tokens.color.textSecondary}; font-weight: 700; font-size: 11px;
    display: flex; align-items: center; justify-content: center; }
  .n { font-weight: 600; font-size: 13px; }
  .d { font-size: 11.5px; color: ${tokens.color.textSecondary}; margin-top: 2px; }
  .actions { margin-left: auto; }
  button {
    background: transparent; border: 0; color: ${tokens.color.info}; font-weight: 600; font-size: 12.5px;
    cursor: pointer;
  }
`;

const AddBtn = styled.button`
  width: 100%;
  background: transparent;
  border: 1.5px dashed ${tokens.color.borderStrong};
  color: ${tokens.color.textSecondary};
  padding: 11px 14px;
  border-radius: 11px;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  &:hover { border-color: ${tokens.color.primary}; color: ${tokens.color.primary}; }
`;

const InterestChip = styled.button<{ $on?: boolean }>`
  border: 1.5px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.borderStrong)};
  background: ${(p) => (p.$on ? tokens.color.primary : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : tokens.color.textSecondary)};
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 12.5px; font-weight: 600;
  cursor: pointer;
  margin: 0 8px 8px 0;
`;

const FooterBar = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-top: 28px;
  .saved {
    color: ${tokens.color.secondary}; font-size: 12px; font-weight: 600;
    display: flex; align-items: center; gap: 6px;
  }
  .saved::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%; background: ${tokens.color.secondary};
  }
`;

const ReviewCard = styled.div`
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 12px;
  .h { font-weight: 700; font-size: 13.5px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .h button { background: transparent; border: 0; color: ${tokens.color.info}; font-weight: 600; font-size: 12px; cursor: pointer; }
  dl { display: grid; grid-template-columns: 1fr 2fr; gap: 6px 14px; margin: 0; font-size: 13px; }
  dt { color: ${tokens.color.textSecondary}; font-weight: 500; }
  dd { margin: 0; color: ${tokens.color.textPrimary}; }
`;

type StepId = 1 | 2 | 3 | 4 | 5;

const STEPS: { id: StepId; title: string; desc: string }[] = [
  { id: 1, title: 'Church information', desc: 'Name, location, contacts' },
  { id: 2, title: 'Leadership information', desc: 'Pastor & representative' },
  { id: 3, title: 'Church profile', desc: 'Mission, size, ministries' },
  { id: 4, title: 'Event participation', desc: 'Interests & capacity' },
  { id: 5, title: 'Verification', desc: 'Documents & review' },
];

type Contact = { name: string; role: string; email: string };

export default function NewChurchWizardPage() {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<StepId>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [authFile, setAuthFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [f, setF] = useState({
    name: '',
    denomination: 'Non-denominational',
    established: new Date().getFullYear(),
    website: '',
    email: '',
    country: 'United Kingdom',
    city: '',
    pastorName: '',
    pastorTitle: 'Senior Pastor',
    pastorEmail: '',
    pastorPhoneCode: '+44',
    pastorPhone: '',
    pastorYears: '',
    repName: '',
    repRole: 'Church Administrator',
    repEmail: '',
    repPhoneCode: '+44',
    repPhone: '',
    bio: '',
    size: '',
    branches: 1,
    interests: [] as string[],
  });

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  // Prefill primary rep from the signed-in user
  useEffect(() => {
    fetch('/api/me/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.profile) return;
        const p = d.profile as { firstName?: string; lastName?: string; email?: string };
        const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ');
        setF((prev) => ({
          ...prev,
          repName: prev.repName || fullName,
          repEmail: prev.repEmail || p.email || '',
        }));
      })
      .catch(() => {});
  }, []);

  function onImagePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > MAX_IMAGE_BYTES) { setError('Image must be 5 MB or smaller.'); return; }
    setError(null);
    setImage(file);
    const r = new FileReader();
    r.onload = () => setImagePreview(typeof r.result === 'string' ? r.result : null);
    r.readAsDataURL(file);
  }

  function onPdfPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setError('Authorization letter must be a PDF.'); return; }
    if (file.size > MAX_PDF_BYTES) { setError('Authorization letter must be 10 MB or smaller.'); return; }
    setError(null);
    setAuthFile(file);
  }

  function toggleInterest(x: string) {
    setF((prev) => ({
      ...prev,
      interests: prev.interests.includes(x)
        ? prev.interests.filter((i) => i !== x)
        : [...prev.interests, x],
    }));
  }

  function validateStep(s: StepId): string | null {
    if (s === 1) {
      if (!required(f.name)) return 'Church name is required.';
      if (!required(f.city)) return 'City is required.';
      if (!required(f.country)) return 'Country is required.';
      if (f.email && !isValidEmail(f.email)) return 'Official email is not valid.';
    }
    if (s === 2) {
      if (!required(f.pastorName)) return 'Senior pastor name is required.';
      if (!required(f.pastorTitle)) return 'Pastor title is required.';
      if (f.pastorEmail && !isValidEmail(f.pastorEmail)) return 'Pastor email is not valid.';
      if (!required(f.repName)) return 'Primary representative name is required.';
      if (!isValidEmail(f.repEmail)) return 'Primary representative email is required.';
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError(null);
    if (step < 5) setStep((step + 1) as StepId);
  }

  function back() {
    setError(null);
    if (step > 1) setStep((step - 1) as StepId);
  }

  async function submit() {
    const err = validateStep(1) || validateStep(2);
    if (err) { setError(err); return; }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('name', f.name);
    fd.append('denomination', f.denomination);
    fd.append('established', String(f.established));
    fd.append('website', f.website);
    fd.append('email', f.email);
    fd.append('country', f.country);
    fd.append('city', f.city);
    fd.append('pastor', f.pastorName);
    fd.append('pastorTitle', f.pastorTitle);
    fd.append('pastorEmail', f.pastorEmail);
    fd.append('pastorPhone', f.pastorPhone ? `${f.pastorPhoneCode} ${f.pastorPhone}` : '');
    fd.append('pastorYears', f.pastorYears);
    fd.append('repName', f.repName);
    fd.append('repRole', f.repRole);
    fd.append('repEmail', f.repEmail);
    fd.append('repPhone', f.repPhone ? `${f.repPhoneCode} ${f.repPhone}` : '');
    fd.append('bio', f.bio);
    fd.append('size', f.size);
    fd.append('branches', String(f.branches));
    fd.append('interests', JSON.stringify(f.interests));
    if (image) fd.append('image', image);
    if (authFile) fd.append('authorizationLetter', authFile);

    const res = await fetch('/api/me/churches', { method: 'POST', body: fd });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as { error?: string }));
      setError(data.error || 'Failed to create church.');
      return;
    }
    router.push('/dashboard/churches');
  }

  return (
    <Page>
      <Top>
        <Brand>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: tokens.color.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V10l8-6 8 6v10h-5v-6H9v6H4z" stroke={tokens.color.secondary} strokeWidth="1.8" />
            </svg>
          </div>
          <span>Church at the Stadiums</span>
        </Brand>
        <Link href="/dashboard/churches" style={{ color: tokens.color.textSecondary, fontSize: 13 }}>
          Save &amp; exit
        </Link>
      </Top>

      <Shell>
        <Sidebar>
          <Eyebrow>Church application</Eyebrow>
          <SidebarH>Join our network</SidebarH>
          <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 6 }}>{step} / 5</div>

          <StepList>
            {STEPS.map((s) => {
              const state: 'done' | 'active' | 'todo' =
                s.id < step ? 'done' : s.id === step ? 'active' : 'todo';
              return (
                <StepItem key={s.id} $state={state} onClick={() => setStep(s.id)}>
                  <StepNum $state={state}>
                    {state === 'done' ? '✓' : s.id}
                  </StepNum>
                  <div>
                    <div className="t">{s.title}</div>
                    <div className="d">{s.desc}</div>
                  </div>
                </StepItem>
              );
            })}
          </StepList>

          <Autosave>
            <div className="h">💡 Autosave</div>
            Your progress is held in this browser. You can continue later from your dashboard after your first save.
          </Autosave>
        </Sidebar>

        <Main>
          <StepLabel>Step {step} of 5</StepLabel>
          <StepH1>{STEPS[step - 1].title}</StepH1>
          {step === 1 && <StepSub>Tell us about your church — the basics that appear on your public profile.</StepSub>}
          {step === 2 && <StepSub>Tell us about your senior leadership and the person who will represent your church on the platform.</StepSub>}
          {step === 3 && <StepSub>What makes your church distinct — mission, size, and a short bio.</StepSub>}
          {step === 4 && <StepSub>Let us know what kinds of gatherings your church wants to join.</StepSub>}
          {step === 5 && <StepSub>Review your details and attach any supporting documents.</StepSub>}

          <Divider />

          {step === 1 && (
            <>
              <FieldGroup $cols={2}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Label>Official church name *</Label>
                  <Input value={f.name} placeholder="Your church's registered name" onChange={(e) => set('name', e.target.value)} />
                </div>
                <div>
                  <Label>Denomination</Label>
                  <Input value={f.denomination} onChange={(e) => set('denomination', e.target.value)} />
                </div>
                <div>
                  <Label>Year established</Label>
                  <Input type="number" value={String(f.established)} onChange={(e) => set('established', Number(e.target.value) || new Date().getFullYear())} />
                </div>
                <div>
                  <Label>Country *</Label>
                  <Select value={f.country} onChange={(e) => set('country', e.target.value)}>
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>City *</Label>
                  <Input value={f.city} onChange={(e) => set('city', e.target.value)} />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={f.website} placeholder="https://" onChange={(e) => set('website', e.target.value)} />
                </div>
                <div>
                  <Label>Official email</Label>
                  <Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
                </div>
              </FieldGroup>
            </>
          )}

          {step === 2 && (
            <>
              <SubHead>Senior pastor</SubHead>
              <SubSub>&nbsp;</SubSub>
              <FieldGroup $cols={2}>
                <div>
                  <Label>Full name *</Label>
                  <Input value={f.pastorName} placeholder="Rev. Daniel Okonkwo" onChange={(e) => set('pastorName', e.target.value)} />
                </div>
                <div>
                  <Label>Title / position *</Label>
                  <Input value={f.pastorTitle} onChange={(e) => set('pastorTitle', e.target.value)} />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={f.pastorEmail} onChange={(e) => set('pastorEmail', e.target.value)} />
                </div>
                <div>
                  <Label>Telephone</Label>
                  <PhoneWrap>
                    <Select value={f.pastorPhoneCode} onChange={(e) => set('pastorPhoneCode', e.target.value)}>
                      {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </Select>
                    <Input value={f.pastorPhone} onChange={(e) => set('pastorPhone', e.target.value)} placeholder="20 7946 0123" />
                  </PhoneWrap>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Label>Years in leadership</Label>
                  <Input value={f.pastorYears} placeholder="12 years at Grace International Fellowship" onChange={(e) => set('pastorYears', e.target.value)} />
                  <Hint>Optional. Appears on your public verification badge.</Hint>
                </div>
              </FieldGroup>

              <Divider />

              <SubHead>Primary representative <span className="badge">Platform contact</span></SubHead>
              <SubSub>This person manages your church's presence, invitations, and event participation on the platform.</SubSub>
              <FieldGroup $cols={2}>
                <div>
                  <Label>Full name *</Label>
                  <Input value={f.repName} onChange={(e) => set('repName', e.target.value)} />
                </div>
                <div>
                  <Label>Position in church *</Label>
                  <Select value={f.repRole} onChange={(e) => set('repRole', e.target.value)}>
                    <option>Church Administrator</option>
                    <option>Senior Pastor</option>
                    <option>Associate Pastor</option>
                    <option>Elder</option>
                    <option>Volunteer Coordinator</option>
                    <option>Other</option>
                  </Select>
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={f.repEmail} onChange={(e) => set('repEmail', e.target.value)} />
                  <Hint>This is also the account used to sign in.</Hint>
                </div>
                <div>
                  <Label>Telephone</Label>
                  <PhoneWrap>
                    <Select value={f.repPhoneCode} onChange={(e) => set('repPhoneCode', e.target.value)}>
                      {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </Select>
                    <Input value={f.repPhone} onChange={(e) => set('repPhone', e.target.value)} placeholder="7700 900 143" />
                  </PhoneWrap>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <Label>Authorization to represent church</Label>
                  <input ref={pdfRef} type="file" accept="application/pdf" onChange={onPdfPicked} style={{ display: 'none' }} />
                  {authFile ? (
                    <Attachment>
                      <div className="icon">PDF</div>
                      <div>
                        <div className="name">{authFile.name}</div>
                        <div className="meta">{Math.round(authFile.size / 1024)} KB · Ready to upload</div>
                      </div>
                      <div className="actions">
                        <button onClick={() => pdfRef.current?.click()}>Replace</button>
                        <button onClick={() => setAuthFile(null)}>Remove</button>
                      </div>
                    </Attachment>
                  ) : (
                    <AddBtn type="button" onClick={() => pdfRef.current?.click()}>+ Attach PDF</AddBtn>
                  )}
                  <Hint>A signed letter from your senior pastor confirming this person represents the church. PDF, max 10 MB.</Hint>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <Label>Additional contacts <span style={{ fontWeight: 400, color: tokens.color.textSecondary }}>(optional)</span></Label>
                  {contacts.map((c, i) => (
                    <ContactRow key={i} style={{ marginTop: i === 0 ? 0 : 8 }}>
                      <div className="avatar">{c.name.split(' ').map((n) => n[0]).slice(0, 2).join('') || '?'}</div>
                      <div>
                        <div className="n">{c.name || 'Unnamed'}</div>
                        <div className="d">{c.role || 'Role'} · {c.email}</div>
                      </div>
                      <div className="actions">
                        <button onClick={() => setContacts(contacts.filter((_, ix) => ix !== i))}>Remove</button>
                      </div>
                    </ContactRow>
                  ))}
                  <AddBtn type="button" onClick={() => {
                    const name = prompt('Contact name') || '';
                    if (!name) return;
                    const role = prompt('Position / role') || '';
                    const email = prompt('Email') || '';
                    setContacts([...contacts, { name, role, email }]);
                  }}>+ Add another contact</AddBtn>
                </div>
              </FieldGroup>
            </>
          )}

          {step === 3 && (
            <FieldGroup $cols={2}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Short bio</Label>
                <Textarea rows={5} value={f.bio} onChange={(e) => set('bio', e.target.value)}
                  placeholder="A few sentences about your mission, your community, and where you gather." />
              </div>
              <div>
                <Label>Congregation size</Label>
                <Input value={f.size} placeholder="e.g. ~500 members" onChange={(e) => set('size', e.target.value)} />
              </div>
              <div>
                <Label>Branches</Label>
                <Input type="number" value={String(f.branches)} onChange={(e) => set('branches', Number(e.target.value) || 1)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Church image</Label>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                  <div style={{
                    width: 96, height: 96, borderRadius: 14,
                    background: imagePreview ? `url(${imagePreview}) center/cover no-repeat` : tokens.color.surface,
                    border: `1px solid ${tokens.color.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.08em',
                    textTransform: 'uppercase', fontWeight: 700,
                  }}>{imagePreview ? '' : 'No image'}</div>
                  <div>
                    <input ref={imageRef} type="file" accept="image/*" onChange={onImagePicked} style={{ display: 'none' }} />
                    <Button $variant="secondary" $size="sm" onClick={() => imageRef.current?.click()}>
                      {image ? 'Replace image' : 'Upload image'}
                    </Button>
                    <Hint>PNG, JPG, WebP or GIF. Up to 5 MB.</Hint>
                  </div>
                </div>
              </div>
            </FieldGroup>
          )}

          {step === 4 && (
            <div>
              <Label>Which gatherings is your church interested in joining?</Label>
              <div style={{ marginTop: 10 }}>
                {INTEREST_OPTIONS.map((x) => (
                  <InterestChip key={x} type="button" $on={f.interests.includes(x)} onClick={() => toggleInterest(x)}>
                    {f.interests.includes(x) ? '✓ ' : '+ '}{x}
                  </InterestChip>
                ))}
              </div>
              <Hint>Pick as many as apply. You can change these later.</Hint>
            </div>
          )}

          {step === 5 && (
            <>
              <ReviewCard>
                <div className="h">Church information <button onClick={() => setStep(1)}>Edit</button></div>
                <dl>
                  <dt>Name</dt><dd>{f.name || '—'}</dd>
                  <dt>Location</dt><dd>{[f.city, f.country].filter(Boolean).join(', ') || '—'}</dd>
                  <dt>Denomination</dt><dd>{f.denomination}</dd>
                  <dt>Established</dt><dd>{f.established}</dd>
                  <dt>Website</dt><dd>{f.website || '—'}</dd>
                </dl>
              </ReviewCard>

              <ReviewCard>
                <div className="h">Leadership <button onClick={() => setStep(2)}>Edit</button></div>
                <dl>
                  <dt>Senior pastor</dt><dd>{f.pastorName} {f.pastorTitle ? `(${f.pastorTitle})` : ''}</dd>
                  <dt>Primary rep</dt><dd>{f.repName} — {f.repEmail}</dd>
                  <dt>Authorization letter</dt><dd>{authFile ? authFile.name : 'Not attached'}</dd>
                </dl>
              </ReviewCard>

              <ReviewCard>
                <div className="h">Profile &amp; interests <button onClick={() => setStep(3)}>Edit</button></div>
                <dl>
                  <dt>Congregation</dt><dd>{f.size || '—'} · {f.branches} {f.branches === 1 ? 'branch' : 'branches'}</dd>
                  <dt>Interests</dt><dd>{f.interests.length ? f.interests.join(', ') : 'None selected'}</dd>
                </dl>
              </ReviewCard>

              <div style={{
                marginTop: 14, padding: '12px 14px',
                background: tokens.color.secondarySoft,
                border: `1px solid ${tokens.color.secondary}33`,
                borderRadius: 11, fontSize: 12.5, color: tokens.color.textPrimary,
              }}>
                <b>Instant publish:</b> on submit, your church is added to the network and you are set as its
                first representative — no admin approval needed.
              </div>
            </>
          )}

          {error && (
            <div style={{
              marginTop: 16,
              padding: '10px 12px',
              background: tokens.color.errorSurface,
              border: `1px solid ${tokens.color.errorBorder}`,
              color: tokens.color.errorText,
              borderRadius: 10, fontSize: 13,
            }}>{error}</div>
          )}

          <FooterBar>
            {step > 1 ? (
              <Button $variant="ghost" onClick={back}>← Back</Button>
            ) : (
              <span />
            )}
            <span className="saved">Saved just now</span>
            {step < 5 ? (
              <Button onClick={next}>
                Continue to {STEPS[step].title} →
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting}>
                {submitting ? 'Publishing…' : 'Submit application →'}
              </Button>
            )}
          </FooterBar>
        </Main>
      </Shell>
    </Page>
  );
}
