# Agent guide — Dev's Cake Lab

Instructions for AI coding agents working in this repository.

## Goal

Keep the site a polished, brand-forward dessert SPA that builds cleanly and deploys to GitHub Pages under `/dev-cake-lab/`. Prefer small, targeted edits over refactors.

## Read first

1. `summary.md` — what the product is, architecture, known gaps
2. `instructions.md` — run, routes, file map, admin, deploy
3. `README.md` — short human setup notes

## Hard constraints

1. **Preserve the GitHub Pages base path.** Use `asset()`, `toLocation()`, and `appPath()` / `navigate()`. Do not hardcode `/` asset paths that break under `/dev-cake-lab/`.
2. **Do not put `.hero-note` inside `.cat-hero`.** Keep it on `.cat-hero-shell` as a sibling. `.cat-hero` clips overflow.
3. **Do not navigate from `pointercancel` in `CategoryCarousel`,** and keep `touch-action: pan-y` on `.category-grid`.
4. **Do not change Pages to serve source `index.html`.** Deploy the Vite `dist` via `.github/workflows/deploy-pages.yml`, and keep the `dist/404.html` copy.
5. **Match existing style.** Same fonts, CSS variables, and layout language in `src/styles.css`. Custom cakes keep olive chips, rust kickers, Playfair headings, and paper cards.
6. **Bag vs custom-cake dates.** Only the cart hydrates today + rounded-up 15-minute time (`bagWhenFromDraft`). Leave Contact and `/custom` dates empty so the 2–4 day custom lead does not inherit “now.”
7. **Keep WhatsApp pinned in the bag.** `.cart` is a flex column with `overflow: hidden`; `.cart-scroll` is `flex: 1; min-height: 0`; `.cart-foot` is `flex-shrink: 0`.
8. **Keep `.cart-art .smart-picture { display: block }`.** Global `.smart-picture { display: contents }` otherwise pulls the product image out of the thumb cell.
9. **Catalog price is the default.** `public/data/extra-products.json` wins by slug. Do not wipe that file, and do not save a catalog price over an extras price. Reapply in-session edits with `withSavedEdit`.
10. **Do not add `/admin` to the nav.** It stays a hidden route. On that page the header stays `position: static` (`.app-admin .header`).
11. **One photo per Worker call.** Generate sends `shot: "hero"` and `shot: "detail"` as two requests. The model is `@cf/black-forest-labs/flux-2-klein-4b`. Do not send `steps`.
12. **No secrets in commits.** Do not commit `.env`, `ADMIN_PASSWORD`, or `GITHUB_TOKEN`. Those Worker secrets stay on Cloudflare.
13. **No drive-by refactors.** Do not introduce a router unless requested. Do not put back the home announcement bar or the extra Biscoff “Chef’s special” block unless asked.
14. **Keep tests under `src/test/`.** After contact, custom-cake, cart, admin, or validation changes, run `npm test`.

Layout, routes, and deploy steps are in `instructions.md`.

## Safe defaults

- Shop grid stays one column under 760px.
- Bag WhatsApp stays short: items, total, needed, pickup or delivery, Maps.
- Custom-cake WhatsApp stays short: greeting, needed by, picks, design, message, allergies, then pickup as the shop name (or a compact delivery line).
- `/contact` is WhatsApp plus a mailto aside. FormSubmit email is `/custom` only.
- If custom-cake email or the admin API may fetch a new host, update `connect-src` in `index.html`.

## Out of scope unless asked

- Payments, or replacing FormSubmit
- A database or CMS in place of the extras file
- TypeScript migration
- Force-pushing or rewriting published git history

## Response style for agents

- Be concise; say what changed and where.
- Do not commit or open PRs unless the user asks.
- If assets are missing, say which filenames are required rather than inventing placeholders.
