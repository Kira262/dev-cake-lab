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

Open the URL Vite prints (usually `http://localhost:5173/`). The bag and enquiry drafts stay in the browser (`localStorage`).

Other scripts:

```bash
npm run build    # production build into dist/
npm run preview  # preview the production build locally
npm test         # Vitest suite in src/test/
```

## Project layout

```text
src/
  App.jsx              App shell: cart, routing, extras merge, page switch
  main.jsx             React entry
  styles.css           All styles
  components/          Header, Footer, Cart, ProductCard, SmartImage, CatHero, …
  pages/               Home, Menu, Product, Custom cake, Visit, Contact, Admin
  data/
    catalog.js         Baked categories, products, reviews
    contacts.js        Phone, email, address, social links
    customCake.js      Weights, shapes, occasions, sponges, flavours
    admin.js           Admin API base URL and badge list
  lib/
    paths.js           asset(), appPath(), toLocation(), webpFromUrl()
    routes.js          Route helpers, nav active state
    cart.js            Line IDs, totals, bag persist, short WhatsApp draft
    draft.js           Remembered name, phone, email, address, date
    schedule.js        Date/time helpers, bag today/now defaults
    validate.js        Name / email / phone / address / date rules
    enquiry.js         Header Enquire text + FormSubmit (custom cake email)
    customCake.js      Brief labels and WhatsApp text
    extraProducts.js   Load and merge extra-products.json
    adminApi.js        Admin password header and Worker calls
    adminForm.js       Generate / publish readiness
    brandImage.js      Stamp the logo onto a generated photo
  test/                Vitest (mirrors data/, lib/, pages/, components/)
public/
  assets/              Logo and product photos (JPEG/PNG + WebP)
  data/
    extra-products.json  Live price, photo, and delete overrides
worker/
  admin.js             Admin API: unlock, generate, publish, delete
  wrangler.toml        Worker name, AI binding, GitHub path
scripts/               optimize-images.mjs
index.html             HTML shell + CSP
```

## Routing and base path

This is a client-side SPA (no React Router). Navigation uses `history.pushState` and helpers:

- `appPath()` — strips the GitHub Pages base from the URL
- `toLocation(to)` — prefixes paths with the production base
- `asset(file)` — resolves files under `public/assets/` with `import.meta.env.BASE_URL`

Header tabs: **Home** `/` · **Shop** `/menu` · **Custom cakes** `/custom` · **Visit** `/visit` · **Contact** `/contact`.

Routes:

- `/` — home
- `/menu` — full menu (`?type=` filters by category)
- `/product/:slug` — product detail page
- `/custom` — custom cake brief
- `/visit` — location / hours
- `/contact` — WhatsApp enquiry (cart can prefill the message)
- `/admin` — hidden staff desk (not in the nav)

When changing routes or links, always go through `navigate()` / `toLocation()` so GitHub Pages under `/dev-cake-lab/` keeps working.

## Menu data

Baked products and prices live in `src/data/catalog.js`. The shop does not paint that list first. It waits for `public/data/extra-products.json`, then merges by slug. An extras price, photo, or delete replaces the catalog row. Edits made in this browser session are reapplied after that fetch so a stale file cannot put the catalog price back.

## Assets

Put catalog images in `public/assets/` and reference them with `asset("filename.ext")`. Product photos and the logo go through `SmartImage` (WebP `<source>` + JPEG/PNG `<img>`). After adding new catalog photos, run `node scripts/optimize-images.mjs` to write WebP copies (and shrink oversized JPEGs).

Expected brand files include `dev-cake-logo.png`. Per-product hero and `*-detail.jpg` names are in `src/data/catalog.js`. `npm test` fails CI if a referenced catalog file is missing.

## Admin

Open `/admin` on the Vite dev server. The page is not linked from the header. The header on this route is not sticky, so it does not cover the form.

The API defaults to `https://cakelab-admin-api.cakelab.workers.dev`. Set `VITE_ADMIN_API` to point elsewhere. Calls send `x-admin-password`. Endpoints are `POST /unlock`, `/generate`, `/publish`, and `/delete`.

**Generate photos** sends two requests, `shot: "hero"` then `shot: "detail"`. Each call makes one image with `@cf/black-forest-labs/flux-2-klein-4b`. The browser then stamps the logo (`brandProductPhoto`). **Publish** and **Delete** write `public/data/extra-products.json` on GitHub `main`.

Deploy the Worker from `worker/`:

```bash
npx wrangler deploy
```

`ADMIN_PASSWORD` and `GITHUB_TOKEN` are Wrangler secrets, not files in this repo. CSP `connect-src` in `index.html` must keep the `workers.dev` hosts.

## Persistence

Cart and enquiry drafts stay in this browser via `localStorage` (`devCakeLab.bag`, `devCakeLab.enquiryDraft`). Clearing site data empties the bag. Published menu changes are the extras file, not `localStorage`.

