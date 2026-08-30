import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Cart } from "../../components/Cart.jsx";
import { lineTotal } from "../../lib/cart.js";
import { formatDisplayDate, isoDateFromToday } from "../../lib/schedule.js";

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
    expect(text).toContain("Pickup at Paldi, Ahmedabad");
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

    fireEvent.change(screen.getByLabelText(/when/i), {
      target: { value: day },
    });
    await user.click(screen.getByRole("radio", { name: /^delivery$/i }));
    await user.type(
      screen.getByRole("textbox", { name: /area \/ address/i }),
      "Bodakdev, near ISRO",
    );

    const text = whatsappText();
    expect(text).toContain(`Needed: ${formatDisplayDate(day)}.`);
    expect(text).toContain("Bodakdev, near ISRO");
    expect(text).toContain("confirm delivery charges");
  });
});
