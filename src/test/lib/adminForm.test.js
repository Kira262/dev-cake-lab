import { describe, expect, it } from "vitest";
import {
  adminGenerateReady,
  adminPublishReady,
  draftToProduct,
  readImageFile,
} from "../../lib/adminForm.js";

const draft = {
  type: "Brownies",
  name: "Walnut Brownie",
  price: "85",
  note: "100–120 g · Walnut Brownie",
  hero: "data:image/jpeg;base64,hero",
  detail: "data:image/jpeg;base64,detail",
};

describe("admin draft gates", () => {
  it("needs category, name, and price before generate", () => {
    expect(adminGenerateReady({})).toBe(false);
    expect(adminGenerateReady({ type: "Brownies", name: "Walnut Brownie" })).toBe(
      false,
    );
    expect(adminGenerateReady({ type: "Brownies", name: "Walnut Brownie", price: 85 })).toBe(
      true,
    );
  });

  it("needs both photo previews before publish", () => {
    expect(adminPublishReady({ ...draft, hero: "", detail: "" })).toBe(false);
    expect(adminPublishReady(draft)).toBe(true);
  });
});

describe("readImageFile", () => {
  it("rejects a file that is not a photo", async () => {
    const file = new File(["hi"], "notes.txt", { type: "text/plain" });
    await expect(readImageFile(file)).rejects.toThrow(/jpg, png, or webp/i);
  });
});

describe("draftToProduct", () => {
  it("applies cookie unit and a kebab slug", () => {
    const product = draftToProduct(
      {
        type: "Cookies",
        name: "Sea Salt Cookies",
        price: 40,
        flavourOne: "Milk",
        flavourTwo: "Dark",
        bestSeller: true,
        hero: "data:image/jpeg;base64,hero",
        detail: "data:image/jpeg;base64,detail",
      },
      31,
    );
    expect(product).toMatchObject({
      id: 31,
      slug: "sea-salt-cookies",
      unit: "per piece",
      art: "cookie",
      flavours: ["Milk", "Dark"],
      bestSeller: true,
    });
  });

  it("keeps id and slug when editing", () => {
    const product = draftToProduct(
      {
        type: "Cheesecakes",
        name: "Renamed Cheesecake",
        price: 400,
        hero: "/assets/biscoff-cheesecake.jpg",
        detail: "/assets/biscoff-cheesecake-detail.jpg",
      },
      99,
      { id: 3, slug: "biscoff-cheesecake", art: "chocolate" },
    );
    expect(product).toMatchObject({
      id: 3,
      slug: "biscoff-cheesecake",
      art: "chocolate",
      name: "Renamed Cheesecake",
    });
  });
});
