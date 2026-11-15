import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { Church } from '@/lib/models/Church';
import { HelpArticle } from '@/lib/models/HelpArticle';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().toLowerCase() ?? '';
  const type = searchParams.get('type') ?? 'all';
  if (!q) return NextResponse.json({ q, results: { events: [], churches: [], articles: [] }, totals: { events: 0, churches: 0, articles: 0 } });

  await dbConnect();
  const want = (k: string) => type === 'all' || type === k;

  const [events, churches, articles] = await Promise.all([
    want('events')
      ? Event.find({}).lean().then((docs) =>
          docs.filter((e) =>
            e.title.toLowerCase().includes(q) ||
            e.city.toLowerCase().includes(q) ||
            e.venue.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q)
          )
        )
      : Promise.resolve([]),
    want('churches')
      ? Church.find({}).lean().then((docs) =>
          docs.filter((c) =>
            c.name.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            c.country.toLowerCase().includes(q) ||
            (c.denomination || '').toLowerCase().includes(q)
          )
        )
      : Promise.resolve([]),
    want('articles')
      ? HelpArticle.find({}).lean().then((docs) =>
          docs.filter((a) =>
            a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
          )
        )
      : Promise.resolve([]),
  ]);

  return NextResponse.json({
    q,
    totals: { events: events.length, churches: churches.length, articles: articles.length },
    results: {
      events: events.slice(0, 20).map((e) => ({
        slug: e.slug, title: e.title, category: e.category, dateLabel: e.dateLabel, city: e.city, venue: e.venue,
      })),
      churches: churches.slice(0, 20).map((c) => ({
        slug: c.slug, name: c.name, city: c.city, country: c.country,
        denomination: c.denomination, verified: c.verified, gradient: c.gradient, initials: c.initials,
      })),
      articles: articles.slice(0, 20).map((a) => ({
        slug: a.slug, title: a.title, categorySlug: a.categorySlug, readMinutes: a.readMinutes,
      })),
    },
  });
}
