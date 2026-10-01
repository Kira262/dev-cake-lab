import { CONTACTS, mapsLink } from "../data/contacts.js";
import { pageTitle } from "./routes.js";

export const SITE_ORIGIN = "https://kira262.github.io/dev-cake-lab";
export const SITE_PATH = "/dev-cake-lab";

const DEFAULT_DESCRIPTION =
  "Dev's Cake Lab in Ahmedabad. Small-batch cheesecakes, cookies, and brownies. Order on WhatsApp.";
const LOGO_FILE = "dev-cake-logo.png";
const OG_COVER_FILE = "og-cover.jpg";

export function shareAssetUrl(filename) {
  const raw = String(filename || LOGO_FILE).replace(/\\/g, "/");
  const parts = raw.split("/").filter(Boolean);
  const extraAt = parts.lastIndexOf("extra");
  if (extraAt >= 0 && parts[extraAt + 1]) {
    return `${SITE_ORIGIN}/assets/extra/${encodeURIComponent(parts[extraAt + 1])}`;
  }
  const name = parts.pop() || LOGO_FILE;
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
  const image = product?.image;
  if (image) {
    const value = String(image).trim();
    if (value.startsWith("data:")) {
      return shareAssetUrl(LOGO_FILE);
    }
    return shareAssetUrl(value);
  }
  if (!route || route === "/") {
    return shareAssetUrl(OG_COVER_FILE);
  }
  return shareAssetUrl(LOGO_FILE);
}

export function shareMetaForRoute(route, product, productSlug = "") {
  const slug = product?.slug || productSlug;
  const title = pageTitle(route, product);
  const description = pageDescription(route, product);
  const url = sharePageUrl(route, slug && route.startsWith("/product") ? slug : "");
  const image = shareImageUrl(route, product);
  const noindex = route === "/admin";
  return { title, description, url, image, noindex };
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function bakeryJsonLd() {
  const address = CONTACTS.addressLines.join(", ");
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: CONTACTS.addressName,
    telephone: CONTACTS.phoneTel,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACTS.addressLines[0],
      addressLocality: "Ahmedabad",
      postalCode: "380006",
      addressCountry: "IN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "11:00",
        closes: "01:00",
      },
    ],
    hasMap: mapsLink(),
    description: DEFAULT_DESCRIPTION,
    url: `${SITE_ORIGIN}/`,
    image: shareAssetUrl(OG_COVER_FILE),
    areaServed: address,
  };
}

export function patchShareHtml(html, meta, options = {}) {
  const { title, description, url, image, noindex } = meta;
  const { jsonLd } = options;
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeAttr(description)}" />`,
  );
  if (noindex) {
    if (/name="robots"/i.test(out)) {
      out = out.replace(
        /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="robots" content="noindex, nofollow" />`,
      );
    } else {
      out = out.replace(
        /<meta\s+name="description"/i,
        `<meta name="robots" content="noindex, nofollow" />\n    <meta name="description"`,
      );
    }
  }
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
  if (/rel="canonical"/i.test(out)) {
    out = out.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${escapeAttr(url)}" />`,
    );
  } else {
    out = out.replace(
      /<title>/i,
      `<link rel="canonical" href="${escapeAttr(url)}" />\n    <title>`,
    );
  }
  if (jsonLd) {
    const block = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    if (/<script type="application\/ld\+json">/i.test(out)) {
      out = out.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
        block,
      );
    } else {
      out = out.replace(/<\/head>/i, `    ${block}\n  </head>`);
    }
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

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

export function applyShareMeta({ route, product, productSlug = "" }) {
  const meta = shareMetaForRoute(route, product, productSlug);
  document.title = meta.title;
  setMetaName("description", meta.description);
  if (meta.noindex) {
    setMetaName("robots", "noindex, nofollow");
  }
  setMetaProperty("og:title", meta.title);
  setMetaProperty("og:description", meta.description);
  setMetaProperty("og:url", meta.url);
  setMetaProperty("og:image", meta.image);
  setCanonical(meta.url);
}
