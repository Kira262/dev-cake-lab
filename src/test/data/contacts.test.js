import { describe, expect, it } from "vitest";
import {
  CONTACTS,
  gmailComposeUrl,
  mapsEmbedSrc,
  mapsLink,
  pickupAddressText,
  whatsappOrderUrl,
} from "../../data/contacts.js";

describe("whatsappOrderUrl", () => {
  it("adds the order text to the shop WhatsApp number", () => {
    const href = whatsappOrderUrl("I'd like a cake");
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe("https://wa.me/919638241506");
    expect(url.searchParams.get("text")).toBe("I'd like a cake");
  });
});

describe("pickup address", () => {
  it("formats the shop name, unit, and maps URLs", () => {
    expect(pickupAddressText()).toContain("Dev's Cake Lab");
    expect(pickupAddressText()).toContain("401, P.D. Apartment");
    expect(pickupAddressText()).toContain("Ellisbridge, Ahmedabad, India 380006");
    expect(mapsLink()).toContain("https://maps.google.com/?q=");
    expect(mapsEmbedSrc()).toContain("https://maps.google.com/maps");
    expect(mapsEmbedSrc()).toContain("output=embed");
  });
});

describe("gmailComposeUrl", () => {
  it("still addresses the shop inbox for the sidebar email link", () => {
    const href = gmailComposeUrl({
      subject: "Hello",
      body: "Cake please",
    });
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe("https://mail.google.com/mail/");
    expect(url.searchParams.get("to")).toBe(CONTACTS.email);
  });
});
