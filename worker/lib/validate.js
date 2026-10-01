import {
  ADMIN_ARTS,
  ADMIN_BADGES,
  ADMIN_UNITS,
  FLAVOUR_MAX,
  ID_MAX,
  JPEG_MAX_BYTES,
  NAME_MAX,
  NOTE_MAX,
  PRICE_MAX,
  PRICE_MIN,
  SHOP_CATEGORIES,
  SLUG_MAX,
} from "./constants.js";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugFromName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validSlug(value) {
  const slug = String(value || "").trim();
  if (!slug || slug.length > SLUG_MAX || !SLUG_RE.test(slug)) return null;
  return slug;
}

export function parseJpegDataUrl(value) {
  const str = String(value || "").trim();
  const match = /^data:image\/jpeg;base64,(.+)$/i.exec(str);
  if (!match) return null;
  const b64 = match[1].replace(/\s/g, "");
  let binary;
  try {
    binary = atob(b64);
  } catch {
    return null;
  }
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  if (bytes.length < 3 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
    return null;
  }
  if (bytes.length > JPEG_MAX_BYTES) return null;
  return { bytes, b64 };
}

export function normalizeAssetPath(value) {
  const str = String(value || "").trim();
  if (!str || str.startsWith("data:") || /^https?:\/\//i.test(str)) return null;
  const withoutQuery = str.split("?")[0].split("#")[0];
  let path = withoutQuery;
  if (path.includes("/assets/")) {
    path = path.slice(path.indexOf("/assets/") + "/assets/".length);
  } else if (path.startsWith("assets/")) {
    path = path.slice("assets/".length);
  } else {
    path = path.split("/").pop() || "";
  }
  if (!path || path.includes("..") || path.includes("\\")) return null;
  if (path.includes("/")) {
    if (!/^extra\/[^/]+\.(jpe?g|png|webp)$/i.test(path)) return null;
  } else if (!/\.(jpe?g|png|webp)$/i.test(path)) {
    return null;
  }
  return `assets/${path}`;
}

export function roundPrice(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < PRICE_MIN || n > PRICE_MAX) return null;
  return n;
}

export function validatePublishBody(body) {
  const name = String(body.name || "").trim().slice(0, NAME_MAX);
  const type = String(body.type || "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (!SHOP_CATEGORIES.includes(type)) {
    return { ok: false, error: "Pick a valid category." };
  }
  const price = roundPrice(body.price);
  if (price === null) {
    return { ok: false, error: "Price must be between ₹1 and ₹100,000." };
  }
  const note = String(body.note || "").slice(0, NOTE_MAX);
  const badge = String(body.badge || "");
  if (!ADMIN_BADGES.includes(badge)) {
    return { ok: false, error: "Badge is not allowed." };
  }
  const flavours = (Array.isArray(body.flavours) ? body.flavours : [])
    .map((item) => String(item || "").trim().slice(0, FLAVOUR_MAX))
    .filter(Boolean)
    .slice(0, 2);
  const slugGiven = body.slug != null && String(body.slug).trim() !== "";
  const slug = slugGiven ? validSlug(body.slug) : validSlug(slugFromName(name));
  if (!slug) {
    return {
      ok: false,
      error: slugGiven ? "Slug is not valid." : "Name must produce a valid slug.",
    };
  }
  let id;
  if (body.id != null && body.id !== "") {
    const numeric =
      typeof body.id === "number" ||
      (typeof body.id === "string" && /^\d+$/.test(body.id));
    id = numeric ? Number(body.id) : NaN;
    if (!Number.isInteger(id) || id < 1 || id > ID_MAX) {
      return { ok: false, error: "Product id is not valid." };
    }
  }
  const unitText = body.unit == null ? "" : String(body.unit).trim();
  if (unitText && !ADMIN_UNITS.includes(unitText)) {
    return { ok: false, error: "Unit is not allowed." };
  }
  const art = body.art == null || body.art === "" ? "" : String(body.art);
  if (!ADMIN_ARTS.includes(art)) {
    return { ok: false, error: "Art is not allowed." };
  }
  if (!body.image || !body.detailImage) {
    return { ok: false, error: "Both photos are required." };
  }
  return {
    ok: true,
    value: {
      name,
      type,
      price,
      note,
      badge,
      flavours,
      slug,
      image: body.image,
      detailImage: body.detailImage,
      unit: unitText || undefined,
      art,
      bestSeller: body.bestSeller ? Number(body.bestSeller) || true : undefined,
      id,
    },
  };
}

export async function shortHash(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function resolvePhotoForStore(value, slug, role) {
  const asset = normalizeAssetPath(value);
  if (asset) return { asset, file: null };
  const jpeg = parseJpegDataUrl(value);
  if (!jpeg) {
    throw new Error("Photos must be JPEG uploads or existing shop images.");
  }
  const hash = await shortHash(jpeg.bytes);
  const fileName = `${slug}-${role}-${hash}.jpg`;
  return {
    asset: `assets/extra/${fileName}`,
    file: {
      path: `public/assets/extra/${fileName}`,
      contentBase64: jpeg.b64,
    },
  };
}
