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

For cart and enquiry persistence, run the session API in a second terminal:

```bash
npm run server:install   # first time only
npm run server
```

Copy `.env.example` to `.env` if you need a custom `VITE_API_URL` (defaults to `http://localhost:3001`).

Open the URL Vite prints (usually `http://localhost:5173/`).

Other scripts:

```bash
npm run build    # production build into dist/
npm run preview  # preview the production build locally
npm test         # Vitest: validation, enquiry send, pages, CSP, assets
npm run server   # session API (bag + enquiry drafts on disk)
npm run test:server
```

## Project layout

```text
src/
  App.jsx              App shell: cart, routing, page switch
  main.jsx             React entry
  styles.css           All styles
  components/          Header, Footer, Cart, ProductCard, SmartImage, CatHero, …
  pages/               Home, Menu (Shop), Product, Custom cake, Visit, Contact
  data/
    catalog.js         Categories, products, reviews
    contacts.js        Phone, email, address, social links
    customCake.js      Weights, shapes, occasions, sponges, flavours
  lib/
    paths.js           asset(), appPath(), toLocation(), webpFromUrl()
    session.js         Session API client (bag + draft sync)
    routes.js          Route helpers, nav active state
    cart.js            Line IDs, totals, bag persist, short WhatsApp draft
    draft.js           Remembered name, phone, email, address, date
    schedule.js        Date/time helpers, bag today/now defaults
    validate.js        Name / email / phone / address / date rules
    enquiry.js         Header Enquire text + FormSubmit (custom cake email)
    customCake.js      Brief labels and WhatsApp text
  test/
    setup.js           Testing Library cleanup
    csp.test.js        Content-Security-Policy checks
    data/              contacts tests
    lib/               cart, customCake, enquiry, routes, schedule, validate
    pages/             Contact, CustomCake, Product, Visit
    components/        Cart, Header, FAQ, CategoryCarousel, ProductCard
public/assets/         Logo and product photos (JPEG/PNG + WebP)
scripts/               optimize-images.mjs
server/                Session API (JSON per user on disk)
index.html             HTML shell + CSP
```

| Path                                 | Purpose                                                      |
| ------------------------------------ | ------------------------------------------------------------ |
| `src/App.jsx`                        | App shell: cart state, routing, page switch                  |
| `src/pages/`                         | Home, Menu (Shop), Product, Custom cake, Visit, Contact      |
| `src/components/`                    | Header, Footer, Cart, ProductCard, etc.                      |
| `src/data/catalog.js`                | Categories, products, reviews                                |
| `src/data/contacts.js`               | Phone, email, address, social links                          |
| `src/data/customCake.js`             | Weights, shapes, occasions, sponges, flavours                |
| `src/lib/customCake.js`              | Brief labels and WhatsApp text                               |
| `src/lib/paths.js`                   | `asset()`, `appPath()`, `toLocation()`, `webpFromUrl()`      |
| `src/lib/session.js`                 | Session API client — bag and enquiry draft sync              |
| `src/lib/routes.js`                  | Route helpers, nav active state                              |
| `src/lib/cart.js`                    | Cart line IDs, totals, qty clamp, short WhatsApp draft, bag persist |
| `src/lib/draft.js`                   | Remembered enquiry / delivery details                        |
| `src/lib/schedule.js`                | Needed-by dates, `isoTimeFromNow`, `bagWhenFromDraft`        |
| `src/lib/validate.js`                | Enquiry field validation and length caps                     |
| `src/lib/enquiry.js`                 | Header Enquire starter + FormSubmit (custom cake email)      |
| `src/components/SmartImage.jsx`      | WebP `<picture>` with JPEG/PNG fallback                      |
| `src/test/`                          | Vitest suite (mirrors `data/`, `lib/`, `pages/`, `components/`) |
| `src/styles.css`                     | All styles                                                   |
| `src/main.jsx`                       | React entry                                                  |
| `index.html`                         | HTML shell and Content-Security-Policy                       |
| `public/assets/`                     | Logo and product photos (JPEG/PNG + WebP)                    |
| `scripts/optimize-images.mjs`        | Write WebP copies; shrink oversized JPEGs                    |
| `public/.nojekyll`                   | Disables Jekyll on GitHub Pages                              |
| `vite.config.js`                     | Vite + React; production `base` is `/dev-cake-lab/`          |
| `.github/workflows/deploy-pages.yml` | `npm test`, build, deploy to GitHub Pages                    |

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

When changing routes or links, always go through `navigate()` / `toLocation()` so GitHub Pages under `/dev-cake-lab/` keeps working.

## Assets

Put images in `public/assets/` and reference them with `asset("filename.ext")`. Product photos and the logo go through `SmartImage` (WebP `<source>` + JPEG/PNG `<img>`). After adding new photos, run `node scripts/optimize-images.mjs` to write WebP copies (and shrink oversized JPEGs).

Expected product / brand files include:

- `dev-cake-logo.png`
- Per-product hero and `*-detail.jpg` photos (see `src/data/catalog.js`)

Missing files will 404 in the browser (broken logos and product photos). `npm test` includes an asset audit that fails CI if any referenced file is absent.

## Session API

Cart and enquiry drafts sync to `server/data/sessions/{uuid}.json` via the Node API — not `localStorage` (except a small `sessionId` pointer).

| Endpoint | Purpose |
| --- | --- |
| `POST /api/sessions` | Create a new session |
| `GET /api/sessions/:id` | Load session |
| `PATCH /api/sessions/:id` | Update `bag` and/or `draft` |

**Deploy:** host `server/` separately (VPS, Railway, Render, etc.). Set `VITE_API_URL` when building the frontend and add that API origin to `connect-src` in `index.html`. Optional: share a bookmark with `?sid=<uuid>` to restore a session after clearing site data.

