import type photos from '../config/photos.json';
import type { SourceId } from './sources';

/**
 * Language-neutral biographical facts: names, places, dates, links and the sources behind them.
 * All wording lives in src/i18n/<locale>.ts, keyed by the ids used here.
 * Anything not verified is intentionally absent; see docs/PENDING.md.
 */

/** Toned photos built by `python3 scripts/build-photos.py` from scripts/photos.json. */
export type PhotoId = keyof typeof photos;

export type LogoId = 'uc3m' | 'berkeley' | 'bologna' | 'garrigues' | 'maec' | 'fletcher' | 'areces' | 'hks';

export interface Period {
  from?: string;
  to?: string | 'present';
}

export interface Item {
  id: string;
  link?: string;
  sources: SourceId[];
}

export interface Entry {
  id: string;
  institution: string;
  logo?: LogoId;
  period?: Period;
  /** A single point in time (YYYY-MM or YYYY-MM-DD) when the span is not documented. */
  date?: string;
  link?: string;
  /** Sub-entries such as the courses taken at an institution. */
  items?: Item[];
  photo?: PhotoId;
  sources: SourceId[];
}

export interface Stage {
  id: string;
  city: string;
  place: string;
  photo?: PhotoId;
  entries: Entry[];
}

export const person = {
  name: 'Diego Prados Jódar',
  displayName: ['Diego', 'Prados'],
  email: 'diegopradosjodar@berkeley.edu',
  linkedin: 'https://www.linkedin.com/in/diegopradosjodar/',
} as const;

export const studies: Stage[] = [
  {
    id: 'madrid-uc3m',
    city: 'Madrid',
    place: 'Getafe, Madrid, Spain',
    photo: 'madrid',
    entries: [
      {
        id: 'uc3m',
        institution: 'Universidad Carlos III de Madrid',
        logo: 'uc3m',
        period: { from: '2020', to: '2025' },
        sources: ['li-profile', 'tpr-article'],
      },
    ],
  },
  {
    id: 'berkeley',
    city: 'Berkeley',
    place: 'Berkeley, California, United States',
    photo: 'berkeley',
    entries: [
      {
        id: 'berkeley',
        institution: 'University of California, Berkeley',
        logo: 'berkeley',
        period: { from: '2022', to: '2023' },
        sources: ['li-profile', 'li-berkeley'],
      },
    ],
  },
  {
    id: 'bologna',
    city: 'Bologna',
    place: 'Bologna, Italy',
    photo: 'bologna',
    entries: [
      {
        id: 'bologna',
        institution: 'Alma Mater Studiorum, Università di Bologna',
        logo: 'bologna',
        sources: ['li-profile', 'tpr-article'],
      },
    ],
  },
  {
    id: 'bruges',
    city: 'Bruges',
    place: 'Bruges, Belgium',
    photo: 'bruges',
    entries: [
      {
        id: 'coe',
        institution: 'College of Europe',
        link: 'https://www.coleurope.eu/study/master-arts-transatlantic-affairs-mata',
        period: { from: '2025', to: 'present' },
        sources: ['li-profile', 'areces-list', 'coe-mata'],
      },
    ],
  },
  {
    id: 'boston',
    city: 'Boston',
    place: 'Greater Boston, Massachusetts, United States',
    photo: 'boston',
    entries: [
      {
        id: 'fletcher',
        institution: 'The Fletcher School, Tufts University',
        logo: 'fletcher',
        link: 'https://fletcher.tufts.edu/academics/degrees-programs/master-arts-transatlantic-affairs',
        sources: ['coe-mata', 'fletcher-mata', 'diego-direct'],
      },
      {
        id: 'harvard',
        institution: 'Harvard Kennedy School',
        logo: 'hks',
        link: 'https://www.hks.harvard.edu/',
        sources: ['diego-direct', 'hks-maga', 'my-harvard-dpi451m'],
        items: [
          {
            id: 'maga',
            link: 'https://www.hks.harvard.edu/courses/make-america-great-again-ideas-behind-movement',
            sources: ['hks-maga'],
          },
          {
            id: 'china',
            link: 'https://my.harvard.edu/course/DPI451M/2026-Fall/Fall-2/001',
            sources: ['my-harvard-dpi451m'],
          },
        ],
      },
    ],
  },
];

export const scholarships: Entry[] = [
  {
    id: 'areces',
    institution: 'Fundación Ramón Areces',
    logo: 'areces',
    link: 'https://www.fundacionareces.es/fundacionareces/en/social-sciences/scholarships/',
    sources: ['areces-list', 'areces-call', 'cv'],
  },
  {
    id: 'madrid-excellence',
    institution: 'Comunidad de Madrid',
    sources: ['cv'],
  },
];

