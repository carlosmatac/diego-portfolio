# Diego Prados Jódar, portfolio

Editorial portfolio built with Astro. English first, structured for Spanish and French. Home, Work and the shell are static; Blog and the backoffice are server rendered on Vercel (Neon Postgres for articles, Vercel Blob for images).

## Run

```bash
nvm use            # Node 22 (see .nvmrc)
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run check      # type check
```

## Where things are

| What | Where |
| --- | --- |
| Facts: places, dates, links, source ids | `src/data/facts.ts`, `src/data/sources.ts` |
| Wording (English) | `src/i18n/en.ts` (other locales implement the same `Copy` type) |
| Opening scene settings: timings, scale, sequences, greetings, slots | `src/config/animation.ts` |
| City and Ministry photos: list and crops | `scripts/photos.json` (built by `npm run photos` into `public/photos/` and `src/config/photos.json`) |
| Route film (Remotion project) | `video/` (stops in `video/src/data.ts`, rendered by `npm run video` into `public/video/`) |
| Playback engine | `src/scripts/hero.ts` |
| Sections | `src/components/` |
| Tokens and type | `src/styles/global.css` |
| Source register and open questions | `docs/SOURCES.md`, `docs/PENDING.md`, `docs/CREDITS.md` |

## Opening scene

`diego-saludo-v4/` holds the original drawings. `npm run frames` (Python, Pillow, ffmpeg) turns them into transparent WebP
frames in `public/frames/{sm,lg}/` and writes `src/config/frames.json`:

- 40 greeting drawings (`g01` to `g40`) played in the order of `src/config/sequence.json` (copied from `secuencia.json`; file order is not playback order).
- 12 walk drawings (`w01` to `w12`) recovered from the clip embedded in `ver-saludo.html`; the arrival repeats them four times while scale grows.
- Paper is removed by turning luminance into alpha, so there is no blend mode, halo or rectangle on the marble surface.
- Only a rolling window of frames is decoded at a time. The arrival plays once per page load; afterwards only the greeting cycle repeats.
- `prefers-reduced-motion` shows a still pose with no approach and no flowing greetings; the round button in the corner pauses or plays.

## Route film

`video/` is a separate Remotion project (its own `package.json`, run `npm install` inside it once). It renders a pencil globe
following the stops Granada, Madrid, Berkeley, Bologna, Bruges and Boston in two formats: `route-wide.mp4` (1920x1080) and
`route-tall.mp4` (1080x1350, used up to 760px wide), plus a poster of the last frame for each. `cd video && npm run dev`
opens Remotion Studio. The film is drawn on white and shown with `mix-blend-mode: multiply`, so the marble shows through. It
loads only near the viewport, plays once, pauses off screen, has a play/pause button and never autoplays with
`prefers-reduced-motion`. If a stop changes on the site, change `video/src/data.ts` and render again.

## Pages

| Route | What |
| --- | --- |
| `/` | Opening scene, profile, studies (with scholarships), AUGE, experience, contact. The big name docks into the header on scroll (`src/scripts/header.ts`) |
| `/work` | Work, on its own page |
| `/blog`, `/blog/[slug]` | Published articles (server rendered, cached 60 s) |
| `/admin` | Backoffice behind a password: list, block editor, preview, publish |

## Blog and backoffice

- Articles are stored as JSON blocks (heading, text, list, quote, image, image row, callout, references, divider) in Postgres. Types in `src/lib/article-types.ts`, server-side validation in `src/lib/article-validate.ts`, rendering in `src/components/ArticleView.astro`, editor in `src/scripts/editor.ts`.
- Each article picks one of three type presets and one of three palettes (marble, stone, charcoal), all drawn from the site's own system.
- Environment (set in Vercel, pulled with `vercel env pull`): `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD`, `SESSION_SECRET`. The table is created automatically on first use.
- Locally, set `ARTICLES_TABLE="articles_dev"` in `.env.local` so test articles do not mix with production ones. Uploaded test images do go to the real Blob store.
- Login sets a signed, httpOnly, SameSite=Strict cookie valid 7 days; state-changing requests must come from the same origin. To change the password: `vercel env rm ADMIN_PASSWORD` then `vercel env add ADMIN_PASSWORD`, and redeploy.
