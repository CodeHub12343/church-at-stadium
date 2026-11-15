'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled, { css } from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea, FieldGroup, Hint } from '@/components/ui/Input';
import { required } from '@/lib/form';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const CATEGORIES = [
  'Stadium Worship',
  'United Prayer',
  'Gospel Crusade',
  'Conference',
  'Youth Gathering',
  'Outreach',
] as const;

const DEPT_DEFAULTS: { name: string; slots: number }[] = [
  { name: 'Ushering', slots: 240 },
  { name: 'Prayer Team', slots: 120 },
  { name: 'Hospitality', slots: 160 },
  { name: 'Media', slots: 80 },
  { name: 'Technical', slots: 80 },
  { name: 'Registration', slots: 40 },
  { name: 'Security Coordination', slots: 40 },
  { name: 'Medical Coordination', slots: 20 },
  { name: 'Logistics', slots: 40 },
  { name: 'Cleanup', slots: 60 },
];

const COUNTRIES = ['United Kingdom','United States','Brazil','India','Germany','Ghana','Kenya','South Africa','Other'] as const;

const Page = styled.div`
  background: ${tokens.color.surface};
  min-height: 100vh;
`;

const TopBar = styled.div`
  background: #fff;
  border-bottom: 1px solid ${tokens.color.border};
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 5;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 12px 16px;
  }
`;

const Crumbs = styled.div`
  color: ${tokens.color.textSecondary};
  font-size: 12.5px;
  a { color: inherit; }
  b { color: ${tokens.color.textPrimary}; font-weight: 600; }
`;

const TopActions = styled.div`
  display: flex; align-items: center; gap: 12px;
`;

const SavedPill = styled.span`
  font-size: 11.5px;
  color: ${tokens.color.textSecondary};
  background: ${tokens.color.surface2};
  padding: 4px 9px;
  border-radius: 999px;
`;

const Shell = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 28px;
  padding: 28px 32px 60px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    padding: 20px 16px 48px;
  }
`;

const Head = styled.div`
  margin-bottom: 18px;
`;

const Eyebrow = styled.div`
  color: ${tokens.color.secondary};
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
`;

const H1 = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-top: 6px;
`;

const Sub = styled.p`
  color: ${tokens.color.textSecondary};
  font-size: 14px;
  margin-top: 6px;
  max-width: 640px;
  line-height: 1.6;
`;

const ChipRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px;
  margin: 18px 0 22px;
`;

const Chip = styled.a<{ $done?: boolean; $active?: boolean }>`
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 12.5px;
  font-weight: 600;
  color: ${(p) => (p.$active ? tokens.color.primary : tokens.color.textSecondary)};
  background: ${(p) => (p.$active ? tokens.color.secondarySoft : '#fff')};
  border: 1px solid ${(p) => (p.$active ? tokens.color.primary : tokens.color.border)};
  padding: 7px 12px;
  border-radius: 999px;
  cursor: pointer;
  &::before {
    content: '';
    width: 8px; height: 8px;
    border-radius: 50%;
    background: ${(p) => (p.$done ? tokens.color.secondary : 'transparent')};
    border: 1.5px solid ${(p) => (p.$done ? tokens.color.secondary : tokens.color.borderStrong)};
  }
`;

const Section = styled.section`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 24px 26px;
  margin-bottom: 16px;
  scroll-margin-top: 90px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 18px 16px;
  }
`;

const SectionHead = styled.div`
  margin-bottom: 16px;
  h2 { font-size: 16px; font-weight: 700; }
  p { color: ${tokens.color.textSecondary}; font-size: 13px; margin-top: 4px; }
`;

const Rail = styled.aside`
  display: flex; flex-direction: column; gap: 14px;
  @media (max-width: 960px) {
    order: -1;
  }
`;

const RailCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 16px;
`;

const RailLabel = styled.div`
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${tokens.color.textSecondary};
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
`;

