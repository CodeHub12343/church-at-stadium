import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { Document, DocumentAccess, DocumentType } from '@/lib/models/Document';
import { isNonEmptyString } from '@/lib/validators';

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const docs = await Document.find({ ownerId: session.user.id }).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({
    documents: docs.map((d) => ({
      id: d.slug,
      name: d.name,
      type: d.type,
      sizeKB: d.sizeKB,
      pages: d.pages,
      access: d.access,
      eventSlug: d.eventSlug,
      folderName: d.folderName,
      updatedAt: d.updatedAt,
      fileUrl: d.fileUrl,
      contentType: d.contentType,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { name, type, sizeKB, pages, eventSlug, folderName, access, description, fileUrl, contentType } = body ?? {};
  if (!isNonEmptyString(name)) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  await dbConnect();
  let slug = slugify(name) || `doc-${Date.now()}`;
  let candidate = slug;
  for (let i = 1; i < 10; i++) {
    const exists = await Document.findOne({ ownerId: session.user.id, slug: candidate }).lean();
    if (!exists) break;
    candidate = `${slug}-${i}`;
  }

  const allowedTypes: DocumentType[] = ['PDF', 'DOC', 'XLS', 'PNG', 'JPG', 'OTHER'];
  const allowedAccess: DocumentAccess[] = ['Team', 'Restricted', 'Public'];

  const doc = await Document.create({
    ownerId: session.user.id,
    slug: candidate,
    name: name.trim(),
    type: allowedTypes.includes(type) ? type : 'OTHER',
    sizeKB: Math.max(0, Number(sizeKB) || 0),
    pages: pages ? Number(pages) : undefined,
    eventSlug: isNonEmptyString(eventSlug) ? eventSlug : undefined,
    folderName: isNonEmptyString(folderName) ? folderName : undefined,
    access: allowedAccess.includes(access) ? access : 'Team',
    description: isNonEmptyString(description) ? description : undefined,
    fileUrl: isNonEmptyString(fileUrl) ? fileUrl : undefined,
    contentType: isNonEmptyString(contentType) ? contentType : undefined,
  });

  return NextResponse.json({ ok: true, id: doc.slug });
}
