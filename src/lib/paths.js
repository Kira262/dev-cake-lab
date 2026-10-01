const BASE_URL = import.meta.env?.BASE_URL || "/";

export const BASE = BASE_URL.replace(/\/$/, "");

export function asset(file) {
  const raw = String(file || "").split("?")[0].split("#")[0].replace(/\\/g, "/");
  const parts = raw.split("/").filter(Boolean);
  const extraAt = parts.lastIndexOf("extra");
  if (extraAt >= 0 && parts[extraAt + 1]) {
    return `${BASE_URL}assets/extra/${encodeURIComponent(parts[extraAt + 1])}`;
  }
  const name = parts.pop() || "";
  return `${BASE_URL}assets/${encodeURIComponent(name)}`;
}

export function webpFromUrl(url) {
  return String(url).replace(/\.(jpe?g|png)(\?|#|$)/i, ".webp$2");
}

export function isRemoteImageUrl(url) {
  return /^https?:\/\//i.test(String(url || ""));
}

export function responsiveWebpSrcSet(src) {
  const webp = webpFromUrl(src);
  if (!webp || isRemoteImageUrl(src) || String(src).startsWith("data:")) {
    return null;
  }
  const stem = webp.replace(/\.webp(\?|#|$)/i, "");
  return `${stem}-400.webp 400w, ${stem}-800.webp 800w, ${webp} 1200w`;
}

export function appPath() {
  let path = window.location.pathname || "/";
  if (BASE && (path === BASE || path.startsWith(`${BASE}/`))) {
    path = path.slice(BASE.length) || "/";
  }
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path;
}

export function toLocation(to) {
  const url = new URL(to, window.location.origin);
  const prefixed = url.pathname === "/" ? `${BASE}/` : `${BASE}${url.pathname}`;
  return `${prefixed}${url.search}${url.hash}`;
}
