import { StaticPage } from '@/components/public/StaticPage';

export default function PrivacyPage() {
  return (
    <StaticPage eyebrow="Legal" title="Privacy Policy">
      <p>Last updated 7 November 2026.</p>
      <p>
        This Privacy Policy describes how Church at the Stadiums ("we", "our", or "the platform") collects, uses, and
        protects the personal data of people who use ChurchAtTheStadiums.com and the related dashboards and tools.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account information you provide: name, email, country, church affiliation.</li>
        <li>Event registration details: attendee names, accessibility notes (optional), group members.</li>
        <li>Church application details: leadership contacts, supporting documents.</li>
        <li>Volunteer application details: departments, qualifications you upload.</li>
        <li>Technical data: IP address, device, and browser — used to protect your account and diagnose issues.</li>
      </ul>

      <h2>Why we collect it</h2>
      <ul>
        <li>To run the platform (sign-in, applications, approvals, registrations).</li>
        <li>To reach you with service messages (confirmations, schedule changes, safety-critical updates).</li>
        <li>To publish aggregate, non-identifying statistics about the network.</li>
      </ul>

      <h2>What we don't do</h2>
      <ul>
        <li>We do not sell personal data.</li>
        <li>We do not share your data with advertisers.</li>
        <li>We do not use your data to train third-party AI models.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can access, correct, export, or delete your data at any time from Settings → Account. If you'd rather write
        to us, email privacy@churchatthestadiums.com.
      </p>

      <h2>Safeguarding data</h2>
      <p>
        Information shared through a safeguarding concern is handled by a separate team, retained only as long as
        needed to address the concern, and never used for any other purpose.
      </p>
    </StaticPage>
  );
}