export const experience: Entry[] = [
  {
    id: 'euroconf',
    institution: 'European Conference',
    link: 'https://euroconf.eu/',
    date: '2027',
    sources: ['diego-direct', 'euroconf-2026'],
  },
  {
    id: 'sppn',
    institution: 'Spanish Public Policy Network',
    link: 'https://spainpolicy.com/',
    sources: ['diego-direct', 'sppn-home'],
  },
  {
    id: 'maec',
    institution: 'Ministry of Foreign Affairs, European Union and Cooperation',
    logo: 'maec',
    photo: 'ministry',
    period: { from: '2024-09', to: '2025-01' },
    sources: ['li-profile', 'li-nato', 'maec-placement'],
  },
  {
    id: 'garrigues',
    institution: 'Garrigues',
    logo: 'garrigues',
    date: '2024-06',
    sources: ['li-profile', 'li-garrigues', 'cv'],
  },
  {
    id: 'tpr',
    institution: 'The Political Room',
    link: 'https://thepoliticalroom.com',
    sources: ['li-profile', 'tpr-article'],
  },
];

export interface Initiative {
  id: string;
  date: string;
  link?: string;
  sources: SourceId[];
}

export const auge = {
  name: 'Asociación Universitaria de Geopolítica y Estrategia',
  acronym: 'AUGE',
  host: 'Universidad Carlos III de Madrid',
  announced: '2023-08-23',
  presidentSince: '2023-08',
  instagram: 'https://www.instagram.com/auge.uc3m/',
  media: 'https://media.uc3m.es/series/6526553d9b2ac014e938d313',
  founders: ['Diego Prados Jódar', 'Aina Vallespir Bonafé', 'Pedro Pérez Motilla', 'Carla Ruiz Gutiérrez'],
  sources: ['li-auge-launch', 'li-profile', 'tpr-article', 'li-auge-carla'] as SourceId[],
  initiatives: [
    {
      id: 'libya',
      date: '2023-09-20',
      link: 'https://es.linkedin.com/posts/aina-vallespir-bonaf%C3%A9-aa71a323a_hoy-hemos-dado-por-iniciadas-las-sesiones-activity-7110393538969792512-L-3K',
      sources: ['li-auge-bartu'],
    },
    {
      id: 'europe',
      date: '2023-10-10',
      link: 'https://media.uc3m.es/video/652655949b2ac014f23f0e92',
      sources: ['uc3m-media-auge'],
    },
    {
      id: 'latam',
      date: '2023-11-02',
      link: 'https://media.uc3m.es/video/6544c3e69b2ac01906635bb2',
      sources: ['uc3m-media-auge'],
    },
    {
      id: 'blair',
      date: '2023-11-20',
      link: 'https://media.uc3m.es/video/655b1d259b2ac01b2d1d5d12',
      sources: ['uc3m-media-auge'],
    },
    {
      id: 'vara',
      date: '2023-11-22',
      link: 'https://media.uc3m.es/video/65646ec79b2ac01dfd3de022',
      sources: ['uc3m-media-auge', 'li-auge-term'],
    },
    {
      id: 'palestine',
      date: '2024-03-19',
      link: 'https://media.uc3m.es/video/65fad62c9ab8c90d760dd292',
      sources: ['uc3m-media-auge'],
    },
    {
      id: 'japan',
      date: '2024-11-06',
      link: 'https://es.linkedin.com/posts/diegopradosjodar_hola-a-todos-estoy-muy-orgulloso-de-poder-activity-7269402851762716672-mzj8',
      sources: ['li-auge-japan', 'embassy-nakamae', 'uc3m-japan-week'],
    },
    {
      id: 'atlas',
      date: '2025-11-20',
      link: 'https://www.linkedin.com/posts/delegacionuc3m_activity-7396256200138416129-KpeI',
      sources: ['li-auge-eom'],
    },
  ] satisfies Initiative[],
};

export interface Work {
  id: string;
  date?: string;
  period?: Period;
  link?: string;
  sources: SourceId[];
}

export const works: Work[] = [
  {
    id: 'nato',
    date: '2024-11-29',
    link: 'https://www.linkedin.com/posts/diegopradosjodar_on-november-29th-i-had-the-opportunity-to-activity-7281416546785067008-1GYF',
    sources: ['li-nato'],
  },
  {
    id: 'china-sea',
    date: '2024-03-04',
    link: 'https://thepoliticalroom.com/blog/el-mar-de-china-meridional-punto-final-al-derecho-internacional',
    sources: ['tpr-article'],
  },
  { id: 'thesis', period: { from: '2025', to: 'present' }, sources: ['li-profile'] },
];
