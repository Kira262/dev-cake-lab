import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisitPage } from "../../pages/VisitPage.jsx";

describe("VisitPage", () => {
  it("embeds Google Maps with a sandbox", () => {
    const { container } = render(<VisitPage />);
    const pin = container.querySelector(".visit-map-pin");
    const iframe = container.querySelector("iframe");
    expect(container.querySelector(".visit-pin")).toBeTruthy();
    expect(container.textContent).toContain(
      "41, Pritam Nagar Rd, Pritam Nagar, Paldi, Ahmedabad, Gujarat 380006",
    );
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute("src")).toContain("https://maps.google.com/maps");
    expect(iframe.getAttribute("src")).toContain("Pritam");
    expect(iframe.getAttribute("src")).toContain("z=17");
    expect(iframe.getAttribute("sandbox")).toContain("allow-scripts");
    expect(iframe.getAttribute("sandbox")).toContain("allow-same-origin");
  });
});
