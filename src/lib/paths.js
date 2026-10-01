const BASE_URL = import.meta.env?.BASE_URL || "/";

export const BASE = BASE_URL.replace(/\/$/, "");

export function asset(file) {
  const name = String(file || "")
    .split("/")
    .pop();
  return `${BASE_URL}assets/${encodeURIComponent(name)}`;
}

export function webpFromUrl(url) {
  return String(url).replace(/\.(jpe?g|png)(\?|#|$)/i, ".webp$2");
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
