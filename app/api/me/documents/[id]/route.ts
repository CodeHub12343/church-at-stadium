import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { Document } from '@/lib/models/Document';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const d = await Document.findOne({ ownerId: session.user.id, slug: params.id }).lean();
  if (!d) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  return NextResponse.json({
    document: {
      id: d.slug, name: d.name, type: d.type, sizeKB: d.sizeKB, pages: d.pages,
      access: d.access, eventSlug: d.eventSlug, folderName: d.folderName,
      description: d.description, createdAt: d.createdAt, updatedAt: d.updatedAt,
    },
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  await Document.deleteOne({ ownerId: session.user.id, slug: params.id });
  return NextResponse.json({ ok: true });
}
