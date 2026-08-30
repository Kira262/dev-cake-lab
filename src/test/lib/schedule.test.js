import { describe, expect, it } from "vitest";
import {
  formatDisplayDate,
  formatDisplayTime,
  isoDateFromToday,
  parseNeededTime,
  whenNote,
} from "../../lib/schedule.js";

describe("parseNeededTime", () => {
  it("reads 12-hour typing and 24-hour values", () => {
    expect(parseNeededTime("4:30 PM")).toBe("16:30");
    expect(parseNeededTime("12:00 AM")).toBe("00:00");
    expect(parseNeededTime("12:00 PM")).toBe("12:00");
    expect(parseNeededTime("16:30")).toBe("16:30");
    expect(formatDisplayTime("16:30")).toBe("4:30 PM");
    expect(parseNeededTime("23:93 AM")).toBe("");
    expect(parseNeededTime("23:00 AM")).toBe("");
  });
});

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
