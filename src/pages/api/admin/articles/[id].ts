import type { APIRoute } from 'astro';
import { parseArticleInput } from '../../../../lib/article-validate';
import { deleteArticle, updateArticle } from '../../../../lib/db';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const PUT: APIRoute = async ({ request, params }) => {
  const raw = await request.json().catch(() => null);
  const parsed = parseArticleInput(raw);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const status = raw.status === 'published' || raw.status === 'draft' ? raw.status : undefined;
  const article = await updateArticle(params.id!, parsed.value, status);
  return article ? json(article) : json({ error: 'No encontrado' }, 404);
};

export const DELETE: APIRoute = async ({ params }) => {
  await deleteArticle(params.id!);
  return json({ ok: true });
};
