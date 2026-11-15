'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';

const Banner = styled.div`
  background: #FEF6E4;
  border-bottom: 1px solid #F3DDA0;
  color: #7A5300;
  font-size: 13px;
  padding: 10px 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: ${tokens.color.primary};
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  &:disabled { opacity: 0.6; cursor: wait; }
`;

export function VerifiedBanner() {
  const [state, setState] = useState<'checking' | 'verified' | 'unverified' | 'sent'>('checking');
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/me/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.profile) {
          setState('checking');
          return;
        }
        setEmail(d.profile.email);
        setState(d.profile.verified ? 'verified' : 'unverified');
      })
      .catch(() => setState('checking'));
  }, []);

  async function resend() {
    if (!email) return;
    setSending(true);
    try {
      await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setState('sent');
    } finally {
      setSending(false);
    }
  }

  if (state === 'checking' || state === 'verified') return null;

  return (
    <Banner role="status">
      <span>
        <strong>Verify your email.</strong> We sent a confirmation link to <b>{email}</b>. Some actions are blocked until you confirm.
      </span>
      {state === 'sent' ? (
        <span>✓ Sent. Check your inbox.</span>
      ) : (
        <Button onClick={resend} disabled={sending}>
          {sending ? 'Sending…' : 'Resend link'}
        </Button>
      )}
    </Banner>
  );
}
