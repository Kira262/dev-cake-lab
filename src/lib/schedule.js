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

export function parseNeededTime(value) {
  const raw = String(value || "")
    .trim()
    .replace(/\./g, ":")
    .replace(/\s+/g, " ");
  if (!raw) return "";

  const meridiemMatch = raw.match(/\b(am|pm)\b/i);
  const period = meridiemMatch ? meridiemMatch[1].toLowerCase() : "";
  const clock = raw.match(/(\d{1,2}):(\d{2})(?!\d)/);
  if (!clock) return "";

  let hours = Number(clock[1]);
  const minutes = Number(clock[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return "";
  if (minutes > 59) return "";

  if (period === "am" || period === "pm") {
    if (hours < 1 || hours > 12) return "";
    if (period === "am") hours = hours === 12 ? 0 : hours;
    else hours = hours === 12 ? 12 : hours + 12;
  } else if (hours > 23 || hours < 0) {
    return "";
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatDisplayTime(value) {
  const time = parseNeededTime(value);
  if (!time) return "";
  let [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function toTwelveHourParts(value) {
  const time = parseNeededTime(value);
  if (!time) return { hour: "", minute: "", period: "AM" };
  let [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return {
    hour: String(hours),
    minute: String(minutes).padStart(2, "0"),
    period,
  };
}

export function fromTwelveHourParts({ hour, minute, period }) {
  if (hour === "" || hour == null || minute === "" || minute == null) return "";
  const hours = Number(hour);
  const minutes = Number(minute);
  if (!Number.isInteger(hours) || hours < 1 || hours > 12) return "";
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) return "";
  const meridiem = period === "PM" ? "PM" : "AM";
  return parseNeededTime(
    `${hours}:${String(minutes).padStart(2, "0")} ${meridiem}`,
  );
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

export function whenNote(when = "", time = "") {
  const date = parseISODate(when);
  if (!date) {
    return "Date to confirm — we can pick a time on WhatsApp.";
  }
  const clock = formatDisplayTime(time);
  return clock
    ? `Needed: ${formatDisplayDate(when)}, ${clock}.`
    : `Needed: ${formatDisplayDate(when)}.`;
}

export function scheduleNote({
  neededBy = "",
  time = "",
  minDays = 0,
} = {}) {
  if (!neededBy) return "";
  const clock = formatDisplayTime(time);
  const when = clock
    ? `${formatDisplayDate(neededBy)}, ${clock}`
    : formatDisplayDate(neededBy);
  const lead =
    minDays >= 2
      ? "Custom cakes usually need 2–4 days."
      : "We'll confirm if this date works.";
  return `Needed by: ${when}.\n${lead}`;
}
