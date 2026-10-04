import { neon } from '@neondatabase/serverless';
import type { Article, ArticleInput } from './article-types';
import { env, requireEnv } from './env';

const tableName = () => {
  const t = env('ARTICLES_TABLE') ?? 'articles';
  if (!/^[a-z_]{3,40}$/.test(t)) throw new Error('Invalid ARTICLES_TABLE');
  return t;
};

let client: ReturnType<typeof neon> | undefined;
let ready: Promise<void> | undefined;

function sql() {
  client ??= neon(requireEnv('DATABASE_URL'));
  return client;
}

/** Creates the table on first use so the owner never has to run a migration. */
function ensure() {
  ready ??= (async () => {
    const t = tableName();
    await sql().query(`
      CREATE TABLE IF NOT EXISTS ${t} (
        id text PRIMARY KEY,
        slug text NOT NULL UNIQUE,
        title text NOT NULL,
        subtitle text NOT NULL DEFAULT '',
        status text NOT NULL DEFAULT 'draft',
        style jsonb NOT NULL,
        cover jsonb,
        blocks jsonb NOT NULL DEFAULT '[]',
        published_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`);
  })().catch((e) => {
    ready = undefined;
    throw e;
  });
  return ready;
}

const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);

function toArticle(r: any): Article {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    status: r.status,
    style: r.style,
    cover: r.cover,
    blocks: r.blocks,
    publishedAt: iso(r.published_at),
    createdAt: iso(r.created_at)!,
    updatedAt: iso(r.updated_at)!,
  };
}

async function uniqueSlug(base: string, exceptId?: string) {
  const t = tableName();
  let slug = base;
  for (let n = 2; n < 50; n++) {
    const rows = (await sql().query(`SELECT id FROM ${t} WHERE slug = $1`, [slug])) as any[];
    if (!rows.length || rows[0].id === exceptId) return slug;
    slug = `${base}-${n}`;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function listArticles(opts: { publishedOnly?: boolean } = {}): Promise<Article[]> {
  await ensure();
  const where = opts.publishedOnly ? `WHERE status = 'published'` : '';
  const rows = (await sql().query(
    `SELECT * FROM ${tableName()} ${where} ORDER BY coalesce(published_at, updated_at) DESC`,
  )) as any[];
  return rows.map(toArticle);
}

export async function getArticleById(id: string): Promise<Article | null> {
  await ensure();
  const rows = (await sql().query(`SELECT * FROM ${tableName()} WHERE id = $1`, [id])) as any[];
  return rows[0] ? toArticle(rows[0]) : null;
}

export async function getPublishedBySlug(slug: string): Promise<Article | null> {
  await ensure();
  const rows = (await sql().query(`SELECT * FROM ${tableName()} WHERE slug = $1 AND status = 'published'`, [slug])) as any[];
  return rows[0] ? toArticle(rows[0]) : null;
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  await ensure();
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const slug = await uniqueSlug(input.slug);
  const rows = (await sql().query(
    `INSERT INTO ${tableName()} (id, slug, title, subtitle, style, cover, blocks)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [id, slug, input.title, input.subtitle, JSON.stringify(input.style), JSON.stringify(input.cover), JSON.stringify(input.blocks)],
  )) as any[];
  return toArticle(rows[0]);
}

export async function updateArticle(id: string, input: ArticleInput, status?: 'draft' | 'published'): Promise<Article | null> {
  await ensure();
  const slug = await uniqueSlug(input.slug, id);
  const rows = (await sql().query(
    `UPDATE ${tableName()} SET
       slug = $2, title = $3, subtitle = $4, style = $5, cover = $6, blocks = $7,
       status = coalesce($8, status),
       published_at = CASE
         WHEN $8 = 'published' AND published_at IS NULL THEN now()
         WHEN $8 = 'draft' THEN NULL
         ELSE published_at END,
       updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, slug, input.title, input.subtitle, JSON.stringify(input.style), JSON.stringify(input.cover), JSON.stringify(input.blocks), status ?? null],
  )) as any[];
  return rows[0] ? toArticle(rows[0]) : null;
}

export async function deleteArticle(id: string): Promise<void> {
  await ensure();
  await sql().query(`DELETE FROM ${tableName()} WHERE id = $1`, [id]);
}
