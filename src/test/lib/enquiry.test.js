import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ENQUIRY_ENDPOINT,
  buildEnquiryPayload,
  enquiryWhatsAppText,
  submitEnquiry,
} from "../../lib/enquiry.js";
import { CONTACTS } from "../../data/contacts.js";

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
    expect(text).toContain("Pickup at Ellisbridge");
  });

  it("includes the delivery address for a quote", () => {
    const text = enquiryWhatsAppText({
      name: "Pavan",
      fulfilment: "delivery",
      area: "Bodakdev",
      address: "near ISRO",
      neededBy: "2026-08-28",
      slot: "Evening",
      message: "Tonight",
    });
    expect(text).toContain("Address:\nnear ISRO");
    expect(text).toContain("Delivery requested to Bodakdev");
    expect(text).toContain("confirm delivery charges");
    expect(text).toContain("Needed by:");
  });
});
