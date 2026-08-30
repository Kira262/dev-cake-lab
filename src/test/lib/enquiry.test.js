import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ENQUIRY_ENDPOINT,
  ENQUIRE_WHATSAPP_TEXT,
  buildEnquiryPayload,
  enquireWhatsAppUrl,
  enquiryWhatsAppText,
  submitEnquiry,
} from "../../lib/enquiry.js";
import { CONTACTS, mapsLink, pickupAddressText } from "../../data/contacts.js";

const values = {
  name: "Pavan",
  email: "you@example.com",
  phone: "+919876543210",
  topic: "Custom cake",
  message: "Saturday pickup",
};

describe("submitEnquiry", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts the enquiry to FormSubmit for the shop inbox", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: "true" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await submitEnquiry(values);

    expect(ENQUIRY_ENDPOINT).toContain(CONTACTS.email);
    expect(fetchMock).toHaveBeenCalledWith(
      ENQUIRY_ENDPOINT,
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject(buildEnquiryPayload(values));
    expect(body.phone).toBe("+919876543210");
    expect(body._replyto).toBe("you@example.com");
    expect(body.fulfilment).toBe("Pickup");
  });

  it("sends the delivery address when delivery is requested", () => {
    const body = buildEnquiryPayload({
      ...values,
      fulfilment: "delivery",
      address: "near CEPT",
      area: "Navrangpura",
    });
    expect(body.fulfilment).toBe("Delivery");
    expect(body.address).toBe("near CEPT");
    expect(body.area).toBe("Navrangpura");
    expect(body.location).toBe("");
  });

  it("sends the shop address and maps location for pickup", () => {
    const body = buildEnquiryPayload(values);
    expect(body.fulfilment).toBe("Pickup");
    expect(body.address).toBe(pickupAddressText());
    expect(body.location).toBe(mapsLink());
    expect(body.address).toContain("401, P.D. Apartment");
  });

  it("falls back to the shop inbox when email is blank", () => {
    const body = buildEnquiryPayload({ ...values, email: "" });
    expect(body.email).toBe("");
    expect(body._replyto).toBe(CONTACTS.email);
  });

  it("throws when FormSubmit reports failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: "false", message: "Not activated" }),
      }),
    );
    await expect(submitEnquiry(values)).rejects.toThrow(/not activated/i);
  });
});

describe("enquire WhatsApp", () => {
  it("opens a short hello without cart, address, or maps", () => {
    expect(ENQUIRE_WHATSAPP_TEXT).toContain(
      "Hi, I'd like to order from Dev's Cake Lab.",
    );
    expect(ENQUIRE_WHATSAPP_TEXT).toContain("I want:");
    expect(ENQUIRE_WHATSAPP_TEXT).toContain("For (date):");
    expect(ENQUIRE_WHATSAPP_TEXT).toContain("Pickup or delivery:");
    expect(ENQUIRE_WHATSAPP_TEXT).not.toContain("401");
    expect(ENQUIRE_WHATSAPP_TEXT).not.toContain("maps.google");
    expect(enquireWhatsAppUrl()).toContain("wa.me");
    expect(new URL(enquireWhatsAppUrl()).searchParams.get("text")).toBe(
      ENQUIRE_WHATSAPP_TEXT,
    );
  });
});

describe("enquiryWhatsAppText", () => {
  it("includes name and phone when they are filled in", () => {
    const text = enquiryWhatsAppText({
      name: "Pavan",
      phone: "+919876543210",
      topic: "Custom cake",
      message: "Saturday pickup",
    });
    expect(text).toContain("Hi, I'm Pavan.");
    expect(text).toContain("Phone: +919876543210");
    expect(text).toContain("Saturday pickup");
    expect(text).toContain("401, P.D. Apartment");
    expect(text).toContain(mapsLink());
  });

  it("opens a custom cake chat without a name", () => {
    const text = enquiryWhatsAppText({
      topic: "Custom cake",
      message: "Birthday, 12 slices, vanilla",
    });
    expect(text).toContain("Hi, I'd like a custom cake.");
    expect(text).toContain("Birthday, 12 slices, vanilla");
  });

  it("includes the delivery address for a quote", () => {
    const text = enquiryWhatsAppText({
      name: "Pavan",
      fulfilment: "delivery",
      area: "Bodakdev",
      address: "near ISRO",
      neededBy: "2026-08-28",
      time: "18:00",
      message: "Tonight",
    });
    expect(text).toContain("Address:\nnear ISRO");
    expect(text).toContain("Delivery requested to Bodakdev");
    expect(text).toContain("confirm delivery charges");
    expect(text).toContain("Needed by:");
    expect(text).toMatch(/6:00/i);
  });
});