const PreviewCard = styled.div<{ $bg?: string }>`
  border-radius: 10px;
  overflow: hidden;
  background: ${(p) => p.$bg || `linear-gradient(135deg, #101B32, ${tokens.color.primary})`};
  min-height: 150px;
  padding: 14px;
  display: flex; align-items: flex-end;
  color: #fff;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
`;

const PreviewBody = styled.div`
  padding: 14px 4px 4px;
`;

const Progress = styled.div`
  position: relative;
  height: 6px;
  width: 100%;
  background: ${tokens.color.surface2};
  border-radius: 999px;
  overflow: hidden;
  & > span {
    position: absolute; inset: 0 auto 0 0;
    background: ${tokens.color.primary};
    transition: width 0.3s;
  }
`;

const CheckList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: flex; flex-direction: column; gap: 8px;
  font-size: 13px;
`;

const CheckItem = styled.li<{ $done?: boolean }>`
  display: flex; align-items: center; gap: 10px;
  color: ${(p) => (p.$done ? tokens.color.textPrimary : tokens.color.textSecondary)};
  &::before {
    content: '';
    width: 15px; height: 15px;
    border-radius: 50%;
    display: inline-block;
    background: ${(p) => (p.$done ? tokens.color.primary : 'transparent')};
    border: 1.5px solid ${(p) => (p.$done ? tokens.color.primary : tokens.color.borderStrong)};
    flex-shrink: 0;
    ${(p) =>
      p.$done &&
      css`background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none'><path d='M5 12l5 5L20 7' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/></svg>");
        background-repeat: no-repeat;
        background-position: center;`}
  }
  span { margin-left: auto; font-size: 11.5px; color: ${tokens.color.textSecondary}; font-variant-numeric: tabular-nums; }
`;

const RegMode = styled.label<{ $on?: boolean }>`
  display: block;
  padding: 12px 14px;
  border: 1.5px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.borderStrong)};
  background: ${(p) => (p.$on ? tokens.color.secondarySoft : '#fff')};
  border-radius: 11px;
  cursor: pointer;
  & + & { margin-top: 10px; }
  display: flex; gap: 10px; align-items: flex-start;
  input { margin-top: 3px; accent-color: ${tokens.color.primary}; }
  .t { font-weight: 700; font-size: 13.5px; }
  .d { color: ${tokens.color.textSecondary}; font-size: 12px; margin-top: 2px; }
`;

const DeptRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px;
`;

const DeptChip = styled.button<{ $on?: boolean }>`
  border: 1.5px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.borderStrong)};
  background: ${(p) => (p.$on ? tokens.color.primary : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : tokens.color.textSecondary)};
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex; align-items: center; gap: 7px;
  &::before {
    content: ${(p) => (p.$on ? '"✓"' : '"+"')};
    font-size: 11px;
    opacity: 0.9;
  }
`;

const Footer = styled.div`
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  padding-top: 18px;
  border-top: 1px solid ${tokens.color.surface2};
  margin-top: 12px;
  flex-wrap: wrap;
