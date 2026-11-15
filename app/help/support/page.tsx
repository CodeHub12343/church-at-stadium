'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea, FieldGroup, Hint } from '@/components/ui/Input';
import { Eyebrow, Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { submitJson, isValidEmail, required } from '@/lib/form';

const Grid = styled.div`
  padding: 40px 0 80px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const FormCard = styled.section`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const Priority = styled.label<{ $on?: boolean; $danger?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 14px;
  border: 1px solid ${(p) => (p.$danger ? tokens.color.errorBorder : p.$on ? tokens.color.primary : tokens.color.borderStrong)};
  background: ${(p) => (p.$danger ? tokens.color.errorSurface : p.$on ? tokens.color.secondarySoft : '#fff')};
  border-radius: 11px;
  cursor: pointer;
  flex: 1;
  input { display: none; }
`;

export default function SupportPage() {
  const [pri, setPri] = useState('broken');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('events');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!required(name)) { setError('Please enter your name.'); return; }
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
    if (!required(subject)) { setError('Add a short summary subject.'); return; }
    if (!required(body) || body.trim().length < 10) { setError('Describe what happened in a few sentences.'); return; }
    setState('sending');
    const res = await submitJson<{ reference: string }>('/api/support', {
      name: name.trim(), email: email.trim(),
      subject: subject.trim(),
      body: `[Priority: ${pri}]\n\n${body.trim()}`,
      topic, category: 'help',
    });
    if (!res.ok) { setError(res.error); setState('idle'); return; }
    setReference(res.data.reference);
    setState('sent');
  }

  return (
    <>
      <PublicNav />
      <Container>
        <Grid>
          <FormCard>
            <div>
              <Eyebrow>Support</Eyebrow>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Tell us what's going on</h1>
              <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4, maxWidth: 520, lineHeight: 1.6 }}>
                A real person reads every message. The clearer the description, the faster we can help.
              </p>
            </div>

            <div
              style={{
                padding: '12px 16px',
                background: tokens.color.secondarySoft,
                border: `1px solid ${tokens.color.warningBorder}`,
                borderRadius: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: tokens.color.primary,
                  color: tokens.color.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontFamily: tokens.font.display,
                  fontSize: 12,
                }}
              >
                EO
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" autoComplete="name" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email *" autoComplete="email" />
              </div>
            </div>

            <div>
              <Label>What&apos;s this about? *</Label>
              <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="events">Events &amp; registration</option>
                <option value="church">Churches &amp; verification</option>
                <option value="vol">Volunteering</option>
                <option value="account">Account &amp; sign-in</option>
                <option value="other">Something else</option>
              </Select>
            </div>

            <div>
              <Label>Short summary *</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="One line, like an email subject" />
              <Hint>One line, as if you were writing an email subject.</Hint>
            </div>

            <div>
              <Label>Priority</Label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Priority $on={pri === 'question'}>
                  <input type="radio" name="pri" checked={pri === 'question'} onChange={() => setPri('question')} />
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Question</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>No one is blocked</div>
                </Priority>
                <Priority $on={pri === 'broken'}>
                  <input type="radio" name="pri" checked={pri === 'broken'} onChange={() => setPri('broken')} />
                  <div style={{ fontWeight: 700, fontSize: 13, color: tokens.color.primary }}>Something broken</div>
                  <div style={{ color: tokens.color.warningText, fontSize: 11.5 }}>I can't complete a task</div>
                </Priority>
                <Priority $on={pri === 'urgent'}>
                  <input type="radio" name="pri" checked={pri === 'urgent'} onChange={() => setPri('urgent')} />
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Urgent · event in &lt;48h</div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>On-site or gate issue</div>
                </Priority>
                <Priority $danger $on={pri === 'safeguarding'}>
                  <input type="radio" name="pri" checked={pri === 'safeguarding'} onChange={() => setPri('safeguarding')} />
                  <div style={{ fontWeight: 700, fontSize: 13, color: tokens.color.errorText }}>Safeguarding concern</div>
                  <div style={{ color: tokens.color.errorText, fontSize: 11.5 }}>Confidential channel</div>
                </Priority>
              </div>
            </div>

            <div>
              <Label>Describe what happened *</Label>
              <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="The exact steps you took, what you expected, and what happened." />
              <Hint>Share the exact steps you took, what you expected, and what happened.</Hint>
            </div>

            {state === 'sent' && reference && (
              <div style={{ padding: '12px 16px', background: tokens.color.successBg, border: `1px solid ${tokens.color.success}33`, borderRadius: 10, color: tokens.color.successText, fontSize: 13 }}>
                Ticket received. Your reference is <strong>{reference}</strong> — we&apos;ll reply by email.
              </div>
            )}
            {error && (
              <div style={{ padding: '10px 12px', background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, borderRadius: 10, fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ paddingTop: 20, borderTop: `1px solid ${tokens.color.surface2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>
                By submitting, you agree to our <Link href="/terms" style={{ color: tokens.color.info }}>Support terms</Link>.
              </div>
              <Button onClick={submit} disabled={state === 'sending' || state === 'sent'}>
                {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Submitted' : 'Submit ticket →'}
              </Button>
            </div>
          </FormCard>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Card>
              <div style={{ color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Expected reply
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                <div className="mono" style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 24, color: tokens.color.primary }}>
                  6h 42m
                </div>
                <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>average · last 7 days</div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: tokens.color.textSecondary, lineHeight: 1.55 }}>
                Mon–Fri · 09:00–18:00 UTC. Urgent event-day issues are handled around the clock.
              </div>
            </Card>

            <Card>
              <div style={{ color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Have you tried these?
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[
                  { t: 'Registering a child under 16', s: '4 min · 92% helpful', slug: 'child-under-16' },
                  { t: 'Group registration · troubleshooting', s: '3 min · updated 6 Nov', slug: 'group-troubleshoot' },
                  { t: 'Clear cache and reload', s: '1 min · for Chrome', slug: 'clear-cache' },
                ].map((x) => (
                  <Link
                    key={x.slug}
                    href={`/help/articles/${x.slug}`}
                    style={{ padding: 10, border: `1px solid ${tokens.color.surface2}`, borderRadius: 10, display: 'block' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{x.t}</div>
                    <div style={{ color: tokens.color.textSecondary, fontSize: 11.5, marginTop: 2 }}>{x.s}</div>
                  </Link>
                ))}
              </div>
            </Card>

            <Card>
              <div style={{ color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Your recent tickets
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: '9px 10px', border: `1px solid ${tokens.color.surface2}`, borderRadius: 9, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>Volunteer app stuck in review</div>
                    <div style={{ color: tokens.color.textSecondary, fontSize: 11 }}>#CS-2184 · 2 days ago</div>
                  </div>
                  <Badge $tone="success">Resolved</Badge>
                </div>
                <div style={{ padding: '9px 10px', border: `1px solid ${tokens.color.surface2}`, borderRadius: 9, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>Pastor email didn't verify</div>
                    <div style={{ color: tokens.color.textSecondary, fontSize: 11 }}>#CS-2108 · 22 Oct</div>
                  </div>
                  <Badge $tone="success">Resolved</Badge>
                </div>
              </div>
            </Card>
          </aside>
        </Grid>
      </Container>
      <PublicFooter />
    </>
  );
}
