import type { Period } from '../data/facts';
import type { Copy } from './en';

/** Formats YYYY, YYYY-MM or YYYY-MM-DD for the given locale. */
export function formatDate(iso: string, copy: Copy) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!m) return String(y);
  const opts: Intl.DateTimeFormatOptions = d
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat(copy.locales.month, { ...opts, timeZone: 'UTC' }).format(Date.UTC(y, m - 1, d ?? 1));
}

export function formatPeriod(period: Period | undefined, copy: Copy) {
  if (!period?.from) return '';
  const from = formatDate(period.from, copy);
  if (!period.to) return `${copy.words.since} ${from}`;
  const to = period.to === 'present' ? copy.words.present : formatDate(period.to, copy);
  return `${from} ${copy.words.to} ${to}`;
}
