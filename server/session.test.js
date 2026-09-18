import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  emptySession,
  mergeSession,
  patchSession,
  readSession,
  writeSession,
} from "./sessionStore.js";

describe("sessionStore", () => {
  it("creates, reads, and patches a session file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "dcl-session-"));
    try {
      const created = await createSession(dir);
      assert.ok(created.id);
      assert.deepEqual(created.bag, []);

      const loaded = await readSession(dir, created.id);
      assert.equal(loaded.id, created.id);

      const patched = await patchSession(dir, created.id, {
        bag: [{ id: 3, qty: 2, notes: "less sweet" }],
        draft: { name: "Aarushi", phone: "9638241506" },
      });
      assert.equal(patched.bag[0].qty, 2);
      assert.equal(patched.draft.name, "Aarushi");

      const raw = await readFile(join(dir, `${created.id}.json`), "utf8");
      assert.match(raw, /"name": "Aarushi"/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("merges draft fields without dropping existing values", () => {
    const base = emptySession("00000000-0000-4000-8000-000000000001");
    base.draft.name = "Mehak";
    const next = mergeSession(base, { draft: { phone: "9876543210" } });
    assert.equal(next.draft.name, "Mehak");
    assert.equal(next.draft.phone, "9876543210");
  });

  it("rejects invalid session ids on write", async () => {
    const dir = await mkdtemp(join(tmpdir(), "dcl-session-"));
    try {
      await assert.rejects(() => writeSession(dir, { id: "bad" }));
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
