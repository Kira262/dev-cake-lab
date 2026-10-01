import { afterEach, describe, expect, it } from "vitest";
import {
  applyShareMeta,
  patchShareHtml,
  shareMetaForRoute,
  sharePageUrl,
  SITE_ORIGIN,
} from "../../lib/shareMeta.js";

const SHELL = `<!doctype html>
<html><head>
<meta name="description" content="old desc" />
<meta property="og:title" content="old title" />
<meta property="og:description" content="old og desc" />
<meta property="og:type" content="website" />
<meta property="og:image" content="/relative/logo.png" />
<title>old</title>
</head><body></body></html>`;

describe("patchShareHtml", () => {
  it("replaces title, description, and og tags and inserts og:url", () => {
    const html = patchShareHtml(SHELL, {
      title: "Shop · Dev's Cake Lab",
      description: "Browse desserts.",
      url: `${SITE_ORIGIN}/menu/`,
      image: `${SITE_ORIGIN}/assets/dev-cake-logo.png`,
    });
    expect(html).toContain("<title>Shop · Dev's Cake Lab</title>");
    expect(html).toContain('name="description" content="Browse desserts."');
    expect(html).toContain('property="og:title" content="Shop · Dev\'s Cake Lab"');
    expect(html).toContain(`property="og:url" content="${SITE_ORIGIN}/menu/"`);
    expect(html).toContain(
      `property="og:image" content="${SITE_ORIGIN}/assets/dev-cake-logo.png"`,
    );
  });
});

describe("sharePageUrl", () => {
  it("builds absolute URLs with trailing slash on inner routes", () => {
    expect(sharePageUrl("/")).toBe(`${SITE_ORIGIN}/`);
    expect(sharePageUrl("/visit")).toBe(`${SITE_ORIGIN}/visit/`);
    expect(sharePageUrl("/product", "oreo-cheesecake")).toBe(
      `${SITE_ORIGIN}/product/oreo-cheesecake/`,
    );
  });
});

describe("shareMetaForRoute", () => {
  it("uses product note for product pages", () => {
    const product = {
      name: "Oreo Cheesecake",
      slug: "oreo-cheesecake",
      note: "250 g · Oreo layers",
      image: "/dev-cake-lab/assets/oreo-cheesecake.jpg",
    };
    const meta = shareMetaForRoute("/product/oreo-cheesecake", product);
    expect(meta.title).toBe("Oreo Cheesecake · Dev's Cake Lab");
    expect(meta.description).toContain("Oreo Cheesecake");
    expect(meta.image).toBe(`${SITE_ORIGIN}/assets/oreo-cheesecake.jpg`);
  });
});

describe("applyShareMeta", () => {
  afterEach(() => {
    document.head.innerHTML = "";
  });

  it("updates document title and meta tags", () => {
    document.head.innerHTML = `
      <meta name="description" content="x" />
      <meta property="og:title" content="x" />
      <meta property="og:description" content="x" />
      <meta property="og:url" content="x" />
      <meta property="og:image" content="x" />
    `;
    applyShareMeta({ route: "/contact", product: null });
    expect(document.title).toBe("Contact · Dev's Cake Lab");
    expect(document.querySelector('meta[property="og:title"]').content).toBe(
      "Contact · Dev's Cake Lab",
    );
    expect(document.querySelector('meta[property="og:url"]').content).toBe(
      `${SITE_ORIGIN}/contact/`,
    );
  });
});
