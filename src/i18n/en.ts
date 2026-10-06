export interface ItemCopy {
  title: string;
  note?: string;
}

export interface EntryCopy {
  relation: string;
  programme: string;
  place?: string;
  summary?: string;
  points?: string[];
  items?: Record<string, ItemCopy>;
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
      'Diego Prados Jódar is a transatlantic policy and strategy professional focused on technology, industrial and energy policy. Universidad Carlos III de Madrid, UC Berkeley, Bologna, College of Europe and The Fletcher School. Founder of AUGE.',
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
      { id: 'studies', label: 'Studies' },
      { id: 'auge', label: 'AUGE' },
      { id: 'experience', label: 'Experience' },
      { id: 'contact', label: 'Contact' },
    ],
  },
  words: { to: 'to', present: 'present', since: 'Since' },
  profile: {
    title: ['Transatlantic policy and strategy professional with a focus on technology, industrial, and energy policy.'],
    paragraphs: [
      'Transatlantic policy and strategy professional with a background in international affairs, law, public-sector analysis, and geopolitical research. Experience across foreign policy, regulatory analysis, legal consultancy, and policy research. Currently pursuing an M.A. in Transatlantic Affairs at the College of Europe and Fletcher School, with a focus on technology, industrial, and energy policy. Interested in strategic and policy roles across the intersection of these sectors.',
      'Alongside his studies he has worked in the administrative law department of Garrigues, one of the best-known law firms in Spain, with the Spanish Ministry of Foreign Affairs and as a collaborating researcher at an independent media outlet on international affairs. He is a member of the Spanish Public Policy Network and coordinates a panel on industrial policy for the 2027 European Conference. In 2023 he co-founded AUGE, the geopolitics and strategy association of his university, and presided over it until June 2025.',
    ],
    facts: [
      { label: 'Now', value: 'Master of Arts in Transatlantic Affairs, College of Europe (Bruges) and The Fletcher School (Boston)' },
      { label: 'Harvard', value: 'Cross-registration at Harvard Kennedy School, two courses' },
      { label: 'Scholarship', value: 'Fundación Ramón Areces, postgraduate studies abroad, awarded twice' },
      { label: 'Founded', value: 'AUGE, university association for geopolitics and strategy, 2023' },
    ],
  },
  studies: {
    title: 'Studies',
    lede: 'Degrees, exchange stays and scholarships, city by city.',
    film: {
      label:
        'Animated map: a pencil line on a globe follows Diego from Granada to Madrid, Berkeley, Bologna, Bruges and Boston.',
      caption: 'From Granada to Boston.',
      pause: 'Pause the film',
      play: 'Play the film',
      replay: 'Play the film again',
    },
    entries: {
      uc3m: {
        relation: 'Degree',
        programme: 'Double Degree in International Studies and Law',
        summary:
          'A five-year programme that pairs demanding legal training with the multidisciplinary approach of international studies: the global economy, poverty and inequality, migration and climate policy.',
        points: [
          'In August 2023 he co-founded AUGE, the university\u2019s geopolitics and strategy association, and became its president, a post he held until June 2025.',
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
      coe: {
        relation: 'Master of Arts, in progress',
        programme: 'Transatlantic Affairs (MATA)',
        summary:
          'A two-year, 120 ECTS degree awarded jointly with The Fletcher School at Tufts University, with study at both institutions and a transatlantic internship.',
        points: [
          'Coursework includes European governance and institutions, European political economy, transatlantic trade and EU foresight, industrial strategy and digital policies.',
          'Thesis in progress on European chip policy, supervised by Chris Miller.',
        ],
      },
      fletcher: {
        relation: 'Joint degree, partner institution',
        programme: 'Master of Arts in Transatlantic Affairs',
        place: 'Greater Boston, Massachusetts',
        summary:
          'The Fletcher School is the other half of the degree. Students who begin in Bruges cross the Atlantic for a semester in the Boston area.',
        points: ['From Fletcher, Diego cross-registers at Harvard Kennedy School.'],
      },
      harvard: {
        relation: 'Cross-registration',
        programme: 'Two courses through Fletcher',
        place: 'Cambridge, Massachusetts',
        summary: 'Fletcher students can take courses at Harvard through cross-registration. Diego takes two at the Kennedy School.',
        items: {
          maga: {
            title: 'Make America Great Again: The Ideas Behind The Movement',
            note: 'Stephen Richer, Adjunct Lecturer in Public Policy. The ideas behind the MAGA movement, read through primary sources.',
          },
          china: {
            title: 'China\u2019s Political Economy: Industrial Policy and Corporate Strategy',
            note: 'Edward Cunningham. Fall 2026, second half of the term, 19 October to 4 December. How business and the state interact in China, through the energy and technology sectors.',
          },
        },
      },
    } satisfies Record<string, EntryCopy>,
    scholarships: {
      title: 'Scholarships',
      items: {
        areces: {
          relation: 'Scholarship holder, awarded twice',
          programme: 'Postgraduate studies abroad, social sciences',
          summary:
            'The foundation\u2019s annual call funds master\u2019s and doctoral studies at universities and research centres abroad in economics, EU law and the social sciences. Diego holds it for his master\u2019s at the College of Europe and Fletcher. He appears on the foundation\u2019s list of grantees for the 2025/26 call and holds the scholarship again in 2026/27, although the public list does not show it yet.',
        },
        'madrid-excellence': {
          relation: 'Scholarship holder, awarded three times',
          programme: 'Excellence Scholarship for undergraduate students',
          summary: 'Awarded by the regional government of Madrid during his Double Degree at Universidad Carlos III de Madrid.',
        },
      } satisfies Record<string, EntryCopy>,
    },
  },
  experience: {
    title: 'Experience',
    lede: 'Work first, then leadership, associations and conferences.',
    work: {
      title: 'Work',
      entries: {
        maec: {
          relation: 'Collaborator',
          programme: 'Deputy Directorate-General for Common Foreign and Security Policy',
          place: 'Madrid, Spain',
          points: [
            'Helped organise the first Meeting of Senior Allied Officials on NATO\u2019s Southern Neighbourhood, held at the Ministry on 29 November 2024: preparing the infrastructure (live translation, transport and meals), receiving the diplomats and accompanying them during the event.',
            'Helped prepare and translate the Minister\u2019s interventions for the EU\u2019s Foreign Affairs Council, compiling and analysing relevant events and declarations by European leaders.',
            'Researched Spain\u2019s foreign security policy in the EU context to brief the assigned diplomats on recent developments and strategic courses of action.',
            'Analysed the EEAS expenditure breakdown in the current Multiannual Financial Framework and built a database to monitor and track spending.',
          ],
        },
        garrigues: {
          relation: 'Summer Legal Intern',
          programme: 'Administrative Law department',
          place: 'Málaga, Spain',
          summary: 'Garrigues is one of the best-known law firms in Spain.',
          points: [
            'Supported the department\u2019s counsel by analysing case law, reviewing the urban planning regulations of municipalities in Andalusia, and drafting legal reports and administrative claims.',
            'Areas of practice covered: public procurement, concessions, infrastructure, expropriations, grants and subsidies, administrative litigation, environmental law and urban planning.',
          ],
        },
        tpr: {
          relation: 'Collaborator',
          programme: 'Independent media outlet on international relations and security affairs',
          place: 'Madrid, Spain',
          summary:
            'Researched Southeast Asia and wrote an analysis, in Spanish, of the interplay between international law and the Chinese maritime presence in the region: \u201cEl Mar de China Meridional: \u00bfPunto final al Derecho Internacional?\u201d, published in March 2024.',
        },
      } satisfies Record<string, EntryCopy>,
    },
    leadership: {
      title: 'Leadership',
      entries: {
        euroconf: {
          relation: 'Panel coordinator',
          programme: 'Industrial policy panel, European Conference 2027',
          place: 'Cambridge, Massachusetts',
          summary:
            'Diego is organising a panel on industrial policy for the 2027 edition. The conference is run each year by Harvard, MIT and Fletcher students to strengthen transatlantic dialogue; the 2026 edition was its twelfth.',
        },
        tellus: {
          relation: 'Participant',
          programme: 'Innovation ecosystems policy project',
          place: 'Bruges, Belgium',
          points: [
            'Led team research on innovation ecosystems and drafted a policy report on the engines that drive innovation, comparing ecosystems and formulating recommendations for the EU.',
            'Presented the final draft to Marc Lema\u00eetre, Director-General of DG RTD at the European Commission, under the supervision of Jekaterina Novikova.',
          ],
        },
        sppn: {
          relation: 'Member',
          programme: 'Platform for young Spanish professionals in public policy',
          summary:
            'The Spanish Public Policy Network brings together students, professionals and institutional leaders in policymaking and international affairs, through institutional visits, expert talks, an annual conference and a policy blog.',
        },
        auge: {
          relation: 'Founder and president',
          programme: 'Student association for geopolitical analysis and strategic debate',
          place: 'Madrid, Spain',
          points: [
            'Founded and directed the association at Universidad Carlos III de Madrid. He stepped down as president in June 2025.',
            'Organised and moderated seminars and guest lectures with experts in geopolitics, and interviewed guests including Dennis C. Blair, former U.S. Director of National Intelligence, and María Andrés Marín, Director of the European Parliament Office in Spain.',
          ],
        },
        dpe: {
          relation: 'Member',
          programme: 'Professional foreign service fraternity, Epsilon Chapter',
          place: 'Berkeley, California',
          points: [
            'Took part in panels and guest lectures on international affairs with diplomats, scholars and foreign policy practitioners.',
            'Wrote a research paper on the security dynamics of the Sahel and their implications for EU external action, presented at an academic symposium.',
          ],
        },
        cafe: {
          relation: 'Volunteer',
          programme: 'Community association',
          place: 'Granada, Spain',
        },
      } satisfies Record<string, EntryCopy>,
    },
  },
  photos: {
    by: 'Photo',
    edited: 'cropped and toned',
    items: {
      madrid: {
        caption: 'Universidad Carlos III de Madrid, Getafe campus',
        alt: 'Panoramic view of the Getafe campus of Universidad Carlos III de Madrid.',
      },
      berkeley: {
        caption: 'Sather Tower from Memorial Glade, UC Berkeley',
        alt: 'The Sather Tower campanile rising above the trees of Memorial Glade at UC Berkeley.',
      },
      bologna: {
        caption: 'The portico of the Archiginnasio, Bologna',
        alt: 'A long vaulted arcade under the Archiginnasio in Bologna.',
      },
      bruges: {
        caption: 'Rozenhoedkaai and the Dijver, Bruges',
        alt: 'Brick houses along the canal at the Rozenhoedkaai in Bruges.',
      },
      boston: {
        caption: 'The Fletcher School of Law and Diplomacy, Tufts University',
        alt: 'The Fletcher School building on the Tufts University campus.',
      },
      ministry: {
        caption: 'Palacio de Santa Cruz, Madrid, seat of the Ministry of Foreign Affairs',
        alt: 'The brick and stone façade of the Palacio de Santa Cruz in Madrid.',
      },
    },
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
      'President from August 2023 to June 2025.',
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
        note: 'Dennis C. Blair is a former U.S. Director of National Intelligence. Recorded session.',
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
    text: 'Diego is interested in strategic and policy roles across technology, industrial, and energy policy.',
    emailLabel: 'Email',
    linkedinLabel: 'LinkedIn',
    linkedinText: 'linkedin.com/in/diegopradosjodar',
    figureLabel: 'Pencil sketch of Diego with his arms crossed, smiling.',
    footer: 'Diego Prados Jódar',
  },
};

export type Copy = typeof en;
