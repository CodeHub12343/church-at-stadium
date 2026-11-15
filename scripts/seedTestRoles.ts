import { dbConnect } from '../lib/mongodb';
import { User } from '../lib/models/User';
import bcrypt from 'bcryptjs';

const PASSWORD = 'testtest1';
const roles = [
  { email: 'attendee@test.com',  firstName: 'Ava',   lastName: 'Attendee',  role: 'attendee'  as const },
  { email: 'volunteer@test.com', firstName: 'Vee',   lastName: 'Volunteer', role: 'volunteer' as const },
  { email: 'rep@test.com',       firstName: 'Rae',   lastName: 'Rep',       role: 'church_rep' as const },
  { email: 'organizer@test.com', firstName: 'Omo',   lastName: 'Organizer', role: 'organizer' as const },
];

async function main() {
  await dbConnect();
  const hash = await bcrypt.hash(PASSWORD, 12);
  for (const r of roles) {
    const existing = await User.findOne({ email: r.email });
    if (existing) {
      existing.role = r.role;
      existing.emailVerified = new Date();
      await existing.save();
      console.log(`updated ${r.email} (${r.role})`);
      continue;
    }
    await User.create({
      email: r.email,
      passwordHash: hash,
      firstName: r.firstName,
      lastName: r.lastName,
      role: r.role,
      emailVerified: new Date(),
    });
    console.log(`created ${r.email} (${r.role})`);
  }
  console.log(`\npassword for all: ${PASSWORD}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
