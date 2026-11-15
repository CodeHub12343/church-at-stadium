import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { HelpArticle } from '@/lib/models/HelpArticle';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q')?.trim().toLowerCase();
  await dbConnect();

  const filter: Record<string, unknown> = {};
  if (category) filter.categorySlug = category;
  let docs = await HelpArticle.find(filter).sort({ views: -1, updatedAt: -1 }).lean();
  if (q) {
    docs = docs.filter(
      (a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    articles: docs.map((a) => ({
      slug: a.slug,
      title: a.title,
      categorySlug: a.categorySlug,
      readMinutes: a.readMinutes,
      views: a.views,
      updatedAt: a.updatedAt,
    })),
  });
}
