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
    const links = screen.getAllByRole("link", { name: /enquire/i });
    expect(links.length).toBeGreaterThan(0);
    const hrefs = links.map((link) => link.getAttribute("href"));
    expect(hrefs.every((href) => href === enquireWhatsAppUrl())).toBe(true);
    const href = hrefs[0];
    const text = new URL(href).searchParams.get("text");
    expect(text).toBe(ENQUIRE_WHATSAPP_TEXT);
    expect(text).toContain("Hi, I'd like to order from Dev's Cake Lab.");
    expect(text).toContain("For (date):");
    expect(text).toContain("Pickup or delivery:");
  });
});

describe("Header mobile menu overlay", () => {
  const props = {
    navigate: vi.fn(),
    route: "/",
    count: 0,
    openCart: vi.fn(),
    openSearch: vi.fn(),
    setMenuOpen: vi.fn(),
  };

  it("keeps the overlay closed and inert until the menu opens", () => {
    const { container, rerender } = render(
      <Header {...props} menuOpen={false} />,
    );
    const overlay = container.querySelector(".mobile-nav-overlay");
    expect(overlay).toBeTruthy();
    expect(overlay.classList.contains("open")).toBe(false);
    expect(overlay.getAttribute("tabIndex")).toBe("-1");

    rerender(<Header {...props} menuOpen />);
    expect(overlay.classList.contains("open")).toBe(true);
    expect(overlay.getAttribute("tabIndex")).toBe("0");
  });
});

describe("Header shopping bag", () => {
  it("includes the item count in the accessible name", () => {
    render(
      <Header
        navigate={vi.fn()}
        route="/"
        count={3}
        openCart={vi.fn()}
        openSearch={vi.fn()}
        menuOpen={false}
        setMenuOpen={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Shopping bag, 3 items" }),
    ).toBeTruthy();
  });

  it("closes the menu when the bag opens", () => {
    const setMenuOpen = vi.fn();
    const openCart = vi.fn();
    render(
      <Header
        navigate={vi.fn()}
        route="/"
        count={1}
        openCart={openCart}
        openSearch={vi.fn()}
        menuOpen
        setMenuOpen={setMenuOpen}
      />,
    );
    screen.getByRole("button", { name: "Shopping bag, 1 items" }).click();
    expect(setMenuOpen).toHaveBeenCalledWith(false);
    expect(openCart).toHaveBeenCalled();
  });
});
