import { describe, expect, it } from "vitest";
import { webpFromUrl } from "../../lib/paths.js";

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
