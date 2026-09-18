import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { categories } from "../data/catalog.js";
import { menuPath } from "../lib/routes.js";
import { CategoryIcon } from "./CategoryIcon.jsx";

const COPIES = 3;

export function CategoryCarousel({ navigate }) {
  const scroller = useRef(null);
  const loopWidth = useRef(0);
  const paused = useRef(false);
  const swallowClick = useRef(false);
  const drag = useRef({
    down: false,
    dragging: false,
    startX: 0,
    startScroll: 0,
  });

  const openCategory = (title) => {
    if (title === "Custom Cakes") navigate("/custom");
    else navigate(menuPath(title));
  };

  const wrapScroll = () => {
    const el = scroller.current;
    const width = loopWidth.current;
    if (!el || !width) return;
    while (el.scrollLeft < width) el.scrollLeft += width;
    while (el.scrollLeft >= width * 2) el.scrollLeft -= width;
  };

  const measure = () => {
    const el = scroller.current;
    if (!el) return;
    loopWidth.current = el.scrollWidth / COPIES;
    if (el.scrollLeft < 8) el.scrollLeft = loopWidth.current;
    wrapScroll();
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    measure();
    const ro =
      typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    const images = [...el.querySelectorAll("img")];
    images.forEach((img) => img.addEventListener("load", measure));

    let raf = 0;
    const tick = () => {
      if (!paused.current && !drag.current.down) {
        el.scrollLeft += 0.55;
        wrapScroll();
      }
      raf = requestAnimationFrame(tick);
    };

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!reduce?.matches) raf = requestAnimationFrame(tick);

    const onScroll = () => wrapScroll();
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      images.forEach((img) => img.removeEventListener("load", measure));
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onPointerDown = (e) => {
    if (!scroller.current) return;
    // Touch swipes must reach pointermove instead of becoming a tap on a card.
    if (e.pointerType === "touch") e.preventDefault();
    paused.current = true;
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
    wrapScroll();
  };
  const endDrag = (e) => {
    const wasDrag = drag.current.dragging;
    drag.current.down = false;
    drag.current.dragging = false;
    const el = scroller.current;
    if (el?.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    return wasDrag;
  };
  const onPointerUp = (e) => {
    if (endDrag(e)) {
      swallowClick.current = true;
      return;
    }
    const card = e.target.closest?.(".category-card");
    if (card?.dataset.category) openCategory(card.dataset.category);
  };
  const onPointerCancel = (e) => {
    if (endDrag(e)) swallowClick.current = true;
  };
  const onClick = (e) => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const pause = () => {
    paused.current = true;
  };
  const resume = () => {
    if (!drag.current.down) paused.current = false;
  };

  const slides = Array.from({ length: COPIES }, (_, copy) =>
    categories.map(([title, caption, art]) => ({
      title,
      caption,
      art,
      key: `${copy}-${title}`,
    })),
  ).flat();

  return (
    <div
      className="category-drag-shell"
      onPointerEnter={pause}
      onPointerLeave={resume}
    >
      <div
        ref={scroller}
        className="category-grid category-drag"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={onClick}
      >
        {slides.map(({ title, caption, art, key }) => (
          <button
            key={key}
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
        <span>←</span> Drag to explore <span>→</span>
      </div>
    </div>
  );
}
