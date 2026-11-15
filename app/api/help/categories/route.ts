export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { HelpCategory, HelpArticle } from '@/lib/models/HelpArticle';

export async function GET() {
  await dbConnect();
  const cats = await HelpCategory.find({}).sort({ order: 1 }).lean();
  const counts = await HelpArticle.aggregate([{ $group: { _id: '$categorySlug', count: { $sum: 1 } } }]);
  const byCat = new Map<string, number>(counts.map((c) => [c._id as string, c.count as number]));
  return NextResponse.json({
    categories: cats.map((c) => ({
      slug: c.slug,
      title: c.title,
      description: c.description,
      icon: c.icon,
      bg: c.bg,
      count: byCat.get(c.slug) ?? 0,
    })),
  });
}
