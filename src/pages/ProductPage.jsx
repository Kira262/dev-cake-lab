import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { DIET_NOTE } from "../data/catalog.js";
import { MAX_LINE_QTY } from "../lib/cart.js";
import { NOTES_MAX } from "../lib/validate.js";

export function ProductPage({ product, add, navigate }) {
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const [photo, setPhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const linePrice = product.price * qty;

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
                onClick={() => setQty((n) => Math.min(MAX_LINE_QTY, n + 1))}
              >
                <Plus size={16} />
              </button>
            </div>
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
            <button
              className="primary"
              type="button"
              onClick={() => add(product, { qty, notes })}
            >
              Add to bag <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
