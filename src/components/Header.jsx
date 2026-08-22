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
  return (
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
      <nav>
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
        <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {menuOpen && (
        <div className="mobile-nav">
          {nav.map(([label, href]) => (
            <button
              key={label}
              className={isNavActive(label, route) ? "active" : ""}
              onClick={() => navigate(href)}
            >
              {label}
            </button>
          ))}
          <button onClick={openSearch}>Search desserts</button>
          <button onClick={() => navigate("/contact")}>Enquire</button>
        </div>
      )}
    </header>
  );
}
