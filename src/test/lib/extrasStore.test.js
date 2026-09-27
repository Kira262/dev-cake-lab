import { describe, expect, it } from "vitest";
import { parseStore } from "../../../worker/admin.js";

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
