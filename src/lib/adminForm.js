import { categoryDefaults, slugFromName } from "./extraProducts.js";

export function adminGenerateReady(draft = {}) {
  return Boolean(
    draft.type &&
      String(draft.name || "").trim() &&
      Number(draft.price) > 0,
  );
}

export function adminPublishReady(draft = {}) {
  return adminGenerateReady(draft) && Boolean(draft.hero && draft.detail);
}

export function productDraftPhotos(product) {
  const hero = String(product?.image || "");
  const detail = String(
    product?.gallery?.[1] || product?.detailImage || hero,
  );
  return { hero, detail };
}

export function draftToProduct(draft = {}, id, existing = null) {
  const name = String(draft.name || "").trim();
  const defaults = categoryDefaults(draft.type, name);
  const flavours = [draft.flavourOne, draft.flavourTwo]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 2);
  const product = {
    id: existing?.id || id,
    name,
    type: draft.type,
    price: Number(draft.price) || 0,
    note: String(draft.note || defaults.note).trim() || defaults.note,
    badge: String(draft.badge || ""),
    art: existing?.art || defaults.art,
    image: draft.hero || "",
    detailImage: draft.detail || "",
    slug: existing?.slug || slugFromName(name),
  };
  if (existing?.unit || defaults.unit) product.unit = existing?.unit || defaults.unit;
  if (flavours.length === 2) product.flavours = flavours;
  if (draft.bestSeller) {
    product.bestSeller = existing?.bestSeller || true;
  }
  return product;
}
