import { dbConnect } from '../lib/mongodb';
import { CommunityTicket } from '../lib/models/CommunityTicket';

const REF = process.argv[2];
if (!REF) { console.error('usage: tsx scripts/deleteCommunityTicket.ts <reference>'); process.exit(1); }

async function main() {
  await dbConnect();
  const t = await CommunityTicket.findOneAndDelete({ reference: REF });
  console.log(t ? `removed ${t.reference}` : 'not found');
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
