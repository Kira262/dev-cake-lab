import { describe, expect, it } from "vitest";
import { getBag, getDraft, patchDraft, setBag } from "../../lib/session.js";

describe("session cache (mocked)", () => {
  it("stores bag rows in memory", () => {
    setBag([{ id: 3, qty: 2, notes: "less sweet" }]);
    expect(getBag()).toEqual([{ id: 3, qty: 2, notes: "less sweet" }]);
  });

  it("merges enquiry draft fields", () => {
    patchDraft({ name: "Pavan", phone: "9876543210" });
    expect(getDraft()).toMatchObject({
      name: "Pavan",
      phone: "9876543210",
    });
  });
});
