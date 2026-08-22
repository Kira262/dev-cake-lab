import React, { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Mail,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const CONTACTS = {
  phoneDisplay: "+91 96382 41506",
  phoneTel: "+919638241506",
  email: "devscakelab@gmail.com",
  instagram: "DEVCAKELAB",
  instagramUrl: "https://www.instagram.com/devcakelab/",
  whatsappUrl: "https://wa.me/919638241506",
  addressName: "Dev's Cake Lab",
  addressLines: [
    "P.D. Apartment, Opp Mira Madhav Flat",
    "Ellisbridge, Ahmedabad, India 380006",
  ],
  mapsQuery:
    "P.D. Apartment, Opp Mira Madhav Flat, Ellisbridge, Ahmedabad, India 380006",
};

function asset(file) {
  return `${import.meta.env.BASE_URL}assets/${file}`;
}

function appPath() {
  let path = window.location.pathname || "/";
  if (BASE && (path === BASE || path.startsWith(`${BASE}/`))) {
    path = path.slice(BASE.length) || "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

function toLocation(to) {
  const url = new URL(to, window.location.origin);
  const prefixed = url.pathname === "/" ? `${BASE}/` : `${BASE}${url.pathname}`;
  return `${prefixed}${url.search}${url.hash}`;
}

const categories = [
  ["Cheesecakes", "Creamy layers, biscuit bases", "cake"],
  ["Cookie Tins", "300–400 g dessert tins", "cookie"],
  ["Cookies", "10–20 g per piece", "cookie"],
  ["Cake Bowls", "300–400 g layered bowls", "jar"],
  ["Cupcakes", "Classic to Biscoff swirls", "cupcake"],
  ["Custom Cakes", "Made for your celebration", "signature"],
];

const products = [
  {
    id: 1,
    name: "Caramel Cheesecake",
    type: "Cheesecakes",
    price: 260,
    note: "250–300 g · creamy caramel cheesecake",
    badge: "",
    art: "chocolate",
    image: asset("caramel-cheesecake.jpg"),
  },
  {
    id: 2,
    name: "Mix Berry Cheesecake",
    type: "Cheesecakes",
    price: 280,
    note: "250–300 g · berry cream cheesecake",
    badge: "",
    art: "jar",
    image: asset("mix-berry-cheesecake.jpg"),
  },
  {
    id: 3,
    name: "Biscoff Cheesecake",
    type: "Cheesecakes",
    price: 350,
    note: "250–300 g · Biscoff spread & biscuit base",
    badge: "BESTSELLER",
    art: "chocolate",
    image: asset("biscoff-cheesecake.jpg"),
  },
  {
    id: 4,
    name: "Ganache Cookie Tin",
    type: "Cookie Tins",
    price: 330,
    note: "300–400 g · assorted ganache cookies",
    badge: "",
    art: "cookie",
    image: asset("ganache-cookie-tin.jpg"),
  },
  {
    id: 5,
    name: "Nutella Cookies Tin",
    type: "Cookie Tins",
    price: 380,
    note: "300–400 g · Nutella-filled cookies",
    badge: "",
    art: "cookie",
    image: asset("nutella-cookie-tin.jpg"),
  },
  {
    id: 6,
    name: "Biscoff Cookies Tin",
    type: "Cookie Tins",
    price: 420,
    note: "300–400 g · Biscoff cookies",
    badge: "FAN FAVOURITE",
    art: "cookie",
    image: asset("biscoff-cookie-tin.jpg"),
  },
  {
    id: 7,
    name: "Nutella Cookies",
    type: "Cookies",
    price: 20,
    note: "10–20 g · per piece",
    badge: "",
    art: "cookie",
    image: asset("nutella-cookies.jpg"),
    unit: "per piece",
  },
  {
    id: 8,
    name: "Ganache Cake Bowl",
    type: "Cake Bowls",
    price: 200,
    note: "300–400 g · rich ganache cake bowl",
    badge: "",
    art: "jar",
    image: asset("ganache-cake-bowl.jpg"),
  },
  {
    id: 9,
    name: "Mix Berry Cake Bowl",
    type: "Cake Bowls",
    price: 250,
    note: "300–400 g · berry cake layers",
    badge: "",
    art: "jar",
    image: asset("mix-berry-cake-bowl.jpg"),
  },
  {
    id: 10,
    name: "Nutella Cake Bowl",
    type: "Cake Bowls",
    price: 300,
    note: "300–400 g · Nutella chocolate layers",
    badge: "",
    art: "chocolate",
    image: asset("nutella-cake-bowl.jpg"),
  },
  {
    id: 11,
    name: "Biscoff Cake Bowl",
    type: "Cake Bowls",
    price: 300,
    note: "300–400 g · Biscoff cake layers",
    badge: "SIGNATURE",
    art: "jar",
    image: asset("biscoff-cake-bowl.jpg"),
  },
  {
    id: 12,
    name: "Cupcake — Vanilla or Chocolate",
    type: "Cupcakes",
    price: 50,
    note: "Classic cupcake · vanilla or chocolate",
    badge: "",
    art: "cupcake",
    image: asset("cupcake-vanilla-chocolate.jpg"),
  },
  {
    id: 13,
    name: "Chocochip Cupcake",
    type: "Cupcakes",
    price: 60,
    note: "Chocolate chips · soft sponge",
    badge: "",
    art: "cupcake",
    image: asset("chocochip-cupcake.jpg"),
  },
  {
    id: 14,
    name: "Ganache Cupcake",
    type: "Cupcakes",
    price: 65,
    note: "Ganache topped · chocolate sponge",
    badge: "",
    art: "cupcake",
    image: asset("ganache-cupcake.jpg"),
  },
  {
    id: 15,
    name: "Nutella Cupcake",
    type: "Cupcakes",
    price: 70,
    note: "Nutella cream · chocolate sponge",
    badge: "",
    art: "cupcake",
    image: asset("nutella-cupcake.jpg"),
  },
  {
    id: 16,
    name: "Cookie Dough Cupcake",
    type: "Cupcakes",
    price: 75,
    note: "Cookie dough center · soft sponge",
    badge: "",
    art: "cupcake",
    image: asset("cookie-dough-cupcake.jpg"),
  },
  {
    id: 17,
    name: "Biscoff Cupcake",
    type: "Cupcakes",
    price: 80,
    note: "Biscoff cream · biscuit crumble",
    badge: "TOP PICK",
    art: "cupcake",
    image: asset("biscoff-cupcake.jpg"),
  },
].map((p) => {
  const file = p.image.split("/").pop();
  const stem = file.replace(/\.[^.]+$/, "");
  return {
    ...p,
    slug: stem,
    gallery: [p.image, asset(`${stem}-detail.jpg`)],
  };
});

const reviews = [
  [
    "The chocolate cake disappeared before the candles even cooled.",
    "Aarushi · Chandigarh",
  ],
  [
    "Elegant, rich and not overly sweet. Exactly what I wanted.",
    "Mehak · Ludhiana",
  ],
  [
    "The gift box looked gorgeous and every single dessert tasted fresh.",
    "Rohan · Delhi",
  ],
];

const categoryNames = categories.map((c) => c[0]);

function readPath() {
  return appPath();
}

function readMenuType() {
  const type = new URLSearchParams(window.location.search).get("type");
  if (!type || type === "All") return "All";
  return categoryNames.includes(type) ? type : "All";
}

function menuPath(type) {
  return !type || type === "All"
    ? "/menu"
    : `/menu?type=${encodeURIComponent(type)}`;
}

function productPath(slug) {
  return `/product/${slug}`;
}

function readProductSlug() {
  const path = appPath();
  const match = path.match(/^\/product\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function makeLineId(product, extras = {}) {
  const message = (extras.message || "").trim();
  const notes = (extras.notes || "").trim();
  return `${product.id}::${message}::${notes}`;
}

function lineTotal(item) {
  return item.price * item.qty;
}

function orderMessage(cart, total) {
  if (!cart.length) return "";
  const lines = cart.map((item) => {
    const extras = [
      item.message && `message: ${item.message}`,
      item.notes && `notes: ${item.notes}`,
    ].filter(Boolean);
    const extra = extras.length ? ` (${extras.join("; ")})` : "";
    return `• ${item.name} × ${item.qty}${extra} — ₹${lineTotal(item).toLocaleString("en-IN")}`;
  });
  return `I'd like to order:\n${lines.join("\n")}\n\nSubtotal: ₹${total.toLocaleString("en-IN")}\n\n`;
}

export default function App() {
  const [route, setRoute] = useState(readPath);
  const [menuType, setMenuType] = useState(readMenuType);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);
  const [orderTicket, setOrderTicket] = useState(0);

  const syncFromLocation = () => {
    setRoute(readPath());
    setMenuType(readMenuType());
  };

  const navigate = (to, options = {}) => {
    window.history.pushState({}, "", toLocation(to));
    syncFromLocation();
    setMenuOpen(false);
    if (options.focusSearch) setFocusSearch(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  React.useEffect(() => {
    const onPop = () => syncFromLocation();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const add = (product, extras = {}) => {
    const qty = extras.qty || 1;
    const lineId = makeLineId(product, extras);
    setCart((items) => {
      const found = items.find((item) => item.lineId === lineId);
      return found
        ? items.map((item) =>
            item.lineId === lineId
              ? { ...item, qty: item.qty + qty }
              : item,
          )
        : [
            ...items,
            {
              ...product,
              lineId,
              qty,
              message: (extras.message || "").trim(),
              notes: (extras.notes || "").trim(),
            },
          ];
    });
    setCartOpen(true);
  };
  const changeQty = (lineId, delta) =>
    setCart((items) =>
      items.flatMap((item) =>
        item.lineId === lineId
          ? [{ ...item, qty: item.qty + delta }].filter((x) => x.qty > 0)
          : [item],
      ),
    );
  const total = cart.reduce((sum, item) => sum + lineTotal(item), 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const productSlug = readProductSlug();
  const activeProduct = products.find((p) => p.slug === productSlug);

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
      <ContactPage cart={cart} total={total} orderTicket={orderTicket} />
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
        menuType={menuType}
        productType={activeProduct?.type}
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
    </div>
  );
}

function isNavActive(label, route, menuType, productType) {
  if (label === "Cakes") {
    if (route.startsWith("/product/")) return productType === "Cheesecakes";
    return route === "/menu" && menuType === "Cheesecakes";
  }
  if (label === "Shop") {
    if (route.startsWith("/product/"))
      return Boolean(productType) && productType !== "Cheesecakes";
    return route === "/menu" && menuType !== "Cheesecakes";
  }
  if (label === "Visit") return route === "/visit";
  if (label === "Contact") return route === "/contact";
  return false;
}

function Header({
  navigate,
  route,
  menuType,
  productType,
  count,
  openCart,
  openSearch,
  menuOpen,
  setMenuOpen,
}) {
  const nav = [
    ["Shop", "/menu"],
    ["Cakes", menuPath("Cheesecakes")],
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
            className={
              isNavActive(label, route, menuType, productType) ? "active" : ""
            }
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
        <button className="order-btn" onClick={() => navigate("/menu")}>
          Order Online <ArrowUpRight size={15} />
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
              className={
                isNavActive(label, route, menuType, productType) ? "active" : ""
              }
              onClick={() => navigate(href)}
            >
              {label}
            </button>
          ))}
          <button onClick={openSearch}>Search desserts</button>
        </div>
      )}
    </header>
  );
}

function HomePage({ navigate, add }) {
  return (
    <main>
      <section className="hero wrap">
        <div className="hero-copy">
          <span className="kicker">ARTISAN DESSERTS · DEV'S CAKE LAB</span>
          <h1>
            Baked with
            <br />
            <i>obsession.</i>
          </h1>
          <p>
            Layered cakes, indulgent brownies, elegant desserts and little
            treats made with real butter, good chocolate and a ridiculous amount
            of care.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => navigate("/menu")}>
              Explore the menu <ArrowRight size={17} />
            </button>
            <button className="secondary" onClick={() => navigate("/contact")}>
              Custom cakes
            </button>
          </div>
          <div className="hero-proof">
            <span>CRAFTED.</span>
            <span>TESTED.</span>
            <span>PERFECTED.</span>
          </div>
        </div>
        <CatHero />
      </section>

      <section className="category-band">
        <div className="wrap">
          <div className="section-intro center">
            <span className="kicker">SOMETHING FOR EVERY SWEET TOOTH</span>
            <h2>Shop by category</h2>
            <p>
              From celebration cakes to a box of brownies you definitely did not
              need.
            </p>
          </div>
          <CategoryCarousel navigate={navigate} />
        </div>
      </section>

      <section className="wrap section">
        <div className="section-heading">
          <div>
            <span className="kicker">THE FAVOURITES</span>
            <h2>Best sellers</h2>
            <p>The things people come back for.</p>
          </div>
          <button className="text-link" onClick={() => navigate("/menu")}>
            View all treats <ArrowRight size={16} />
          </button>
        </div>
        <div className="products">
          {products.slice(0, 4).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              add={add}
              navigate={navigate}
            />
          ))}
        </div>
      </section>

      <section className="manifesto">
        <div className="wrap manifesto-grid">
          <div>
            <span className="kicker">WHY DEV'S?</span>
            <h2>
              Small-batch. Handmade.
              <br />
              <i>Worth remembering.</i>
            </h2>
          </div>
          <div className="manifesto-points">
            <div>
              <b>01</b>
              <span>Real ingredients</span>
              <p>Butter, cream, chocolate and fruit. No shortcuts.</p>
            </div>
            <div>
              <b>02</b>
              <span>Made to order</span>
              <p>
                Fresh batches with the care of a home kitchen and the finish of
                a pastry studio.
              </p>
            </div>
            <div>
              <b>03</b>
              <span>Beautifully yours</span>
              <p>Custom flavours, colours and cakes for your celebration.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="feature wrap">
        <div className="feature-art photo-feature">
          <img src={asset("biscoff-cheesecake.jpg")} alt="Biscoff cheesecake" />
          <span className="stamp">
            SIGNATURE
            <br />
            CHEESECAKE
          </span>
        </div>
        <div className="feature-copy">
          <span className="kicker">THE DEV SIGNATURE</span>
          <h2>Biscoff Cheesecake</h2>
          <p>
            Creamy. Crunchy. Irresistible. A biscuit base, smooth cheesecake,
            Biscoff spread and a generous crumble on top.
          </p>
          <div className="price-note">
            <strong>₹350</strong>
            <span>250–300 g</span>
          </div>
          <button className="primary" onClick={() => navigate("/menu")}>
            Order this favourite <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <section className="reviews">
        <div className="wrap">
          <div className="section-intro center">
            <span className="kicker">LOVED BY SWEET TOOTHS</span>
            <h2>Kind words</h2>
          </div>
          <div className="review-grid">
            {reviews.map(([quote, by]) => (
              <article key={by}>
                <div className="stars">★★★★★</div>
                <p>“{quote}”</p>
                <small>{by}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FAQ />
    </main>
  );
}

function CatHero() {
  return (
    <div className="cat-hero-shell">
      <div className="cat-hero">
        <div className="paper-sun" />
        <div className="cat-scene">
          <div className="cat-ear left" />
          <div className="cat-ear right" />
          <div className="cat-head">
            <span className="cat-eye one" />
            <span className="cat-eye two" />
            <span className="cat-nose" />
            <span className="cat-mouth" />
          </div>
          <div className="cat-body" />
          <div className="cat-tail" />
          <div className="chef-hat">
            <i />
            <i />
            <i />
          </div>
          <div className="apron">
            DEV'S
            <br />
            <small>CAKE LAB</small>
          </div>
        </div>
        <div className="cake-crumbs">✦ · ✦ · ✦</div>
      </div>
      <div className="hero-note">A LITTLE CAT. A LOT OF CAKE.</div>
    </div>
  );
}

function CategoryCarousel({ navigate }) {
  const scroller = useRef(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  const onPointerDown = (e) => {
    if (!scroller.current) return;
    drag.current = {
      down: true,
      startX: e.clientX,
      startScroll: scroller.current.scrollLeft,
      moved: false,
    };
    scroller.current.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current.down || !scroller.current) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 5) drag.current.moved = true;
    scroller.current.scrollLeft = drag.current.startScroll - dx;
  };
  const onPointerUp = (e) => {
    drag.current.down = false;
    scroller.current?.releasePointerCapture?.(e.pointerId);
  };
  const onCategoryClick = (e, title) => {
    if (drag.current.moved) {
      e.preventDefault();
      drag.current.moved = false;
      return;
    }
    if (title === "Custom Cakes") navigate("/contact");
    else navigate(menuPath(title));
  };

  return (
    <div className="category-drag-shell">
      <div
        ref={scroller}
        className="category-grid category-drag"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {categories.map(([title, caption, art]) => (
          <button
            key={title}
            className={`category-card ${art}`}
            onClick={(e) => onCategoryClick(e, title)}
          >
            <DessertArt type={art} />
            <b>{title}</b>
            <small>{caption}</small>
            <ArrowUpRight size={15} />
          </button>
        ))}
      </div>
      <div className="drag-hint">
        <span>←</span> Click & drag to explore <span>→</span>
      </div>
    </div>
  );
}

function DessertArt({ type, large }) {
  return (
    <div className={`dessert-art art-${type} ${large ? "large" : ""}`}>
      <div className="art-shadow" />
      <div className="art-main" />
      <div className="art-icing" />
      <div className="art-detail one" />
      <div className="art-detail two" />
      <div className="art-detail three" />
    </div>
  );
}

function ProductCard({ product, add, navigate }) {
  const open = () => navigate(productPath(product.slug));
  return (
    <article className="product-card">
      <div className="product-visual">
        <button className="product-hit" type="button" onClick={open}>
          {product.image ? (
            <img
              className="product-photo"
              src={product.image}
              alt={product.name}
            />
          ) : (
            <DessertArt type={product.art} />
          )}
        </button>
        {product.badge && <span className="badge">{product.badge}</span>}
        <button
          className="quick-add"
          type="button"
          onClick={() => add(product)}
        >
          + Add
        </button>
      </div>
      <button className="product-meta-btn" type="button" onClick={open}>
        <div className="product-meta">
          <div>
            <h3>{product.name}</h3>
            <p>{product.note}</p>
          </div>
          <strong>
            ₹{product.price.toLocaleString("en-IN")}
            {product.unit ? ` / ${product.unit}` : ""}
          </strong>
        </div>
      </button>
      <div className="rating">
        <Star size={13} fill="currentColor" /> Dev's Cake Lab
      </div>
    </article>
  );
}

function ProductPage({ product, add, navigate }) {
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const [photo, setPhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");
  const linePrice = product.price * qty;

  return (
    <main>
      <section className="wrap product-page">
        <button className="text-link back-link" onClick={() => navigate("/menu")}>
          ← Back to menu
        </button>
        <div className="product-page-grid">
          <div className="product-gallery">
            <div className="product-gallery-main">
              <img src={gallery[photo]} alt={product.name} />
              {product.badge && <span className="badge">{product.badge}</span>}
            </div>
            {gallery.length > 1 && (
              <div className="product-thumbs">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className={i === photo ? "active" : ""}
                    onClick={() => setPhoto(i)}
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="product-detail">
            <span className="kicker">{product.type}</span>
            <h1>{product.name}</h1>
            <p>{product.note}</p>
            <div className="price-note">
              <strong>₹{linePrice.toLocaleString("en-IN")}</strong>
              <span>
                ₹{product.price.toLocaleString("en-IN")}
                {product.unit ? ` / ${product.unit}` : ""} × {qty}
              </span>
            </div>
            <div className="qty product-qty">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((n) => Math.max(1, n - 1))}
              >
                <Minus size={16} />
              </button>
              <span>{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((n) => n + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
            <label className="product-field">
              Message on cake
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional — happy birthday, names..."
              />
            </label>
            <label className="product-field">
              Flavour / packing notes
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional — less sweet, extra packing..."
              />
            </label>
            <button
              className="primary"
              type="button"
              onClick={() => add(product, { qty, message, notes })}
            >
              Add to bag <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function MenuPage({
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

  React.useEffect(() => {
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
        <p>
          Every item below matches the current Dev's Cake Lab menu, including
          weights and listed prices.
        </p>
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
              Tell us the occasion, flavour and size — we will sketch something
              worth celebrating.
            </p>
            <button className="primary" onClick={() => navigate("/contact")}>
              Start a custom cake enquiry <ArrowRight size={17} />
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

function FAQ() {
  const questions = [
    "How far ahead should I order a custom cake?",
    "Do you offer eggless or less-sweet options?",
    "How do I store my cake or desserts?",
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="wrap faq section">
      <div>
        <span className="kicker">QUESTIONS, ANSWERED</span>
        <h2>Frequently asked</h2>
        <p>Everything you need before placing an order.</p>
      </div>
      <div>
        {questions.map((q, i) => (
          <button
            key={q}
            className="faq-row"
            onClick={() => setOpen(open === i ? -1 : i)}
          >
            <span>{q}</span>
            {open === i ? <Minus size={16} /> : <Plus size={16} />}{" "}
            {open === i && (
              <small>
                {i === 0
                  ? "For custom cakes, 2–4 days is ideal. Rush orders depend on availability."
                  : i === 1
                    ? "Yes. Message us with your preference and we will suggest suitable flavours."
                    : "Most cakes should be refrigerated and brought to room temperature before serving."}
              </small>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function VisitPage() {
  const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(CONTACTS.mapsQuery)}&z=15&output=embed`;
  const mapsLink = `https://maps.google.com/?q=${encodeURIComponent(CONTACTS.mapsQuery)}`;

  return (
    <main>
      <section className="page-hero wrap">
        <span className="kicker">COME SAY HELLO</span>
        <h1>
          Visit the
          <br />
          <i>cake lab.</i>
        </h1>
        <p>
          Pick up a cake, stay for dessert, leave with something for tomorrow.
        </p>
      </section>
      <section className="wrap visit">
        <div className="visit-card">
          <MapPin size={21} />
          <h2>Find us</h2>
          <p>
            {CONTACTS.addressName}
            {CONTACTS.addressLines.map((line) => (
              <React.Fragment key={line}>
                <br />
                {line}
              </React.Fragment>
            ))}
          </p>
          <div className="hours">
            <b>Mon–Sat</b>
            <span>10:00 AM — 8:00 PM</span>
            <b>Sunday</b>
            <span>11:00 AM — 6:00 PM</span>
          </div>
          <a
            className="maps-link"
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
        <div className="visit-card map">
          <iframe
            title="Dev's Cake Lab at P.D. Apartment, Ellisbridge, Ahmedabad"
            src={mapsEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <p>
            Pickup, custom cake consultations and dessert gifting are available
            here.
          </p>
        </div>
      </section>
    </main>
  );
}
function ContactPage({ cart = [], total = 0, orderTicket = 0 }) {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState(() => orderMessage(cart, total));

  React.useEffect(() => {
    setMessage(orderMessage(cart, total));
  }, [orderTicket]);

  return (
    <main>
      <section className="page-hero wrap">
        <span className="kicker">GET IN TOUCH</span>
        <h1>
          Let's make
          <br />
          <i>something sweet.</i>
        </h1>
        <p>Custom cakes, flavour enquiries and collaborations.</p>
      </section>
      <section className="wrap contact">
        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <label>
            Your name
            <input required placeholder="Dev's favourite human" />
          </label>
          <label>
            Email
            <input required type="email" placeholder="you@example.com" />
          </label>
          <label>
            What can we make?
            <select defaultValue={cart.length ? "Menu order" : "Custom cake"}>
              {cart.length > 0 && <option>Menu order</option>}
              <option>Custom cake</option>
              <option>Collaboration</option>
            </select>
          </label>
          <label>
            Tell us more
            <textarea
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Date, flavour, size, budget, occasion..."
            ></textarea>
          </label>
          {cart.length > 0 && (
            <p className="form-success">
              Your bag ({cart.reduce((sum, item) => sum + item.qty, 0)} items ·
              ₹{total.toLocaleString("en-IN")}) is included in this enquiry.
            </p>
          )}
          <button className="primary" type="submit">
            Send enquiry <ArrowRight size={17} />
          </button>
          {sent && (
            <p className="form-success">
              Thanks. Your enquiry is ready for the next step.
            </p>
          )}
        </form>
        <aside>
          <div>
            <Phone size={18} />
            <h3>Call</h3>
            <p>
              <a href={`tel:${CONTACTS.phoneTel}`}>{CONTACTS.phoneDisplay}</a>
            </p>
          </div>
          <div>
            <Mail size={18} />
            <h3>Email</h3>
            <p>
              <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
            </p>
          </div>
          <div>
            <span className="social-icon">◎</span>
            <h3>Instagram</h3>
            <p>
              <a
                href={CONTACTS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {CONTACTS.instagram}
              </a>
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Footer({ navigate }) {
  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <button
            className="wordmark footer-mark"
            onClick={() => navigate("/")}
            aria-label="The Dev's Cake Lab home"
          >
            <img
              className="wordmark-logo"
              src={asset("dev-cake-logo.png")}
              alt="The Dev's Cake Lab"
            />
          </button>
          <p>Crafted, tested and perfected in small batches.</p>
        </div>
        <div>
          <h4>EXPLORE</h4>
          <button onClick={() => navigate("/menu")}>Menu</button>
          <button onClick={() => navigate("/visit")}>Visit</button>
        </div>
        <div>
          <h4>ORDERS</h4>
          <button onClick={() => navigate("/contact")}>Custom cakes</button>
          <button onClick={() => navigate("/contact")}>Contact</button>
        </div>
        <div>
          <h4>FOLLOW</h4>
          <a
            href={CONTACTS.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>

          <a
            href={CONTACTS.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© 2026 Dev's Cake Lab</span>
        <span>Crafted. Tested. Perfected.</span>
      </div>
    </footer>
  );
}

function Cart({ open, setOpen, cart, total, changeQty, navigate, startOrder }) {
  return (
    <>
      {open && <div className="overlay" onClick={() => setOpen(false)} />}
      <aside className={`cart ${open ? "open" : ""}`}>
        <div className="cart-head">
          <div>
            <span className="kicker">YOUR ORDER</span>
            <h2>Sweet things</h2>
          </div>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        {cart.length ? (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.lineId}>
                  <div className="cart-art">
                    {item.image ? (
                      <img src={item.image} alt="" />
                    ) : (
                      <DessertArt type={item.art} />
                    )}
                  </div>
                  <div>
                    <b>{item.name}</b>
                    <small>
                      ₹{item.price.toLocaleString("en-IN")}
                      {item.message ? ` · “${item.message}”` : ""}
                      {item.notes ? ` · ${item.notes}` : ""}
                    </small>
                    <div className="qty">
                      <button onClick={() => changeQty(item.lineId, -1)}>
                        <Minus size={13} />
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => changeQty(item.lineId, 1)}>
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove"
                    onClick={() => changeQty(item.lineId, -item.qty)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-foot">
              <div>
                <span>Subtotal</span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>
              <p>Delivery calculated at checkout.</p>
              <button className="primary" onClick={startOrder}>
                Continue to order <ArrowRight size={17} />
              </button>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <div className="empty-cookie">♡</div>
            <h3>Your bag is waiting.</h3>
            <p>Add a cake. Add a brownie. Add a reason.</p>
            <button
              className="secondary"
              onClick={() => {
                setOpen(false);
                navigate("/menu");
              }}
            >
              Shop desserts
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
