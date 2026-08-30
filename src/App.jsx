import React, { useEffect, useState } from "react";
import { Check, Heart } from "lucide-react";
import { products } from "./data/catalog.js";
import {
  makeLineId,
  lineTotal,
  clampQty,
  hydrateBag,
  readBag,
  saveBag,
} from "./lib/cart.js";
import { NOTES_MAX, clipText } from "./lib/validate.js";
import { toLocation } from "./lib/paths.js";
import { readMenuType, readPath, readProductSlug } from "./lib/routes.js";
import { Cart } from "./components/Cart.jsx";
import { Footer } from "./components/Footer.jsx";
import { Header } from "./components/Header.jsx";
import { ContactPage } from "./pages/ContactPage.jsx";
import { CustomCakePage } from "./pages/CustomCakePage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { MenuPage } from "./pages/MenuPage.jsx";
import { ProductPage } from "./pages/ProductPage.jsx";
import { VisitPage } from "./pages/VisitPage.jsx";

export default function App() {
  const [route, setRoute] = useState(readPath);
  const [menuType, setMenuType] = useState(readMenuType);
  const [cart, setCart] = useState(() => hydrateBag(readBag(), products));
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);
  const [orderTicket, setOrderTicket] = useState(0);
  const [toast, setToast] = useState(null);

  const syncFromLocation = () => {
    setRoute(readPath());
    setMenuType(readMenuType());
  };

  const navigate = (to, options = {}) => {
    window.history.pushState({}, "", toLocation(to));
    syncFromLocation();
    setMenuOpen(false);
    if (options.focusSearch) setFocusSearch(true);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onPop = () => syncFromLocation();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    saveBag(cart);
  }, [cart]);

  const add = (product, extras = {}) => {
    const qty = clampQty(extras.qty);
    const notes = clipText(extras.notes, NOTES_MAX);
    const lineId = makeLineId(product, { notes });
    setCart((items) => {
      const found = items.find((item) => item.lineId === lineId);
      return found
        ? items.map((item) =>
            item.lineId === lineId
              ? { ...item, qty: clampQty(item.qty + qty) }
              : item,
          )
        : [
            ...items,
            {
              ...product,
              lineId,
              qty,
              notes,
            },
          ];
    });
    setCartOpen(false);
    setToast({
      id: Date.now(),
      name: product.name,
      qty,
    });
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const changeQty = (lineId, delta) =>
    setCart((items) =>
      items.flatMap((item) => {
        if (item.lineId !== lineId) return [item];
        const next = item.qty + delta;
        if (next <= 0) return [];
        return [{ ...item, qty: clampQty(next) }];
      }),
    );
  const total = cart.reduce((sum, item) => sum + lineTotal(item), 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const productSlug = readProductSlug();
  const activeProduct = products.find((p) => p.slug === productSlug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route, productSlug]);

  const page =
    productSlug && activeProduct ? (
      <ProductPage product={activeProduct} add={add} navigate={navigate} />
    ) : route === "/menu" || (productSlug && !activeProduct) ? (
      <MenuPage
        add={add}
        query={query}
        setQuery={setQuery}
        filter={menuType}
        navigate={navigate}
        focusSearch={focusSearch}
        onSearchFocused={() => setFocusSearch(false)}
      />
    ) : route === "/contact" ? (
      <ContactPage
        cart={cart}
        total={total}
        orderTicket={orderTicket}
        navigate={navigate}
      />
    ) : route === "/custom" ? (
      <CustomCakePage />
    ) : route === "/visit" ? (
      <VisitPage />
    ) : (
      <HomePage navigate={navigate} add={add} />
    );

  return (
    <div className="app">
      <div className="announcement">
        HAND-FINISHED IN SMALL BATCHES <Heart size={13} fill="currentColor" />
      </div>
      <Header
        navigate={navigate}
        route={route}
        count={count}
        openCart={() => setCartOpen(true)}
        openSearch={() => navigate("/menu", { focusSearch: true })}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      {page}
      <Footer navigate={navigate} />
      <Cart
        open={cartOpen}
        setOpen={setCartOpen}
        cart={cart}
        total={total}
        changeQty={changeQty}
        navigate={navigate}
        startOrder={() => {
          setCartOpen(false);
          setOrderTicket((n) => n + 1);
          navigate("/contact");
        }}
      />
      {toast && (
        <div className="cart-toast" role="status" aria-live="polite">
          <Check size={18} strokeWidth={2.4} />
          <div>
            <strong>Added to cart</strong>
            <span>
              {toast.name}
              {toast.qty > 1 ? ` × ${toast.qty}` : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setToast(null);
              setCartOpen(true);
            }}
          >
            View bag
          </button>
        </div>
      )}
    </div>
  );
}
