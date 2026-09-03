import { describe, expect, it } from "vitest";
import {
  customCakeBriefReady,
  formatCustomCakeBrief,
} from "../../lib/customCake.js";

describe("formatCustomCakeBrief", () => {
  it("writes a structured brief for WhatsApp", () => {
    const text = formatCustomCakeBrief({
      weightId: "1kg",
      shapeId: "tall",
      occasion: "Birthday",
      sponge: "Vanilla",
      flavour: "Chocolate ganache",
      design: "Pale pink roses",
      cakeMessage: "Happy birthday Aya",
      allergies: "Nut-free",
    });
    expect(text).toContain("Occasion: Birthday");
    expect(text).toContain("Weight: 1 kg");
    expect(text).toContain("Shape: Tall cake");
    expect(text).toContain("Sponge: Vanilla");
    expect(text).toContain("Flavour / filling: Chocolate ganache");
    expect(text).toContain("Pale pink roses");
    expect(text).toContain("Message on cake: Happy birthday Aya");
    expect(text).toContain("Nut-free");
    expect(text).toContain("quote on WhatsApp");
  });

  it("uses the custom weight text", () => {
    const text = formatCustomCakeBrief({
      weightId: "custom",
      customWeight: "3 kg",
      occasion: "Wedding",
    });
    expect(text).toContain("Weight: 3 kg");
  });
});

describe("customCakeBriefReady", () => {
  it("accepts occasion plus size, or free-text notes", () => {
    expect(
      customCakeBriefReady({
        weightId: "1kg",
        occasion: "Birthday",
      }),
    ).toBe(true);
    expect(
      customCakeBriefReady({
        design: "Birthday for 12, vanilla",
      }),
    ).toBe(true);
    expect(customCakeBriefReady({})).toBe(false);
  });
});
