import { describe, expect, it } from "vitest";
import { assertExtrasBody, parseStore } from "../../../worker/admin.js";

describe("parseStore", () => {
  it("treats an empty extras file as an empty shop store", () => {
    expect(parseStore("")).toEqual({ items: [], deletedSlugs: [] });
    expect(parseStore("   \n")).toEqual({ items: [], deletedSlugs: [] });
  });

  it("reads a valid extras payload", () => {
    expect(
      parseStore(
        JSON.stringify({
          items: [{ slug: "oreo-cheesecake" }],
          deletedSlugs: ["biscoff"],
        }),
      ),
    ).toEqual({
      items: [{ slug: "oreo-cheesecake" }],
      deletedSlugs: ["biscoff"],
    });
  });

  it("rejects a non-empty file that is not JSON", () => {
    expect(() => parseStore("<html>broken")).toThrow();
  });
});

describe("assertExtrasBody", () => {
  it("refuses a non-empty GitHub size with empty text", () => {
    expect(() => assertExtrasBody(1200, "")).toThrow(/empty/i);
    expect(() => assertExtrasBody(1200, "   ")).toThrow(/empty/i);
  });

  it("allows a truly empty file", () => {
    expect(() => assertExtrasBody(0, "")).not.toThrow();
  });
});