## Hero note (do not put back inside `.cat-hero`)

The badge **A LITTLE CAT. A LOT OF CAKE.** must stay on `.cat-hero-shell`, **outside** `.cat-hero`.

`.cat-hero` uses `overflow: hidden` for the rounded illustration. Text inside that layer gets clipped. The shell + sibling note structure is the permanent fix.

## Shop by category strip

The looping strip is `src/components/CategoryCarousel.jsx`. Its icons are inline SVGs in `src/components/CategoryIcon.jsx`, keyed by the `art` value in `src/data/catalog.js` (`cake`, `tin`, `cookie`, `jar`, `cupcake`, `signature`). They use brand CSS variables, so add new icons there rather than as files under `public/assets/`.

Touch rules, so a phone swipe drags instead of opening the card under the finger:

- `.category-grid` must keep `touch-action: pan-y`. Horizontal gestures belong to the pointer handlers; the page still scrolls vertically.
- `pointercancel` clears drag state only. Never navigate from it — that is what made a swipe open a category on iOS/Android.
- A pointer that moved less than 10px counts as a tap and opens the category from `pointerup`. After a real drag, the trailing `click` is swallowed.

## Custom cakes (`/custom`)

Structured brief for celebration cakes. Home, Shop (Custom Cakes chip), Contact, and the footer all link here. Do not fold this back into the short contact form.

Edit options in `src/data/customCake.js`. Format the WhatsApp/email brief in `src/lib/customCake.js`. Page UI is `src/pages/CustomCakePage.jsx`; look is `.custom-hero`, `.cake-form`, `.cake-pills`, `.cake-shape`, `.cake-summary` in `src/styles.css`.

Current picks:

- Weight: 0.5 / 1 / 1.5 / 2 kg, or Custom (free-text size)
- Shape: tall or wide
- Occasion: birthday, anniversary, wedding, engagement, baby shower, graduation, corporate, festival, other
- Sponge: vanilla, chocolate, red velvet, funfetti
- Flavour / filling: fresh cream; chocolate ganache (white, milk, dark); Belgian chocolate; Nutella hazelnut; blueberry; strawberry; orange; mango; coffee; Lotus Biscoff; Custom (shows a text field)
- Needed-by date and time (required, 2–4 day lead)
- Pickup or delivery, design notes, message on cake, allergies

The brief is ready when size + occasion are set, or design notes are at least 6 characters. **WhatsApp this cake** opens a draft; quote and the usual 50% advance happen in chat, not on the site. **Email instead** is only on this page (FormSubmit). Contact no longer sends email.

Needed-by on `/custom` stays empty until they pick a date (2–4 day lead). Do not copy the bag’s today/now defaults onto this form.

## Contact / cart behaviour

- Cart lives in `App` state and syncs to the session API (`src/lib/session.js`). Line qty is clamped to 1–20. Packing notes max 300. Menu items have no icing-message field.
- Opening the bag hydrates date/time with `bagWhenFromDraft`: a saved ISO date **today or later** is kept; otherwise **today** and now rounded **up to the next 15 minutes**. Contact and custom cakes do not get those defaults.
- The drawer is a flex column: items + When/Pickup scroll in `.cart-scroll`; **Order on WhatsApp** stays pinned in `.cart-foot`. `.cart` uses `overflow: hidden` so the button cannot paint off-screen. There is no Email instead in the bag.
- When + Pickup sit in one paper card. Minutes step by 15. Compact pickup is shop name + Maps (full address still goes into WhatsApp). Delivery is one Area / address field.
- Phone: header shows bag + hamburger; a sticky **Enquire** pill (`.mobile-enquire`) is the empty WhatsApp starter. Desktop header has Enquire too.
- **Order on WhatsApp** builds a short draft in `orderWhatsAppText` (`src/lib/cart.js`):

```text
Nutella Cheesecake × 1 — ₹270
Biscoff Cheesecake × 1 — ₹350
Total ₹620

Needed: 18 Sept 2026, 3:15 PM.

Pickup: Dev's Cake Lab
401, P.D. Apartment, Opp Mira Madhav Flat, Ellisbridge
https://maps.google.com/?q=…
```

  Delivery is one line (`Delivery: Bodakdev, near ISRO` or `Delivery: address to confirm.`). If there is no date, `whenNote` is `Date to confirm.`
- `/contact` is WhatsApp-only: a **Tell us more** box (prefilled from the bag on load), **WhatsApp this enquiry**, and a Call / Email (`mailto:`) / Instagram aside. No date, pickup, or FormSubmit on this page. Custom cakes still go to `/custom`.
- Custom cake **Email instead** POSTs to FormSubmit (`https://formsubmit.co/ajax/devscakelab@gmail.com`). The first live send needs the activation email in that inbox. CSP `connect-src` must include `https://formsubmit.co` and your session API host.

## Deploy (GitHub Pages)

1. Push to `main`.
2. Repo **Settings → Pages → Source → GitHub Actions**.
3. Workflow runs `npm ci`, `npm test`, `npm run build`, copies `dist/index.html` → `dist/404.html` (SPA fallback), then deploys `dist`.

Live site: [kira262.github.io/dev-cake-lab](https://kira262.github.io/dev-cake-lab/)

Do not point Pages at the source `index.html`; it must use the Vite build from Actions.

## Style / content edits

- Brand look lives in CSS variables and `src/styles.css`.
- Menu items and prices are in `src/data/catalog.js`.
- Contact details are in `src/data/contacts.js`.
- Custom cake weights, sponges, and flavours are in `src/data/customCake.js`.
