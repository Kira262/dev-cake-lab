# Summary — Dev's Cake Lab

## What it is

A Vite + React marketing and ordering front end for **Dev's Cake Lab**, a dessert brand. Shoppers browse categories and products, add items to a bag, and send an enquiry (custom cakes or menu orders). There is no payment backend yet.

## Stack

- React 18+ (SPA in a single `App.jsx`)
- Vite
- Lucide React icons
- CSS in `src/styles.css` (no CSS framework)
- Deployed with GitHub Actions → GitHub Pages at `/dev-cake-lab/`

## Main features

- Home: hero with cat mascot, categories, best sellers, manifesto, signature product, reviews, FAQ
- Menu: filter chips + search, product cards, custom-cake CTA
- Visit: location and hours (Chandigarh)
- Contact: enquiry form; cart contents can seed the message
- Cart drawer: qty controls, continue to contact
- Client routing with production base-path support for GitHub Pages

## Architecture notes

- Almost all UI logic is in `src/App.jsx`.
- Static assets are served from `public/assets/` via `asset()`.
- Production `base` in `vite.config.js` is `/dev-cake-lab/`.
- SPA deep links on Pages use a copied `404.html` that mirrors `index.html`.

## Current gaps / known issues

- Several product images referenced in code may still be missing from `public/assets/` (only the logo is guaranteed present).
- Contact form does not send email or hit an API; it only shows a local success message.
- Cart edits on `/contact` after arrival may not refresh the textarea unless `orderTicket` changes again.

## Brand

- Name: Dev's Cake Lab
- Tone: artisan desserts, small-batch, playful cat mascot
- Hero line: “A LITTLE CAT. A LOT OF CAKE.”
