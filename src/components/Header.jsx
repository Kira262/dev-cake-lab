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
    ["Visit", "/visit"],
    ["Contact", "/contact"],
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="header">
        <button
          className="wordmark"
          onClick={() => navigate("/")}
          aria-label="The Dev's Cake Lab home"
        >
          <img
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
          <button className="order-btn" onClick={() => navigate("/contact")}>
            Enquire <ArrowUpRight size={15} />
          </button>
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
        <button
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => navigate("/contact")}
        >
          Enquire
        </button>
      </nav>
    </>
  );
}
