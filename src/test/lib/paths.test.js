import { afterEach, describe, expect, it } from "vitest";
import { appPath, webpFromUrl } from "../../lib/paths.js";

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
