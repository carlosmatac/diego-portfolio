import type { Article, Block } from './article-types';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const isSafeUrl = (u: string) => /^(https?:\/\/|mailto:|\/(?!\/))/i.test(u.trim());

/**
 * Tiny inline markup for article text: **bold**, *italic*, [label](url). Everything else is escaped.
 */
export function renderInline(raw: string): string {
  const links: string[] = [];
  let s = esc(raw).replace(/\[([^\]\n]{1,300})\]\(([^)\s]{1,1000})\)/g, (_, label: string, url: string) => {
    const href = url.replace(/&amp;/g, '&');
    if (!isSafeUrl(href)) return label;
    const external = /^https?:/i.test(href);
    links.push(
      `<a href="${esc(href)}"${external ? ' rel="noopener noreferrer" target="_blank"' : ''}>${label}</a>`,
    );
    return `\u0000${links.length - 1}\u0000`;
  });
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => links[+i]);
  return s.replace(/\n/g, '<br>');
}

export const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const blockText = (b: Block): string => {
  switch (b.type) {
    case 'heading':
    case 'text':
    case 'quote':
      return b.text;
    case 'list':
      return b.items.join(' ');
    case 'callout':
      return `${b.title} ${b.text}`;
    default:
      return '';
  }
};

export const readingMinutes = (a: Pick<Article, 'blocks'>) => {
  const words = a.blocks.map(blockText).join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

/** Plain-text description for meta tags. */
export function describe(a: Pick<Article, 'subtitle' | 'blocks'>) {
  if (a.subtitle) return a.subtitle;
  const first = a.blocks.find((b) => b.type === 'text');
  const t = first && first.type === 'text' ? first.text.replace(/[*\[\]()]/g, '') : '';
  return t.length > 180 ? `${t.slice(0, 177)}...` : t;
}
