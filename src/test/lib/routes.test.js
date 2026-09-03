import { afterEach, describe, expect, it } from "vitest";
import { isNavActive, productPath, readProductSlug } from "../../lib/routes.js";

describe("readProductSlug", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("reads a normal product slug", () => {
    window.history.replaceState({}, "", "/product/biscoff-cheesecake");
    expect(readProductSlug()).toBe("biscoff-cheesecake");
  });

  it("returns empty instead of throwing on a malformed percent encoding", () => {
    window.history.replaceState({}, "", "/product/%E0%A4");
    expect(() => readProductSlug()).not.toThrow();
    expect(readProductSlug()).toBe("");
  });
});

describe("isNavActive", () => {
  it("marks Home, Shop, Visit, and Contact from the route", () => {
    expect(isNavActive("Home", "/")).toBe(true);
    expect(isNavActive("Shop", "/menu")).toBe(true);
    expect(isNavActive("Shop", "/product/biscoff-cheesecake")).toBe(true);
    expect(isNavActive("Custom cakes", "/custom")).toBe(true);
    expect(isNavActive("Visit", "/visit")).toBe(true);
    expect(isNavActive("Contact", "/contact")).toBe(true);
  });
});

describe("productPath", () => {
  it("opens the product at the top of the page", () => {
    expect(productPath("biscoff-cheesecake")).toBe(
      "/product/biscoff-cheesecake",
    );
  });
});
