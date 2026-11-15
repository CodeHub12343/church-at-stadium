import { StaticPage } from '@/components/public/StaticPage';

export default function TermsPage() {
  return (
    <StaticPage eyebrow="Legal" title="Terms & Conditions">
      <p>Last updated 7 November 2026.</p>
      <p>
        By creating an account or using Church at the Stadiums ("the platform"), you agree to these terms. Please read
        them carefully; they are intentionally short and plain.
      </p>

      <h2>Using the platform</h2>
      <ul>
        <li>You're responsible for the accuracy of information you submit.</li>
        <li>Church representatives must be authorized by the church they represent.</li>
        <li>You agree to treat other users, churches, and partners with respect.</li>
      </ul>

      <h2>Accounts &amp; access</h2>
      <ul>
        <li>Keep your sign-in credentials safe. Two-factor authentication is required for admin roles.</li>
        <li>We may suspend accounts that are misused, abandoned, or compromised.</li>
      </ul>

      <h2>Events &amp; registrations</h2>
      <p>
        Registration reserves your spot for an event. It is not a ticket for paid entry unless explicitly stated.
        Attendance is confirmed by on-site check-in.
      </p>

      <h2>Content &amp; uploads</h2>
      <p>
        You keep ownership of anything you upload (documents, logos, media). You grant us a limited licence to display
        and distribute it on the platform in the normal course of running your workspace.
      </p>

      <h2>Limits of liability</h2>
      <p>
        The platform is provided as-is. Events are the responsibility of their organizers and participating churches.
        We work hard to keep the platform reliable, but cannot be liable for things beyond our control.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms occasionally. Material changes will be announced in-app at least 14 days before they
        take effect.
      </p>
    </StaticPage>
  );
}
