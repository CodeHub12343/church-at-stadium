import { dbConnect } from '../lib/mongodb';
import { Event } from '../lib/models/Event';
import { EventRegistration } from '../lib/models/EventRegistration';

const SLUG = process.argv[2];
if (!SLUG) { console.error('usage: tsx scripts/deleteEvent.ts <slug>'); process.exit(1); }

async function main() {
  await dbConnect();
  const ev = await Event.findOneAndDelete({ slug: SLUG });
  const regs = await EventRegistration.deleteMany({ eventSlug: SLUG });
  console.log(`deleted event: ${ev ? ev.title : 'not found'}; registrations removed: ${regs.deletedCount}`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
