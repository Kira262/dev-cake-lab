import { NOTES_MAX, clipText } from "./validate.js";
import { whenNote } from "./schedule.js";
import { CONTACTS } from "../data/contacts.js";

export const MAX_LINE_QTY = 20;
export const BAG_KEY = "devCakeLab.bag";

export function clampQty(n) {
  const qty = Math.floor(Number(n));
  if (!Number.isFinite(qty) || qty < 1) return 1;
  return Math.min(MAX_LINE_QTY, qty);
}

export function makeLineId(product, extras = {}) {
  const notes = (extras.notes || "").trim();
  return `${product.id}::${notes}`;
}

export function lineTotal(item) {
  return item.price * item.qty;
}

export function serializeBag(cart) {
  return (cart || []).map((item) => ({
    id: item.id,
    qty: item.qty,
    notes: item.notes || "",
  }));
}

export function hydrateBag(saved, catalog) {
  if (!Array.isArray(saved) || !Array.isArray(catalog)) return [];
  const byId = new Map(catalog.map((product) => [product.id, product]));
  const merged = [];
  for (const row of saved) {
    const product = byId.get(row.id);
    if (!product) continue;
    const notes = clipText(row.notes, NOTES_MAX);
    const qty = clampQty(row.qty);
    const lineId = makeLineId(product, { notes });
    const found = merged.find((item) => item.lineId === lineId);
    if (found) {
      found.qty = clampQty(found.qty + qty);
    } else {
      merged.push({ ...product, lineId, qty, notes });
    }
  }
  return merged;
}

export function readBag() {
  try {
    const raw = localStorage.getItem(BAG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBag(cart) {
  try {
    localStorage.setItem(BAG_KEY, JSON.stringify(serializeBag(cart)));
  } catch {
    /* ignore quota / private mode */
  }
}

export function orderMessage(cart, total) {
  if (!cart.length) return "";
  const lines = cart.map((item) => {
    const extra = item.notes ? ` (notes: ${item.notes})` : "";
    return `• ${item.name} × ${item.qty}${extra} — ₹${lineTotal(item).toLocaleString("en-IN")}`;
  });
  return `I'd like to order:\n${lines.join("\n")}\n\nSubtotal: ₹${total.toLocaleString("en-IN")}\n\n`;
}

export function fulfilmentNote({
  fulfilment = "pickup",
  address = "",
  area = "",
} = {}) {
  if (fulfilment === "delivery") {
    const where = String(address || "").trim();
    const lines = [
      area && area !== "Other"
        ? `Delivery requested to ${area}.`
        : "Delivery requested.",
    ];
    if (where) lines.push(`Address:\n${where}`);
    else lines.push("Address to confirm.");
    lines.push("Please confirm delivery charges for this area.");
    return lines.join("\n");
  }
  return `Pickup at ${CONTACTS.pickupPlace}.`;
}

export function orderWhatsAppText(cart, total, extras = {}) {
  return [
    orderMessage(cart, total).trim(),
    whenNote(extras.when || extras.neededBy, extras.slot),
    fulfilmentNote(extras),
  ]
    .filter(Boolean)
    .join("\n\n");
}
