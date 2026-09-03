import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { products } from "../../data/catalog.js";

const ROOT = resolve(import.meta.dirname, "../../..");
const ASSETS_DIR = join(ROOT, "public", "assets");

function referencedInSource() {
  const srcDir = join(ROOT, "src");
  const names = new Set();
  const assetRe = /asset\(\s*["']([^"']+)["']\s*\)/g;

  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(js|jsx)$/.test(entry.name)) {
        const text = readFileSync(full, "utf8");
        let match;
        while ((match = assetRe.exec(text))) names.add(match[1]);
      }
    }
  };
  walk(srcDir);
  return names;
}

describe("public/assets", () => {
  it("has every file referenced via asset() in src/", () => {
    const onDisk = new Set(readdirSync(ASSETS_DIR));
    const missing = [...referencedInSource()].filter((file) => !onDisk.has(file));
    expect(missing, `missing from public/assets/: ${missing.join(", ")}`).toEqual([]);
  });

  it("has hero and detail images for every catalog product", () => {
    const onDisk = new Set(readdirSync(ASSETS_DIR));
    const missing = [];
    for (const product of products) {
      const hero = product.image.split("/").pop();
      const stem = hero.replace(/\.[^.]+$/, "");
      const detail = `${stem}-detail.jpg`;
      if (!onDisk.has(hero)) missing.push(hero);
      if (!onDisk.has(detail)) missing.push(detail);
    }
    expect(missing, `missing product images: ${missing.join(", ")}`).toEqual([]);
  });

  it("includes brand and product assets on disk", () => {
    const onDisk = readdirSync(ASSETS_DIR);
    expect(onDisk).toContain("dev-cake-logo.png");
    expect(onDisk.length).toBeGreaterThanOrEqual(35);
  });
});
