import { isoDateFromToday, parseISODate } from "./schedule.js";

export const NAME_MAX = 80;
export const EMAIL_MAX = 80;
export const ADDRESS_MAX = 240;
export const MESSAGE_MAX = 1200;
export const NOTES_MAX = 300;
export const ENQUIRY_TOPICS = ["Menu order", "Custom cake", "Collaboration"];
export const FULFILMENT = {
  pickup: "pickup",
  delivery: "delivery",
};
export const DELIVERY_AREAS = [
  "Ellisbridge",
  "Navrangpura",
  "Satellite",
  "Bodakdev",
  "Paldi",
  "Other",
];
export const CLOCK_HOURS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];
export const CLOCK_MINUTES = ["00", "15", "30", "45"];
export const CLOCK_PERIODS = ["AM", "PM"];

const CLOCK_TIME_RE = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM)$/i;

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const NAME_RE = /^[\p{L}][\p{L} .'-]*$/u;

export function validateName(value) {
  const name = String(value || "")
    .trim()
    .replace(/\s+/g, " ");
  if (name.length < 2) {
    return { ok: false, error: "Please enter your name." };
  }
  if (name.length > NAME_MAX) {
    return { ok: false, error: "Name is too long." };
  }
  if (!NAME_RE.test(name)) {
    return {
      ok: false,
      error: "Use letters, spaces, hyphens, or apostrophes.",
    };
  }
  return { ok: true, value: name };
}

export function validateEmail(value, { optional = false } = {}) {
  const email = String(value || "")
    .trim()
    .toLowerCase();
  if (!email) {
    if (optional) return { ok: true, value: "" };
    return { ok: false, error: "Please enter your email." };
  }
  if (email.length > EMAIL_MAX) {
    return { ok: false, error: "Email is too long." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email, like you@example.com." };
  }
  return { ok: true, value: email };
}

export function normalizeIndianPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits;
}

export function validatePhone(value) {
  const national = normalizeIndianPhone(value);
  if (!/^[6-9]\d{9}$/.test(national)) {
    return { ok: false, error: "Enter a 10-digit Indian mobile number." };
  }
  return { ok: true, value: `+91${national}` };
}

export function validateMessage(value) {
  const message = String(value || "").trim();
  if (message.length > MESSAGE_MAX) {
    return {
      ok: false,
      error: `Keep your message under ${MESSAGE_MAX} characters.`,
    };
  }
  return { ok: true, value: message };
}

export function safeFulfilment(value) {
  return value === FULFILMENT.delivery ? FULFILMENT.delivery : FULFILMENT.pickup;
}

export function validateAddress(value, { required = false } = {}) {
  const address = String(value || "")
    .replace(/\r\n/g, "\n")
    .trim();
  if (!address) {
    if (!required) return { ok: true, value: "" };
    return {
      ok: false,
      error: "Enter a delivery address so we can quote charges.",
    };
  }
  if (address.length < 6) {
    return {
      ok: false,
      error: "Add your area or a landmark so we can quote delivery.",
    };
  }
  if (address.length > ADDRESS_MAX) {
    return { ok: false, error: "Address is too long." };
  }
  return { ok: true, value: address };
}

export function safeArea(value) {
  return DELIVERY_AREAS.includes(value) ? value : "";
}

export function validateArea(value, { required = false } = {}) {
  if (!required) return { ok: true, value: safeArea(value) };
  const area = safeArea(value);
  if (!area) {
    return { ok: false, error: "Pick an area so we can quote delivery." };
  }
  return { ok: true, value: area };
}

export function fulfilmentReady(fulfilment, address, area = "") {
  const delivery = safeFulfilment(fulfilment) === FULFILMENT.delivery;
  return (
    validateArea(area, { required: delivery }).ok &&
    validateAddress(address, { required: delivery }).ok
  );
}

export function formatClockTime(hour, minute, period) {
  const h = String(hour || "").padStart(2, "0");
  const m = String(minute || "").padStart(2, "0");
  const p = String(period || "").toUpperCase();
  if (!CLOCK_HOURS.includes(h) || !CLOCK_MINUTES.includes(m)) return "";
  if (!CLOCK_PERIODS.includes(p)) return "";
  return `${h}:${m} ${p}`;
}

export function parseClockTime(value) {
  const match = CLOCK_TIME_RE.exec(String(value || "").trim());
  if (!match) return null;
  const hour = String(Number(match[1])).padStart(2, "0");
  const minute = match[2];
  const period = match[3].toUpperCase();
  if (!CLOCK_MINUTES.includes(minute)) return null;
  return { hour, minute, period };
}

export function safeTimeSlot(value) {
  const parsed = parseClockTime(value);
  if (!parsed) return "";
  return formatClockTime(parsed.hour, parsed.minute, parsed.period);
}

export function scheduleRequired({ fulfilment, topic, hasCart = false } = {}) {
  return (
    safeFulfilment(fulfilment) === FULFILMENT.delivery ||
    topic === "Custom cake" ||
    hasCart
  );
}

export function minLeadDays(topic) {
  return topic === "Custom cake" ? 2 : 0;
}

export function validateNeededBy(value, { required = false, minDays = 0 } = {}) {
  const raw = String(value || "").trim();
  if (!raw) {
    if (!required) return { ok: true, value: "" };
    return { ok: false, error: "Pick a date so we can bake on time." };
  }
  const date = parseISODate(raw);
  if (!date) return { ok: false, error: "Pick a valid date." };
  const min = parseISODate(isoDateFromToday(minDays));
  if (min && date < min) {
    return {
      ok: false,
      error:
        minDays >= 2
          ? "Custom cakes need at least 2 days."
          : "Please pick today or a later date.",
    };
  }
  const max = parseISODate(isoDateFromToday(60));
  if (max && date > max) {
    return { ok: false, error: "Please pick a date within 60 days." };
  }
  return { ok: true, value: raw };
}

export function validateTimeSlot(value, { required = false } = {}) {
  const slot = safeTimeSlot(value);
  if (!slot) {
    if (!required) return { ok: true, value: "" };
    return { ok: false, error: "Pick a time (HH:MM AM/PM)." };
  }
  return { ok: true, value: slot };
}

export function scheduleReady({
  neededBy,
  slot,
  required = false,
  minDays = 0,
} = {}) {
  return (
    validateNeededBy(neededBy, { required, minDays }).ok &&
    validateTimeSlot(slot, { required }).ok
  );
}

export function safeTopic(topic, { allowMenuOrder = false } = {}) {
  const allowed = allowMenuOrder
    ? ENQUIRY_TOPICS
    : ENQUIRY_TOPICS.filter((item) => item !== "Menu order");
  return allowed.includes(topic) ? topic : "Custom cake";
}

export function clipText(value, max) {
  return String(value || "")
    .trim()
    .slice(0, max);
}
