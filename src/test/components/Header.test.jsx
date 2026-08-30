import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "../../components/Header.jsx";
import { ENQUIRE_WHATSAPP_TEXT, enquireWhatsAppUrl } from "../../lib/enquiry.js";

describe("Header enquire", () => {
  it("opens WhatsApp with a short order starter, not the contact form", () => {
    render(
      <Header
        navigate={vi.fn()}
        route="/"
        count={0}
        openCart={vi.fn()}
        openSearch={vi.fn()}
        menuOpen={false}
        setMenuOpen={vi.fn()}
      />,
    );
    const href = screen.getByRole("link", { name: /enquire/i }).getAttribute("href");
    expect(href).toBe(enquireWhatsAppUrl());
    const text = new URL(href).searchParams.get("text");
    expect(text).toBe(ENQUIRE_WHATSAPP_TEXT);
    expect(text).toContain("Hi, I'd like to order from Dev's Cake Lab.");
    expect(text).toContain("For (date):");
    expect(text).toContain("Pickup or delivery:");
  });
});
