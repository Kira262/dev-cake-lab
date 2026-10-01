import { describe, expect, it } from "vitest";
import { passwordsMatch, signAdminToken, verifyAdminToken } from "../../../worker/lib/auth.js";

describe("passwordsMatch", () => {
  it("matches equal passwords and rejects different ones", async () => {
    await expect(passwordsMatch("secret", "secret")).resolves.toBe(true);
    await expect(passwordsMatch("secret", "other")).resolves.toBe(false);
    await expect(passwordsMatch("", "secret")).resolves.toBe(false);
  });
});

describe("admin token", () => {
  const env = { TOKEN_SECRET: "unit-test-secret-key" };

  it("signs and verifies a bearer token", async () => {
    const token = await signAdminToken(env);
    const request = new Request("https://example.com/publish", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
    await expect(verifyAdminToken(request, env)).resolves.toBe(true);
  });

  it("rejects a malformed token", async () => {
    const request = new Request("https://example.com/publish", {
      method: "POST",
      headers: { authorization: "Bearer abc.%%%" },
    });
    await expect(verifyAdminToken(request, env)).resolves.toBe(false);
  });

  it("rejects a tampered token", async () => {
    const token = await signAdminToken(env);
    const request = new Request("https://example.com/publish", {
      method: "POST",
      headers: { authorization: `Bearer ${token}x` },
    });
    await expect(verifyAdminToken(request, env)).resolves.toBe(false);
  });
});
