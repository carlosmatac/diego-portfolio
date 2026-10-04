# Pending confirmation

Open items for Diego or the owner. None of these appear as placeholders on the public site: where data is missing the
entry is simply shorter.

## Biography
- **UC3M double degree**: LinkedIn shows 2020 to 2025 with a final mark, the site says "studied". Confirm graduation and the official English name of the programme.
- **Bologna**: dates, exchange programme (Erasmus or other), department and courses. The entry currently has no dates.
- **College of Europe (MATA)**: start date (2025 is inferred from the Fundación Ramón Areces 2025/26 call), track (Bruges), expected end date, and whether the Fletcher semester in the Boston area has happened or is planned, with dates. The site only states how the programme is built, not that Diego has already studied at Fletcher.
- **Thesis**: official title and supervisor wording (taken from LinkedIn, marked "in process").
- **The Political Room**: start and end of his role as collaborating researcher, and any other articles worth listing.
- **Garrigues**: length of the summer internship.
- **Ministry**: official job title and type of placement ("Colaborador"; a University of Granada resolution lists it among non-paid placements). Confirm wording and the Sep 2024 to Jan 2025 dates.
- **NATO meeting**: how to describe his part ("organise", as in his post). Confirm he is happy for the speakers' names to appear.

## AUGE
- Official name: the 2023 announcement says "para la Geopolítica y Estrategia", later posts and his profile say "de Geopolítica y Estrategia". The site uses "Asociación Universitaria de Geopolítica y Estrategia".
- Whether Diego is still president today (LinkedIn says "Present") and the current board.
- Verified figures for the "what came of it" text: members, attendance, number of sessions per year, partners. None are public, so the text is qualitative and counts only sessions found online (six between Sep 2023 and Mar 2024).
- Sessions from 2024/25 and 2025/26 other than the two listed: only publicly found ones are shown. A talk on European security by a Colonel (Oct 2025) was left out because the name was not readable.
- "Conference with Dennis Blair" (20 Nov 2023): the UC3M recording has no description. Confirm who he is and the title before adding any credential.
- Role of Diego in the Nov 2025 El Orden Mundial presentation (the site only says it was an AUGE event).
- The Japan session: confirm the exact title of the talk. Identity is settled (Takahiro Nakamae, Ambassador of Japan to Spain).

## Contact and rights
- Email: `diegopradosjodar@berkeley.edu` comes from his LinkedIn "About". Confirm it is the address he wants to publish long term.
- Logos are shown as found on official sites or Wikimedia Commons (`public/logos/`). Confirm the right to use them in a personal portfolio, especially UC Berkeley (strict wordmark rules), the University of Bologna seal and Garrigues. No logo was found for College of Europe or The Political Room, so their names are set in type.
- Photo or social links beyond LinkedIn and AUGE's Instagram, if wanted.

## Animation assets
- The walk cycle exists only inside the embedded MP4 of `diego-saludo-v4/ver-saludo.html` (12 distinct drawings, repeated four times; H.264 compression). If the original PNGs of those 12 drawings exist, add them and rerun `npm run frames` for cleaner lines.
- The greeting loop uses the 40 PNGs and the original exposure order from `secuencia.json`.

## Product
- The opening animation no longer has a visible pause button (removed on request). It loops indefinitely, so consider WCAG 2.2.2 (Pause, Stop, Hide); reduced-motion users get a still pose. A discreet control or the Escape key can be added back.
- Blog: password is in Vercel env vars; hand it to Diego privately and rotate it if shared. Add rate limiting (Vercel WAF) before launch. No RSS feed, tags or search yet.
- Admin UI is in Spanish; make it follow the site language if other editors join.
- Contact section: Path, AUGE and Contact links only appear in the header on large screens.
- Spanish and French versions (copy lives in `src/i18n/`; add `es.ts` and `fr.ts` typed as `Copy` and routes).
- Social preview image, favicon, analytics, domain and legal notice.
