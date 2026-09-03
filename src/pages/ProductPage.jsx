import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { DIET_NOTE } from "../data/catalog.js";
import { MAX_LINE_QTY } from "../lib/cart.js";
import { scrollToTop } from "../lib/scroll.js";
import { NOTES_MAX } from "../lib/validate.js";

function QtyStepper({ value, onChange, label }) {
  return (
    <div className="qty product-qty">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus size={16} />
      </button>
      <span>{value}</span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(Math.min(MAX_LINE_QTY, value + 1))}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

export function flavourOrderNote(choice, vanillaQty, chocolateQty) {
  if (choice === "both") {
    return `Vanilla × ${vanillaQty}, Chocolate × ${chocolateQty}`;
  }
  if (choice === "chocolate") return "Chocolate";
  return "Vanilla";
}

export function ProductPage({ product, add, navigate }) {
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const flavoured = Boolean(product.flavours?.length);
  const [photo, setPhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [vanillaQty, setVanillaQty] = useState(1);
  const [chocolateQty, setChocolateQty] = useState(1);
  const [choice, setChoice] = useState("vanilla");
  const [notes, setNotes] = useState("");

  const pieces =
    flavoured && choice === "both" ? vanillaQty + chocolateQty : qty;
  const linePrice = product.price * pieces;

  useEffect(() => {
    setPhoto(0);
    setQty(1);
    setVanillaQty(1);
    setChocolateQty(1);
    setChoice("vanilla");
    setNotes("");
    scrollToTop();
  }, [product.slug, product.name]);

  const addToBag = () => {
    const flavour = flavoured
      ? flavourOrderNote(choice, vanillaQty, chocolateQty)
      : "";
    const extra = notes.trim();
    const combined = [flavour && `Flavour: ${flavour}`, extra]
      .filter(Boolean)
      .join("\n");
    add(product, { qty: pieces, notes: combined });
  };

  return (
    <main>
      <section className="wrap product-page">
        <button
          className="text-link back-link"
          onClick={() => navigate("/menu")}
        >
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
            <p className="diet-note">{DIET_NOTE}</p>
            <div className="price-note">
              <strong>₹{linePrice.toLocaleString("en-IN")}</strong>
              <span>
                ₹{product.price.toLocaleString("en-IN")}
                {product.unit ? ` / ${product.unit}` : ""} × {pieces}
              </span>
            </div>
            {flavoured && (
              <>
                <p className="product-field">Flavour</p>
                <div className="flavour-picks" role="group" aria-label="Flavour">
                  <button
                    type="button"
                    className={choice === "vanilla" ? "active" : ""}
                    onClick={() => {
                      setChoice("vanilla");
                      setQty(vanillaQty);
                    }}
                  >
                    Vanilla
                  </button>
                  <button
                    type="button"
                    className={choice === "chocolate" ? "active" : ""}
                    onClick={() => {
                      setChoice("chocolate");
                      setQty(chocolateQty);
                    }}
                  >
                    Chocolate
                  </button>
                  <button
                    type="button"
                    className={choice === "both" ? "active" : ""}
                    onClick={() => setChoice("both")}
                  >
                    Both
                  </button>
                </div>
              </>
            )}
            {flavoured && choice === "both" ? (
              <>
                <div className="flavour-qty-row">
                  <span>Vanilla</span>
                  <QtyStepper
                    label="vanilla quantity"
                    value={vanillaQty}
                    onChange={setVanillaQty}
                  />
                </div>
                <div className="flavour-qty-row">
                  <span>Chocolate</span>
                  <QtyStepper
                    label="chocolate quantity"
                    value={chocolateQty}
                    onChange={setChocolateQty}
                  />
                </div>
              </>
            ) : (
              <QtyStepper
                label="quantity"
                value={qty}
                onChange={(next) => {
                  setQty(next);
                  if (choice === "chocolate") setChocolateQty(next);
                  else setVanillaQty(next);
                }}
              />
            )}
            <label className="product-field">
              Flavour / packing notes
              <textarea
                rows="3"
                value={notes}
                maxLength={NOTES_MAX}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional — less sweet, extra packing, eggless..."
              />
            </label>
            <button className="primary" type="button" onClick={addToBag}>
              Add to bag <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
