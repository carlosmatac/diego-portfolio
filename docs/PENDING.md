# Pending confirmation

Open items for Diego or the owner. None of these appear as placeholders on the public site: where data is missing the
entry is simply shorter.

## Biography
- **UC3M double degree**: LinkedIn shows 2020 to 2025 with a final mark, the site says "studied". Confirm graduation and the official English name of the programme.
- **Bologna**: dates, exchange programme (Erasmus or other), department and courses. The entry currently has no dates.
- **College of Europe (MATA)**: start date (2025 is inferred from the Fundación Ramón Areces 2025/26 call), track (Bruges), expected end date and the dates of the Fletcher semester in the Boston area.
- **CV**: `Diego_Prados_Jodar_CV.pdf` (local, gitignored) answers several items in this list (Bologna dates, thesis title and supervisor, Garrigues and Political Room dates, Ministry title, who Dennis Blair is). It is not a public source, so none of it is applied yet beyond the scholarships and the Garrigues city; confirm with Diego what he wants published. It also lists the TellUs Project, languages and grades, which the site deliberately leaves out, and gives AUGE as June 2023 to June 2025 against "Present" on LinkedIn.
- **Thesis**: official title and supervisor wording (taken from LinkedIn, marked "in process").
- **The Political Room**: start and end of his role as collaborating researcher, and any other articles worth listing.
- **Garrigues**: length of the summer internship.
- **Ministry**: official job title and type of placement ("Colaborador"; a University of Granada resolution lists it among non-paid placements). Confirm wording and the Sep 2024 to Jan 2025 dates.
- **NATO meeting**: how to describe his part ("organise", as in his post). Confirm he is happy for the speakers' names to appear.

## Harvard, SPPN, European Conference and scholarships
- **Harvard cross-registration**: the two courses come from Diego. Confirm both registrations are final (my.Harvard showed DPI 451M at 75/75 with a waitlist when checked), the term of the "Make America Great Again" course (its page gives none), and that he is happy to name both courses.
- **SPPN**: date of joining and type of membership (the site offers Full and Associate).
- **European Conference 2027**: exact role title, panel title and dates. euroconf.eu only shows the 2026 edition, so the 2027 role rests on Diego alone.
- **Fundación Ramón Areces**: the CV says "two-time recipient" but the public grantee lists only confirm the 2025/26 call (the second award may be the renewal for the second year of the master). Confirm the years. The site does not call it "prestigious" because there is no citable basis; if wanted, add a sourced fact (for example the number of grantees per call).
- **Comunidad de Madrid Excellence Scholarship**: official Spanish name and the three academic years.
- **Garrigues**: the city changed from Madrid to Málaga, following the CV. Confirm.

## AUGE
- Official name: the 2023 announcement says "para la Geopolítica y Estrategia", later posts and his profile say "de Geopolítica y Estrategia". The site uses "Asociación Universitaria de Geopolítica y Estrategia".
- Diego left the presidency in June 2025 (told by Diego); LinkedIn still says "Present". The current board is unknown.
- Verified figures for the "what came of it" text: members, attendance, number of sessions per year, partners. None are public, so the text is qualitative and counts only sessions found online (six between Sep 2023 and Mar 2024).
- Sessions from 2024/25 and 2025/26 other than the two listed: only publicly found ones are shown. A talk on European security by a Colonel (Oct 2025) was left out because the name was not readable.
- "Conference with Dennis Blair" (20 Nov 2023): the UC3M recording has no description. Confirm who he is and the title before adding any credential.
- Role of Diego in the Nov 2025 El Orden Mundial presentation (the site only says it was an AUGE event).
- The Japan session: confirm the exact title of the talk. Identity is settled (Takahiro Nakamae, Ambassador of Japan to Spain).

## Contact and rights
- Email: `diego.pradosjodar@coleurope.eu` (given by Diego, also in his CV). A College of Europe address may stop working after the master ends; ask for a long-term one.
- Logos are shown as found on official sites or Wikimedia Commons (`public/logos/`). Confirm the right to use them in a personal portfolio, especially UC Berkeley (strict wordmark rules), the University of Bologna seal and Garrigues. No logo was found for College of Europe or The Political Room, so their names are set in type.
- Photo or social links beyond LinkedIn and AUGE's Instagram, if wanted.

## Photos and film
- Photos are Wikimedia Commons city and building views, not photos of Diego. If he has his own (at the College of Europe, Fletcher, Harvard, AUGE sessions, the European Conference), they would be better. `scripts/build-photos.py` only fetches from Commons today, so it would need a local-file option.
- The film shows Boston with "2026" (from the Harvard course in Fall 2026) and Bologna without a year, matching the site. Update `video/src/data.ts` once the Bologna and Fletcher dates are confirmed.

## Animation assets
- The walk cycle exists only inside the embedded MP4 of `diego-saludo-v4/ver-saludo.html` (12 distinct drawings, repeated four times; H.264 compression). If the original PNGs of those 12 drawings exist, add them and rerun `npm run frames` for cleaner lines.
- The greeting loop uses the 40 PNGs and the original exposure order from `secuencia.json`.

## Product
- The opening animation no longer has a visible pause button (removed on request). It loops indefinitely, so consider WCAG 2.2.2 (Pause, Stop, Hide); reduced-motion users get a still pose. A discreet control or the Escape key can be added back.
- The pencil sketches (line boil) loop while in view and have no pause control; reduced-motion users get the first drawing. They are decorative and `aria-hidden`, but a pause could be added if wanted.
- Blog: password is in Vercel env vars; hand it to Diego privately and rotate it if shared. Add rate limiting (Vercel WAF) before launch. No RSS feed, tags or search yet.
- Admin UI is in Spanish; make it follow the site language if other editors join.
- Contact section: Path, AUGE and Contact links only appear in the header on large screens.
- Spanish and French versions (copy lives in `src/i18n/`; add `es.ts` and `fr.ts` typed as `Copy` and routes).
- Social preview image, favicon, analytics, domain and legal notice.
