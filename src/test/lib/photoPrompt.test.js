import { describe, expect, it } from "vitest";
import { detailPrompt, heroPrompt } from "../../../worker/admin.js";

const biscoff = {
  name: "chocolate biscoff",
  type: "Cheesecakes",
  note: "250 g · chocolate biscoff",
  flavours: ["Milk", "Dark"],
};

describe("photo prompts", () => {
  it("leads with the dessert and keeps both shots on that cheesecake", () => {
    const hero = heroPrompt(biscoff);
    const detail = detailPrompt(biscoff);

    expect(hero).toContain("chocolate biscoff");
    expect(hero).toMatch(/medium close-up/);
    expect(detail).toMatch(/macro focus/);
    expect(hero).toMatch(/caramelized Lotus biscuit spread and crumbs/i);
    expect(detail).toMatch(/caramelized Lotus biscuit spread and crumbs/i);
    expect(hero).toMatch(/cheesecake/i);
    expect(detail).toMatch(/cheesecake/i);
    expect(hero).toMatch(/Milk and Dark/);
    expect(detail).toMatch(/Milk and Dark/);
    expect(hero).not.toMatch(/250 g/);
    expect(detail).not.toMatch(/250 g/);
    expect(hero).not.toMatch(/no logo/i);
    expect(detail).not.toMatch(/no logo/i);
    expect(hero).not.toMatch(/no text/i);
    expect(detail).not.toMatch(/no text/i);
    expect(hero).not.toBe(detail);
  });

  it("drops a per-piece weight and still names the cookie", () => {
    const hero = heroPrompt({
      name: "Oreo Chunk Cookies",
      type: "Cookies",
      note: "45 g · per piece",
    });
    expect(hero).toContain("Oreo Chunk Cookies");
    expect(hero).toMatch(/cookie/i);
    expect(hero).not.toMatch(/45 g/);
    expect(hero).not.toMatch(/per piece/i);
  });
});
