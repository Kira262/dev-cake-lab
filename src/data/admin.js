const viteEnv =
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};

export const ADMIN_API = (
  viteEnv.VITE_ADMIN_API || "https://cakelab-admin-api.cakelab.workers.dev"
).replace(/\/$/, "");

export const ADMIN_BADGES = ["", "BESTSELLER", "FAN FAVOURITE", "SIGNATURE", "TOP PICK"];
