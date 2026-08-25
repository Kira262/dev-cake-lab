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
npm test         # Vitest: validation, enquiry send, pages, CSP
```

## Project layout

```text
src/
  App.jsx              App shell: cart, routing, page switch
  main.jsx             React entry
  styles.css           All styles
  components/          Header, Footer, Cart, ProductCard, CatHero, …
  pages/               Home, Menu (Shop), Product, Visit, Contact
  data/
    catalog.js         Categories, products, reviews
    contacts.js        Phone, email, address, social links
  lib/
    paths.js           asset(), appPath(), toLocation()
    routes.js          Route helpers, nav active state
    cart.js            Line IDs, totals, qty clamp, order message, bag persist
    draft.js           Remembered name, phone, email, address, date
    schedule.js        Needed-by date helpers
    validate.js        Name / email / phone / address / date rules
    enquiry.js         FormSubmit POST for the contact form
    test/
    setup.js           Testing Library cleanup
    csp.test.js        Content-Security-Policy checks
    data/              contacts tests
    lib/               cart, enquiry, routes, validate tests
    pages/             Contact, Product, Visit page tests
    components/        Cart and FAQ tests
public/assets/         Logo and product photos
index.html             HTML shell + CSP
```

| Path                                 | Purpose                                                      |
| ------------------------------------ | ------------------------------------------------------------ |
| `src/App.jsx`                        | App shell: cart state, routing, page switch                  |
| `src/pages/`                         | Home, Menu (Shop), Product, Visit, Contact                   |
| `src/components/`                    | Header, Footer, Cart, ProductCard, etc.                      |
| `src/data/catalog.js`                | Categories, products, reviews                                |
| `src/data/contacts.js`               | Phone, email, address, social links                          |
| `src/lib/paths.js`                   | `asset()`, `appPath()`, `toLocation()`                       |
| `src/lib/routes.js`                  | Route helpers, nav active state                              |
| `src/lib/cart.js`                    | Cart line IDs, totals, qty clamp, order message, bag persist |
| `src/lib/draft.js`                   | Remembered enquiry / delivery details                        |
| `src/lib/schedule.js`                | Needed-by date helpers                                       |
| `src/lib/validate.js`                | Enquiry field validation and length caps                     |
| `src/lib/enquiry.js`                 | FormSubmit AJAX send                                         |
| `src/test/`                          | Vitest suite (mirrors `data/`, `lib/`, `pages/`)             |
| `src/styles.css`                     | All styles                                                   |
| `src/main.jsx`                       | React entry                                                  |
| `index.html`                         | HTML shell and Content-Security-Policy                       |
| `public/assets/`                     | Static images (logo, product photos)                         |
| `public/.nojekyll`                   | Disables Jekyll on GitHub Pages                              |
| `vite.config.js`                     | Vite + React; production `base` is `/dev-cake-lab/`          |
| `.github/workflows/deploy-pages.yml` | `npm test`, build, deploy to GitHub Pages                    |

## Routing and base path

This is a client-side SPA (no React Router). Navigation uses `history.pushState` and helpers:

- `appPath()` — strips the GitHub Pages base from the URL
- `toLocation(to)` — prefixes paths with the production base
- `asset(file)` — resolves files under `public/assets/` with `import.meta.env.BASE_URL`

Header tabs: **Home** `/` · **Shop** `/menu` · **Visit** `/visit` · **Contact** `/contact`.

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

- Cart lives in `App` state and is remembered in `localStorage`. Line qty is clamped to 1–20. Packing notes max 300. Menu items have no icing-message field (cheesecakes, tins, cookies, bowls, cupcakes).
- **Order on WhatsApp** is always a live link from the bag. Defaults are pickup at Ellisbridge and “date to confirm.” Optional date picker; skip it and they can pick a time on WhatsApp. Delivery shows one Area / address line; if empty, the chat says address to confirm and asks to quote charges.
- No name, email, phone, calendar, or morning/evening radios in the bag. **Email instead** opens `/contact`, which still has the longer form (date, slot, area chips, building) because email has no back-and-forth.
- **Email instead** bumps `orderTicket` and navigates to `/contact`. The long form still asks for date, slot, area, and building because email has no chat.
- `ContactPage` refreshes the prefilled message when `orderTicket` changes.
- Contact is WhatsApp-first too: **WhatsApp this enquiry** uses the same prefilled text plus name/phone if filled. **Send email** POSTs to FormSubmit (`https://formsubmit.co/ajax/devscakelab@gmail.com`) on that one click — there is no review popup.
- Enquiry fields: name (2–80, required for email), Indian mobile (10 digits starting 6–9, required for email), email optional (real `local@domain.tld` when filled, max 80), delivery area + address required only for delivery, message optional (max 1,200 characters / about 200 words).
- The first live email send requires clicking FormSubmit’s activation email in that inbox. After that, enquiries arrive as normal email.
- CSP `connect-src` must include `https://formsubmit.co` or the send will be blocked.
- The contact sidebar email link may still open Gmail compose for a direct write.

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
