import type { LogoId, PhotoId } from '../data/facts';

/**
 * The editable content of the home page. Defaults come from src/data/facts.ts and src/i18n/en.ts
 * (src/lib/site-default.ts); once Diego saves from /admin/site, the stored copy wins.
 * Empty strings mean "not shown".
 */
export interface SiteItem {
  id: string;
  title: string;
  link: string;
  note: string;
}

export interface SiteEntry {
  id: string;
  institution: string;
  link: string;
  logo: LogoId | '';
  photo: PhotoId | '';
  relation: string;
  programme: string;
  place: string;
  /** YYYY, YYYY-MM or YYYY-MM-DD. */
  from: string;
  /** Same formats, or "present". */
  to: string;
  /** A single point in time, used when there is no span. */
  date: string;
  grade: string;
  summary: string;
  points: string[];
  items: SiteItem[];
}

export interface SiteStage {
  id: string;
  city: string;
  place: string;
  photo: PhotoId | '';
  entries: SiteEntry[];
}

export interface SiteInitiative {
  id: string;
  date: string;
  link: string;
  title: string;
  note: string;
}

export interface SiteFact {
  label: string;
  value: string;
}

export interface SiteContent {
  profile: { title: string; paragraphs: string[]; facts: SiteFact[] };
  studies: { lede: string; stages: SiteStage[]; scholarships: SiteEntry[] };
  experience: { lede: string; work: SiteEntry[]; leadership: SiteEntry[] };
  auge: {
    purpose: string[];
    role: string[];
    format: string[];
    initiatives: SiteInitiative[];
    outcome: string[];
  };
  contact: { text: string; email: string; linkedin: string; linkedinText: string };
}
