import photos from '../config/photos.json';
import type { LogoId, PhotoId } from '../data/facts';
import { logos } from '../data/logos';
import type { SiteContent, SiteEntry, SiteInitiative, SiteItem, SiteStage } from './site-types';

const LIMIT = { short: 300, medium: 1200, long: 6000, list: 60 };
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').slice(0, max).trim() : '');
const arr = (v: unknown, max = LIMIT.list): any[] => (Array.isArray(v) ? v.slice(0, max) : []);
const lines = (v: unknown, max = LIMIT.long) => arr(v).map((s) => str(s, max)).filter(Boolean);
const id = (v: unknown) => (typeof v === 'string' && /^[a-zA-Z0-9_-]{1,40}$/.test(v) ? v : crypto.randomUUID().slice(0, 12));

const DATE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;
const URL_OK = /^(https?:\/\/[^\s]+|mailto:[^\s]+|\/(?!\/)[^\s]*|#[\w-]+)$/i;

export const LOGO_IDS = Object.keys(logos) as LogoId[];
export const PHOTO_IDS = Object.keys(photos) as PhotoId[];

/**
 * Cleans what the editor sends: trims, caps lengths, drops unknown keys and fills missing ones, so a
 * stored copy from an older shape still renders. Dates, links and the email are checked and reported
 * (in Spanish, for the admin); the API refuses to save while `errors` is not empty.
 */
export function parseSite(input: any): { value: SiteContent; errors: string[] } {
  const raw = input && typeof input === 'object' ? input : {};
  const errors: string[] = [];

  const date = (v: unknown, where: string, label: string, allowPresent = false) => {
    let s = str(v, 20).toLowerCase();
    if (allowPresent && ['present', 'actualidad', 'presente', 'actual'].includes(s)) return 'present';
    if (s && !DATE.test(s)) {
      errors.push(`${where}: la fecha «${label}» no es válida (usa AAAA, AAAA-MM o AAAA-MM-DD${allowPresent ? ', o «actualidad»' : ''}).`);
      s = '';
    }
    return s;
  };
  const link = (v: unknown, where: string) => {
    const s = str(v, LIMIT.medium);
    if (s && !URL_OK.test(s)) {
      errors.push(`${where}: el enlace «${s.slice(0, 60)}» no es válido (debe empezar por https://).`);
      return '';
    }
    return s;
  };
  const required = (v: unknown, max: number, where: string, label: string) => {
    const s = str(v, max);
    if (!s) errors.push(`${where}: falta ${label}.`);
    return s;
  };

  const item = (v: any, where: string): SiteItem => ({
    id: id(v?.id),
    title: required(v?.title, LIMIT.short, where, 'el título del curso'),
    link: link(v?.link, where),
    note: str(v?.note, LIMIT.medium),
  });

  const entry = (v: any, where: string): SiteEntry => {
    const name = str(v?.institution, LIMIT.short);
    const at = `${where} › ${name || 'entrada sin nombre'}`;
    if (!name) errors.push(`${at}: falta la institución.`);
    const from = date(v?.from, at, 'Desde');
    const to = date(v?.to, at, 'Hasta', true);
    if (to && !from) errors.push(`${at}: hay fecha «Hasta» pero falta «Desde».`);
    return {
      id: id(v?.id),
      institution: name,
      link: link(v?.link, at),
      logo: LOGO_IDS.includes(v?.logo) ? v.logo : '',
      photo: PHOTO_IDS.includes(v?.photo) ? v.photo : '',
      relation: str(v?.relation, LIMIT.short),
      programme: str(v?.programme, LIMIT.short),
      place: str(v?.place, LIMIT.short),
      from,
      to,
      date: date(v?.date, at, 'Fecha única'),
      grade: str(v?.grade, 40),
      summary: str(v?.summary, LIMIT.long),
      points: lines(v?.points),
      items: arr(v?.items, 20).map((i) => item(i, at)),
    };
  };

  const stage = (v: any): SiteStage => {
    const city = str(v?.city, 80);
    const where = `Estudios › ${city || 'ciudad sin nombre'}`;
    if (!city) errors.push(`${where}: falta el nombre de la ciudad.`);
    return {
      id: id(v?.id),
      city,
      place: str(v?.place, LIMIT.short),
      photo: PHOTO_IDS.includes(v?.photo) ? v.photo : '',
      entries: arr(v?.entries, 10).map((e) => entry(e, where)),
    };
  };

  const initiative = (v: any): SiteInitiative => {
    const title = str(v?.title, LIMIT.short);
    const where = `AUGE › ${title || 'sesión sin título'}`;
    if (!title) errors.push(`${where}: falta el título.`);
    const d = date(v?.date, where, 'Fecha');
    if (!d) errors.push(`${where}: falta la fecha.`);
    return { id: id(v?.id), date: d, link: link(v?.link, where), title, note: str(v?.note, LIMIT.medium) };
  };

  const p = raw.profile ?? {};
  const s = raw.studies ?? {};
  const x = raw.experience ?? {};
  const a = raw.auge ?? {};
  const c = raw.contact ?? {};

  const email = str(c.email, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Contacto: el email no es válido.');

  const value: SiteContent = {
    profile: {
      title: required(p.title, 400, 'Perfil', 'la frase principal'),
      paragraphs: lines(p.paragraphs, LIMIT.long),
      facts: arr(p.facts, 12)
        .map((f) => ({ label: str(f?.label, 60), value: str(f?.value, LIMIT.short) }))
        .filter((f) => f.label || f.value),
    },
    studies: {
      lede: str(s.lede, LIMIT.short),
      stages: arr(s.stages, 20).map(stage),
      scholarships: arr(s.scholarships, 20).map((e) => entry(e, 'Becas')),
    },
    experience: {
      lede: str(x.lede, LIMIT.short),
      work: arr(x.work, 30).map((e) => entry(e, 'Experiencia › Trabajo')),
      leadership: arr(x.leadership, 30).map((e) => entry(e, 'Experiencia › Liderazgo')),
    },
    auge: {
      purpose: lines(a.purpose),
      role: lines(a.role),
      format: lines(a.format),
      initiatives: arr(a.initiatives, 80).map(initiative),
      outcome: lines(a.outcome),
    },
    contact: {
      text: str(c.text, LIMIT.medium),
      email,
      linkedin: link(c.linkedin, 'Contacto'),
      linkedinText: str(c.linkedinText, 120),
    },
  };

  return { value, errors };
}
