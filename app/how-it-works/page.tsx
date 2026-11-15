import { StaticPage } from '@/components/public/StaticPage';

export default function HowItWorksPage() {
  return (
    <StaticPage eyebrow="How it works" title="Four steps from apply to gather.">
      <p>
        Church at the Stadiums is a collaboration platform — most of the work happens between congregations, event
        teams, and volunteers. Here's how the pieces fit together.
      </p>

      <h2>How churches join</h2>
      <ul>
        <li>A representative creates an account and submits a five-step application.</li>
        <li>Our review team confirms leadership, authorization, and verification documents.</li>
        <li>Verified churches can respond to invitations and apply to any open event.</li>
      </ul>

      <h2>How events are organized</h2>
      <ul>
        <li>An Event Director scopes a stadium gathering: venue, programme, operational needs.</li>
        <li>A Platform Admin approves and publishes the event to the network.</li>
        <li>The organizer invites churches and opens participation, volunteers, and attendee registration.</li>
      </ul>

      <h2>How volunteers participate</h2>
      <ul>
        <li>Browse opportunities, pick a department, apply.</li>
        <li>A supervisor approves and shares the briefing document.</li>
        <li>On the day, report to the gate and the role you were given.</li>
      </ul>

      <h2>How attendees register</h2>
      <ul>
        <li>Open an event page from the public list.</li>
        <li>Register individually or as a group of up to 20.</li>
        <li>Receive a reference by email — present it at the gate.</li>
      </ul>

      <h2>Frequently asked questions</h2>
      <h3>Does my church have to pay to join?</h3>
      <p>
        No. Church participation on the platform is free. Specific stadium events may ask churches to commit volunteers
        or resources; some events may charge for optional add-ons. Financial requirements are always stated up front.
      </p>

      <h3>Can I attend without a church?</h3>
      <p>
        Yes. Attendee registration is open to anyone with a platform account, with or without church affiliation.
      </p>

      <h3>What does "verified" actually mean?</h3>
      <p>
        Our team confirms that the person representing the church is authorized by the senior pastor, and that the
        church's basic details (legal name, address, website or registration document) match. It is not a doctrinal
        statement.
      </p>
    </StaticPage>
  );
}
