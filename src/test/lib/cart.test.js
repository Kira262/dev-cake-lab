import { describe, expect, it } from "vitest";
import { mapsLink } from "../../data/contacts.js";
import { clampQty, fulfilmentNote, hydrateBag, lineTotal, MAX_LINE_QTY, orderMessage } from "../../lib/cart.js";

describe("clampQty", () => {
  it("clamps negative, zero, and huge quantities to 1–20", () => {
    expect(clampQty(-5)).toBe(1);
    expect(clampQty(0)).toBe(1);
    expect(clampQty(99)).toBe(MAX_LINE_QTY);
    expect(clampQty(3)).toBe(3);
  });
});

describe("orderMessage", () => {
  it("prefills a cart checkout message with extras and subtotal", () => {
    const cart = [
      {
        name: "Biscoff Cheesecake",
        qty: 2,
        price: 350,
        notes: "less sweet",
      },
    ];
    const text = orderMessage(cart, lineTotal(cart[0]));
    expect(text).not.toContain("I'd like to order:");
    expect(text).toContain("Biscoff Cheesecake × 2");
    expect(text).not.toContain("message:");
    expect(text).toContain("(less sweet)");
    expect(text).not.toContain("notes:");
    expect(text).toContain("Total ₹700");
    expect(text).not.toContain("Subtotal:");
  });
});

describe("hydrateBag", () => {
  it("rebuilds bag lines from saved ids and current catalog prices", () => {
    const catalog = [{ id: 3, name: "Biscoff Cheesecake", price: 350 }];
    const bag = hydrateBag(
      [
        { id: 3, qty: 2, notes: "less sweet" },
        { id: 99, qty: 1, notes: "" },
      ],
      catalog,
    );
    expect(bag).toHaveLength(1);
    expect(bag[0]).toMatchObject({
      id: 3,
      qty: 2,
      notes: "less sweet",
      price: 350,
    });
  });
});

describe("fulfilmentNote", () => {
  it("asks the bakery to quote delivery for the given area", () => {
    const text = fulfilmentNote({
      fulfilment: "delivery",
      area: "Navrangpura",
      address: "near CEPT",
    });
    expect(text).toBe("Delivery: Navrangpura, near CEPT");
  });

  it("leaves address open when delivery details are missing", () => {
    const text = fulfilmentNote({ fulfilment: "delivery" });
    expect(text).toBe("Delivery: address to confirm.");
  });

  it("includes the shop address and maps link for pickup", () => {
    const text = fulfilmentNote({ fulfilment: "pickup" });
    expect(text).toContain("Pickup: Dev's Cake Lab");
    expect(text).toContain("401, P.D. Apartment, Opp Mira Madhav Flat, Ellisbridge");
    expect(text).not.toContain("Ahmedabad, India 380006");
    expect(text).toContain(mapsLink());
  });
});
