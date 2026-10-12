import { auge, leadership, person, scholarships, studies, work, type Entry } from '../data/facts';
import { en, type EntryCopy } from '../i18n/en';
import type { SiteContent, SiteEntry } from './site-types';

const entry = (e: Entry, t: EntryCopy): SiteEntry => ({
  id: e.id,
  institution: e.institution,
  link: e.link ?? '',
  logo: e.logo ?? '',
  photo: e.photo ?? '',
  relation: t.relation,
  programme: t.programme,
  place: t.place ?? '',
  from: e.period?.from ?? '',
  to: e.period?.to ?? '',
  date: e.date ?? '',
  grade: e.grade ?? '',
  summary: t.summary ?? '',
  points: [...(t.points ?? [])],
  items: (e.items ?? []).map((i) => ({
    id: i.id,
    title: t.items?.[i.id]?.title ?? '',
    link: i.link ?? '',
    note: t.items?.[i.id]?.note ?? '',
  })),
});

const copyOf = (group: Record<string, EntryCopy>, id: string) => group[id];

/** The sourced content that ships with the code. Used until Diego publishes his own version, and as a fallback. */
export function defaultSite(): SiteContent {
  const s = en.studies;
  const x = en.experience;
  return {
    profile: {
      title: en.profile.title.join(' '),
      paragraphs: [...en.profile.paragraphs],
      facts: en.profile.facts.map((f) => ({ ...f })),
    },
    studies: {
      lede: s.lede,
      stages: studies.map((st) => ({
        id: st.id,
        city: st.city,
        place: st.place,
        photo: st.photo ?? '',
        entries: st.entries.map((e) => entry(e, copyOf(s.entries, e.id))),
      })),
      scholarships: scholarships.map((e) => entry(e, copyOf(s.scholarships.items, e.id))),
    },
    experience: {
      lede: x.lede,
      work: work.map((e) => entry(e, copyOf(x.work.entries, e.id))),
      leadership: leadership.map((e) => entry(e, copyOf(x.leadership.entries, e.id))),
    },
    auge: {
      purpose: [...en.auge.purpose],
      role: [...en.auge.role],
      format: [...en.auge.format],
      initiatives: auge.initiatives.map((i) => {
        const t = en.auge.initiatives[i.id as keyof typeof en.auge.initiatives];
        return { id: i.id, date: i.date, link: i.link ?? '', title: t.title, note: t.note ?? '' };
      }),
      outcome: [...en.auge.outcome],
    },
    contact: {
      text: en.contact.text,
      email: person.email,
      linkedin: person.linkedin,
      linkedinText: en.contact.linkedinText,
    },
  };
}
