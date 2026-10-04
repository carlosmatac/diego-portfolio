import type { APIRoute } from 'astro';
import { parseArticleInput } from '../../../../lib/article-validate';
import { createArticle, updateArticle } from '../../../../lib/db';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.json().catch(() => null);
  const parsed = parseArticleInput(raw);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const created = await createArticle(parsed.value);
  const article = raw.status === 'published' ? ((await updateArticle(created.id, parsed.value, 'published')) ?? created) : created;
  return json(article, 201);
};
