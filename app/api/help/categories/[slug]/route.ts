import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { HelpCategory, HelpArticle } from '@/lib/models/HelpArticle';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  await dbConnect();
  const cat = await HelpCategory.findOne({ slug: params.slug }).lean();
  if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  const articles = await HelpArticle.find({ categorySlug: params.slug }).sort({ views: -1 }).lean();
  return NextResponse.json({
    category: {
      slug: cat.slug,
      title: cat.title,
      description: cat.description,
      icon: cat.icon,
      bg: cat.bg,
    },
    articles: articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      readMinutes: a.readMinutes,
      views: a.views,
      updatedAt: a.updatedAt,
    })),
  });
}
