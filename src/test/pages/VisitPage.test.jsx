import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mapsEmbedSrc } from "../../data/contacts.js";
import { VisitPage } from "../../pages/VisitPage.jsx";

describe("VisitPage", () => {
  it("embeds Google Maps with a sandbox", () => {
    const { container } = render(<VisitPage />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute("src")).toBe(mapsEmbedSrc());
    expect(screen.getByText(/401, P\.D\. Apartment/i)).toBeTruthy();
    expect(iframe.getAttribute("sandbox")).toContain("allow-scripts");
    expect(iframe.getAttribute("sandbox")).toContain("allow-same-origin");
  });
});
