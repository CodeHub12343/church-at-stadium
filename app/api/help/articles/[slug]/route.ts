import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { HelpArticle, HelpCategory } from '@/lib/models/HelpArticle';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  await dbConnect();
  const a = await HelpArticle.findOneAndUpdate(
    { slug: params.slug },
    { $inc: { views: 1 } },
    { new: true }
  ).lean();
  if (!a) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

  const category = await HelpCategory.findOne({ slug: a.categorySlug }).lean();
  const related = await HelpArticle.find({ categorySlug: a.categorySlug, slug: { $ne: a.slug } })
    .limit(5)
    .lean();

  return NextResponse.json({
    article: {
      slug: a.slug,
      title: a.title,
      body: a.body,
      categorySlug: a.categorySlug,
      categoryTitle: category?.title,
      readMinutes: a.readMinutes,
      views: a.views,
      updatedAt: a.updatedAt,
    },
    related: related.map((r) => ({ slug: r.slug, title: r.title, readMinutes: r.readMinutes })),
  });
}
