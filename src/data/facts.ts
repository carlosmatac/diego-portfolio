import type { SourceId } from './sources';

/**
 * Language-neutral biographical facts: names, places, dates, links and the sources behind them.
 * All wording lives in src/i18n/<locale>.ts, keyed by the ids used here.
 * Anything not verified is intentionally absent; see docs/PENDING.md.
 */

export type LogoId = 'uc3m' | 'berkeley' | 'bologna' | 'garrigues' | 'maec' | 'fletcher' | 'areces';

export interface Period {
  from?: string;
  to?: string | 'present';
}

export interface Entry {
  id: string;
  institution: string;
  logo?: LogoId;
  period?: Period;
  /** A single point in time (YYYY-MM or YYYY-MM-DD) when the span is not documented. */
  date?: string;
  link?: string;
  sources: SourceId[];
}

export interface Stage {
  id: string;
  city: string;
  place: string;
  entries: Entry[];
}

export const person = {
  name: 'Diego Prados Jódar',
  displayName: ['Diego', 'Prados'],
  email: 'diegopradosjodar@berkeley.edu',
  linkedin: 'https://www.linkedin.com/in/diegopradosjodar/',
} as const;

export const stages: Stage[] = [
  {
    id: 'madrid-uc3m',
    city: 'Madrid',
    place: 'Getafe, Madrid, Spain',
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
    id: 'madrid-work',
    city: 'Madrid',
    place: 'Madrid, Spain',
    entries: [
      {
        id: 'tpr',
        institution: 'The Political Room',
        link: 'https://thepoliticalroom.com',
        sources: ['li-profile', 'tpr-article'],
      },
      {
        id: 'garrigues',
        institution: 'Garrigues',
        logo: 'garrigues',
        date: '2024-06',
        sources: ['li-profile', 'li-garrigues'],
      },
      {
        id: 'maec',
        institution: 'Ministry of Foreign Affairs, European Union and Cooperation',
        logo: 'maec',
        period: { from: '2024-09', to: '2025-01' },
        sources: ['li-profile', 'li-nato', 'maec-placement'],
      },
    ],
  },
  {
    id: 'bruges',
    city: 'Bruges',
    place: 'Bruges, Belgium',
    entries: [
      {
        id: 'coe',
        institution: 'College of Europe',
        link: 'https://www.coleurope.eu/study/master-arts-transatlantic-affairs-mata',
        period: { from: '2025', to: 'present' },
        sources: ['li-profile', 'areces-list', 'coe-mata'],
      },
      {
        id: 'fletcher',
        institution: 'The Fletcher School, Tufts University',
        logo: 'fletcher',
        link: 'https://fletcher.tufts.edu/academics/degrees-programs/master-arts-transatlantic-affairs',
        sources: ['coe-mata', 'fletcher-mata'],
      },
    ],
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
