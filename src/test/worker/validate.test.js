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

  it("keeps a valid slug and rounds price", () => {
    const result = validatePublishBody({ ...base, slug: "ganache-cookie-tin" });
    expect(result.ok).toBe(true);
    expect(result.value.slug).toBe("ganache-cookie-tin");
    expect(result.value.price).toBe(85);
  });

  it("builds a slug only when the request omits one", () => {
    const result = validatePublishBody(base);
    expect(result.ok).toBe(true);
    expect(result.value.slug).toBe(slugFromName("Walnut Brownie"));
  });

  it("rejects an invalid slug, id, unit, and art", () => {
    expect(validatePublishBody({ ...base, slug: "../x" }).ok).toBe(false);
    expect(validatePublishBody({ ...base, id: "nope" }).ok).toBe(false);
    expect(validatePublishBody({ ...base, id: 12 }).value.id).toBe(12);
    expect(validatePublishBody({ ...base, unit: "per piece" }).value.unit).toBe("per piece");
    expect(validatePublishBody({ ...base, unit: "kg" }).ok).toBe(false);
    expect(validatePublishBody({ ...base, art: "brownie" }).value.art).toBe("brownie");
    expect(validatePublishBody({ ...base, art: "script" }).ok).toBe(false);
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
