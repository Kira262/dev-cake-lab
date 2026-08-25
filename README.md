# Dev's Cake Lab

Vite + React frontend for Dev's Cake Lab.

```bash
npm install
npm run dev
```

```bash
npm test         # Vitest suite in src/test/
npm run build    # production build into dist/
npm run preview  # preview the production build locally
```

Layout, routes, contact/FormSubmit behaviour, and deploy notes: [instructions.md](instructions.md).

## GitHub Pages

The live site must be the **Vite build**, not the source `index.html`. After pushing `main`, set:

**Settings → Pages → Source → GitHub Actions**

The workflow runs tests, then builds. The site will be at [https://kira262.github.io/dev-cake-lab/](https://kira262.github.io/dev-cake-lab/)
