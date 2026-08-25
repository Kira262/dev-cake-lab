export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function isoDateFromToday(offsetDays = 0, now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  date.setDate(date.getDate() + offsetDays);
  return toISODate(date);
}

export function formatDisplayDate(iso) {
  const date = parseISODate(iso);
  if (!date) return String(iso || "");
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function whenNote(when = "") {
  const date = parseISODate(when);
  if (!date) {
    return "Date to confirm — we can pick a time on WhatsApp.";
  }
  return `Needed: ${formatDisplayDate(when)}.`;
}

export function scheduleNote({
  neededBy = "",
  slot = "",
  minDays = 0,
} = {}) {
  if (!neededBy) return "";
  const when = slot
    ? `${formatDisplayDate(neededBy)}, ${String(slot).toLowerCase()}`
    : formatDisplayDate(neededBy);
  const lead =
    minDays >= 2
      ? "Custom cakes usually need 2–4 days."
      : "We'll confirm if this date works.";
  return `Needed by: ${when}.\n${lead}`;
}
