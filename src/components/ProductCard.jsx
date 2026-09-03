import { Star } from "lucide-react";
import { DIET_NOTE } from "../data/catalog.js";
import { productPath } from "../lib/routes.js";
import { AssetImage } from "./AssetImage.jsx";
import { DessertArt } from "./DessertArt.jsx";

export function ProductCard({ product, add, navigate }) {
  const open = () => navigate(productPath(product.slug));
  return (
    <article className="product-card">
      <div className="product-visual">
        <button className="product-hit" type="button" onClick={open}>
          {product.image ? (
            <AssetImage
              className="product-photo"
              src={product.image}
              alt={product.name}
              artType={product.art}
            />
          ) : (
            <DessertArt type={product.art} />
          )}
        </button>
        {product.badge && <span className="badge">{product.badge}</span>}
        <button
          className="quick-add"
          type="button"
          onClick={() => (product.flavours ? open() : add(product))}
        >
          + Add
        </button>
      </div>
      <button className="product-meta-btn" type="button" onClick={open}>
        <div className="product-meta">
          <div>
            <h3>{product.name}</h3>
            <p>{product.note}</p>
            <p className="diet-note">{DIET_NOTE}</p>
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
