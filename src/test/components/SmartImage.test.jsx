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
});