`;

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

const SECTIONS = [
  { id: 'basic', label: 'Basic info' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'venue', label: 'Venue' },
  { id: 'participation', label: 'Participation' },
  { id: 'ops', label: 'Operations' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

export default function NewEventPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [active, setActive] = useState<SectionId>('basic');

  const [f, setF] = useState({
    title: '',
    category: 'Stadium Worship' as (typeof CATEGORIES)[number],
    slug: '',
    description: '',
    startDate: '',
    startTime: '18:00',
    endDate: '',
    endTime: '22:00',
    timezone: 'Europe/London',
    recurrence: 'single' as 'single' | 'weekly' | 'monthly',
    venue: '',
    city: '',
    country: 'United Kingdom',
    expected: '',
    registrationCap: '',
    registrationMode: 'open' as 'open' | 'invitation',
    departments: [] as { name: string; slots: number }[],
  });

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  const effectiveSlug = f.slug || slugify(f.title);

  function toggleDept(name: string) {
    setF((prev) => {
      const existing = prev.departments.find((d) => d.name === name);
      if (existing) return { ...prev, departments: prev.departments.filter((d) => d.name !== name) };
      const def = DEPT_DEFAULTS.find((d) => d.name === name);
      return { ...prev, departments: [...prev.departments, { name, slots: def?.slots ?? 20 }] };
    });
  }

  function onImagePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > MAX_IMAGE_BYTES) { setError('Image must be 5 MB or smaller.'); return; }
    setError(null);
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  }

  // Completion scoring per section
  const progress = useMemo(() => {
    const basic = [required(f.title), !!f.category, !!effectiveSlug, f.description.length > 0];
    const schedule = [!!f.startDate, !!f.startTime, !!f.endDate || !!f.startDate, !!f.endTime, !!f.timezone, true];
    const venue = [required(f.venue), required(f.city), required(f.country)];
    const participation = [required(String(f.expected)), !!f.registrationCap, !!f.registrationMode];
    const ops = [image !== null, f.departments.length > 0, true];
    const score = (arr: boolean[]) => arr.filter(Boolean).length;
    return {
      basic:    { done: score(basic),         total: basic.length },
      schedule: { done: score(schedule),      total: schedule.length },
      venue:    { done: score(venue),         total: venue.length },
      participation: { done: score(participation), total: participation.length },
      ops:      { done: score(ops),           total: ops.length },
    };
  }, [f, effectiveSlug, image]);

  const overallPct = useMemo(() => {
    const vals = Object.values(progress);
    const done = vals.reduce((s, v) => s + v.done, 0);
    const total = vals.reduce((s, v) => s + v.total, 0);
    return total ? Math.round((done / total) * 100) : 0;
  }, [progress]);

  function goTo(id: SectionId) {
    setActive(id);
    const el = document.getElementById(`sec-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function submit() {
    setError(null);
    if (!required(f.title)) { setError('Event title is required.'); goTo('basic'); return; }
    if (!required(f.startDate)) { setError('Start date is required.'); goTo('schedule'); return; }
    if (!required(f.venue)) { setError('Venue is required.'); goTo('venue'); return; }
    if (!required(f.city) || !required(f.country)) { setError('City and country are required.'); goTo('venue'); return; }

    const startIso = new Date(`${f.startDate}T${f.startTime || '00:00'}`).toISOString();
    const endIso = f.endDate ? new Date(`${f.endDate}T${f.endTime || f.startTime || '00:00'}`).toISOString() : startIso;

    setSubmitting(true);
    const fd = new FormData();
    fd.append('title', f.title);
    fd.append('category', f.category);
    fd.append('start', startIso);
    fd.append('end', endIso);
    fd.append('city', f.city);
    fd.append('country', f.country);
    fd.append('venue', f.venue);
    fd.append('expected', f.expected);
    fd.append('description', f.description);
    fd.append('registrationMode', f.registrationMode);
    if (f.registrationCap) fd.append('registrationCap', f.registrationCap);
    fd.append('departments', JSON.stringify(f.departments));
    if (image) fd.append('image', image);

    const res = await fetch('/api/me/events', { method: 'POST', body: fd });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as { error?: string }));
      setError(data.error || 'Failed to create event.');
      return;
    }
    const data = (await res.json()) as { slug: string };
    router.push(`/events/${data.slug}`);
  }

  const previewDateLabel = (() => {
    if (!f.startDate) return 'Dates to be set';
    const s = new Date(f.startDate);
    const e = f.endDate ? new Date(f.endDate) : s;
    const fmt = (d: Date) => d.toLocaleDateString('en', { day: '2-digit', month: 'short' });
    return s.toDateString() === e.toDateString()
      ? `${fmt(s)} · ${s.getFullYear()}`
      : `${fmt(s)} – ${fmt(e)} · ${s.getFullYear()}`;
  })();

  return (
    <Page>
      <TopBar>
        <Crumbs>
          <Link href="/dashboard/events">Events</Link> / <Link href="/dashboard/events">My events</Link> / <b>Create</b>
        </Crumbs>
        <TopActions>
          <SavedPill>Draft · auto-saved to this browser</SavedPill>
          <Link href="/dashboard/events"><Button $variant="ghost" $size="sm">Cancel</Button></Link>
          <Button $size="sm" onClick={submit} disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish event'}
          </Button>
        </TopActions>
      </TopBar>

      <Shell>
        <div>
          <Head>
            <Eyebrow>New event</Eyebrow>
            <H1>Create a stadium gathering</H1>
            <Sub>
              Fill each section. Your event goes live immediately — no admin approval required — and appears
              on the public events page for churches and volunteers to discover.
            </Sub>
          </Head>

          <ChipRow>
            {SECTIONS.map((s) => (
              <Chip
                key={s.id}
                $active={active === s.id}
                $done={progress[s.id].done === progress[s.id].total}
                onClick={(e) => { e.preventDefault(); goTo(s.id); }}
              >
                {s.label}
              </Chip>
            ))}
          </ChipRow>

          <Section id="sec-basic">
            <SectionHead>
              <h2>Basic information</h2>
              <p>What is this gathering, in a sentence?</p>
            </SectionHead>
            <FieldGroup $cols={1}>
              <div>
                <Label>Event title *</Label>
                <Input
                  value={f.title}
                  placeholder="e.g. Wembley Prayer Gathering 2027"
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>
            </FieldGroup>
            <div style={{ height: 14 }} />
            <FieldGroup $cols={2}>
              <div>
                <Label>Category *</Label>
                <Select value={f.category} onChange={(e) => set('category', e.target.value as (typeof CATEGORIES)[number])}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <Label>URL slug</Label>
                <Input
                  value={f.slug}
                  placeholder={effectiveSlug || 'auto-generated'}
                  onChange={(e) => set('slug', e.target.value)}
                />
                <Hint>/events/<b>{effectiveSlug || 'your-event'}</b></Hint>
              </div>
            </FieldGroup>
            <div style={{ height: 14 }} />
            <div>
              <Label>Short description</Label>
              <Textarea
                rows={3}
                maxLength={240}
                value={f.description}
                placeholder="Two sentences that sell the gathering: who it's for, what to expect."
                onChange={(e) => set('description', e.target.value)}
              />
              <Hint>Shown on event listing cards. {f.description.length}/240 characters.</Hint>
            </div>
          </Section>

          <Section id="sec-schedule">
            <SectionHead>
              <h2>Schedule</h2>
              <p>Start and end times for the gathering.</p>
            </SectionHead>
            <FieldGroup $cols={3}>
              <div>
                <Label>Start date *</Label>
                <Input type="date" value={f.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </div>
              <div>
                <Label>Start time</Label>
                <Input type="time" value={f.startTime} onChange={(e) => set('startTime', e.target.value)} />
              </div>
              <div>
                <Label>Time zone</Label>
                <Select value={f.timezone} onChange={(e) => set('timezone', e.target.value)}>
                  <option value="Europe/London">Europe/London (BST, UTC+1)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Sao_Paulo">America/São_Paulo</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                </Select>
              </div>
              <div>
                <Label>End date</Label>
                <Input type="date" value={f.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </div>
              <div>
                <Label>End time</Label>
                <Input type="time" value={f.endTime} onChange={(e) => set('endTime', e.target.value)} />
              </div>
              <div>
                <Label>Recurrence</Label>
                <Select value={f.recurrence} onChange={(e) => set('recurrence', e.target.value as typeof f.recurrence)}>
                  <option value="single">Single occurrence</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </div>
            </FieldGroup>
          </Section>

          <Section id="sec-venue">
            <SectionHead>
              <h2>Venue</h2>
              <p>Where the gathering happens.</p>
            </SectionHead>
            <FieldGroup $cols={1}>
              <div>
                <Label>Venue name *</Label>
                <Input value={f.venue} placeholder="e.g. Wembley Stadium" onChange={(e) => set('venue', e.target.value)} />
              </div>
            </FieldGroup>
            <div style={{ height: 14 }} />
            <FieldGroup $cols={2}>
              <div>
                <Label>City *</Label>
                <Input value={f.city} onChange={(e) => set('city', e.target.value)} />
              </div>
              <div>
                <Label>Country *</Label>
                <Select value={f.country} onChange={(e) => set('country', e.target.value)}>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </div>
            </FieldGroup>
          </Section>

          <Section id="sec-participation">
            <SectionHead>
              <h2>Participation &amp; capacity</h2>
              <p>How churches and attendees take part.</p>
            </SectionHead>
            <FieldGroup $cols={2}>
              <div>
                <Label>Expected attendance</Label>
                <Input value={f.expected} placeholder="e.g. 82,000" onChange={(e) => set('expected', e.target.value)} />
              </div>
              <div>
                <Label>Registration cap</Label>
                <Input
                  type="number"
                  value={f.registrationCap}
                  placeholder="e.g. 85000"
                  onChange={(e) => set('registrationCap', e.target.value)}
                />
              </div>
            </FieldGroup>
            <div style={{ height: 14 }} />
            <RegMode $on={f.registrationMode === 'open'}>
              <input
                type="radio"
                checked={f.registrationMode === 'open'}
                onChange={() => set('registrationMode', 'open')}
              />
              <div>
                <div className="t">Open registration</div>
                <div className="d">Anyone with a platform account may register. Recommended for public gatherings.</div>
              </div>
            </RegMode>
            <RegMode $on={f.registrationMode === 'invitation'}>
              <input
                type="radio"
                checked={f.registrationMode === 'invitation'}
                onChange={() => set('registrationMode', 'invitation')}
              />
              <div>
                <div className="t">Invitation-based</div>
                <div className="d">Only invited churches and their members can register.</div>
              </div>
            </RegMode>
          </Section>

          <Section id="sec-ops">
            <SectionHead>
              <h2>Operational requirements</h2>
              <p>Volunteer departments and the event banner image.</p>
            </SectionHead>

            <Label>Event banner image</Label>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
              <div
                style={{
                  width: 96, height: 96, borderRadius: 10,
                  background: imagePreview
                    ? `url(${imagePreview}) center/cover no-repeat`
                    : `linear-gradient(135deg, #101B32, ${tokens.color.primary})`,
                  border: `1px solid ${tokens.color.border}`,
                  color: '#fff', fontSize: 10, letterSpacing: '0.08em',
                  textTransform: 'uppercase', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {imagePreview ? '' : 'No image'}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={onImagePicked} style={{ display: 'none' }} />
                <Button $variant="secondary" $size="sm" onClick={() => fileRef.current?.click()}>
                  {image ? 'Replace image' : 'Upload image'}
                </Button>
                <Hint>PNG, JPG, WebP or GIF, up to 5 MB.</Hint>
              </div>
            </div>

            <div style={{ height: 18 }} />
            <Label>Volunteer departments <span style={{ fontWeight: 400, color: tokens.color.textSecondary }}>(click to toggle)</span></Label>
            <DeptRow>
              {DEPT_DEFAULTS.map((d) => {
                const on = !!f.departments.find((x) => x.name === d.name);
                return (
                  <DeptChip key={d.name} type="button" $on={on} onClick={() => toggleDept(d.name)}>
                    {d.name}{on ? ` · ${d.slots}` : ''}
                  </DeptChip>
                );
              })}
            </DeptRow>
            <Hint>Picked departments appear on the volunteer opportunities page after publishing.</Hint>

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

            <Footer>
              <Link href="/dashboard/events" style={{ color: tokens.color.textSecondary, fontSize: 13.5 }}>
                ← Save as draft
              </Link>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? 'Publishing…' : 'Publish event →'}
              </Button>
            </Footer>
          </Section>
        </div>

        <Rail>
          <RailCard>
            <RailLabel>Preview <span style={{ color: tokens.color.textSecondary, fontSize: 10.5 }}>Card</span></RailLabel>
            <PreviewCard $bg={imagePreview ? `linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(0,0,0,0.65)), url(${imagePreview}) center/cover no-repeat` : undefined}>
              {f.category || 'Stadium Worship'}
            </PreviewCard>
            <PreviewBody>
              <div style={{ fontSize: 11.5, color: tokens.color.textSecondary, fontWeight: 600 }}>{previewDateLabel}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4, color: tokens.color.textPrimary }}>
                {f.title || 'Your event title'}
              </div>
              <div style={{ fontSize: 12.5, color: tokens.color.textSecondary, marginTop: 2 }}>
                {f.venue || 'Venue'} · {f.city || 'City'}
              </div>
            </PreviewBody>
          </RailCard>

          <RailCard>
            <RailLabel>Completion <span style={{ color: tokens.color.textPrimary, fontSize: 12 }}>{overallPct}%</span></RailLabel>
            <Progress><span style={{ width: `${overallPct}%` }} /></Progress>
            <CheckList>
              {SECTIONS.map((s) => {
                const p = progress[s.id];
                const done = p.done === p.total;
                return (
                  <CheckItem key={s.id} $done={done} onClick={() => goTo(s.id)} style={{ cursor: 'pointer' }}>
                    {s.label} <span>{p.done}/{p.total}</span>
                  </CheckItem>
                );
              })}
            </CheckList>
          </RailCard>

          <RailCard style={{ background: tokens.color.primary, color: '#fff', border: 'none' }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: tokens.color.secondary }}>
              No approval needed
            </div>
            <div style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
              Your event publishes instantly when you hit <b style={{ color: '#fff' }}>Publish event</b>. You can edit or unpublish any time from your dashboard.
            </div>
          </RailCard>
        </Rail>
      </Shell>
    </Page>
  );
}
