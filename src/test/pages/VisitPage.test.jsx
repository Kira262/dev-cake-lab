import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisitPage } from "../../pages/VisitPage.jsx";

describe("VisitPage", () => {
  it("embeds Google Maps with a sandbox", () => {
    const { container } = render(<VisitPage />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute("src")).toContain("https://maps.google.com/maps");
    expect(iframe.getAttribute("sandbox")).toContain("allow-scripts");
    expect(iframe.getAttribute("sandbox")).toContain("allow-same-origin");
  });
});
