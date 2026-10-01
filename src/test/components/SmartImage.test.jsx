import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SmartImage } from "../../components/SmartImage.jsx";

describe("SmartImage", () => {
  it("renders a plain img for data URLs", () => {
    const src = "data:image/jpeg;base64,abc";
    const { container } = render(<SmartImage src={src} alt="Walnut brownie" />);
    expect(container.querySelector("source")).toBeNull();
    const img = container.querySelector("img");
    expect(img.getAttribute("src")).toBe(src);
    expect(img.getAttribute("alt")).toBe("Walnut brownie");
  });

  it("renders a plain img for the logo and extra photos", () => {
    const { container, rerender } = render(
      <SmartImage src="/assets/dev-cake-logo.png" alt="Dev's Cake Lab" />,
    );
    expect(container.querySelector("source")).toBeNull();
    expect(container.querySelector("img").getAttribute("src")).toBe(
      "/assets/dev-cake-logo.png",
    );

    rerender(
      <SmartImage src="/assets/extra/walnut-brownie-hero-abc.jpg" alt="Walnut" />,
    );
    expect(container.querySelector("source")).toBeNull();
    expect(container.querySelector("img").getAttribute("src")).toBe(
      "/assets/extra/walnut-brownie-hero-abc.jpg",
    );
  });
});
