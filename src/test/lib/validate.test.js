import { describe, expect, it } from "vitest";
import {
  MESSAGE_MAX,
  NOTES_MAX,
  clipText,
  safeTopic,
  validateEmail,
  validateMessage,
  validateName,
  validatePhone,
  validateAddress,
  validateArea,
  validateNeededBy,
  validateNeededTime,
} from "../../lib/validate.js";
import { isoDateFromToday } from "../../lib/schedule.js";

describe("validateEmail", () => {
  it("rejects a@b, spaces, and a missing @", () => {
    expect(validateEmail("a@b").ok).toBe(false);
    expect(validateEmail("   ").ok).toBe(false);
    expect(validateEmail("not-an-email").ok).toBe(false);
  });

  it("accepts a real address and lowercases it", () => {
    const result = validateEmail("You@Example.com");
    expect(result).toEqual({ ok: true, value: "you@example.com" });
  });

  it("allows a blank email when optional", () => {
    expect(validateEmail("", { optional: true })).toEqual({
      ok: true,
      value: "",
    });
    expect(validateEmail("   ", { optional: true })).toEqual({
      ok: true,
      value: "",
    });
    expect(validateEmail("a@b", { optional: true }).ok).toBe(false);
  });
});

describe("validatePhone", () => {
  it("rejects short, US-like, and letter values", () => {
    expect(validatePhone("123").ok).toBe(false);
    expect(validatePhone("5551234567").ok).toBe(false);
    expect(validatePhone("letters").ok).toBe(false);
  });

  it("normalizes Indian mobiles to +91", () => {
    expect(validatePhone("9876543210").value).toBe("+919876543210");
    expect(validatePhone("09876543210").value).toBe("+919876543210");
    expect(validatePhone("+91 98765 43210").value).toBe("+919876543210");
    expect(validatePhone("91-9876543210").value).toBe("+919876543210");
  });
});

describe("validateName", () => {
  it("blocks empty and whitespace-only names", () => {
    expect(validateName("").ok).toBe(false);
    expect(validateName("   ").ok).toBe(false);
    expect(validateName("A").ok).toBe(false);
  });

  it("trims a valid name", () => {
    expect(validateName("  Pavan  ")).toEqual({ ok: true, value: "Pavan" });
  });
});

describe("validateMessage", () => {
  it("allows an empty message and caps length", () => {
    expect(validateMessage("").ok).toBe(true);
    expect(validateMessage("x".repeat(MESSAGE_MAX + 1)).ok).toBe(false);
  });
});

describe("validateAddress", () => {
  it("is optional for pickup and required for delivery", () => {
    expect(validateAddress("", { required: false }).ok).toBe(true);
    expect(validateAddress("", { required: true }).ok).toBe(false);
    expect(validateAddress("Navrangpura").ok).toBe(true);
    expect(validateAddress("xx", { required: true }).ok).toBe(false);
  });
});

describe("clipText and topics", () => {
  it("clips packing notes and rejects unknown topics", () => {
    expect(clipText("  hello  ", 4)).toBe("hell");
    expect(clipText("x".repeat(400), NOTES_MAX).length).toBe(NOTES_MAX);
    expect(safeTopic("Evil")).toBe("Enquiry");
    expect(safeTopic("Collaboration")).toBe("Enquiry");
    expect(safeTopic("Menu order", { allowMenuOrder: true })).toBe(
      "Menu order",
    );
  });
});

describe("validateArea", () => {
  it("requires a known area for delivery", () => {
    expect(validateArea("", { required: true }).ok).toBe(false);
    expect(validateArea("Navrangpura", { required: true }).value).toBe(
      "Navrangpura",
    );
  });
});

describe("validateNeededTime", () => {
  it("accepts a clock time and rejects morning or evening labels", () => {
    expect(validateNeededTime("", { required: true }).ok).toBe(false);
    expect(validateNeededTime("Evening", { required: true }).ok).toBe(false);
    expect(validateNeededTime("16:30")).toEqual({ ok: true, value: "16:30" });
    expect(validateNeededTime("4:30 PM")).toEqual({ ok: true, value: "16:30" });
    expect(validateNeededTime("23:93 AM").ok).toBe(false);
    expect(validateNeededTime("23:93 AM", { required: false }).ok).toBe(false);
  });
});

describe("validateNeededBy", () => {
  it("enforces a 2-day lead for custom cakes", () => {
    expect(validateNeededBy("", { required: true }).ok).toBe(false);
    expect(
      validateNeededBy(isoDateFromToday(0), { required: true, minDays: 2 }).ok,
    ).toBe(false);
    expect(
      validateNeededBy(isoDateFromToday(3), { required: true, minDays: 2 }).ok,
    ).toBe(true);
  });
});
