import { CONTACTS, mapsLink, pickupAddressText, whatsappOrderUrl } from "../data/contacts.js";
import { fulfilmentNote } from "./cart.js";
import { minLeadDays } from "./validate.js";
import { scheduleNote } from "./schedule.js";

export const ENQUIRY_ENDPOINT = `https://formsubmit.co/ajax/${CONTACTS.email}`;

export const ENQUIRE_WHATSAPP_TEXT = [
  "Hi, I'd like to order from Dev's Cake Lab.",
  "",
  "I want:",
  "For (date):",
  "Pickup or delivery:",
].join("\n");

export function enquireWhatsAppUrl() {
  return whatsappOrderUrl(ENQUIRE_WHATSAPP_TEXT);
}

export function buildEnquiryPayload(values) {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    topic: values.topic,
    fulfilment: values.fulfilment === "delivery" ? "Delivery" : "Pickup",
    area:
      values.fulfilment === "delivery"
        ? values.area || "unspecified"
        : "Pickup",
    address:
      values.fulfilment === "delivery"
        ? values.address || "(missing)"
        : pickupAddressText(),
    location:
      values.fulfilment === "delivery" ? "" : mapsLink(),
    neededBy: values.neededBy || "(not set)",
    time: values.neededTime || values.time || "(not set)",
    message: values.message || "(No extra notes)",
    _subject: `Dev's Cake Lab enquiry — ${values.topic}`,
    _template: "table",
    _captcha: "false",
    _replyto: values.email || CONTACTS.email,
  };
}

export function enquiryWhatsAppText({
  name = "",
  phone = "",
  topic = "",
  message = "",
  fulfilment = "pickup",
  address = "",
  area = "",
  neededBy = "",
  time = "",
} = {}) {
  const lines = [];
  if (name) lines.push(`Hi, I'm ${name}.`);
  else if (topic === "Custom cake") {
    lines.push("Hi, I'd like a custom cake.");
  } else {
    lines.push("Hi, I'd like to order from Dev's Cake Lab.");
  }
  if (phone) lines.push(`Phone: ${phone}`);
  if (topic) lines.push(`Topic: ${topic}`);
  const when = scheduleNote({
    neededBy,
    time,
    minDays: minLeadDays(topic),
  });
  if (when) lines.push(when);
  lines.push(fulfilmentNote({ fulfilment, address, area }));
  if (message.trim()) {
    lines.push("", message.trim());
  }
  return lines.join("\n");
}

export async function submitEnquiry(values) {
  const response = await fetch(ENQUIRY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(buildEnquiryPayload(values)),
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok || data.success === false || data.success === "false") {
    throw new Error(data.message || "Could not send this enquiry. Please try again.");
  }
  return data;
}
