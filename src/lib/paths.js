export const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

export function asset(file) {
  return `${import.meta.env.BASE_URL}assets/${file}`;
}

export function appPath() {
  let path = window.location.pathname || "/";
  if (BASE && (path === BASE || path.startsWith(`${BASE}/`))) {
    path = path.slice(BASE.length) || "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

export function toLocation(to) {
  const url = new URL(to, window.location.origin);
  const prefixed = url.pathname === "/" ? `${BASE}/` : `${BASE}${url.pathname}`;
  return `${prefixed}${url.search}${url.hash}`;
}
