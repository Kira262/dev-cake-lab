import { describe, expect, it } from "vitest";
import {
  normalizeAssetPath,
  parseJpegDataUrl,
  roundPrice,
  slugFromName,
  validatePublishBody,
} from "../../../worker/lib/validate.js";

describe("worker validatePublishBody", () => {
  const base = {
    name: "Walnut Brownie",
    type: "Brownies",
    price: 85,
    note: "100 g",
    image: "data:image/jpeg;base64,/9j/4AAQ",
    detailImage: "data:image/jpeg;base64,/9j/4AAQ",
  };

  it("rebuilds slug from name and rounds price", () => {
    const result = validatePublishBody({ ...base, slug: "ignored" });
    expect(result.ok).toBe(true);
    expect(result.value.slug).toBe(slugFromName("Walnut Brownie"));
    expect(result.value.price).toBe(85);
  });

  it("rejects invalid categories and prices", () => {
    expect(validatePublishBody({ ...base, type: "Custom Cakes" }).ok).toBe(false);
    expect(validatePublishBody({ ...base, price: 0 }).ok).toBe(false);
    expect(validatePublishBody({ ...base, price: 200000 }).ok).toBe(false);
  });
});

describe("roundPrice", () => {
  it("clamps to shop bounds", () => {
    expect(roundPrice(49.6)).toBe(50);
    expect(roundPrice(null)).toBeNull();
  });
});

describe("parseJpegDataUrl", () => {
  it("requires jpeg magic bytes", () => {
    const tiny = btoa(String.fromCharCode(0xff, 0xd8, 0xff, 0x00));
    expect(parseJpegDataUrl(`data:image/jpeg;base64,${tiny}`)).toBeTruthy();
    expect(parseJpegDataUrl("data:image/png;base64,abc")).toBeNull();
  });
});

describe("normalizeAssetPath", () => {
  it("keeps extra/ files and catalog filenames", () => {
    expect(normalizeAssetPath("assets/extra/walnut-hero-ab.jpg")).toBe(
      "assets/extra/walnut-hero-ab.jpg",
    );
    expect(normalizeAssetPath("/dev-cake-lab/assets/biscoff-cheesecake.jpg")).toBe(
      "assets/biscoff-cheesecake.jpg",
    );
    expect(normalizeAssetPath("https://evil.example/x.jpg")).toBeNull();
  });
});
