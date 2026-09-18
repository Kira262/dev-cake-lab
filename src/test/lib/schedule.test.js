import { describe, expect, it } from "vitest";
import {
  bagWhenFromDraft,
  formatDisplayDate,
  formatDisplayTime,
  isoDateFromToday,
  isoTimeFromNow,
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

describe("isoTimeFromNow", () => {
  it("rounds up to the next quarter hour", () => {
    expect(isoTimeFromNow(new Date(2026, 8, 18, 14, 0, 0))).toBe("14:00");
    expect(isoTimeFromNow(new Date(2026, 8, 18, 14, 0, 1))).toBe("14:15");
    expect(isoTimeFromNow(new Date(2026, 8, 18, 14, 1, 0))).toBe("14:15");
    expect(isoTimeFromNow(new Date(2026, 8, 18, 14, 15, 0))).toBe("14:15");
    expect(isoTimeFromNow(new Date(2026, 8, 18, 14, 16, 0))).toBe("14:30");
    expect(isoTimeFromNow(new Date(2026, 8, 18, 23, 52, 0))).toBe("00:00");
  });
});

describe("bagWhenFromDraft", () => {
  const now = new Date(2026, 8, 18, 14, 7, 0);

  it("fills today and a rounded time when nothing is saved", () => {
    expect(bagWhenFromDraft({}, now)).toEqual({
      date: "2026-09-18",
      time: "14:15",
    });
  });

  it("replaces a past date and refreshes the time", () => {
    expect(
      bagWhenFromDraft({ neededBy: "2026-09-01", neededTime: "09:00" }, now),
    ).toEqual({ date: "2026-09-18", time: "14:15" });
  });

  it("keeps a future date and saved time", () => {
    expect(
      bagWhenFromDraft({ neededBy: "2026-09-20", neededTime: "16:30" }, now),
    ).toEqual({ date: "2026-09-20", time: "16:30" });
  });

  it("keeps a future date and fills time when missing", () => {
    expect(bagWhenFromDraft({ neededBy: "2026-09-20" }, now)).toEqual({
      date: "2026-09-20",
      time: "14:15",
    });
  });

  it("rolls the date forward when rounding crosses midnight", () => {
    const late = new Date(2026, 8, 18, 23, 52, 0);
    expect(bagWhenFromDraft({}, late)).toEqual({
      date: "2026-09-19",
      time: "00:00",
    });
  });
});

describe("whenNote", () => {
  it("uses a picked date or leaves it for WhatsApp", () => {
    const day = isoDateFromToday(2);
    expect(whenNote(day)).toBe(`Needed: ${formatDisplayDate(day)}.`);
    expect(whenNote(day, "10:00 AM")).toBe(
      `Needed: ${formatDisplayDate(day)}, 10:00 AM.`,
    );
    expect(whenNote("")).toBe("Date to confirm.");
    expect(whenNote("tomorrow")).toBe("Date to confirm.");
  });
});
