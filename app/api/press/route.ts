import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { PressRelease } from '@/lib/models/PressRelease';

export async function GET() {
  await dbConnect();
  const docs = await PressRelease.find({}).sort({ publishedAt: -1 }).lean();
  return NextResponse.json({
    releases: docs.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      tag: r.tag,
      publishedAt: r.publishedAt,
    })),
  });
}
