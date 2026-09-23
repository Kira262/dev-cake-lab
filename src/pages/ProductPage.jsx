import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { DIET_NOTE } from "../data/catalog.js";
import { MAX_LINE_QTY } from "../lib/cart.js";
import { scrollToTop } from "../lib/scroll.js";
import { NOTES_MAX } from "../lib/validate.js";
import { DessertArt } from "../components/DessertArt.jsx";
import { SmartImage } from "../components/SmartImage.jsx";

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

export function flavourOrderNote(flavours, choice, firstQty, secondQty) {
  const first = flavours[0] || "";
  const second = flavours[1] || "";
  if (choice === "both") {
    return `${first} × ${firstQty}, ${second} × ${secondQty}`;
  }
  if (choice === "second") return second;
  return first;
}

export function ProductPage({ product, add, navigate }) {
  const gallery = product.gallery?.length
    ? product.gallery
    : product.image
      ? [product.image]
      : [];
  const flavours = product.flavours || [];
  const flavoured = flavours.length >= 2;
  const firstFlavour = flavours[0] || "";
  const secondFlavour = flavours[1] || "";
  const [photo, setPhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [firstQty, setFirstQty] = useState(1);
  const [secondQty, setSecondQty] = useState(1);
  const [choice, setChoice] = useState("first");
  const [notes, setNotes] = useState("");

  const pieces = flavoured && choice === "both" ? firstQty + secondQty : qty;
  const linePrice = product.price * pieces;
  const photoSrc = gallery[photo];

  useEffect(() => {
    setPhoto(0);
    setQty(1);
    setFirstQty(1);
    setSecondQty(1);
    setChoice("first");
    setNotes("");
    scrollToTop();
  }, [product.slug, product.name]);

  const addToBag = () => {
    const flavour = flavoured
      ? flavourOrderNote(flavours, choice, firstQty, secondQty)
      : "";
    const extra = notes.trim();
    const combined = [flavour && `Flavour: ${flavour}`, extra]
      .filter(Boolean)
      .join("\n");
    add(product, { qty: pieces, notes: combined });
  };

  return (
    <main id="main-content">
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
              {photoSrc ? (
                <SmartImage src={photoSrc} alt={product.name} priority />
              ) : (
                <DessertArt type={product.art} large />
              )}
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
                    <SmartImage src={src} alt="" />
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
                    className={choice === "first" ? "active" : ""}
                    onClick={() => {
                      setChoice("first");
                      setQty(firstQty);
                    }}
                  >
                    {firstFlavour}
                  </button>
                  <button
                    type="button"
                    className={choice === "second" ? "active" : ""}
                    onClick={() => {
                      setChoice("second");
                      setQty(secondQty);
                    }}
                  >
                    {secondFlavour}
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
                  <span>{firstFlavour}</span>
                  <QtyStepper
                    label={`${firstFlavour.toLowerCase()} quantity`}
                    value={firstQty}
                    onChange={setFirstQty}
                  />
                </div>
                <div className="flavour-qty-row">
                  <span>{secondFlavour}</span>
                  <QtyStepper
                    label={`${secondFlavour.toLowerCase()} quantity`}
                    value={secondQty}
                    onChange={setSecondQty}
                  />
                </div>
              </>
            ) : (
              <QtyStepper
                label="quantity"
                value={qty}
                onChange={(next) => {
                  setQty(next);
                  if (choice === "second") setSecondQty(next);
                  else setFirstQty(next);
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
                placeholder="Optional — less sweet, extra packing..."
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
