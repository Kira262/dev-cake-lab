import { categories, categoryNames } from "../data/catalog.js";

export const SHOP_CATEGORIES = categories.filter(
  ([name]) => name !== "Custom Cakes",
);

export const CATEGORY_DEFAULTS = {
  Cheesecakes: { art: "cake", weight: "250 g" },
  "Cookie Lava Tins": { art: "tin", weight: "300–400 g" },
  Cookies: {
    art: "cookie",
    weight: "45 g",
    unit: "per piece",
    note: "45 g · per piece",
  },
  "Cake Bowls": { art: "jar", weight: "300 g" },
  Cupcakes: { art: "cupcake" },
  Brownies: { art: "brownie", weight: "100–120 g" },
};

export function slugFromName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isShopCategory(type) {
  return Boolean(type && type !== "Custom Cakes" && categoryNames.includes(type));
}

export function categoryDefaults(type, name = "") {
  const meta = CATEGORY_DEFAULTS[type] || { art: "cake" };
  const label = String(name || "").trim();
  const note = meta.note
    || (meta.weight && label ? `${meta.weight} · ${label}` : meta.weight || label);
  return {
    art: meta.art,
    unit: meta.unit,
    note,
  };
}

export function extraProductsUrl() {
  return `${import.meta.env.BASE_URL}data/extra-products.json`;
}

export function parseExtrasPayload(data) {
  if (Array.isArray(data)) {
    return { items: data, deletedSlugs: [] };
  }
  if (!data || typeof data !== "object") {
    return { items: [], deletedSlugs: [] };
  }
  return {
    items: Array.isArray(data.items) ? data.items : [],
    deletedSlugs: (Array.isArray(data.deletedSlugs) ? data.deletedSlugs : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean),
  };
}

export async function fetchExtraProducts() {
  try {
    const res = await fetch(`${extraProductsUrl()}?t=${Date.now()}`);
    if (!res.ok) return { items: [], deletedSlugs: [] };
    return parseExtrasPayload(await res.json());
  } catch {
    return { items: [], deletedSlugs: [] };
  }
}

export function nextProductId(list) {
  const ids = (list || []).map((item) => Number(item.id) || 0);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

export function normalizeExtraProduct(raw, fallbackId) {
  if (!raw || !isShopCategory(raw.type)) return null;
  const name = String(raw.name || "").trim();
  if (!name) return null;
  const defaults = categoryDefaults(raw.type, name);
  const image = String(raw.image || "").trim();
  const detail = String(raw.detailImage || "").trim();
  const gallery = [...new Set([image, detail].filter(Boolean))];
  const flavours = Array.isArray(raw.flavours)
    ? raw.flavours.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 2)
    : [];
  const product = {
    id: Number(raw.id) || fallbackId,
    name,
    type: raw.type,
    price: Number(raw.price) || 0,
    note: String(raw.note || defaults.note),
    badge: String(raw.badge || ""),
    art: raw.art || defaults.art,
    image,
    slug: slugFromName(raw.slug || name),
    gallery,
  };
  if (defaults.unit || raw.unit) product.unit = raw.unit || defaults.unit;
  if (flavours.length) product.flavours = flavours;
  if (raw.bestSeller) product.bestSeller = raw.bestSeller;
  return product;
}

export function mergeCatalog(base, extras = [], deletedSlugsArg) {
  const fromPayload = Boolean(extras) && !Array.isArray(extras) && typeof extras === "object";
  const { items, deletedSlugs } = fromPayload
    ? parseExtrasPayload(extras)
    : { items: extras || [], deletedSlugs: deletedSlugsArg || [] };
  const hidden = new Set(deletedSlugs);
  const catalog = (Array.isArray(base) ? base : [])
    .filter((item) => !hidden.has(item.slug))
    .map((item) => ({ ...item }));
  const usedIds = new Set(catalog.map((item) => item.id));
  let nextId = nextProductId(catalog);

  for (const raw of items) {
    const extra = normalizeExtraProduct(raw, nextId);
    if (!extra || hidden.has(extra.slug)) continue;
    const index = catalog.findIndex((item) => item.slug === extra.slug);
    if (index >= 0) {
      extra.id = catalog[index].id;
      catalog[index] = extra;
      continue;
    }
    if (usedIds.has(extra.id)) extra.id = nextId;
    usedIds.add(extra.id);
    catalog.push(extra);
    nextId = Math.max(nextId, extra.id + 1);
  }
  return catalog;
}

export function removeProduct(list, slug) {
  return (list || []).filter((item) => item.slug !== slug);
}

export function bestSellersFrom(list) {
  return (list || [])
    .filter((item) => item.bestSeller)
    .sort((a, b) => Number(a.bestSeller) - Number(b.bestSeller));
}
