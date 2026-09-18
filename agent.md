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
3. **Do not navigate from `pointercancel` in `CategoryCarousel`,** and keep `touch-action: pan-y` on `.category-grid`. Both together are what let a phone swipe drag the strip instead of opening the card under the finger.
4. **Do not change Pages to serve source `index.html`.** Deploy must remain the Vite `dist` via `.github/workflows/deploy-pages.yml`.
5. **Keep the SPA 404 fallback.** The workflow copies `dist/index.html` → `dist/404.html`; leave that step unless you replace it with an equivalent.
6. **Match existing style.** Same fonts, CSS variables, and layout language in `src/styles.css`. Custom cakes should keep olive chips, rust kickers, Playfair headings, and paper cards — not generic form UI. Avoid “AI purple / cream / newspaper” redesigns unless the user asks for a redesign.
7. **Bag vs custom-cake dates.** Only the cart hydrates today + rounded-up 15-minute time (`bagWhenFromDraft`). Leave Contact and `/custom` empty optional/required dates so the 2–4 day custom lead does not inherit “now.”
8. **Keep WhatsApp pinned in the bag.** `.cart` is a flex column with `overflow: hidden`; `.cart-scroll` is `flex: 1; min-height: 0`; `.cart-foot` is `flex-shrink: 0`. Do not dump When/Pickup into the footer.
9. **Keep `.cart-art .smart-picture { display: block }`.** Global `.smart-picture { display: contents }` otherwise makes the product `<img>` a grid child of `.cart-item` and thumbs overlap qty.
10. **No drive-by refactors.** Do not introduce a router/library unless requested. Do not put back the home announcement bar or the extra Biscoff “Chef’s special” feature unless asked.
11. **No secrets in commits.** Do not commit `.env` or credentials.
12. **Keep tests under `src/test/`.** Do not drop `*.test.js` next to production modules. After contact-form, custom-cake, cart, or validation changes, run `npm test`.

## Where to edit

| Change | Where |
| --- | --- |
| Menu, prices, categories, reviews | `src/data/catalog.js` |
| Phone, email, address, social links | `src/data/contacts.js` |
| Custom cake weights, shapes, occasions, sponges, flavours | `src/data/customCake.js` |
| Shop-by-category icons | `src/components/CategoryIcon.jsx` (inline SVG, keyed by `art`) |
| Custom cake brief / WhatsApp text | `src/lib/customCake.js` |
| Cart / short WhatsApp draft, bag persist | `src/lib/cart.js` (`orderMessage`, `fulfilmentNote`, `orderWhatsAppText`) |
| Remembered name, phone, email, address, date | `src/lib/draft.js` |
| Needed-by dates, bag today/now | `src/lib/schedule.js` (`isoTimeFromNow`, `bagWhenFromDraft`, `whenNote`) |
| Name, email, phone, address, date, message validation | `src/lib/validate.js` |
| Header Enquire starter + FormSubmit (custom cake email) | `src/lib/enquiry.js` |
| Routes, nav helpers | `src/lib/routes.js` |
| Base path, `asset()`, `navigate` | `src/lib/paths.js`, `src/App.jsx` |
| Page UI | `src/pages/*.jsx` (`CustomCakePage.jsx` is `/custom`) |
| Shared UI (header, cart, cards) | `src/components/*.jsx` |
| Layout / look | `src/styles.css` |
| CSP (fonts, Maps, FormSubmit) | `index.html` |
| Tests | `src/test/` (mirrors `data/`, `lib/`, `pages/`, `components/`) |
| Base path / build / Vitest setup | `vite.config.js` |
| Images | `public/assets/` + `asset("…")` |
| Deploy | `.github/workflows/deploy-pages.yml` |

## Safe defaults

- After UI changes that touch routing or assets, mentally verify production URLs under `/dev-cake-lab/`.
- Keep the product grid at **one column under 760px**. Two-up cards on phones are what made Shop feel cramped.
- When adding images, place them in `public/assets/`, wire them through `asset()`, and run `node scripts/optimize-images.mjs`.
- When adding or renaming flavours, edit `CAKE_FLAVOURS` in `src/data/customCake.js`. Keep **Custom** last; `cakeFlavourLabel()` uses that value for the free-text field.
- Keep the bag WhatsApp draft short: items, `Total ₹…`, `Needed: …`, pickup/delivery, Maps. Do not restore “I'd like to order,” the long address block, or the delivery-charges sentence unless asked.
- `/contact` is WhatsApp + mailto aside. FormSubmit email lives on `/custom` only.
- Prefer `npm test` and `npm run build` locally before claiming a Pages, custom-cake, or contact-form fix is done.
- If you change what custom-cake email may fetch, update `connect-src` in `index.html`.

## Out of scope unless asked

- Backend, payments, or replacing FormSubmit with another mail provider
- CMS or database
- TypeScript migration
- Force-pushing or rewriting published git history

## Response style for agents

- Be concise; say what changed and where.
- Do not commit or open PRs unless the user asks.
- If assets are missing, say which filenames are required rather than inventing placeholders.
