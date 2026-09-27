import { appPath } from "./paths.js";
import { categoryNames } from "../data/catalog.js";

export function readPath() {
  return appPath();
}

export function readMenuType() {
  const type = new URLSearchParams(window.location.search).get("type");
  if (!type || type === "All") return "All";
  return categoryNames.includes(type) ? type : "All";
}

export function menuPath(type) {
  return !type || type === "All"
    ? "/menu"
    : `/menu?type=${encodeURIComponent(type)}`;
}

export function productPath(slug) {
  return `/product/${slug}`;
}

export function readProductSlug() {
  const path = appPath();
  const match = path.match(/^\/product\/([^/]+)\/?$/);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return "";
  }
}

export function isNavActive(label, route) {
  if (label === "Home") return route === "/";
  if (label === "Shop")
    return route === "/menu" || route.startsWith("/product/");
  if (label === "Custom cakes") return route === "/custom";
  if (label === "Visit") return route === "/visit";
  if (label === "Contact") return route === "/contact";
  return false;
}

const SHOP = "Dev's Cake Lab";

export function pageTitle(route, product) {
  if (product?.name) return `${product.name} · ${SHOP}`;
  if (route === "/menu") return `Shop · ${SHOP}`;
  if (route === "/visit") return `Visit · ${SHOP}`;
  if (route === "/contact") return `Contact · ${SHOP}`;
  if (route === "/custom") return `Custom cakes · ${SHOP}`;
  if (route === "/admin") return `Admin · ${SHOP}`;
  return SHOP;
}
