import { afterEach, describe, expect, it, vi } from "vitest";
import {
  lockBodyScroll,
  resetBodyScrollLock,
  scrollToTop,
  unlockBodyScroll,
} from "../../lib/scroll.js";

afterEach(() => {
  resetBodyScrollLock();
  document.body.className = "";
  document.body.innerHTML = "";
});

describe("scrollToTop", () => {
  it("scrolls the window and .app to the origin", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const app = document.createElement("div");
    app.className = "app";
    app.scrollTop = 480;
    document.body.appendChild(app);

    scrollToTop();

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "instant",
    });
    expect(app.scrollTop).toBe(0);
    scrollTo.mockRestore();
  });
});

describe("lockBodyScroll", () => {
  it("fixes the body while open and restores after the last unlock", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.spyOn(window, "scrollY", "get").mockReturnValue(220);

    lockBodyScroll();
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-220px");

    lockBodyScroll();
    unlockBodyScroll();
    expect(document.body.style.position).toBe("fixed");

    unlockBodyScroll();
    expect(document.body.style.position).toBe("");
    expect(scrollTo).toHaveBeenCalledWith({
      top: 220,
      left: 0,
      behavior: "instant",
    });
    scrollTo.mockRestore();
  });
});
