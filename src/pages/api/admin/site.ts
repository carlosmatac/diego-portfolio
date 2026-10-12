import type { APIRoute } from 'astro';
import { getSiteRows, putSite } from '../../../lib/db';
import { normalizeSite } from '../../../lib/site';
import { defaultSite } from '../../../lib/site-default';
import { parseSite } from '../../../lib/site-validate';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** Save the draft, and with `publish: true` make it the live version too. */
export const PUT: APIRoute = async ({ request }) => {
  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== 'object') return json({ errors: ['Contenido no válido'] }, 400);
  const { value, errors } = parseSite(raw.content);
  if (errors.length) return json({ errors }, 400);
  await putSite(raw.publish === true ? ['draft', 'live'] : ['draft'], value);
  const rows = await getSiteRows();
  return json({ content: value, pending: JSON.stringify(value) !== JSON.stringify(rows.live ? normalizeSite(rows.live.data) : defaultSite()) });
};

/**
 * `discard`: the draft goes back to what is published.
 * `restore`: the draft becomes the original content that ships with the code (nothing is published until Diego does).
 */
export const POST: APIRoute = async ({ request }) => {
  const raw = await request.json().catch(() => null);
  const rows = await getSiteRows();
  const live = rows.live ? normalizeSite(rows.live.data) : defaultSite();
  if (raw?.action === 'discard') {
    await putSite(['draft'], live);
    return json({ content: live, pending: false });
  }
  if (raw?.action === 'restore') {
    const original = defaultSite();
    await putSite(['draft'], original);
    return json({ content: original, pending: JSON.stringify(original) !== JSON.stringify(live) });
  }
  return json({ errors: ['Acción desconocida'] }, 400);
};
