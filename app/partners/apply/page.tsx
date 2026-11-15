'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Input, Label, Select, Textarea, FieldGroup, Hint } from '@/components/ui/Input';
import { Eyebrow } from '@/components/ui/Card';
import { submitJson, isValidEmail, required } from '@/lib/form';

type Track = 'ministry' | 'operations' | 'hospitality' | 'foundation';

const Grid = styled.div`
  padding: 40px 0 80px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media (max-width: ${tokens.bp.mobile}) {
    padding: 24px 20px;
  }
`;

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const AsideCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 20px;
`;

const Track = styled.label<{ $on?: boolean }>`
  padding: 14px 16px;
  border: 1px solid ${(p) => (p.$on ? tokens.color.primary : tokens.color.borderStrong)};
  background: ${(p) => (p.$on ? tokens.color.secondarySoft : '#fff')};
  border-radius: 11px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  input { display: none; }
`;

export default function PartnersApplyPage() {
  const [organization, setOrganization] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [track, setTrack] = useState<Track>('ministry');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!required(organization)) { setError('Organization name is required.'); return; }
    if (!required(contactName)) { setError('Your name is required.'); return; }
    if (!isValidEmail(contactEmail)) { setError('Enter a valid email address.'); return; }
    setSubmitting(true);
    const res = await submitJson('/api/partners/apply', {
      organization: organization.trim(), contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      phone: phone.trim(), website: website.trim(), track,
      city: city.trim(), country, bio: bio.trim(),
    });
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    setDone(true);
  }

  if (done) {
    return (
      <>
        <PublicNav />
        <Container>
          <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
            <div style={{ fontSize: 44 }}>✓</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>Inquiry received</h1>
            <p style={{ color: tokens.color.textSecondary, fontSize: 15, marginTop: 10 }}>
              Thanks, {contactName.split(' ')[0] || 'partner'}. We read every application — expect a reply within one working week.
            </p>
            <div style={{ marginTop: 20 }}>
              <Link href="/partners"><Button>Back to partners</Button></Link>
            </div>
          </div>
        </Container>
        <PublicFooter />
      </>
    );
  }

  return (
    <>
      <PublicNav />
      <Container>
        <Grid>
          <Card>
            <div>
              <Eyebrow>Partner inquiry</Eyebrow>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Tell us about you</h1>
              <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6 }}>
                A real person on our team reads every application. 5 minutes to fill in, usually one working week to reply.
              </p>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700 }}>About your organization</h2>
            <FieldGroup $cols={2}>
              <div><Label>Organization name *</Label><Input value={organization} onChange={(e) => setOrganization(e.target.value)} /></div>
              <div><Label>Country *</Label>
                <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option>United Kingdom</option>
                  <option>Germany</option>
                  <option>Brazil</option>
                  <option>United States</option>
                  <option>Kenya</option>
                  <option>India</option>
                </Select>
              </div>
              <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
              <div><Label>Website</Label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
                <Hint>If you don&apos;t have one, share a social link or LinkedIn.</Hint>
              </div>
            </FieldGroup>

            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Your contact details</h2>
            <FieldGroup $cols={2}>
              <div><Label>Full name *</Label><Input value={contactName} onChange={(e) => setContactName(e.target.value)} autoComplete="name" /></div>
              <div><Label>Email *</Label><Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} autoComplete="email" /></div>
              <div><Label>Phone or WhatsApp</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            </FieldGroup>

            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Which track fits best?</h2>
              <div style={{ color: tokens.color.textSecondary, fontSize: 12.5, marginTop: 4 }}>
                Pick one to start — we'll shape the scope together.
              </div>
              <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {([
                  { k: 'ministry' as Track, t: 'Ministry partner', d: 'Worship, teaching, prayer teams.' },
                  { k: 'operations' as Track, t: 'Operations partner', d: 'Venue, media, production, translation, security.' },
                  { k: 'hospitality' as Track, t: 'Hospitality partner', d: 'Housing, meals, local pastoral & medical care.' },
                  { k: 'foundation' as Track, t: 'Foundation / sponsor', d: 'Funding events, travel grants, after-care.' },
                ]).map((opt) => (
                  <Track key={opt.k} $on={track === opt.k}>
                    <input type="radio" name="track" checked={track === opt.k} onChange={() => setTrack(opt.k)} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: track === opt.k ? tokens.color.primary : undefined }}>{opt.t}</div>
                    <div style={{ color: tokens.color.textSecondary, fontSize: 12 }}>{opt.d}</div>
                  </Track>
                ))}
              </div>
            </div>

            <div>
              <Label>In your own words — what do you do, and why do you want to partner with CATS?</Label>
              <Textarea rows={5} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            {error && (
              <div style={{ padding: '10px 12px', background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, borderRadius: 10, fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ paddingTop: 20, borderTop: `1px solid ${tokens.color.surface2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>
                By submitting you agree to our <Link href="/terms" style={{ color: tokens.color.info }}>Partner terms</Link>.
              </div>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? 'Sending…' : 'Send inquiry →'}
              </Button>
            </div>
          </Card>

          <Aside>
            <AsideCard>
              <div style={{ color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                What happens next
              </div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5 }}>
                {[
                  { n: 1, t: 'You submit the form', s: 'Takes about 5 minutes.' },
                  { n: 2, t: 'We read & reply', s: 'Usually within one working week.' },
                  { n: 3, t: 'A call in your time zone', s: '30 – 45 minutes. No slide deck required.' },
                  { n: 4, t: 'A short written scope', s: 'What you bring, what we hold, how we report back.' },
                ].map((s) => (
                  <div key={s.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: tokens.color.secondary,
                        color: tokens.color.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 11,
                        flexShrink: 0,
                        fontFamily: tokens.font.display,
                      }}
                    >
                      {s.n}
                    </div>
                    <div>
                      <b>{s.t}</b>
                      <div style={{ color: tokens.color.textSecondary, fontSize: 11.5, marginTop: 2 }}>{s.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AsideCard>

            <div
              style={{
                padding: 16,
                background: tokens.color.errorSurface,
                border: `1px solid ${tokens.color.errorBorder}`,
                borderRadius: 12,
                fontSize: 12,
                color: tokens.color.errorText,
                lineHeight: 1.55,
              }}
            >
              <strong>Safeguarding concerns?</strong> Please don't use this form. Email{' '}
              <a style={{ color: tokens.color.errorText, textDecoration: 'underline', fontWeight: 700 }}>safeguarding@…</a>{' '}
              directly — a different team handles it, confidentially.
            </div>
          </Aside>
        </Grid>
      </Container>
      <PublicFooter />
    </>
  );
}
