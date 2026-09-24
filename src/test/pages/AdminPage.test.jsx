import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteProduct,
  generatePhotos,
  publishProduct,
} from "../../lib/adminApi.js";
import { brandProductPhoto } from "../../lib/brandImage.js";
import { AdminPage } from "../../pages/AdminPage.jsx";

vi.mock("../../lib/adminApi.js", () => ({
  unlockAdmin: vi.fn(async () => ({ ok: true })),
  generatePhotos: vi.fn(async () => ({
    hero: "data:image/png;base64,hero",
    detail: "data:image/png;base64,detail",
  })),
  publishProduct: vi.fn(async (password, product) => ({ product })),
  deleteProduct: vi.fn(async () => ({ ok: true })),
}));

vi.mock("../../lib/brandImage.js", () => ({
  brandProductPhoto: vi.fn(async (src) => src),
}));

const catalogItem = {
  id: 3,
  name: "Biscoff Cheesecake",
  type: "Cheesecakes",
  price: 350,
  note: "250 g · Biscoff spread & biscuit base",
  badge: "BESTSELLER",
  bestSeller: 1,
  art: "chocolate",
  slug: "biscoff-cheesecake",
  image: "/assets/biscoff-cheesecake.jpg",
  gallery: [
    "/assets/biscoff-cheesecake.jpg",
    "/assets/biscoff-cheesecake-detail.jpg",
  ],
};

async function unlock(user) {
  await user.type(screen.getByLabelText(/admin password/i), "secret");
  await user.click(screen.getByRole("button", { name: /^unlock$/i }));
}

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("unlocks, then waits for name and price before generate, and photos before publish", async () => {
    const user = userEvent.setup();
    render(<AdminPage products={[]} onPublished={vi.fn()} />);

    await unlock(user);
    await user.click(screen.getByRole("button", { name: /^brownies$/i }));

    const generate = screen.getByRole("button", { name: /generate photos/i });
    const publish = screen.getByRole("button", { name: /publish to shop/i });
    expect(generate.disabled).toBe(true);
    expect(publish.disabled).toBe(true);

    await user.type(screen.getByLabelText(/^name$/i), "Walnut Brownie");
    await user.type(screen.getByLabelText(/price/i), "85");
    await user.type(screen.getByLabelText(/flavour one/i), "Milk");
    await user.type(screen.getByLabelText(/flavour two/i), "Dark");
    expect(generate.disabled).toBe(false);
    expect(publish.disabled).toBe(true);

    await user.click(generate);
    expect(await screen.findByAltText(/hero preview/i)).toBeTruthy();
    expect(publish.disabled).toBe(false);
    expect(generatePhotos).toHaveBeenNthCalledWith(1, "secret", {
      name: "Walnut Brownie",
      type: "Brownies",
      note: "100–120 g · Walnut Brownie",
      flavours: ["Milk", "Dark"],
      shot: "hero",
    });
    expect(generatePhotos).toHaveBeenNthCalledWith(2, "secret", {
      name: "Walnut Brownie",
      type: "Brownies",
      note: "100–120 g · Walnut Brownie",
      flavours: ["Milk", "Dark"],
      shot: "detail",
    });

    const price = screen.getByLabelText(/price/i);
    expect(price.disabled).toBe(false);
    await user.clear(price);
    await user.type(price, "90");
    expect(price.value).toBe("90");
  });

  it("uploads a shop card and a close-up without generating", async () => {
    const user = userEvent.setup();
    render(<AdminPage products={[]} onPublished={vi.fn()} />);

    await unlock(user);
    await user.click(screen.getByRole("button", { name: /^cheesecakes$/i }));
    await user.upload(
      screen.getByLabelText(/upload shop card/i),
      new File(["hero"], "oreo.jpg", { type: "image/jpeg" }),
    );
    expect(await screen.findByAltText(/hero preview/i)).toBeTruthy();
    expect(brandProductPhoto).toHaveBeenCalled();

    await user.upload(
      screen.getByLabelText(/upload close-up/i),
      new File(["detail"], "oreo-detail.png", { type: "image/png" }),
    );
    expect(await screen.findByAltText(/detail preview/i)).toBeTruthy();
    expect(generatePhotos).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /publish to shop/i }).disabled).toBe(true);
  });

  it("lists catalog products and lets you save an edit without generating photos", async () => {
    const user = userEvent.setup();
    const onPublished = vi.fn();
    render(<AdminPage products={[catalogItem]} onPublished={onPublished} />);

    await unlock(user);
    expect(screen.getByRole("button", { name: /edit biscoff cheesecake/i })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /edit biscoff cheesecake/i }));
    const save = screen.getByRole("button", { name: /save changes/i });
    expect(save.disabled).toBe(false);

    await user.clear(screen.getByLabelText(/price/i));
    await user.type(screen.getByLabelText(/price/i), "399");
    await user.click(save);

    expect(publishProduct).toHaveBeenCalledWith(
      "secret",
      expect.objectContaining({
        id: 3,
        slug: "biscoff-cheesecake",
        price: 399,
        image: "/assets/biscoff-cheesecake.jpg",
        detailImage: "/assets/biscoff-cheesecake-detail.jpg",
      }),
    );
    expect(onPublished).toHaveBeenCalled();
  });

  it("deletes a listed product after confirm", async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    render(
      <AdminPage
        products={[catalogItem]}
        onPublished={vi.fn()}
        onDeleted={onDeleted}
      />,
    );

    await unlock(user);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: /delete biscoff cheesecake/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteProduct).toHaveBeenCalledWith("secret", "biscoff-cheesecake");
    expect(onDeleted).toHaveBeenCalledWith("biscoff-cheesecake");
  });
});
