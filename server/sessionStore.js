import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidSessionId(id) {
  return typeof id === "string" && UUID_RE.test(id);
}

export function emptySession(id) {
  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    updatedAt: now,
    bag: [],
    draft: {
      name: "",
      email: "",
      phone: "",
      fulfilment: "pickup",
      address: "",
      area: "",
      neededBy: "",
      neededTime: "",
    },
  };
}

function sessionPath(dir, id) {
  if (!isValidSessionId(id)) throw new Error("invalid session id");
  return join(dir, `${id}.json`);
}

export async function createSession(dir) {
  await mkdir(dir, { recursive: true });
  const id = randomUUID();
  const session = emptySession(id);
  await writeFile(sessionPath(dir, id), JSON.stringify(session, null, 2), "utf8");
  return session;
}

export async function readSession(dir, id) {
  if (!isValidSessionId(id)) return null;
  try {
    const raw = await readFile(sessionPath(dir, id), "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (err) {
    if (err && err.code === "ENOENT") return null;
    throw err;
  }
}

export function mergeSession(existing, patch = {}) {
  const base = existing || emptySession(patch.id || randomUUID());
  const next = {
    ...base,
    updatedAt: new Date().toISOString(),
  };
  if (Array.isArray(patch.bag)) next.bag = patch.bag;
  if (patch.draft && typeof patch.draft === "object") {
    next.draft = { ...base.draft, ...patch.draft };
  }
  return next;
}

export async function writeSession(dir, session) {
  if (!session?.id || !isValidSessionId(session.id)) {
    throw new Error("invalid session");
  }
  await mkdir(dir, { recursive: true });
  await writeFile(
    sessionPath(dir, session.id),
    JSON.stringify(session, null, 2),
    "utf8",
  );
  return session;
}

export async function patchSession(dir, id, patch) {
  const existing = await readSession(dir, id);
  if (!existing) return null;
  const next = mergeSession(existing, patch);
  await writeSession(dir, next);
  return next;
}
