import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { limit } from '@/lib/rateLimit';
import { uploadFile } from '@/lib/uploads';

export const runtime = 'nodejs';

const ALLOWED_PREFIXES = new Set(['documents', 'avatars', 'churches', 'events']);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await limit(req, 'uploads', { max: 30, windowMs: 60 * 60 * 1000, extra: session.user.id });
  if (rl) return rl;

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  const file = form.get('file');
  const prefixRaw = form.get('prefix');
  const prefix = typeof prefixRaw === 'string' && ALLOWED_PREFIXES.has(prefixRaw) ? prefixRaw : 'documents';

  if (!(file instanceof File)) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const res = await uploadFile({ ownerId: session.user.id, file, prefix });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });

  return NextResponse.json({ ok: true, file: res.file });
}
