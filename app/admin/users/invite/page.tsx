'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Eyebrow } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const Panel = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 24px 26px;
  h3 {
    font-family: ${tokens.font.display};
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    margin-bottom: 12px;
  }
`;

const Step = styled.div`
  padding: 14px 16px;
  border: 1px solid ${tokens.color.border};
  border-radius: 10px;
  background: ${tokens.color.surface};
  margin-top: 10px;
  font-size: 13.5px;
  line-height: 1.6;
  code {
    font-family: 'ui-monospace', 'SF Mono', Consolas, monospace;
    font-size: 12.5px;
    background: #fff;
    padding: 2px 6px;
    border-radius: 6px;
    border: 1px solid ${tokens.color.border};
  }
`;

export default function AdminUserInvitePage() {
  return (
    <>
      <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
        <Link href="/admin/users">← Back to users</Link>
      </div>

      <div style={{ marginBottom: 22 }}>
        <Eyebrow>Admin tools</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Invite / promote a user</h1>
        <p style={{ color: tokens.color.textSecondary, fontSize: 14, marginTop: 6, maxWidth: 640 }}>
          A direct email-invitation flow isn’t live yet. Until it is, use the two-step process below to bring a new
          admin or role-holder onto the platform.
        </p>
      </div>

      <Panel>
        <h3>Current process</h3>
        <Step>
          <strong>1. Ask the person to register.</strong> Send them to{' '}
          <Link href="/register" style={{ color: tokens.color.primary }}>
            {' '}
            /register
          </Link>{' '}
          and have them create an account with the email address you want to promote.
        </Step>
        <Step>
          <strong>2. Promote their account from your terminal.</strong> From the project root:
          <br />
          <code>npm run db:promote &lt;their-email@example.com&gt;</code>
          <br />
          This sets their <code>role</code> to <code>admin</code> in the database. The change takes effect on their
          next sign-in, or within five minutes while they stay signed in (the JWT re-reads role from the DB every
          five minutes).
        </Step>
        <Step>
          <strong>3. Change role from the user’s detail page.</strong> You can also open a user at{' '}
          <code>/admin/users/&lt;id&gt;</code> and use the role controls there once the role-change UI is built out.
        </Step>

        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <Link href="/admin/users">
            <Button>Back to users list</Button>
          </Link>
          <Link href="/admin/audit-logs">
            <Button $variant="secondary">View audit log</Button>
          </Link>
        </div>
      </Panel>

      <Panel style={{ marginTop: 16 }}>
        <h3>Planned — email invitations</h3>
        <p style={{ fontSize: 13.5, color: tokens.color.textSecondary, lineHeight: 1.6 }}>
          A future update will add an &ldquo;invite by email&rdquo; form here that issues a secure invitation link,
          emails it to the recipient, and pre-sets their role when they complete registration. The backend endpoint,
          invitation token model, and email template still need to be built before this page can accept input.
        </p>
      </Panel>
    </>
  );
}
