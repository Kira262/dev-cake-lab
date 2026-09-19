import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ContactPage } from "../../pages/ContactPage.jsx";
import { CONTACTS } from "../../data/contacts.js";
import { lineTotal, orderMessage } from "../../lib/cart.js";
import { ENQUIRY_DRAFT_KEY } from "../../lib/draft.js";

const cart = [
  {
    name: "Biscoff Cheesecake",
    qty: 1,
    price: 350,
    notes: "",
  },
];

describe("ContactPage enquiry form", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("shows a WhatsApp enquiry control without a review dialog", () => {
    render(<ContactPage />);

    const link = screen.getByRole("link", { name: /whatsapp this enquiry/i });
    expect(link.getAttribute("href")).toContain("wa.me");
    expect(
      screen.getByText(/tap send in whatsapp or we won't see the order/i),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: CONTACTS.email }).getAttribute("href"),
    ).toBe(`mailto:${CONTACTS.email}`);
    expect(
      screen.getByRole("link", { name: CONTACTS.instagram }).getAttribute("href"),
    ).toBe(CONTACTS.instagramUrl);
    expect(screen.getByText(/email if you prefer not to chat/i)).toBeTruthy();
    expect(screen.queryByText(/401, P\.D\. Apartment/i)).toBeNull();
    expect(
      screen.queryByRole("link", { name: /open in google maps/i }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /email instead/i })).toBeNull();
    expect(screen.queryByRole("textbox", { name: /your name/i })).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("prefills the cart message and still offers WhatsApp", () => {
    const total = lineTotal(cart[0]);
    render(<ContactPage cart={cart} total={total} />);

    expect(
      screen.getByRole("textbox", { name: /tell us more/i }).value,
    ).toContain(orderMessage(cart, total).trim());
    expect(screen.getByText(/your bag/i)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /whatsapp this enquiry/i }),
    ).toBeTruthy();
  });

  it("refreshes the message when the bag changes", () => {
    const total = lineTotal(cart[0]);
    const { rerender } = render(<ContactPage cart={cart} total={total} />);
    const next = [
      {
        name: "Nutella Cheesecake",
        qty: 2,
        price: 270,
        notes: "",
      },
    ];
    const nextTotal = lineTotal(next[0]);
    rerender(<ContactPage cart={next} total={nextTotal} />);
    expect(
      screen.getByRole("textbox", { name: /tell us more/i }).value,
    ).toContain(orderMessage(next, nextTotal).trim());
  });

  it("does not block WhatsApp when the bag asked for delivery", () => {
    localStorage.setItem(
      ENQUIRY_DRAFT_KEY,
      JSON.stringify({
        fulfilment: "delivery",
        address: "",
        neededBy: "",
        neededTime: "",
      }),
    );
    render(<ContactPage />);
    const link = screen.getByRole("link", { name: /whatsapp this enquiry/i });
    expect(link.getAttribute("aria-disabled")).toBeNull();
    expect(link.getAttribute("href")).toContain("wa.me");
  });
});
