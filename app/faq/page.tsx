import { StaticPage } from '@/components/public/StaticPage';

export default function FAQPage() {
  return (
    <StaticPage eyebrow="Help" title="Frequently asked questions">
      <h2>For churches</h2>
      <h3>Does my church have to pay to join?</h3>
      <p>No. Platform access for churches is free. Participation in specific events may ask for volunteers or resources.</p>
      <h3>How long does verification take?</h3>
      <p>Typically within 48 hours of submitting a complete application.</p>
      <h3>Can we represent more than one branch?</h3>
      <p>Yes — register each branch separately with its own primary representative.</p>

      <h2>For attendees</h2>
      <h3>Can I register without a church?</h3>
      <p>Yes. Church affiliation is optional on the attendee registration form.</p>
      <h3>How do I register a group?</h3>
      <p>Switch to "Group registration" on the registration page. You can add up to 20 members under one reference.</p>
      <h3>What happens if I can't attend?</h3>
      <p>You can cancel from "My Events" up to 48 hours before the event. Your spot is released back to the event.</p>

      <h2>For volunteers</h2>
      <h3>How do I know when and where to show up?</h3>
      <p>Once your application is approved, your briefing document, gate, and reporting time appear in your volunteer portal.</p>
      <h3>What about safety-critical roles?</h3>
      <p>Medical and security roles require verified credentials. Registration alone does not qualify you; upload your certification first.</p>

      <h2>Privacy &amp; data</h2>
      <h3>Where do you store my data?</h3>
      <p>Encrypted at rest, in data centres we're happy to name on request. See our Privacy Policy for details.</p>
      <h3>Can I export my data?</h3>
      <p>Yes — from Settings → Export data, at any time.</p>
    </StaticPage>
  );
}
