export const ADMIN_API = (
  import.meta.env.VITE_ADMIN_API ||
  "https://dev-cake-lab-admin.cakelab.workers.dev"
).replace(/\/$/, "");

export const ADMIN_BADGES = ["", "BESTSELLER", "FAN FAVOURITE", "SIGNATURE", "TOP PICK"];
