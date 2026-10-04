export interface EntryCopy {
  relation: string;
  programme: string;
  place?: string;
  summary?: string;
  points?: string[];
}

export interface InitiativeCopy {
  title: string;
  note?: string;
  role?: string;
}

export interface WorkCopy {
  title: string;
  kind: string;
  text: string;
  linkLabel?: string;
}

/**
 * English copy. Other locales implement the same shape (typed as Copy), so adding
 * src/i18n/es.ts or fr.ts is a translation job only; facts stay in src/data/.
 */
export const en = {
  locale: 'en',
  lang: 'en',
  locales: { month: 'en-GB' },
  meta: {
    title: 'Diego Prados Jódar',
    description:
      'Diego Prados Jódar studies and works on international relations, international law and geostrategy. Universidad Carlos III de Madrid, UC Berkeley, Bologna, College of Europe. Founder and president of AUGE.',
  },
  skip: 'Skip to content',
  hero: {
    figureLabel:
      'Pencil sketch of Diego Prados, who walks towards the viewer, waves, crosses his arms and smiles.',
  },
  header: {
    home: 'Diego Prados Jódar, home',
    label: 'Main',
    pages: [
      { id: 'work', href: '/work', label: 'Work' },
      { id: 'blog', href: '/blog', label: 'Blog' },
    ],
    anchors: [
      { id: 'path', label: 'Path' },
      { id: 'auge', label: 'AUGE' },
      { id: 'contact', label: 'Contact' },
    ],
  },
  words: { to: 'to', present: 'present', since: 'Since' },
  profile: {
    title: ['International relations,', 'international law', 'and geostrategy.'],
    paragraphs: [
      'Diego Prados Jódar was born in Granada. He studied the Double Degree in International Studies and Law at Universidad Carlos III de Madrid, spent an exchange year at UC Berkeley and a stay at the University of Bologna, and is now studying the Master of Arts in Transatlantic Affairs at the College of Europe in Bruges.',
      'Alongside his studies he has worked in the administrative law department of a law firm, with the Spanish Ministry of Foreign Affairs and as a collaborating researcher at an independent media outlet on international affairs. In 2023 he co-founded AUGE, the geopolitics and strategy association of his university, and has presided over it since.',
    ],
    facts: [
      { label: 'Now', value: 'Master of Arts in Transatlantic Affairs, College of Europe, Bruges' },
      { label: 'Founded', value: 'AUGE, university association for geopolitics and strategy, 2023' },
      { label: 'Scholarship', value: 'Fundación Ramón Areces, postgraduate studies abroad, 2025/26 call' },
    ],
  },
  path: {
    title: 'Path',
    lede: 'Studies, placements and a student association, city by city.',
    locationLabel: 'Location',
    entries: {
      uc3m: {
        relation: 'Degree',
        programme: 'Double Degree in International Studies and Law',
        summary:
          'A five-year programme that pairs demanding legal training with the multidisciplinary approach of international studies: the global economy, poverty and inequality, migration and climate policy.',
        points: [
          'In August 2023 he co-founded AUGE, the university\u2019s geopolitics and strategy association, and became its president.',
        ],
      },
      berkeley: {
        relation: 'Exchange year',
        programme: 'Global Studies',
        summary: 'A one-year exchange programme, completed in May 2023.',
        points: [
          'Member of Delta Phi Epsilon, the professional foreign service fraternity (Epsilon Chapter).',
        ],
      },
      bologna: {
        relation: 'Exchange stay',
        programme: 'Law',
        summary: 'Law courses at the University of Bologna, founded in 1088, during an exchange stay.',
      },
      tpr: {
        relation: 'Collaborating researcher',
        programme: 'Independent media outlet on international affairs',
        summary: 'Published an article in Spanish on the South China Sea and international law in March 2024.',
      },
      garrigues: {
        relation: 'Summer Legal Intern',
        programme: 'Administrative Law department',
      },
      maec: {
        relation: 'Collaborator',
        programme: 'Deputy Directorate-General for Common Foreign and Security Policy',
        points: [
          'Part of the team that organised the first Meeting of Senior Allied Officials on NATO\u2019s Southern Neighbourhood, held at the Ministry on 29 November 2024.',
        ],
      },
      coe: {
        relation: 'Master of Arts, in progress',
        programme: 'Transatlantic Affairs (MATA)',
        summary:
          'A two-year, 120 ECTS degree awarded jointly with The Fletcher School at Tufts University, with study at both institutions and a transatlantic internship.',
        points: [
          'Coursework includes European governance and institutions, European political economy, transatlantic trade and EU foresight, industrial strategy and digital policies.',
          'Thesis in progress on European chip policy, supervised by Chris Miller.',
          'Recipient of the Fundación Ramón Areces scholarship for postgraduate studies abroad.',
        ],
      },
      fletcher: {
        relation: 'Partner institution',
        programme: 'Master of Arts in Transatlantic Affairs',
        place: 'Greater Boston, Massachusetts',
        summary:
          'The Fletcher School is the other half of the degree. Students who begin in Bruges cross the Atlantic for a partner semester in the Boston area.',
      },
    } satisfies Record<string, EntryCopy>,
  },
  auge: {
    title: 'AUGE',
    fullNameNote: 'Universidad Carlos III de Madrid, Getafe campus',
    purposeTitle: 'What it is for',
    purpose: [
      'AUGE exists to analyse, understand and anticipate the geopolitical world through talks with experts and university activities built around current strategic cases.',
      'Its method takes the geography, history, economic relations and culture of the actors involved as basic tools of analysis, together with the particularities of each case.',
    ],
    roleTitle: 'Diego\u2019s role',
    role: [
      'Co-founder, with Aina Vallespir Bonafé, Pedro Pérez Motilla and Carla Ruiz Gutiérrez. The association was announced on 23 August 2023, with activities starting that September.',
      'President since August 2023.',
      'Moderator, with Lucía Barona Bonet, of the session with the Ambassador of Japan to Spain on 6 November 2024.',
    ],
    formatTitle: 'How it works',
    format: [
      'Externals are talks at the university with invited specialists: academics, journalists, military officers and diplomats.',
      'Internals are sessions led by members on a current topic.',
      'Several sessions are recorded and published in the UC3M media library.',
    ],
    initiativesTitle: 'Sessions on record',
    initiatives: {
      libya: {
        title: 'The 2011 Libya case',
        note: 'First external session, with Peter Bartu, who teaches at UC Berkeley and specialises in the Middle East.',
      },
      europe: {
        title: 'The importance of Europe: challenges and opportunities of the Union',
        note: 'Recorded session.',
      },
      latam: {
        title: 'EU foreign policy: relations with Latin America and the Caribbean',
        note: 'Recorded session.',
      },
      blair: {
        title: 'Conference with Dennis Blair',
        note: 'Recorded session.',
      },
      vara: {
        title: '\u201cEl porvenir del viejo mundo\u201d, with Óscar Vara',
        note: 'The Universidad Autónoma de Madrid economist presented his new book. It closed the first term.',
      },
      palestine: {
        title: 'The Israeli-Palestinian conflict, with Félix Vacas Fernández',
        note: 'Recorded session.',
      },
      japan: {
        title: 'Japan\u2019s position in Spain and the world, with the Ambassador of Japan',
        note: 'Takahiro Nakamae, Ambassador of Japan to Spain, spoke on the main challenges for the region. Moderated by Diego and Lucía Barona Bonet, with the support of the Embassy of Japan and UC3M.',
      },
      atlas: {
        title: '\u201cLas fuerzas que mueven el mundo\u201d, book presentation',
        note: 'The new geopolitics atlas by the El Orden Mundial team, with its authors. Organised with El Circo del Poder, Sonora UC3M and the student council.',
      },
    } satisfies Record<string, InitiativeCopy>,
    outcomeTitle: 'What came of it',
    outcome: [
      'Six external sessions are documented between September 2023 and March 2024, the first months of an association announced that August, and it was still organising them in November 2025.',
      'It worked with institutions beyond the student body: the Embassy of Japan, the university\u2019s student council and its radio station, Sonora UC3M. Its sessions are archived in UC3M\u2019s media library and on its own YouTube channel.',
    ],
    links: { media: 'Recordings at UC3M Media', instagram: 'AUGE on Instagram' },
    sourceLink: 'Source',
  },
  work: {
    title: 'Work',
    pageTitle: 'Work | Diego Prados Jódar',
    pageDescription: 'Organised events, writing and research by Diego Prados Jódar: the NATO Southern Neighbourhood meeting, an article on the South China Sea and a thesis on European chip policy.',
    lede: 'Three pieces that can be checked.',
    items: {
      nato: {
        kind: 'Organised, 29 November 2024',
        title: 'First Meeting of Senior Allied Officials on NATO\u2019s Southern Neighbourhood',
        text: 'Held at the Spanish Ministry of Foreign Affairs, European Union and Cooperation. It was opened by the Minister, José Manuel Albares, and chaired by Javier Colomina, the NATO Secretary General\u2019s Special Representative for the Southern Neighbourhood. Diego was part of the team that organised it during his placement.',
        linkLabel: 'Diego\u2019s account on LinkedIn',
      },
      'china-sea': {
        kind: 'Article in Spanish, 4 March 2024',
        title: 'El Mar de China Meridional: \u00bfPunto final al Derecho Internacional?',
        text: 'Published in The Political Room, an independent outlet on international affairs, as an 11 minute read. It looks at the South China Sea through international law.',
        linkLabel: 'Read it at The Political Room',
      },
      thesis: {
        kind: 'Master\u2019s thesis, in progress',
        title: 'From Strategic Autonomy to Strategic Interdependence',
        text: 'A case study of European chip policy through ASML\u2019s extreme ultraviolet technology, written at the College of Europe and supervised by Chris Miller, author of Chip War.',
      },
    } satisfies Record<string, WorkCopy>,
  },
  blog: {
    title: 'Blog',
    pageTitle: 'Blog | Diego Prados Jódar',
    pageDescription: 'Articles and notes by Diego Prados Jódar on international relations, international law and geostrategy.',
    lede: 'Articles and notes by Diego.',
    empty: 'The first articles will appear here soon.',
    back: 'All articles',
    published: 'Published',
    minutes: 'min read',
    references: 'References',
    read: 'Read article',
  },
  footer: {
    text: 'Diego Prados Jódar',
    home: 'Home',
  },
  contact: {
    title: 'Contact',
    text: 'Diego is interested in opportunities in international relations, geostrategy and international law.',
    emailLabel: 'Email',
    linkedinLabel: 'LinkedIn',
    linkedinText: 'linkedin.com/in/diegopradosjodar',
    figureLabel: 'Pencil sketch of Diego with his arms crossed, smiling.',
    footer: 'Diego Prados Jódar',
  },
};

export type Copy = typeof en;