## Hero note

The badge **A LITTLE CAT. A LOT OF CAKE.** sits on `.cat-hero-shell`, outside `.cat-hero`. `.cat-hero` uses `overflow: hidden` for the rounded illustration, so text inside that layer gets clipped.

## Shop by category strip

The looping strip is `src/components/CategoryCarousel.jsx`. Icons are inline SVGs in `src/components/CategoryIcon.jsx`, keyed by the `art` value in `src/data/catalog.js` (`cake`, `tin`, `cookie`, `jar`, `cupcake`, `signature`). Add new icons there rather than under `public/assets/`.

Touch rules, so a phone swipe drags instead of opening the card under the finger:

- `.category-grid` keeps `touch-action: pan-y`.
- `pointercancel` clears drag state only. It does not navigate.
- A pointer that moved less than 10px counts as a tap and opens the category from `pointerup`. After a real drag, the trailing `click` is swallowed.

## Custom cakes (`/custom`)

Structured brief for celebration cakes. Home, Shop (Custom Cakes chip), Contact, and the footer all link here.

Edit options in `src/data/customCake.js`. Format the WhatsApp/email brief in `src/lib/customCake.js`. Page UI is `src/pages/CustomCakePage.jsx`; look is `.custom-hero`, `.cake-form`, `.cake-pills`, `.cake-shape`, `.cake-summary` in `src/styles.css`.

Current picks:

- Weight: 0.5 / 1 / 1.5 / 2 kg, or Custom (free-text size)
- Shape: tall or wide
- Occasion: birthday, anniversary, wedding, engagement, baby shower, graduation, corporate, festival, other
- Sponge: vanilla, chocolate, red velvet, funfetti
- Flavour / filling: fresh cream; chocolate ganache (white, milk, dark); Belgian chocolate; Nutella hazelnut; blueberry; strawberry; orange; mango; coffee; Lotus Biscoff; Custom (shows a text field)
- Needed-by date and time (required, 2–4 day lead)
- Pickup or delivery, design notes, message on cake, allergies

The brief is ready when size + occasion are set, or design notes are at least 6 characters. **WhatsApp this cake** opens a short draft: needed by, picks, design/message/allergies, then pickup as the shop name only. **Email instead** is only on this page (FormSubmit). Contact does not send email.

Needed-by on `/custom` stays empty until they pick a date. Do not copy the bag’s today/now defaults onto this form.

## Contact / cart behaviour

- Cart lives in `App` state and persists in `localStorage` (`src/lib/cart.js`). Line qty is clamped to 1–20. Packing notes max 300. Menu items have no icing-message field.
- Opening the bag hydrates date/time with `bagWhenFromDraft`: a saved ISO date **today or later** is kept; otherwise **today** and now rounded **up to the next 15 minutes**. Contact and custom cakes do not get those defaults.
- The drawer is a flex column: items + When/Pickup scroll in `.cart-scroll`; **Order on WhatsApp** stays pinned in `.cart-foot`. There is no Email instead in the bag.
- When + Pickup sit in one paper card. Minutes step by 15. Compact pickup is shop name + Maps. Delivery is one Area / address field.
- Phone: header shows bag + hamburger; a sticky **Enquire** pill (`.mobile-enquire`) is the empty WhatsApp starter. Desktop header has Enquire too.
- **Order on WhatsApp** builds a short draft in `orderWhatsAppText` (`src/lib/cart.js`): items, `Total ₹…`, `Needed: …`, then pickup (shop name, address, Maps) or one delivery line. If there is no date, `whenNote` is `Date to confirm.`
- `/contact` is WhatsApp-only: a **Tell us more** box (prefilled from the bag on load), **WhatsApp this enquiry**, and a Call / Email (`mailto:`) / Instagram aside. Custom cakes still go to `/custom`.
- Custom cake **Email instead** POSTs to FormSubmit (`https://formsubmit.co/ajax/devscakelab@gmail.com`). The first live send needs the activation email in that inbox. CSP `connect-src` must include `https://formsubmit.co`.

## Deploy (GitHub Pages)

1. Push to `main`.
2. Repo **Settings → Pages → Source → GitHub Actions**.
3. Workflow runs `npm ci`, `npm test`, `npm run build`, copies `dist/index.html` → `dist/404.html` (SPA fallback), then deploys `dist`.

Live site: [kira262.github.io/dev-cake-lab](https://kira262.github.io/dev-cake-lab/)

The Worker is a separate deploy (`npx wrangler deploy` from `worker/`). Pushing the site does not update the Worker, and deploying the Worker does not update the Pages bundle.

## Style / content edits

- Brand look lives in CSS variables and `src/styles.css`.
- Default menu items and prices are in `src/data/catalog.js`. Live overrides are in `public/data/extra-products.json`.
- Contact details are in `src/data/contacts.js`.
- Custom cake weights, sponges, and flavours are in `src/data/customCake.js`.
