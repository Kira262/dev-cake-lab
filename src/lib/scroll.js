let lockCount = 0;
let savedY = 0;

function instantScroll(top) {
  const opts = { top, left: 0, behavior: "instant" };
  try {
    window.scrollTo(opts);
  } catch {
    try {
      window.scrollTo({ top, left: 0, behavior: "auto" });
    } catch {
      window.scrollTo(0, top);
    }
  }
}

export function scrollToTop() {
  savedY = 0;
  if (document.body?.style.position === "fixed") {
    document.body.style.top = "0px";
  }
  instantScroll(0);
  const nodes = [
    document.scrollingElement,
    document.documentElement,
    document.body,
    document.querySelector(".app"),
  ];
  for (const el of nodes) {
    if (el) el.scrollTop = 0;
  }
}

export function lockBodyScroll() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    savedY =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }
  lockCount += 1;
}

export function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  const y = Math.abs(parseInt(document.body.style.top || "0", 10)) || savedY;
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  instantScroll(y);
}

export function resetBodyScrollLock() {
  lockCount = 0;
  savedY = 0;
  if (typeof document === "undefined" || !document.body) return;
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
}
