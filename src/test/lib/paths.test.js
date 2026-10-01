import { afterEach, describe, expect, it } from "vitest";
import { appPath, prefersPlainImage, responsiveWebpSrcSet, webpFromUrl } from "../../lib/paths.js";

describe("appPath", () => {
  const { pathname: originalPath } = window.location;

  afterEach(() => {
    window.history.replaceState({}, "", originalPath);
  });

  it("normalizes a trailing slash on inner routes", () => {
    window.history.replaceState({}, "", "/menu/");
    expect(appPath()).toBe("/menu");
  });

  it("keeps root as slash", () => {
    window.history.replaceState({}, "", "/");
    expect(appPath()).toBe("/");
  });
});

describe("webpFromUrl", () => {
  it("swaps jpeg and png extensions for webp", () => {
    expect(webpFromUrl("/dev-cake-lab/assets/biscoff-cheesecake.jpg")).toBe(
      "/dev-cake-lab/assets/biscoff-cheesecake.webp",
    );
    expect(webpFromUrl("/assets/dev-cake-logo.png")).toBe(
      "/assets/dev-cake-logo.webp",
    );
  });
});

describe("responsiveWebpSrcSet", () => {
  it("skips the logo and admin photos", () => {
    expect(prefersPlainImage("/dev-cake-lab/assets/dev-cake-logo.png")).toBe(true);
    expect(prefersPlainImage("/assets/extra/walnut-brownie-hero-abc.jpg")).toBe(true);
    expect(responsiveWebpSrcSet("/assets/dev-cake-logo.png")).toBeNull();
    expect(responsiveWebpSrcSet("/assets/extra/walnut-brownie-hero-abc.jpg")).toBeNull();
    expect(responsiveWebpSrcSet("/assets/biscoff-cheesecake.jpg")).toContain(
      "/assets/biscoff-cheesecake-400.webp 400w",
    );
  });
});
