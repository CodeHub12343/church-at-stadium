import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { PartnerApplication, PartnerTrack } from '@/lib/models/PartnerApplication';
import { isEmail, isNonEmptyString } from '@/lib/validators';
import { limit } from '@/lib/rateLimit';

const TRACKS: PartnerTrack[] = ['ministry', 'operations', 'hospitality', 'foundation'];

export async function POST(req: Request) {
  const rl = await limit(req, 'partners.apply', { max: 3, windowMs: 60 * 60 * 1000 });
  if (rl) return rl;
  try {
    const body = await req.json();
    const { organization, contactName, contactEmail, phone, website, track, city, country, bio } = body ?? {};

    if (!isNonEmptyString(organization)) return NextResponse.json({ error: 'Organization required' }, { status: 400 });
    if (!isNonEmptyString(contactName)) return NextResponse.json({ error: 'Contact name required' }, { status: 400 });
    if (!isEmail(contactEmail)) return NextResponse.json({ error: 'Valid email required' }, { status: 400 });

    await dbConnect();
    const app = await PartnerApplication.create({
      organization: organization.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.toLowerCase().trim(),
      phone: isNonEmptyString(phone) ? phone.trim() : undefined,
      website: isNonEmptyString(website) ? website.trim() : undefined,
      track: TRACKS.includes(track) ? track : 'ministry',
      city: isNonEmptyString(city) ? city.trim() : undefined,
      country: isNonEmptyString(country) ? country.trim() : undefined,
      bio: isNonEmptyString(bio) ? bio.trim() : undefined,
    });
    return NextResponse.json({ ok: true, id: String(app._id) });
  } catch (err) {
    console.error('[partner apply] error', err);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
