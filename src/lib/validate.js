import { isoDateFromToday, parseISODate, parseNeededTime } from "./schedule.js";

export const NAME_MAX = 80;
export const EMAIL_MAX = 80;
export const ADDRESS_MAX = 240;
export const MESSAGE_MAX = 1200;
export const NOTES_MAX = 300;
export const ENQUIRY_TOPICS = ["Menu order", "Custom cake", "Enquiry"];
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

export function fulfilmentReady(fulfilment, address) {
  const delivery = safeFulfilment(fulfilment) === FULFILMENT.delivery;
  return validateAddress(address, { required: delivery }).ok;
}

export function validateNeededTime(value, { required = false } = {}) {
  const raw = String(value || "").trim();
  if (!raw) {
    if (!required) return { ok: true, value: "" };
    return { ok: false, error: "Pick a time so we can plan the bake." };
  }
  const time = parseNeededTime(raw);
  if (!time) {
    return {
      ok: false,
      error: "Enter a valid time, like 4:30 PM.",
    };
  }
  return { ok: true, value: time };
}

export function scheduleRequired({ fulfilment } = {}) {
  return safeFulfilment(fulfilment) === FULFILMENT.delivery;
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

export function scheduleReady({
  neededBy,
  neededTime = "",
  required = false,
  minDays = 0,
} = {}) {
  return (
    validateNeededBy(neededBy, { required, minDays }).ok &&
    validateNeededTime(neededTime, { required }).ok
  );
}

export function safeTopic(topic, { allowMenuOrder = false } = {}) {
  const allowed = allowMenuOrder
    ? ENQUIRY_TOPICS
    : ENQUIRY_TOPICS.filter((item) => item !== "Menu order");
  if (topic === "Collaboration") return "Enquiry";
  return allowed.includes(topic) ? topic : "Enquiry";
}

export function clipText(value, max) {
  return String(value || "")
    .trim()
    .slice(0, max);
}
