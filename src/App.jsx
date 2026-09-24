import React, { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { products as catalogProducts } from "./data/catalog.js";
import {
  makeLineId,
  lineTotal,
  clampQty,
  hydrateBag,
  readBag,
  saveBag,
  serializeBag,
} from "./lib/cart.js";
import {
  bestSellersFrom,
  fetchExtraProducts,
  mergeCatalog,
  removeProduct,
  withSavedEdit,
} from "./lib/extraProducts.js";
import { NOTES_MAX, clipText } from "./lib/validate.js";
import { toLocation } from "./lib/paths.js";
import { readMenuType, readPath, readProductSlug } from "./lib/routes.js";
import { scrollToTop } from "./lib/scroll.js";
import { Cart } from "./components/Cart.jsx";
import { Footer } from "./components/Footer.jsx";
import { Header } from "./components/Header.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";
import { ContactPage } from "./pages/ContactPage.jsx";
import { CustomCakePage } from "./pages/CustomCakePage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { MenuPage } from "./pages/MenuPage.jsx";
import { ProductPage } from "./pages/ProductPage.jsx";
import { VisitPage } from "./pages/VisitPage.jsx";

export default function App() {
  const [route, setRoute] = useState(readPath);
  const [menuType, setMenuType] = useState(readMenuType);
  const [products, setProducts] = useState(null);
  const savedEdits = useRef(new Map());
  const savedDeletes = useRef(new Set());
  const [cart, setCart] = useState(() => hydrateBag(readBag(), catalogProducts));
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);
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
    scrollToTop();
  };

  useEffect(() => {
    const onPop = () => syncFromLocation();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    let alive = true;
    fetchExtraProducts().then((extras) => {
      if (!alive) return;
      const merged = withSavedEdit(
        catalogProducts,
        extras,
        [...savedEdits.current.values()],
        [...savedDeletes.current],
      );
      setProducts(merged);
      setCart((items) => hydrateBag(serializeBag(items), merged));
    });
    return () => {
      alive = false;
    };
  }, []);

  const applyPublished = (product) => {
    if (product?.slug) {
      savedDeletes.current.delete(product.slug);
      savedEdits.current.set(product.slug, product);
    }
    setProducts((current) => {
      const merged = mergeCatalog(current || catalogProducts, [product]);
      setCart((items) => hydrateBag(serializeBag(items), merged));
      return merged;
    });
  };

  const applyDeleted = (slug) => {
    savedEdits.current.delete(slug);
    savedDeletes.current.add(slug);
    setProducts((current) => {
      const next = removeProduct(current, slug);
      setCart((items) => hydrateBag(serializeBag(items), next));
      return next;
    });
  };

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
  const shop = products || [];
  const productSlug = readProductSlug();
  const activeProduct = shop.find((p) => p.slug === productSlug);

  useEffect(() => {
    scrollToTop();
  }, [route, productSlug]);

  const page = !products ? (
      <main id="main-content">
        <section className="page-hero wrap">
          <p>Loading the menu…</p>
        </section>
      </main>
    ) : productSlug && activeProduct ? (
      <ProductPage product={activeProduct} add={add} navigate={navigate} />
    ) : route === "/menu" || (productSlug && !activeProduct) ? (
      <MenuPage
        add={add}
        products={products}
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
        navigate={navigate}
      />
    ) : route === "/custom" ? (
      <CustomCakePage />
    ) : route === "/visit" ? (
      <VisitPage />
    ) : route === "/admin" ? (
      <AdminPage
        products={products}
        onPublished={applyPublished}
        onDeleted={applyDeleted}
      />
    ) : (
      <HomePage
        navigate={navigate}
        add={add}
        bestSellers={bestSellersFrom(shop)}
      />
    );

  return (
    <div className={route === "/admin" ? "app app-admin" : "app"}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
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
