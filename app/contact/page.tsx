'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Container, Section } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea, FieldGroup } from '@/components/ui/Input';
import { submitJson, isValidEmail, required } from '@/lib/form';

const Hero = styled.section`
  background: linear-gradient(180deg, ${tokens.color.surface}, #fff);
  padding: 80px 0 48px;
`;

const H1 = styled.h1`
  font-size: 68px;
  font-weight: 800;
  line-height: 1.05;
  margin-top: 14px;
  @media (max-width: ${tokens.bp.mobile}) {
    font-size: 48px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 40px;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 24px 26px;
`;

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('general');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!required(name)) { setError('Please enter your name.'); return; }
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
    if (!required(message) || message.trim().length < 5) { setError('Please write a short message.'); return; }
    setState('sending');
    const res = await submitJson<{ reference: string }>('/api/support', {
      name: name.trim(), email: email.trim(),
      subject: `Contact: ${topic}`,
      body: message.trim(), topic, category: 'contact',
    });
    if (!res.ok) { setError(res.error); setState('idle'); return; }
    setReference(res.data.reference);
    setState('sent');
  }

  return (
    <>
      <PublicNav />
      <Hero>
        <Container>
          <Eyebrow>Contact</Eyebrow>
          <H1>Say hello — we read every message.</H1>
        </Container>
      </Hero>

      <Section>
        <Container>
          <Grid>
            <Card as="form" onSubmit={submit}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>General enquiry</h2>
              <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4, marginBottom: 20 }}>
                We&apos;ll reply within one working day, in your time zone.
              </p>

              {state === 'sent' ? (
                <div style={{ padding: 16, background: tokens.color.successBg, border: `1px solid ${tokens.color.success}33`, borderRadius: 10, color: tokens.color.successText }}>
                  <strong>Thanks {name.split(' ')[0] || 'there'}!</strong> We received your message.
                  {reference && <> Reference: <code>{reference}</code></>}
                </div>
              ) : (
                <>
                  <FieldGroup $cols={2}>
                    <div><Label>Name *</Label><Input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
                    <div><Label>Email *</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Label>Topic</Label>
                      <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                        <option value="general">General question</option>
                        <option value="church">Our church wants to join</option>
                        <option value="event">Organizing an event</option>
                        <option value="press">Press enquiry</option>
                      </Select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Label>Message *</Label>
                      <Textarea rows={6} required value={message} onChange={(e) => setMessage(e.target.value)} />
                    </div>
                  </FieldGroup>

                  {error && (
                    <div style={{ marginTop: 14, padding: '10px 12px', background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, borderRadius: 10, fontSize: 13 }}>
                      {error}
                    </div>
                  )}

                  <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" disabled={state === 'sending'}>
                      {state === 'sending' ? 'Sending…' : 'Send message →'}
                    </Button>
                  </div>
                </>
              )}
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Card>
                <div style={{ color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                  General
                </div>
                <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 14, marginTop: 6 }}>
                  hello@churchatthestadiums.com
                </div>
              </Card>
              <Card>
                <div style={{ color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Help &amp; support
                </div>
                <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 14, marginTop: 6 }}>
                  help@churchatthestadiums.com
                </div>
              </Card>
              <Card>
                <div style={{ color: tokens.color.textSecondary, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Partnerships
                </div>
                <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 14, marginTop: 6 }}>
                  partnerships@churchatthestadiums.com
                </div>
              </Card>
              <Card style={{ background: tokens.color.errorSurface, borderColor: tokens.color.errorBorder }}>
                <div style={{ color: tokens.color.errorText, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Safeguarding concern
                </div>
                <div style={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 14, marginTop: 6, color: tokens.color.errorText }}>
                  safeguarding@churchatthestadiums.com
                </div>
                <div style={{ fontSize: 12, color: tokens.color.errorText, marginTop: 6 }}>
                  Confidential · handled by a separate team.
                </div>
              </Card>
            </div>
          </Grid>
        </Container>
      </Section>

      <PublicFooter />
    </>
  );
}
