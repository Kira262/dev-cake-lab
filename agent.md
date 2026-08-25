# Agent guide — Dev's Cake Lab

Instructions for AI coding agents working in this repository.

## Goal

Keep the site a polished, brand-forward dessert SPA that builds cleanly and deploys to GitHub Pages under `/dev-cake-lab/`. Prefer small, targeted edits over refactors.

## Read first

1. `summary.md` — product overview and known gaps
2. `instructions.md` — run, routes, assets, deploy rules
3. `README.md` — short human setup notes

## Hard constraints

1. **Preserve the GitHub Pages base path.** Use `asset()`, `toLocation()`, and `appPath()` / `navigate()`. Do not hardcode `/` asset paths that break under `/dev-cake-lab/`.
2. **Do not put `.hero-note` inside `.cat-hero`.** Keep it on `.cat-hero-shell` as a sibling. `.cat-hero` clips overflow; the note will get cut off again if moved inside.
3. **Do not change Pages to serve source `index.html`.** Deploy must remain the Vite `dist` via `.github/workflows/deploy-pages.yml`.
4. **Keep the SPA 404 fallback.** The workflow copies `dist/index.html` → `dist/404.html`; leave that step unless you replace it with an equivalent.
5. **Match existing style.** Same fonts, CSS variables, and layout language in `src/styles.css`. Avoid generic “AI purple / cream / newspaper” redesigns unless the user asks for a redesign.
6. **No drive-by refactors.** Do not introduce a router/library unless requested.
7. **No secrets in commits.** Do not commit `.env` or credentials.
8. **Keep tests under `src/test/`.** Do not drop `*.test.js` next to production modules. After contact-form or validation changes, run `npm test`.

## Where to edit

| Change | Where |
| --- | --- |
| Menu, prices, categories, reviews | `src/data/catalog.js` |
| Phone, email, address, social links | `src/data/contacts.js` |
| Cart / enquiry message helpers, bag persist | `src/lib/cart.js` |
| Remembered name, phone, email, address, date | `src/lib/draft.js` |
| Needed-by dates | `src/lib/schedule.js` |
| Name, email, phone, address, date, message validation | `src/lib/validate.js` |
| FormSubmit enquiry send | `src/lib/enquiry.js` |
| Routes, nav helpers | `src/lib/routes.js` |
| Base path, `asset()`, `navigate` | `src/lib/paths.js`, `src/App.jsx` |
| Page UI | `src/pages/*.jsx` |
| Shared UI (header, cart, cards) | `src/components/*.jsx` |
| Layout / look | `src/styles.css` |
| CSP (fonts, Maps, FormSubmit) | `index.html` |
| Tests | `src/test/` (mirrors `data/`, `lib/`, `pages/`) |
| Base path / build / Vitest setup | `vite.config.js` |
| Images | `public/assets/` + `asset("…")` |
| Deploy | `.github/workflows/deploy-pages.yml` |

## Safe defaults

- After UI changes that touch routing or assets, mentally verify production URLs under `/dev-cake-lab/`.
- When adding images, place them in `public/assets/` and wire them through `asset()`.
- When fixing contact/cart sync, prefer updating the `ContactPage` effect deps carefully so user-edited textarea text is not wiped unexpectedly.
- Prefer `npm test` and `npm run build` locally before claiming a Pages or contact-form fix is done.
- If you change what the enquiry form may fetch, update `connect-src` in `index.html`.

## Out of scope unless asked

- Backend, payments, or replacing FormSubmit with another mail provider
- CMS or database
- TypeScript migration
- Force-pushing or rewriting published git history

## Response style for agents

- Be concise; say what changed and where.
- Do not commit or open PRs unless the user asks.
- If assets are missing, say which filenames are required rather than inventing placeholders.
