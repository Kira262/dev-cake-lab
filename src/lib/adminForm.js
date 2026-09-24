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

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function readImageFile(file) {
  if (!file || !/^image\/(jpeg|png|webp)$/i.test(file.type)) {
    return Promise.reject(new Error("Choose a JPG, PNG, or WebP photo."));
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Promise.reject(new Error("That photo is too large. Use one under 8 MB."));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read that photo."));
    reader.readAsDataURL(file);
  });
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
