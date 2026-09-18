import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const html = readFileSync(join(root, "index.html"), "utf8");

describe("index.html CSP", () => {
  it("allows self, Google Fonts, Maps, and keeps scripts first-party", () => {
    expect(html).toContain('http-equiv="Content-Security-Policy"');
    expect(html).toContain("script-src 'self'");
    expect(html).toContain("https://fonts.googleapis.com");
    expect(html).toContain("https://fonts.gstatic.com");
    expect(html).toContain("https://maps.google.com");
    expect(html).toContain("https://formsubmit.co");
    expect(html).toContain("http://localhost:3001");
  });
});
