import { describe, expect, it } from "vitest";
import { formatDisplayDate, isoDateFromToday, whenNote } from "../../lib/schedule.js";

describe("whenNote", () => {
  it("uses a picked date or leaves it for WhatsApp", () => {
    const day = isoDateFromToday(2);
    expect(whenNote(day)).toBe(`Needed: ${formatDisplayDate(day)}.`);
    expect(whenNote(day, "10:00 AM")).toBe(
      `Needed: ${formatDisplayDate(day)}, 10:00 AM.`,
    );
    expect(whenNote("")).toBe("Date to confirm — we can pick a time on WhatsApp.");
    expect(whenNote("tomorrow")).toBe(
      "Date to confirm — we can pick a time on WhatsApp.",
    );
  });
});
