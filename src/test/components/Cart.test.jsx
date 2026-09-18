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

  it("always offers WhatsApp, with today and a rounded time by default", () => {
    renderCart();
    const today = isoDateFromToday();
    const text = whatsappText();
    expect(text).toContain("401, P.D. Apartment");
    expect(text).toContain("https://maps.google.com/?q=");
    expect(
      screen.getByRole("link", { name: /open in google maps/i }).getAttribute("href"),
    ).toContain("https://maps.google.com/?q=");
    expect(screen.queryByRole("button", { name: /email instead/i })).toBeNull();
    expect(screen.queryByText(/401, P\.D\. Apartment/i)).toBeNull();
    expect(screen.queryByText(/change if you need another slot/i)).toBeNull();
    expect(text).toContain(`Needed: ${formatDisplayDate(today)}`);
    expect(text).not.toContain("Date to confirm — we can pick a time on WhatsApp.");
    expect(screen.getByLabelText(/^date$/i).value).toBe(today);
  });

  it("still opens WhatsApp for delivery with no address yet", async () => {
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole("radio", { name: /^delivery$/i }));

    const text = whatsappText();
    expect(text).toContain("Delivery: address to confirm.");
    expect(text).not.toContain("confirm delivery charges");
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
    expect(text).toContain("Delivery: Bodakdev, near ISRO");
    expect(text).not.toContain("confirm delivery charges");
  });
});
