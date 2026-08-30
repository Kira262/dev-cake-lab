import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Cart } from "../../components/Cart.jsx";
import { lineTotal } from "../../lib/cart.js";
import { formatDisplayDate, formatDisplayTime, isoDateFromToday } from "../../lib/schedule.js";

const cart = [
  {
    lineId: "3::",
    name: "Biscoff Cheesecake",
    qty: 1,
    price: 350,
    notes: "",
  },
];

function renderCart() {
  return render(
    <Cart
      open
      setOpen={vi.fn()}
      cart={cart}
      total={lineTotal(cart[0])}
      changeQty={vi.fn()}
      navigate={vi.fn()}
      startOrder={vi.fn()}
    />,
  );
}

function whatsappText() {
  const href = screen
    .getByRole("link", { name: /order on whatsapp/i })
    .getAttribute("href");
  return new URL(href).searchParams.get("text");
}

describe("Cart fulfilment", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("always offers WhatsApp, with pickup and date to confirm by default", () => {
    renderCart();
    const text = whatsappText();
    expect(text).toContain("401, P.D. Apartment");
    expect(text).toContain("https://maps.google.com/?q=");
    expect(screen.getByText(/401, P\.D\. Apartment/i)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /open in google maps/i }).getAttribute("href"),
    ).toContain("https://maps.google.com/?q=");
    expect(
      screen.getByText(/tap send in whatsapp or we won't see the order/i),
    ).toBeTruthy();
    expect(text).toContain("Date to confirm — we can pick a time on WhatsApp.");
  });

  it("still opens WhatsApp for delivery with no address yet", async () => {
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole("radio", { name: /^delivery$/i }));

    const text = whatsappText();
    expect(text).toContain("Delivery requested.");
    expect(text).toContain("Address to confirm.");
    expect(text).toContain("confirm delivery charges");
  });

  it("puts the picked date and address into the WhatsApp text", async () => {
    const user = userEvent.setup();
    renderCart();
    const day = isoDateFromToday(2);

    fireEvent.change(screen.getByLabelText(/^date$/i), {
      target: { value: day },
    });
    fireEvent.change(screen.getByLabelText(/^hour$/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/^minute$/i), {
      target: { value: "30" },
    });
    await user.click(screen.getByRole("button", { name: /^pm$/i }));
    await user.click(screen.getByRole("radio", { name: /^delivery$/i }));
    await user.type(
      screen.getByRole("textbox", { name: /area \/ address/i }),
      "Bodakdev, near ISRO",
    );

    const text = whatsappText();
    expect(text).toContain(
      `Needed: ${formatDisplayDate(day)}, ${formatDisplayTime("16:30")}.`,
    );
    expect(text).toContain("Bodakdev, near ISRO");
    expect(text).toContain("confirm delivery charges");
  });
});
