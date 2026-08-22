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
|------|---------|
| `src/App.jsx` | Entire SPA UI, routes, cart, catalog |
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
- `/visit` — location / hours
- `/contact` — enquiry form (cart can prefill the message)

When changing routes or links, always go through `navigate()` / `toLocation()` so GitHub Pages under `/dev-cake-lab/` keeps working.

## Assets

Put images in `public/assets/` and reference them with `asset("filename.ext")`.

Expected product / brand files include:

- `dev-cake-logo.png`
- `biscoff-cheesecake.jpg`
- `cookies.jpg`
- `brownies.jpg`
- `molten-lava.jpg`
- `cupcakes.jpg`

Missing files will 404 in the browser (broken logos and product photos).

## Hero note (do not put back inside `.cat-hero`)

The badge **A LITTLE CAT. A LOT OF CAKE.** must stay on `.cat-hero-shell`, **outside** `.cat-hero`.

`.cat-hero` uses `overflow: hidden` for the rounded illustration. Text inside that layer gets clipped. The shell + sibling note structure is the permanent fix.

## Contact / cart behaviour

- Cart lives in `App` state.
- “Continue to order” bumps `orderTicket` and navigates to `/contact`.
- `ContactPage` refreshes the prefilled message when `orderTicket` changes.
- The contact form currently `preventDefault`s only — there is no backend submit yet.

## Deploy (GitHub Pages)

1. Push to `main`.
2. Repo **Settings → Pages → Source → GitHub Actions**.
3. Workflow builds with `npm ci` / `npm run build`, copies `dist/index.html` → `dist/404.html` (SPA fallback), then deploys `dist`.

Live site: https://kira262.github.io/dev-cake-lab/

Do not point Pages at the source `index.html`; it must use the Vite build from Actions.

## Style / content edits

- Brand look lives in CSS variables and `src/styles.css`.
- Menu items and prices are the `products` / `categories` arrays in `src/App.jsx`.
- Contact details (phone, email, social) are in `ContactPage` and related UI copy.
