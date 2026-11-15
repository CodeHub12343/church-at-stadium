// File upload abstraction.
// - Dev / no token: stores under public/uploads/<ownerId>/<hash>.<ext>.
// - If BLOB_READ_WRITE_TOKEN is set, uses Vercel Blob (@vercel/blob).
// Returns a URL the browser can load.

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export type UploadedFile = {
  url: string;
  name: string;
  size: number;
  contentType: string;
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
]);

export function extForContentType(ct: string): string {
  const map: Record<string, string> = {
    'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/plain': '.txt', 'text/csv': '.csv',
  };
  return map[ct] ?? '';
}

export async function uploadFile(args: {
  ownerId: string;
  file: File;
  prefix?: string;
}): Promise<{ ok: true; file: UploadedFile } | { ok: false; error: string; status: number }> {
  const { ownerId, file } = args;

  if (!file || typeof file === 'string') return { ok: false, error: 'No file sent', status: 400 };
  if (file.size === 0) return { ok: false, error: 'Empty file', status: 400 };
  if (file.size > MAX_SIZE) return { ok: false, error: `File too large (max ${Math.floor(MAX_SIZE / 1024 / 1024)}MB)`, status: 413 };
  const contentType = file.type || 'application/octet-stream';
  if (!ALLOWED_TYPES.has(contentType)) return { ok: false, error: `Unsupported type: ${contentType}`, status: 415 };

  const buf = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 24);
  const ext = extForContentType(contentType) || path.extname(file.name) || '';
  const key = `${args.prefix ?? 'uploads'}/${ownerId}/${hash}${ext}`;

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      // @vercel/blob is optional — install it in the deploy to switch from local disk to Vercel Blob.
      // The indirection stops TS from resolving the module at compile time when it isn't installed.
      const modName = '@vercel/blob';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await (new Function('m', 'return import(m)') as (m: string) => Promise<unknown>)(modName).catch(() => null);
      if (mod?.put) {
        const blob = await mod.put(key, buf, {
          access: 'public',
          contentType,
          token: blobToken,
          addRandomSuffix: false,
        });
        return {
          ok: true,
          file: { url: blob.url, name: file.name, size: file.size, contentType },
        };
      }
      console.warn('[uploads] BLOB_READ_WRITE_TOKEN set but @vercel/blob not installed; using local disk');
    } catch (err) {
      console.error('[uploads] Vercel Blob failed, falling back to local', err);
    }
  }

  const root = path.join(process.cwd(), 'public');
  const dest = path.join(root, key);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  const url = `/${key}`;
  return { ok: true, file: { url, name: file.name, size: file.size, contentType } };
}
