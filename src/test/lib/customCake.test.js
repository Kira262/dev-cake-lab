import { describe, expect, it } from "vitest";
import { formatDisplayDate, formatDisplayTime } from "../../lib/schedule.js";
import {
  customCakeBriefReady,
  customCakeWhatsAppText,
  formatCustomCakeBrief,
} from "../../lib/customCake.js";

describe("formatCustomCakeBrief", () => {
  it("writes a structured brief for WhatsApp", () => {
    const text = formatCustomCakeBrief({
      weightId: "1kg",
      shapeId: "tall",
      occasion: "Birthday",
      sponge: "Vanilla",
      flavour: "Chocolate ganache (dark)",
      design: "Pale pink roses",
      cakeMessage: "Happy birthday Aya",
      allergies: "Nut-free",
    });
    expect(text).toContain("Occasion: Birthday");
    expect(text).toContain("Weight: 1 kg");
    expect(text).toContain("Shape: Tall cake");
    expect(text).toContain("Sponge: Vanilla");
    expect(text).toContain("Flavour / filling: Chocolate ganache (dark)");
    expect(text).toContain("Pale pink roses");
    expect(text).toContain("Message on cake: Happy birthday Aya");
    expect(text).toContain("Nut-free");
    expect(text).not.toContain("quote on WhatsApp");
    expect(text).not.toMatch(/\n\nMessage on cake:/);
    expect(text).not.toMatch(/\n\nAllergies /);
  });

  it("uses the custom flavour text", () => {
    const text = formatCustomCakeBrief({
      flavour: "Custom",
      customFlavour: "pistachio rose",
    });
    expect(text).toContain("Flavour / filling: pistachio rose");
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

describe("customCakeWhatsAppText", () => {
  it("writes a short pickup draft without topic, lead time, or maps", () => {
    const text = customCakeWhatsAppText({
      neededBy: "2026-09-23",
      neededTime: "18:30",
      weightId: "2kg",
      shapeId: "tall",
      occasion: "Anniversary",
      sponge: "Red velvet",
      flavour: "Chocolate ganache (white)",
      design: "Pale pink roses, gold leaf",
      cakeMessage: "Happy anniversary",
      allergies: "Nut-free",
    });
    const when = `${formatDisplayDate("2026-09-23")}, ${formatDisplayTime("18:30")}`;
    expect(text).toBe(
      [
        "Hi, I'd like a custom cake.",
        `Needed by: ${when}.`,
        "Occasion: Anniversary",
        "Weight: 2 kg",
        "Shape: Tall cake",
        "Sponge: Red velvet",
        "Flavour / filling: Chocolate ganache (white)",
        "",
        "Design:",
        "Pale pink roses, gold leaf",
        "Message on cake: Happy anniversary",
        "Allergies / special requests: Nut-free",
        "Pickup: Dev's Cake Lab",
        "",
        "Please quote on WhatsApp. After we finalise, I'll pay 50% advance. I'll send reference photos in this chat.",
      ].join("\n"),
    );
    expect(text).not.toContain("Topic:");
    expect(text).not.toContain("2–4 days");
    expect(text).not.toContain("401");
    expect(text).not.toContain("maps.google");
  });

  it("uses a compact delivery line in the same spot as pickup", () => {
    const text = customCakeWhatsAppText({
      neededBy: "2026-09-23",
      neededTime: "18:30",
      occasion: "Anniversary",
      weightId: "2kg",
      fulfilment: "delivery",
      area: "Bodakdev",
      address: "near ISRO",
    });
    expect(text).toContain("Delivery: Bodakdev, near ISRO");
    expect(text).not.toContain("Pickup:");
    expect(text).not.toContain("401");
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
