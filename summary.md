# Summary — Dev's Cake Lab

## What it is

A Vite + React marketing and ordering front end for **Dev's Cake Lab**, a dessert brand. Shoppers browse categories and products, add items to a bag, and send an enquiry (custom cakes or menu orders). There is no payment backend.

## Stack

- React 18+ (SPA in a single `App.jsx`)
- Vite
- Lucide React icons
- CSS in `src/styles.css` (no CSS framework)
- Vitest + Testing Library (`npm test`)
- Deployed with GitHub Actions → GitHub Pages at `/dev-cake-lab/`

## Main features

- Header nav: **Home**, **Shop**, **Visit**, **Contact** (mobile menu button is top-right)
- Home: hero with cat mascot, categories, best sellers, manifesto, signature product, reviews, FAQ
- Shop (`/menu`): filter chips + search, product cards, custom-cake CTA
- Visit: location and hours at P.D. Apartment, Ellisbridge, Ahmedabad, with a sandboxed Google Maps embed
- Contact: short enquiry (name + Indian mobile required, email optional); needed-by date; pickup or delivery with area chips; WhatsApp this enquiry, or send via FormSubmit to `devscakelab@gmail.com` with no review popup
- Cart drawer: qty 1–20; bag remembered; WhatsApp always open; optional date picker and one delivery address line; Email instead uses the longer contact form
- Client routing with production base-path support for GitHub Pages

## Architecture notes

- App shell, cart state, and page switch live in `src/App.jsx`.
- Static assets are served from `public/assets/` via `asset()`.
- Production `base` in `vite.config.js` is `/dev-cake-lab/`.
- SPA deep links on Pages use a copied `404.html` that mirrors `index.html`.
- Enquiry POST goes to FormSubmit (`src/lib/enquiry.js`); CSP in `index.html` allows `https://formsubmit.co`.
- Tests live under `src/test/` (mirrors `data/`, `lib/`, `pages/`). CI runs `npm test` before the Pages build.

## Current gaps / known issues

- Several product images referenced in code may still be missing from `public/assets/` (only the logo is guaranteed present).
- The first live enquiry requires clicking FormSubmit’s activation email in `devscakelab@gmail.com`. Delivery then depends on that third-party relay.
- Cart edits on `/contact` after arrival may not refresh the textarea unless `orderTicket` changes again.

## Brand

- Name: Dev's Cake Lab
- Tone: artisan desserts, small-batch, playful cat mascot
- Hero line: “A LITTLE CAT. A LOT OF CAKE.”
