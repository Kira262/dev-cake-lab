import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../src/data/catalog.js";
import { patchShareHtml, shareMetaForRoute } from "../src/lib/shareMeta.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const EXTRAS_PATH = path.join(ROOT, "public", "data", "extra-products.json");

const STATIC_ROUTES = ["/menu", "/visit", "/contact", "/custom", "/admin"];

async function readDeletedSlugs() {
  try {
    const raw = await readFile(EXTRAS_PATH, "utf8");
    const data = JSON.parse(raw);
    return new Set(Array.isArray(data.deletedSlugs) ? data.deletedSlugs : []);
  } catch {
    return new Set();
  }
}

async function writeShell(distDir, route, meta) {
  const template = await readFile(path.join(DIST, "index.html"), "utf8");
  const html = patchShareHtml(template, meta);
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

async function run() {
  const deleted = await readDeletedSlugs();
  const home = shareMetaForRoute("/", null);
  await writeShell(DIST, "/", home);

  for (const route of STATIC_ROUTES) {
    const meta = shareMetaForRoute(route, null);
    await writeShell(DIST, route, meta);
  }

  for (const product of products) {
    if (!product.slug || deleted.has(product.slug)) continue;
    const route = `/product/${product.slug}`;
    const meta = shareMetaForRoute(route, product, product.slug);
    await writeShell(DIST, route, meta);
  }

  console.log(
    `Share shells: home + ${STATIC_ROUTES.length} routes + ${products.filter((p) => p.slug && !deleted.has(p.slug)).length} products`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
