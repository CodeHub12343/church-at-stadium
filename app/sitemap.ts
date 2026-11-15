import type { MetadataRoute } from 'next';
import { dbConnect } from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { Church } from '@/lib/models/Church';
import { PressRelease } from '@/lib/models/PressRelease';
import { HelpArticle } from '@/lib/models/HelpArticle';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const now = new Date();

  const staticPaths = [
    '', 'about', 'mission', 'how-it-works', 'partners',
    'events', 'churches', 'press', 'help', 'faq', 'contact',
    'status', 'volunteer', 'register', 'login', 'privacy', 'terms',
  ];

  try {
    await dbConnect();
    const [events, churches, releases, articles] = await Promise.all([
      Event.find({ status: { $in: ['Open', 'Approved'] } }).select('slug updatedAt').lean(),
      Church.find({ verified: true }).select('slug updatedAt').lean(),
      PressRelease.find().select('slug publishedAt').lean(),
      HelpArticle.find().select('slug updatedAt').lean(),
    ]);

    return [
      ...staticPaths.map((p) => ({
        url: p ? `${base}/${p}` : `${base}/`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: p === '' ? 1.0 : 0.7,
      })),
      ...events.map((e) => ({
        url: `${base}/events/${e.slug}`,
        lastModified: e.updatedAt ?? now,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      })),
      ...churches.map((c) => ({
        url: `${base}/churches/${c.slug}`,
        lastModified: c.updatedAt ?? now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
      ...releases.map((r) => ({
        url: `${base}/press/releases/${r.slug}`,
        lastModified: r.publishedAt ?? now,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
      ...articles.map((a) => ({
        url: `${base}/help/${a.slug}`,
        lastModified: a.updatedAt ?? now,
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      })),
    ];
  } catch {
    return staticPaths.map((p) => ({
      url: p ? `${base}/${p}` : `${base}/`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
    }));
  }
}
