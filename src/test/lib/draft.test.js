import { describe, expect, it } from "vitest";
import { readEnquiryDraft, saveEnquiryDraft } from "../../lib/draft.js";

describe("enquiry draft persist", () => {
  it("merges fields into localStorage", () => {
    saveEnquiryDraft({ name: "Pavan", phone: "9876543210" });
    saveEnquiryDraft({ fulfilment: "delivery" });
    expect(readEnquiryDraft()).toMatchObject({
      name: "Pavan",
      phone: "9876543210",
      fulfilment: "delivery",
    });
  });
});
