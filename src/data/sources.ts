export interface Source {
  label: string;
  /** Absent for private sources (Diego himself, his CV). */
  url?: string;
  note?: string;
}

/**
 * Register of the sources behind every biographical claim on the site.
 * Facts in facts.ts reference these ids. Human-readable version: docs/SOURCES.md.
 */
export const sources = {
  'li-profile': {
    label: "Diego Prados Jódar, LinkedIn profile (public summary)",
    url: 'https://www.linkedin.com/in/diegopradosjodar/',
    note: 'The profile is behind a login wall for scripts; roles, dates and descriptions were read from the public search snippets of the profile.',
  },
  'li-auge-launch': {
    label: 'LinkedIn post announcing the birth of AUGE (23 Aug 2023)',
    url: 'https://es.linkedin.com/posts/diegopradosjodar_me-complace-enormemente-anunciar-el-nacimiento-activity-7100095587923992576-tniw',
  },
  'li-auge-japan': {
    label: 'LinkedIn post on the AUGE session with the Ambassador of Japan (Dec 2024)',
    url: 'https://es.linkedin.com/posts/diegopradosjodar_hola-a-todos-estoy-muy-orgulloso-de-poder-activity-7269402851762716672-mzj8',
  },
  'li-auge-term': {
    label: 'LinkedIn post closing the first AUGE term (Dec 2023)',
    url: 'https://es.linkedin.com/posts/diegopradosjodar_no-cambiar%C3%ADa-una-palabra-de-lo-dicho-por-activity-7145858248141692928-wN-J',
  },
  'li-auge-bartu': {
    label: 'LinkedIn post by Aina Vallespir Bonafé on the first AUGE external (20 Sep 2023)',
    url: 'https://es.linkedin.com/posts/aina-vallespir-bonaf%C3%A9-aa71a323a_hoy-hemos-dado-por-iniciadas-las-sesiones-activity-7110393538969792512-L-3K',
  },
  'li-auge-carla': {
    label: 'LinkedIn post by Carla Ruiz Gutiérrez on the founding of AUGE (Dec 2023)',
    url: 'https://es.linkedin.com/posts/carla-ruiz-guti%C3%A9rrez-23b93b295_hace-unos-meses-naci%C3%B3-la-idea-de-crear-una-activity-7146125675144396801--t7v',
  },
  'li-auge-eom': {
    label: 'AUGE announcement of the El Orden Mundial book presentation (reshared, 17 Nov 2025)',
    url: 'https://www.linkedin.com/posts/delegacionuc3m_activity-7396256200138416129-KpeI',
  },
  'uc3m-media-auge': {
    label: 'UC3M Media, series "Asociación AUGE"',
    url: 'https://media.uc3m.es/series/6526553d9b2ac014e938d313',
  },
  'podcast-auge': {
    label: 'Podcast Asociaciones UC3M, episode 31: AUGE UC3M',
    url: 'https://open.spotify.com/episode/0BELxzF2TR7zContp5kw64',
  },
  'li-berkeley': {
    label: 'LinkedIn post on completing the exchange year at UC Berkeley (24 May 2023)',
    url: 'https://www.linkedin.com/posts/diegopradosjodar_ucberkeley-experience-friends-activity-7067208457703067649-2hwr',
  },
  'li-garrigues': {
    label: 'LinkedIn post on joining Garrigues as Summer Legal Intern (11 Jun 2024)',
    url: 'https://es.linkedin.com/posts/diegopradosjodar_hola-a-todos-estoy-encantado-de-anunciar-activity-7206411115851919361-idag',
  },
  'li-nato': {
    label: 'LinkedIn post on the Meeting of Senior Allied Officials on NATO\'s Southern Neighbourhood (Jan 2025)',
    url: 'https://www.linkedin.com/posts/diegopradosjodar_on-november-29th-i-had-the-opportunity-to-activity-7281416546785067008-1GYF',
  },
  'maec-placement': {
    label: 'University of Granada resolution of non-paid placements at the Ministry (Oct 2024 to Jan 2025)',
    url: 'https://empleo.ugr.es/wp-content/uploads/2024/07/SSCC-RESOLUCION-TITULARES-PRACTICAS-PRIMER-CUATRIMESTRE-OCTUBRE-2024-ENERO-2025.pdf',
    note: 'Lists "Prados Jódar, Diego (UC3M)" in the SG de Política Exterior y Seguridad Común.',
  },
  'tpr-article': {
    label: 'The Political Room, "El Mar de China Meridional: ¿Punto final al Derecho Internacional?" (4 Mar 2024)',
    url: 'https://thepoliticalroom.com/blog/el-mar-de-china-meridional-punto-final-al-derecho-internacional',
    note: 'The author box also gives Diego\'s own short bio (Granada, double degree at UC3M, stays at Berkeley and Bologna, founder and president of AUGE).',
  },
  'areces-list': {
    label: 'Fundación Ramón Areces, list of grantees, XXXIX call (course 2025/26)',
    url: 'https://www.fundacionareces.es/fundacionareces/es/ciencias-sociales/becarios-ccss/',
    note: 'Lists "Prados Jódar, Diego, Collège d\'Europe (Bruges)".',
  },
  'coe-mata': {
    label: 'College of Europe, Master of Arts in Transatlantic Affairs (MATA)',
    url: 'https://www.coleurope.eu/study/master-arts-transatlantic-affairs-mata',
  },
  'fletcher-mata': {
    label: 'The Fletcher School, Master of Arts in Transatlantic Affairs',
    url: 'https://fletcher.tufts.edu/academics/degrees-programs/master-arts-transatlantic-affairs',
  },
  'embassy-nakamae': {
    label: 'Universidad Rey Juan Carlos: visit of the Ambassador of Japan, Takahiro Nakamae',
    url: 'https://www.urjc.es/fcjp/actualidad-fcjp/noticias-fcjp/8642-visita-del-embajador-de-japon-a-la-fcjp-de-la-universidad-rey-juan-carlos',
    note: 'Independent confirmation that Takahiro Nakamae is the Ambassador of Japan in Spain.',
  },
  'diego-direct': {
    label: 'Diego Prados Jódar, first-hand information given to the site owner (Oct 2026)',
    note: 'Not published online. Cross-registration at Harvard, SPPN membership and the 2027 panel role are known only from Diego himself.',
  },
  cv: {
    label: 'Diego Prados Jódar, CV (PDF)',
    note: 'Private document, kept out of the repository (.gitignore). Used for the scholarships and the city of the Garrigues internship.',
  },
  'hks-maga': {
    label: 'Harvard Kennedy School, course page "Make America Great Again: The Ideas Behind The Movement"',
    url: 'https://www.hks.harvard.edu/courses/make-america-great-again-ideas-behind-movement',
    note: 'Instructor Stephen Richer. The page gives no term.',
  },
  'my-harvard-dpi451m': {
    label: 'my.Harvard, DPI 451M "China\u2019s Political Economy: Industrial Policy and Corporate Strategy" (Fall 2 2026)',
    url: 'https://my.harvard.edu/course/DPI451M/2026-Fall/Fall-2/001',
    note: 'Instructor Edward Cunningham, 19 Oct to 4 Dec 2026, open to Harvard cross-registration for Fletcher students.',
  },
  'sppn-home': {
    label: 'Spanish Public Policy Network (SPPN)',
    url: 'https://spainpolicy.com/',
  },
  'euroconf-2026': {
    label: 'European Conference 2026, home page',
    url: 'https://euroconf.eu/',
    note: 'Organised by Harvard, MIT and Fletcher students; 2026 was the 12th edition. The site shows only the 2026 edition.',
  },
  'areces-call': {
    label: 'Fundación Ramón Areces, XXXIX call for postgraduate studies abroad in the social sciences (course 2025/26)',
    url: 'https://www.fundacionareces.es/fundacionareces/becas-fundacion-ramon-areces-para-estudios-de-postgrado-xxxix-convocatoria-para-ampliacion-de-estudios-en-el-extranjero-en-ciencias-sociales.html',
    note: 'Master programmes: one academic year, renewable for a second year.',
  },
  'uc3m-japan-week': {
    label: 'UC3M Cultura, Japan Cultural Week opening conference with Ambassador Takahiro Nakamae',
    url: 'https://cultura.uc3m.es/eventos/semana-cultural-de-japon-conferencia-inaugural/',
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof sources;
