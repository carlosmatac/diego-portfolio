import { getSiteRows, type SiteKey } from './db';
import { env } from './env';
import { defaultSite } from './site-default';
import type { SiteContent } from './site-types';
import { parseSite } from './site-validate';

/** Stored copies are completed section by section with the defaults, then cleaned, so they always render. */
export const normalizeSite = (stored: unknown): SiteContent =>
  parseSite({ ...defaultSite(), ...(stored && typeof stored === 'object' ? stored : {}) }).value;

let warned = false;

/**
 * Content for the home page. `live` is what visitors see; `draft` is what Diego is editing (falls back to
 * live). Without a database, or if it fails, the sourced defaults from the code are used: the page never breaks.
 */
export async function loadSite(which: SiteKey = 'live'): Promise<SiteContent> {
  if (!env('DATABASE_URL')) return defaultSite();
  try {
    const rows = await getSiteRows();
    const row = which === 'draft' ? (rows.draft ?? rows.live) : rows.live;
    return row ? normalizeSite(row.data) : defaultSite();
  } catch (e) {
    if (!warned) console.error('site content: falling back to defaults', e);
    warned = true;
    return defaultSite();
  }
}
