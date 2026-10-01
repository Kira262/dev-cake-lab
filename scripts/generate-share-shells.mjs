import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { products as catalogProducts } from "../src/data/catalog.js";
import { mergeCatalog, parseExtrasPayload } from "../src/lib/extraProducts.js";
import {
  bakeryJsonLd,
  patchShareHtml,
  shareMetaForRoute,
  SITE_ORIGIN,
  SITE_PATH,
} from "../src/lib/shareMeta.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const EXTRAS_PATH = path.join(ROOT, "public", "data", "extra-products.json");

const STATIC_ROUTES = ["/menu", "/visit", "/contact", "/custom"];

async function readExtras() {
  try {
    const raw = await readFile(EXTRAS_PATH, "utf8");
    return parseExtrasPayload(JSON.parse(raw));
  } catch {
    return { items: [], deletedSlugs: [] };
  }
}

async function writeShell(distDir, route, meta, options = {}) {
  const template = await readFile(path.join(DIST, "index.html"), "utf8");
  const html = patchShareHtml(template, meta, options);
  const dir =
    route === "/"
      ? DIST
      : path.join(DIST, route.replace(/^\//, "").split("/").join(path.sep));
  if (route !== "/") {
    await mkdir(dir, { recursive: true });
  }
  const file = route === "/" ? path.join(DIST, "index.html") : path.join(dir, "index.html");
  await writeFile(file, html, "utf8");
}

function sitemapUrl(pathname) {
  const suffix = pathname === "/" ? "/" : `${pathname}/`;
  return `${SITE_ORIGIN}${suffix}`;
}

async function writeRobotsAndSitemap(productSlugs) {
  const robots = `User-agent: *
Disallow: ${SITE_PATH}/admin/

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
  await writeFile(path.join(DIST, "robots.txt"), robots, "utf8");

  const paths = ["/", ...STATIC_ROUTES.map((r) => r)];
  for (const slug of productSlugs) {
    paths.push(`/product/${slug}`);
  }
  const urls = paths
    .map(
      (p) => `  <url>
    <loc>${sitemapUrl(p)}</loc>
  </url>`,
    )
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  await writeFile(path.join(DIST, "sitemap.xml"), sitemap, "utf8");
}

async function run() {
  const extras = await readExtras();
  const shop = mergeCatalog(catalogProducts, extras);
  const productSlugs = shop.map((p) => p.slug).filter(Boolean);

  const home = shareMetaForRoute("/", null);
  await writeShell(DIST, "/", home, { jsonLd: bakeryJsonLd() });

  for (const route of STATIC_ROUTES) {
    const meta = shareMetaForRoute(route, null);
    const options = route === "/visit" ? { jsonLd: bakeryJsonLd() } : {};
    await writeShell(DIST, route, meta, options);
  }

  for (const product of shop) {
    if (!product.slug) continue;
    const route = `/product/${product.slug}`;
    const meta = shareMetaForRoute(route, product, product.slug);
    await writeShell(DIST, route, meta);
  }

  await writeRobotsAndSitemap(productSlugs);

  console.log(
    `Share shells: home + ${STATIC_ROUTES.length} routes + ${productSlugs.length} products`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
