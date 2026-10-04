import { put } from '@vercel/blob';
import type { APIRoute } from 'astro';
import { requireEnv } from '../../../lib/env';

export const prerender = false;

const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};
const MAX = 8 * 1024 * 1024;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const file = (await request.formData().catch(() => null))?.get('file');
  if (!(file instanceof File)) return json({ error: 'Falta el archivo' }, 400);
  const ext = TYPES[file.type];
  if (!ext) return json({ error: 'Formato no admitido (JPG, PNG, WebP, GIF o AVIF)' }, 415);
  if (file.size > MAX) return json({ error: 'La imagen supera los 8 MB' }, 413);
  const blob = await put(`articles/image.${ext}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
    token: requireEnv('BLOB_READ_WRITE_TOKEN'),
  });
  return json({ url: blob.url });
};
