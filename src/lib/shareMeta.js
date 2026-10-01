import { pageTitle } from "./routes.js";

export const SITE_ORIGIN = "https://kira262.github.io/dev-cake-lab";

const DEFAULT_DESCRIPTION = "Dev's Cake Lab — crafted, tested, perfected.";
const LOGO_FILE = "dev-cake-logo.png";

export function shareAssetUrl(filename) {
  const name = String(filename || LOGO_FILE)
    .split("/")
    .pop();
  return `${SITE_ORIGIN}/assets/${encodeURIComponent(name)}`;
}

export function pageDescription(route, product) {
  if (product?.note) return `${product.name} — ${product.note} · Dev's Cake Lab`;
  if (route === "/menu") {
    return "Browse cheesecakes, cookies, brownies, cupcakes, and more. Order on WhatsApp.";
  }
  if (route === "/visit") {
    return "Pickup at Dev's Cake Lab in Ahmedabad. Hours and map.";
  }
  if (route === "/contact") {
    return "Message Dev's Cake Lab on WhatsApp or send a custom-cake brief.";
  }
  if (route === "/custom") {
    return "Tell us your celebration cake — size, flavours, and design. WhatsApp or email.";
  }
  if (route === "/admin") {
    return "Staff menu desk for Dev's Cake Lab.";
  }
  return DEFAULT_DESCRIPTION;
}

export function sharePageUrl(route, productSlug = "") {
  if (productSlug) {
    return `${SITE_ORIGIN}/product/${encodeURIComponent(productSlug)}/`;
  }
  if (!route || route === "/") return `${SITE_ORIGIN}/`;
  const path = route.startsWith("/") ? route : `/${route}`;
  return `${SITE_ORIGIN}${path}/`;
}

export function shareImageUrl(route, product) {
  if (product?.image) {
    const file = product.image.split("/").pop();
    return shareAssetUrl(file);
  }
  return shareAssetUrl(LOGO_FILE);
}

export function shareMetaForRoute(route, product, productSlug = "") {
  const slug = product?.slug || productSlug;
  const title = pageTitle(route, product);
  const description = pageDescription(route, product);
  const url = sharePageUrl(route, slug && route.startsWith("/product") ? slug : "");
  const image = shareImageUrl(route, product);
  return { title, description, url, image };
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

export function patchShareHtml(html, meta) {
  const { title, description, url, image } = meta;
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeAttr(description)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeAttr(image)}" />`,
  );
  if (/property="og:url"/i.test(out)) {
    out = out.replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${escapeAttr(url)}" />`,
    );
  } else {
    out = out.replace(
      /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${escapeAttr(url)}" />\n    <meta property="og:type" content="website" />`,
    );
  }
  return out;
}

function setMetaName(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function applyShareMeta({ route, product, productSlug = "" }) {
  const meta = shareMetaForRoute(route, product, productSlug);
  document.title = meta.title;
  setMetaName("description", meta.description);
  setMetaProperty("og:title", meta.title);
  setMetaProperty("og:description", meta.description);
  setMetaProperty("og:url", meta.url);
  setMetaProperty("og:image", meta.image);
}
