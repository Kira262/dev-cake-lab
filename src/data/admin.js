export const ADMIN_API = (
  import.meta.env.VITE_ADMIN_API ||
  "https://cakelab-admin-api.cakelab.workers.dev"
).replace(/\/$/, "");

export const ADMIN_BADGES = ["", "BESTSELLER", "FAN FAVOURITE", "SIGNATURE", "TOP PICK"];
