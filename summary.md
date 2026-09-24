# Summary — Dev's Cake Lab

## What it is

A Vite + React shop for **Dev's Cake Lab**. Shoppers browse the menu, add items to a bag, and send a WhatsApp enquiry. Staff edit the live menu from a hidden admin page. There is no payment checkout.

## Stack

- React SPA in `src/App.jsx` (no React Router)
- Vite, with production `base` `/dev-cake-lab/`
- CSS in `src/styles.css`
- Vitest + Testing Library (`npm test`)
- GitHub Actions → GitHub Pages
- Cloudflare Worker `cakelab-admin-api` for the admin desk (Workers AI + GitHub writes)

## Main features

- Shop, custom-cake brief, visit, and WhatsApp contact
- Bag with a short WhatsApp order draft
- Hidden `/admin`: edit prices, generate a hero and a detail photo, publish or delete a product

How those screens behave is in `instructions.md`.

## Architecture notes

```text
catalog.js  +  extra-products.json  →  shop
                      ↑
                 Worker publish/delete
                      ↑
admin page  →  Worker /generate (one photo)  →  logo stamp in the browser
```

- The Pages site is the Vite `dist`. Deep links use a copied `404.html`. Static catalog photos come from `public/assets/` through `asset()` and `SmartImage` (WebP, JPEG/PNG fallback).
- `src/data/catalog.js` is the baked menu. `public/data/extra-products.json` overrides a row by slug (price, photos, notes, or a delete). The shop waits until that file loads. Saves in the current browser session are reapplied after the fetch (`withSavedEdit` in `src/lib/extraProducts.js`).
- `/admin` is not in the header. On that route the header is not sticky. The page talks to `https://cakelab-admin-api.cakelab.workers.dev` (`VITE_ADMIN_API` can override) with `x-admin-password`.
- The Worker (`worker/admin.js`) exposes `POST /unlock`, `/generate`, `/publish`, and `/delete`. Generate uses `@cf/black-forest-labs/flux-2-klein-4b`, one shot per request (`hero`, then `detail`). The browser stamps the logo (`src/lib/brandImage.js`). Publish and delete commit the extras file to GitHub `main`, retry conflicts, and refuse to overwrite a file that cannot be parsed.
- `ADMIN_PASSWORD` and `GITHUB_TOKEN` live on the Worker, not in the repo.
- Cart and enquiry drafts stay in `localStorage`. Custom-cake email is FormSubmit from `/custom` only. Menu orders go out on WhatsApp.

## Current gaps

- The first live custom-cake email needs FormSubmit’s activation message in `devscakelab@gmail.com`.
- Admin UI changes ship with the Pages workflow on `main`. The Worker ships only when it is deployed from `worker/`.
- A new catalog photo still needs a JPEG or PNG in `public/assets/` and `node scripts/optimize-images.mjs` for WebP. Admin-published photos are stored in the extras file, not as new asset files.

## Brand

- Name: Dev's Cake Lab
- Tone: artisan desserts, small-batch, playful cat mascot
- Hero line: “A LITTLE CAT. A LOT OF CAKE.”
