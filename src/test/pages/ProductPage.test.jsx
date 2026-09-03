import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProductPage } from "../../pages/ProductPage.jsx";
import { NOTES_MAX } from "../../lib/validate.js";
import { MAX_LINE_QTY } from "../../lib/cart.js";

const product = {
  name: "Biscoff Cheesecake",
  type: "Cheesecakes",
  price: 350,
  note: "250–300 g",
  image: "/assets/biscoff-cheesecake.jpg",
  gallery: ["/assets/biscoff-cheesecake.jpg"],
};

describe("ProductPage caps", () => {
  it("has no icing message field and limits notes and quantity", async () => {
    const user = userEvent.setup({ delay: null });
    const add = vi.fn();
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<ProductPage product={product} add={add} navigate={vi.fn()} />);
    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    expect(screen.queryByLabelText(/message on cake/i)).toBeNull();
    expect(
      screen.getByLabelText(/flavour \/ packing notes/i).getAttribute("maxLength"),
    ).toBe(String(NOTES_MAX));
    expect(screen.getByText(/eggless and less-sweet/i)).toBeTruthy();

    const increase = screen.getByRole("button", { name: /increase quantity/i });
    for (let i = 0; i < MAX_LINE_QTY + 5; i += 1) {
      await user.click(increase);
    }
    expect(screen.getByText(`₹${product.price.toLocaleString("en-IN")} × ${MAX_LINE_QTY}`)).toBeTruthy();
    scrollTo.mockRestore();
  });

  it("lets you pick vanilla, chocolate, or both with quantities", async () => {
    const user = userEvent.setup({ delay: null });
    const add = vi.fn();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const cupcake = {
      ...product,
      name: "Cupcake — Vanilla or Chocolate",
      price: 50,
      flavours: ["Vanilla", "Chocolate"],
    };
    render(<ProductPage product={cupcake} add={add} navigate={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /^both$/i }));
    await user.click(screen.getByRole("button", { name: /increase vanilla quantity/i }));
    await user.click(screen.getByRole("button", { name: /increase chocolate quantity/i }));
    await user.click(screen.getByRole("button", { name: /add to bag/i }));

    expect(add).toHaveBeenCalledWith(
      cupcake,
      expect.objectContaining({
        qty: 4,
        notes: "Flavour: Vanilla × 2, Chocolate × 2",
      }),
    );
  });
});
