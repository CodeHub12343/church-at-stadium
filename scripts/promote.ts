import 'dotenv/config';
import { dbConnect } from '../lib/mongodb';
import { User } from '../lib/models/User';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npm run db:promote <email>');
    process.exit(1);
  }
  const conn = await dbConnect();
  const u = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { role: 'admin' } },
    { new: true }
  ).lean();
  if (!u) {
    console.error(`[promote] user not found: ${email}`);
    await conn.disconnect();
    process.exit(1);
  }
  console.log(`[promote] ${u.email} -> role=${u.role}`);
  await conn.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
