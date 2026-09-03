import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryCarousel } from "../../components/CategoryCarousel.jsx";
import { categories } from "../../data/catalog.js";

describe("CategoryCarousel", () => {
  it("repeats categories so the strip can loop", () => {
    render(<CategoryCarousel navigate={() => {}} />);
    expect(screen.getAllByText("Cheesecakes")).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: /cupcakes/i }).length).toBe(
      categories.length > 0 ? 3 : 0,
    );
  });
});
