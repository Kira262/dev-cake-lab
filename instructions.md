# Instructions — Dev's Cake Lab

How to run, change, and deploy this site.

## Prerequisites

- Node.js 22+ (matches GitHub Actions)
- npm

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/`).

Other scripts:

```bash
npm run build    # production build into dist/
npm run preview  # preview the production build locally
```

## Project layout

| Path | Purpose |
| --- | --- |
| `src/App.jsx` | App shell: cart state, routing, page switch |
| `src/pages/` | Home, Menu, Product, Visit, Contact pages |
| `src/components/` | Header, Footer, Cart, ProductCard, etc. |
| `src/data/catalog.js` | Categories, products, reviews |
| `src/data/contacts.js` | Phone, email, address, social links |
| `src/lib/paths.js` | `asset()`, `appPath()`, `toLocation()` |
| `src/lib/routes.js` | Route helpers, nav active state |
| `src/lib/cart.js` | Cart line IDs, totals, order message |
| `src/styles.css` | All styles |
| `src/main.jsx` | React entry |
| `index.html` | HTML shell |
| `public/assets/` | Static images (logo, product photos) |
| `public/.nojekyll` | Disables Jekyll on GitHub Pages |
| `vite.config.js` | Vite + React; production `base` is `/dev-cake-lab/` |
| `.github/workflows/deploy-pages.yml` | Build and deploy to GitHub Pages |

## Routing and base path

This is a client-side SPA (no React Router). Navigation uses `history.pushState` and helpers:

- `appPath()` — strips the GitHub Pages base from the URL
- `toLocation(to)` — prefixes paths with the production base
- `asset(file)` — resolves files under `public/assets/` with `import.meta.env.BASE_URL`

Routes:

- `/` — home
- `/menu` — full menu (`?type=` filters by category)
- `/product/:slug` — product detail page
- `/visit` — location / hours
- `/contact` — enquiry form (cart can prefill the message)

When changing routes or links, always go through `navigate()` / `toLocation()` so GitHub Pages under `/dev-cake-lab/` keeps working.

## Assets

Put images in `public/assets/` and reference them with `asset("filename.ext")`.

Expected product / brand files include:

- `dev-cake-logo.png`
- Per-product hero and `*-detail.jpg` photos (see `src/data/catalog.js`)

Missing files will 404 in the browser (broken logos and product photos).

## Hero note (do not put back inside `.cat-hero`)

The badge **A LITTLE CAT. A LOT OF CAKE.** must stay on `.cat-hero-shell`, **outside** `.cat-hero`.

`.cat-hero` uses `overflow: hidden` for the rounded illustration. Text inside that layer gets clipped. The shell + sibling note structure is the permanent fix.

## Contact / cart behaviour

- Cart lives in `App` state.
- “Continue to order” bumps `orderTicket` and navigates to `/contact`.
- `ContactPage` refreshes the prefilled message when `orderTicket` changes.
- The contact form opens a `mailto:` to `devscakelab@gmail.com` with the enquiry filled in.

## Deploy (GitHub Pages)

1. Push to `main`.
2. Repo **Settings → Pages → Source → GitHub Actions**.
3. Workflow builds with `npm ci` / `npm run build`, copies `dist/index.html` → `dist/404.html` (SPA fallback), then deploys `dist`.

Live site: [kira262.github.io/dev-cake-lab](https://kira262.github.io/dev-cake-lab/)

Do not point Pages at the source `index.html`; it must use the Vite build from Actions.

## Style / content edits

- Brand look lives in CSS variables and `src/styles.css`.
- Menu items and prices are in `src/data/catalog.js`.
- Contact details are in `src/data/contacts.js`.
