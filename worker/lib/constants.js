export const ALLOWED_ORIGIN = "https://kira262.github.io";

export const SHOP_CATEGORIES = [
  "Cheesecakes",
  "Cookie Lava Tins",
  "Cookies",
  "Cake Bowls",
  "Cupcakes",
  "Brownies",
];

export const ADMIN_BADGES = ["", "BESTSELLER", "FAN FAVOURITE", "SIGNATURE", "TOP PICK"];

export const NAME_MAX = 80;
export const NOTE_MAX = 160;
export const FLAVOUR_MAX = 40;
export const PRICE_MIN = 1;
export const PRICE_MAX = 100000;
export const JPEG_MAX_BYTES = 1.5 * 1024 * 1024;
export const GENERATE_DAILY_CAP = 24;
export const UNLOCK_MAX_FAILURES = 5;
export const UNLOCK_LOCK_SECONDS = 15 * 60;
export const TOKEN_TTL_SECONDS = 30 * 60;
export const POST_RATE_PER_MINUTE = 5;
export const WRITE_RATE_PER_MINUTE = 30;
export const SLUG_MAX = 80;
export const ID_MAX = 100000;
export const ADMIN_ARTS = [
  "",
  "cake",
  "tin",
  "cookie",
  "jar",
  "cupcake",
  "brownie",
  "chocolate",
  "signature",
];
export const ADMIN_UNITS = ["per piece"];

export const GENERIC_READ_ERROR =
  "Could not read the shop data. Try again in a moment.";
export const GENERIC_WRITE_ERROR =
  "Could not save your changes. Try again in a moment.";
export const GENERIC_GENERATE_ERROR =
  "Photo generation failed. Try again in a moment.";
export const GENERIC_PUBLISH_ERROR = "Could not publish. Try again in a moment.";
export const GENERIC_DELETE_ERROR = "Could not delete. Try again in a moment.";
