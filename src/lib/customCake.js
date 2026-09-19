import { CONTACTS } from "../data/contacts.js";
import {
  CAKE_SHAPES,
  CAKE_WEIGHTS,
} from "../data/customCake.js";
import { formatDisplayDate, formatDisplayTime } from "./schedule.js";

export function cakeWeightLabel({ weightId = "", customWeight = "" } = {}) {
  if (weightId === "custom") {
    const custom = String(customWeight || "").trim();
    return custom ? `${custom}` : "";
  }
  return CAKE_WEIGHTS.find((item) => item.id === weightId)?.label || "";
}

export function cakeShapeLabel(shapeId = "") {
  return CAKE_SHAPES.find((item) => item.id === shapeId)?.label || "";
}

export function cakeFlavourLabel({ flavour = "", customFlavour = "" } = {}) {
  if (flavour === "Custom") {
    return String(customFlavour || "").trim();
  }
  return String(flavour || "").trim();
}

export function customCakeBriefReady({
  weightId = "",
  customWeight = "",
  occasion = "",
  design = "",
} = {}) {
  const hasSize = Boolean(cakeWeightLabel({ weightId, customWeight }));
  const hasOccasion = Boolean(String(occasion || "").trim());
  const hasNotes = String(design || "").trim().length >= 6;
  return (hasSize && hasOccasion) || hasNotes;
}

export function formatCustomCakeBrief({
  weightId = "",
  customWeight = "",
  shapeId = "",
  occasion = "",
  sponge = "",
  flavour = "",
  customFlavour = "",
  design = "",
  cakeMessage = "",
  allergies = "",
} = {}) {
  const lines = [];
  const weight = cakeWeightLabel({ weightId, customWeight });
  const shape = cakeShapeLabel(shapeId);
  if (occasion) lines.push(`Occasion: ${occasion}`);
  if (weight) lines.push(`Weight: ${weight}`);
  if (shape) lines.push(`Shape: ${shape}`);
  if (sponge) lines.push(`Sponge: ${sponge}`);
  const flavourLabel = cakeFlavourLabel({ flavour, customFlavour });
  if (flavourLabel) lines.push(`Flavour / filling: ${flavourLabel}`);
  const notes = [];
  if (String(design || "").trim()) {
    notes.push("Design:", String(design).trim());
  }
  if (String(cakeMessage || "").trim()) {
    notes.push(`Message on cake: ${String(cakeMessage).trim()}`);
  }
  if (String(allergies || "").trim()) {
    notes.push(`Allergies / special requests: ${String(allergies).trim()}`);
  }
  if (notes.length) {
    if (lines.length) lines.push("");
    lines.push(...notes);
  }
  return lines.join("\n");
}

function customCakeFulfilmentNote({
  fulfilment = "pickup",
  address = "",
  area = "",
} = {}) {
  if (fulfilment === "delivery") {
    const where = String(address || "").trim();
    const zone = area && area !== "Other" ? area : "";
    const place = [zone, where].filter(Boolean).join(", ");
    return place
      ? `Delivery: ${place}`
      : "Delivery: address to confirm.";
  }
  return `Pickup: ${CONTACTS.addressName}`;
}

export function customCakeWhatsAppText({
  neededBy = "",
  neededTime = "",
  time = "",
  fulfilment = "pickup",
  address = "",
  area = "",
  ...brief
} = {}) {
  const lines = ["Hi, I'd like a custom cake."];
  const clock = formatDisplayTime(neededTime || time);
  if (neededBy) {
    const when = clock
      ? `${formatDisplayDate(neededBy)}, ${clock}`
      : formatDisplayDate(neededBy);
    lines.push(`Needed by: ${when}.`);
  }
  const body = formatCustomCakeBrief(brief);
  if (body) lines.push(body);
  lines.push(customCakeFulfilmentNote({ fulfilment, address, area }));
  lines.push(
    "",
    "Please quote on WhatsApp. I'll send reference photos in this chat.",
  );
  return lines.join("\n");
}
