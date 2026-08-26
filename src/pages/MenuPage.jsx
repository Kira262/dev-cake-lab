import { useMemo, useRef, useEffect } from "react";
import { ArrowRight, Search } from "lucide-react";
import { categoryNames, products } from "../data/catalog.js";
import { menuPath } from "../lib/routes.js";
import { ProductCard } from "../components/ProductCard.jsx";

export function MenuPage({
  add,
  query,
  setQuery,
  filter,
  navigate,
  focusSearch,
  onSearchFocused,
}) {
  const searchRef = useRef(null);
  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          (filter === "All" || p.type === filter) &&
          p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [filter, query],
  );
  const filters = ["All", ...categoryNames];

  useEffect(() => {
    if (!focusSearch || !searchRef.current) return;
    searchRef.current.focus();
    onSearchFocused?.();
  }, [focusSearch, onSearchFocused]);

  return (
    <main>
      <section className="page-hero wrap">
        <span className="kicker">THE FULL MENU</span>
        <h1>
          Made by hand.
          <br />
          <i>Meant to be shared.</i>
        </h1>
      </section>
      <section className="wrap section menu-section">
        <div className="menu-toolbar">
          <div className="chips">
            {filters.map((f) => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                onClick={() => navigate(menuPath(f))}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="searchbox">
            <Search size={16} />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search desserts"
            />
          </label>
        </div>
        {filter === "Custom Cakes" ? (
          <div className="empty-state custom-cake-cta">
            <h3>Custom cakes, made for your date</h3>
            <p>
              Give us 2–4 days. Tell us the occasion, flavour and size — we will
              sketch something worth celebrating.
            </p>
            <button className="primary" onClick={() => navigate("/custom")}>
              Start a custom cake brief <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <>
            <div className="products">
              {list.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  add={add}
                  navigate={navigate}
                />
              ))}
            </div>
            {list.length === 0 && (
              <div className="empty-state">No dessert matched that search.</div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
