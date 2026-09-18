import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductCard } from "../../components/ProductCard.jsx";

const product = {
  id: "1",
  slug: "biscoff-cheesecake",
  name: "Biscoff Cheesecake",
  note: "250 g",
  price: 350,
  image: "/assets/biscoff-cheesecake.jpg",
};

describe("ProductCard photos", () => {
  it("serves webp with a jpeg fallback and lazy-loads by default", () => {
    const { container, rerender } = render(
      <ProductCard product={product} add={vi.fn()} navigate={vi.fn()} />,
    );
    const img = container.querySelector("img");
    const source = container.querySelector("source");
    expect(source.getAttribute("type")).toBe("image/webp");
    expect(source.getAttribute("srcSet")).toBe("/assets/biscoff-cheesecake.webp");
    expect(img.getAttribute("src")).toBe(product.image);
    expect(img.getAttribute("loading")).toBe("lazy");

    rerender(
      <ProductCard product={product} add={vi.fn()} navigate={vi.fn()} priority />,
    );
    expect(container.querySelector("img").getAttribute("loading")).toBeNull();
    expect(container.querySelector("img").getAttribute("fetchpriority")).toBe(
      "high",
    );
  });
});
