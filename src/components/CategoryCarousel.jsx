import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { categories } from "../data/catalog.js";
import { menuPath } from "../lib/routes.js";
import { CategoryIcon } from "./CategoryIcon.jsx";

export function CategoryCarousel({ navigate }) {
  const scroller = useRef(null);
  const drag = useRef({
    down: false,
    dragging: false,
    startX: 0,
    startScroll: 0,
  });

  const openCategory = (title) => {
    if (title === "Custom Cakes") navigate("/contact");
    else navigate(menuPath(title));
  };

  const onPointerDown = (e) => {
    if (!scroller.current) return;
    drag.current = {
      down: true,
      dragging: false,
      startX: e.clientX,
      startScroll: scroller.current.scrollLeft,
    };
  };
  const onPointerMove = (e) => {
    if (!drag.current.down || !scroller.current) return;
    const dx = e.clientX - drag.current.startX;
    if (!drag.current.dragging) {
      if (Math.abs(dx) < 10) return;
      drag.current.dragging = true;
      scroller.current.setPointerCapture?.(e.pointerId);
    }
    scroller.current.scrollLeft = drag.current.startScroll - dx;
  };
  const onPointerUp = (e) => {
    const wasDrag = drag.current.dragging;
    drag.current.down = false;
    drag.current.dragging = false;
    scroller.current?.releasePointerCapture?.(e.pointerId);
    if (wasDrag) return;
    const card = e.target.closest?.(".category-card");
    if (card?.dataset.category) openCategory(card.dataset.category);
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
            type="button"
            className={`category-card ${art}`}
            data-category={title}
          >
            <CategoryIcon type={art} />
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
