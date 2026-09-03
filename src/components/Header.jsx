import { useEffect } from "react";
import {
  ArrowUpRight,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { asset } from "../lib/paths.js";
import { isNavActive } from "../lib/routes.js";
import { enquireWhatsAppUrl } from "../lib/enquiry.js";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scroll.js";
import { AssetImage } from "./AssetImage.jsx";

export function Header({
  navigate,
  route,
  count,
  openCart,
  openSearch,
  menuOpen,
  setMenuOpen,
}) {
  const nav = [
    ["Home", "/"],
    ["Shop", "/menu"],
    ["Custom cakes", "/custom"],
    ["Visit", "/visit"],
    ["Contact", "/contact"],
  ];

  useEffect(() => {
    if (!menuOpen) return undefined;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [menuOpen]);

  return (
    <>
      <header className="header">
        <button
          className="wordmark"
          onClick={() => navigate("/")}
          aria-label="The Dev's Cake Lab home"
        >
          <AssetImage
            className="wordmark-logo"
            src={asset("dev-cake-logo.png")}
            alt="The Dev's Cake Lab"
          />
        </button>
        <nav className="desktop-nav" aria-label="Primary">
          {nav.map(([label, href]) => (
            <button
              key={label}
              className={isNavActive(label, route) ? "active" : ""}
              onClick={() => navigate(href)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="header-tools">
          <button
            className="tool"
            aria-label="Search desserts"
            onClick={openSearch}
          >
            <Search size={17} />
          </button>
          <button
            className="tool bag"
            onClick={openCart}
            aria-label="Shopping bag"
          >
            <ShoppingBag size={17} />
            {count > 0 && <i>{count}</i>}
          </button>
          <a
            className="order-btn"
            href={enquireWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Enquire <ArrowUpRight size={15} />
          </a>
          <button
            className="mobile-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <button
        type="button"
        className={`mobile-nav-overlay ${menuOpen ? "open" : ""}`}
        aria-label="Close menu"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />
      <nav
        className={`mobile-nav ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
        aria-label="Menu"
      >
        <div className="mobile-nav-head">
          <AssetImage
            className="mobile-nav-logo"
            src={asset("dev-cake-logo.png")}
            alt=""
          />
          <button
            type="button"
            className="mobile-nav-close"
            aria-label="Close menu"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          >
            <X />
          </button>
        </div>
        {nav.map(([label, href]) => (
          <button
            key={label}
            className={isNavActive(label, route) ? "active" : ""}
            onClick={() => navigate(href)}
            tabIndex={menuOpen ? 0 : -1}
          >
            {label}
          </button>
        ))}
        <button tabIndex={menuOpen ? 0 : -1} onClick={openSearch}>
          Search desserts
        </button>
        <a
          href={enquireWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        >
          Enquire
        </a>
      </nav>
    </>
  );
}
