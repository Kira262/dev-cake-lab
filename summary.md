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

- Header nav: **Home**, **Shop**, **Custom cakes**, **Visit**, **Contact**. Phones: bag icon beside the hamburger, plus a sticky WhatsApp **Enquire** pill
- Home: hero with cat mascot, looping categories, best sellers, manifesto, reviews, FAQ (no announcement bar, no second Biscoff “chef’s special” block)
- Shop (`/menu`): filter chips + search, product cards, custom-cake CTA
- Custom cakes (`/custom`): paper-card brief with olive chips for weight, occasion, sponge, and flavour; tall/wide shape cards; sticky “Your cake” summary; WhatsApp quote; **Email instead** via FormSubmit
- Visit: location and hours at P.D. Apartment, Ellisbridge, Ahmedabad, with a sandboxed Google Maps embed
- Contact: WhatsApp-only — message box (bag can prefill it), **WhatsApp this enquiry**, Call / Email mailto / Instagram. Custom cakes go to `/custom`
- Cart drawer: qty 1–20; bag remembered; opens with **today** and now rounded up to 15 minutes unless a future draft date exists; When + Pickup; **Order on WhatsApp** pinned; short chat draft (items, total, needed, pickup/delivery, Maps)
- Client routing with production base-path support for GitHub Pages

## Architecture notes

- App shell, cart state, and page switch live in `src/App.jsx`.
- Static assets are served from `public/assets/` via `asset()`; product photos and the logo use WebP with a JPEG/PNG fallback (`SmartImage`). Inside `.cart-art`, `.smart-picture` is `display: block` so thumbs stay in the 65px cell (`display: contents` would break the item grid). Vitest audits that every referenced file exists.
- Cart and enquiry drafts persist in the browser (`localStorage` via `src/lib/cart.js` and `src/lib/draft.js`).
- Production `base` in `vite.config.js` is `/dev-cake-lab/`.
- SPA deep links on Pages use a copied `404.html` that mirrors `index.html`.
- Custom cake options live in `src/data/customCake.js`; the WhatsApp/email brief is built in `src/lib/customCake.js`. Flavours include ganache (white/milk/dark), Belgian chocolate, Nutella hazelnut, fruit/coffee options, and Custom.
- FormSubmit is used only for custom-cake email (`src/lib/enquiry.js`); CSP in `index.html` allows `https://formsubmit.co`. Menu orders go through WhatsApp from the bag.
- Bag WhatsApp copy is `orderWhatsAppText` in `src/lib/cart.js`; today/now defaults are `bagWhenFromDraft` in `src/lib/schedule.js`.
- Tests live under `src/test/` (mirrors `data/`, `lib/`, `pages/`, `components/`). CI runs `npm test` before the Pages build.

## Current gaps / known issues

- New catalog photos still need a JPEG/PNG in `public/assets/` plus `node scripts/optimize-images.mjs` for WebP.
- Custom-cake email: the first live send requires clicking FormSubmit’s activation email in `devscakelab@gmail.com`. Delivery then depends on that third-party relay.
- `/contact` prefills the message from the bag on load. Editing the bag afterward does not refresh that textarea (App no longer bumps `orderTicket`).

## Brand

- Name: Dev's Cake Lab
- Tone: artisan desserts, small-batch, playful cat mascot
- Hero line: “A LITTLE CAT. A LOT OF CAKE.”
