import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryCarousel } from "../../components/CategoryCarousel.jsx";
import { categories } from "../../data/catalog.js";

function firstCard(container) {
  return container.querySelector(".category-card");
}

describe("CategoryCarousel", () => {
  it("repeats categories so the strip can loop", () => {
    render(<CategoryCarousel navigate={() => {}} />);
    expect(screen.getAllByText("Cheesecakes")).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: /cupcakes/i }).length).toBe(
      categories.length > 0 ? 3 : 0,
    );
  });

  it("draws every category with an inline icon, not a photo", () => {
    const { container } = render(<CategoryCarousel navigate={() => {}} />);
    expect(container.querySelectorAll(".category-icon svg").length).toBe(
      categories.length * 3,
    );
    expect(container.querySelector(".category-icon img")).toBeNull();
  });

  it("opens the category on a tap that does not move", () => {
    const navigate = vi.fn();
    const { container } = render(<CategoryCarousel navigate={navigate} />);
    const card = firstCard(container);

    fireEvent.pointerDown(card, { pointerId: 1, clientX: 120 });
    fireEvent.pointerUp(card, { pointerId: 1, clientX: 122 });

    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("scrolls instead of navigating when the finger drags", () => {
    const navigate = vi.fn();
    const { container } = render(<CategoryCarousel navigate={navigate} />);
    const card = firstCard(container);

    fireEvent.pointerDown(card, { pointerId: 1, clientX: 120 });
    fireEvent.pointerMove(card, { pointerId: 1, clientX: 90 });
    fireEvent.pointerMove(card, { pointerId: 1, clientX: 40 });
    fireEvent.pointerUp(card, { pointerId: 1, clientX: 40 });
    fireEvent.click(card);

    expect(navigate).not.toHaveBeenCalled();
  });

  it("never navigates when the browser cancels the gesture", () => {
    const navigate = vi.fn();
    const { container } = render(<CategoryCarousel navigate={navigate} />);
    const card = firstCard(container);

    fireEvent.pointerDown(card, { pointerId: 1, clientX: 120 });
    fireEvent.pointerCancel(card, { pointerId: 1, clientX: 120 });

    expect(navigate).not.toHaveBeenCalled();
  });
});
