import {
  FONT_STYLES,
  PALETTES,
  type ArticleInput,
  type Block,
  type ImageRef,
  type ReferenceItem,
} from './article-types';
import { isSafeUrl, slugify } from './article-format';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').slice(0, max) : '');
const trim = (v: unknown, max: number) => str(v, max).trim();

/** Image sources must be our own uploads (Vercel Blob, https) or a local path. */
const imageSrc = (v: unknown) => {
  const s = trim(v, 1200);
  return /^https:\/\/[a-z0-9.-]+\//i.test(s) || /^\/(?!\/)/.test(s) ? s : '';
};
const image = (v: any): ImageRef => ({ src: imageSrc(v?.src), alt: trim(v?.alt, 300) });
const url = (v: unknown) => {
  const s = trim(v, 1200);
  return s && isSafeUrl(s) ? s : '';
};
const id = (v: unknown) => (typeof v === 'string' && /^[a-zA-Z0-9_-]{4,40}$/.test(v) ? v : crypto.randomUUID().slice(0, 12));

function block(b: any): Block | null {
  if (!b || typeof b !== 'object') return null;
  const base = { id: id(b.id) };
  switch (b.type) {
    case 'heading':
      return { ...base, type: 'heading', level: b.level === 3 ? 3 : 2, text: trim(b.text, 300) };
    case 'text':
      return { ...base, type: 'text', text: str(b.text, 20000) };
    case 'list':
      return {
        ...base,
        type: 'list',
        ordered: !!b.ordered,
        items: (Array.isArray(b.items) ? b.items : []).slice(0, 60).map((i: unknown) => trim(i, 1000)).filter(Boolean),
      };
    case 'quote':
      return { ...base, type: 'quote', text: str(b.text, 2000), cite: trim(b.cite, 300) };
    case 'image':
      return {
        ...base,
        type: 'image',
        ...image(b),
        caption: trim(b.caption, 600),
        size: b.size === 'wide' || b.size === 'full' ? b.size : 'text',
      };
    case 'images':
      return {
        ...base,
        type: 'images',
        images: (Array.isArray(b.images) ? b.images : []).slice(0, 3).map(image),
        caption: trim(b.caption, 600),
      };
    case 'callout':
      return { ...base, type: 'callout', title: trim(b.title, 200), text: str(b.text, 4000) };
    case 'references':
      return {
        ...base,
        type: 'references',
        title: trim(b.title, 120) || 'References',
        items: (Array.isArray(b.items) ? b.items : []).slice(0, 80).map(
          (r: any): ReferenceItem => ({
            label: trim(r?.label, 400),
            source: trim(r?.source, 300),
            year: trim(r?.year, 12),
            url: url(r?.url),
          }),
        ),
      };
    case 'divider':
      return { ...base, type: 'divider' };
    default:
      return null;
  }
}

export type Parsed = { ok: true; value: ArticleInput } | { ok: false; error: string };

export function parseArticleInput(raw: any): Parsed {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Invalid body' };
  const title = trim(raw.title, 200);
  if (!title) return { ok: false, error: 'El título es obligatorio' };
  const blocks = (Array.isArray(raw.blocks) ? raw.blocks : []).slice(0, 250).map(block).filter(Boolean) as Block[];
  const cover = raw.cover?.src ? image(raw.cover) : null;
  return {
    ok: true,
    value: {
      title,
      slug: slugify(trim(raw.slug, 120) || title) || 'article',
      subtitle: trim(raw.subtitle, 400),
      style: {
        font: FONT_STYLES.includes(raw.style?.font) ? raw.style.font : 'editorial',
        palette: PALETTES.includes(raw.style?.palette) ? raw.style.palette : 'marble',
      },
      cover: cover && cover.src ? cover : null,
      blocks,
    },
  };
}
