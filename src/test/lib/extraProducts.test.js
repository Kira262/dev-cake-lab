import { describe, expect, it } from "vitest";
import {
  bestSellersFrom,
  categoryDefaults,
  isShopCategory,
  mergeCatalog,
  nextProductId,
  normalizeExtraProduct,
  parseExtrasPayload,
  removeProduct,
  slugFromName,
} from "../../lib/extraProducts.js";

const base = [
  {
    id: 3,
    name: "Biscoff Cheesecake",
    type: "Cheesecakes",
    price: 350,
    slug: "biscoff-cheesecake",
    image: "/assets/biscoff-cheesecake.jpg",
    bestSeller: 1,
  },
];

describe("categoryDefaults", () => {
  it("gives cookies a per-piece unit and 45 g note", () => {
    expect(categoryDefaults("Cookies", "Oreo Chunk Cookies")).toMatchObject({
      art: "cookie",
      unit: "per piece",
      note: "45 g · per piece",
    });
  });

  it("gives brownies brownie art and a 100–120 g note", () => {
    expect(categoryDefaults("Brownies", "Walnut Brownie")).toMatchObject({
      art: "brownie",
      note: "100–120 g · Walnut Brownie",
    });
  });
});

describe("normalizeExtraProduct", () => {
  it("skips Custom Cakes and blank names", () => {
    expect(isShopCategory("Custom Cakes")).toBe(false);
    expect(
      normalizeExtraProduct({ name: "Party cake", type: "Custom Cakes" }, 31),
    ).toBeNull();
    expect(normalizeExtraProduct({ type: "Brownies" }, 31)).toBeNull();
  });

  it("builds a slug and gallery from data URLs", () => {
    const extra = normalizeExtraProduct(
      {
        name: "Walnut Brownie",
        type: "Brownies",
        price: 85,
        image: "data:image/jpeg;base64,aaa",
        detailImage: "data:image/jpeg;base64,bbb",
      },
      31,
    );
    expect(extra.slug).toBe("walnut-brownie");
    expect(extra.gallery).toEqual([
      "data:image/jpeg;base64,aaa",
      "data:image/jpeg;base64,bbb",
    ]);
    expect(extra.art).toBe("brownie");
  });
});

describe("parseExtrasPayload", () => {
  it("accepts a bare array or the items/deletedSlugs object", () => {
    expect(parseExtrasPayload([{ slug: "walnut-brownie" }])).toEqual({
      items: [{ slug: "walnut-brownie" }],
      deletedSlugs: [],
    });
    expect(
      parseExtrasPayload({
        items: [{ slug: "walnut-brownie" }],
        deletedSlugs: ["nutella-cheesecake"],
      }),
    ).toEqual({
      items: [{ slug: "walnut-brownie" }],
      deletedSlugs: ["nutella-cheesecake"],
    });
  });
});

describe("mergeCatalog", () => {
  it("replaces matching slugs, appends new extras, and hides deleted rows", () => {
    const merged = mergeCatalog(base, {
      items: [
        {
          name: "Walnut Brownie",
          type: "Brownies",
          price: 85,
          slug: "walnut-brownie",
          image: "data:image/jpeg;base64,aaa",
        },
        {
          name: "Biscoff Cheesecake",
          type: "Cheesecakes",
          price: 399,
          slug: "biscoff-cheesecake",
          image: "/assets/biscoff-cheesecake.jpg",
        },
      ],
      deletedSlugs: [],
    });
    expect(merged).toHaveLength(2);
    expect(merged[0]).toMatchObject({
      id: 3,
      name: "Biscoff Cheesecake",
      price: 399,
    });
    expect(merged[1].name).toBe("Walnut Brownie");
    expect(merged[1].id).toBe(4);
  });

  it("hides catalog rows listed in deletedSlugs", () => {
    expect(
      mergeCatalog(base, { items: [], deletedSlugs: ["biscoff-cheesecake"] }),
    ).toEqual([]);
  });

  it("still accepts a bare extras array", () => {
    const merged = mergeCatalog(base, [
      {
        name: "Walnut Brownie",
        type: "Brownies",
        price: 85,
        slug: "walnut-brownie",
        image: "data:image/jpeg;base64,aaa",
      },
    ]);
    expect(merged.map((item) => item.slug)).toEqual([
      "biscoff-cheesecake",
      "walnut-brownie",
    ]);
  });
});

describe("bestSellersFrom / nextProductId / slugFromName / removeProduct", () => {
  it("sorts best sellers, continues ids, and removes by slug", () => {
    expect(slugFromName("Red Velvet Cookies")).toBe("red-velvet-cookies");
    expect(nextProductId(base)).toBe(4);
    expect(bestSellersFrom(base).map((item) => item.id)).toEqual([3]);
    expect(removeProduct(base, "biscoff-cheesecake")).toEqual([]);
  });
});
