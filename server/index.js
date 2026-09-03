import express from "express";
import cors from "cors";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createSession,
  isValidSessionId,
  patchSession,
  readSession,
} from "./sessionStore.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const SESSIONS_DIR =
  process.env.SESSIONS_DIR || join(__dirname, "data", "sessions");

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ||
  "http://localhost:5173,https://kira262.github.io")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("not allowed by CORS"));
    },
  }),
);
app.use(express.json({ limit: "32kb" }));

function sanitizeBag(bag) {
  if (!Array.isArray(bag)) return [];
  return bag
    .filter((row) => row && Number.isFinite(Number(row.id)))
    .map((row) => ({
      id: Number(row.id),
      qty: Math.min(20, Math.max(1, Math.floor(Number(row.qty) || 1))),
      notes: String(row.notes || "").slice(0, 300),
    }));
}

const DRAFT_KEYS = [
  "name",
  "email",
  "phone",
  "fulfilment",
  "address",
  "area",
  "neededBy",
  "neededTime",
];

function sanitizeDraft(draft) {
  if (!draft || typeof draft !== "object") return {};
  const next = {};
  for (const key of DRAFT_KEYS) {
    if (draft[key] !== undefined) next[key] = String(draft[key] || "").slice(0, 300);
  }
  if (next.name !== undefined) next.name = next.name.slice(0, 80);
  if (next.email !== undefined) next.email = next.email.slice(0, 80);
  if (next.phone !== undefined) next.phone = next.phone.slice(0, 20);
  if (next.address !== undefined) next.address = next.address.slice(0, 500);
  if (
    next.fulfilment !== undefined &&
    next.fulfilment !== "delivery" &&
    next.fulfilment !== "pickup"
  ) {
    next.fulfilment = "pickup";
  }
  return next;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/sessions", async (_req, res, next) => {
  try {
    const session = await createSession(SESSIONS_DIR);
    res.status(201).json({ sessionId: session.id, session });
  } catch (err) {
    next(err);
  }
});

app.get("/api/sessions/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidSessionId(id)) {
      res.status(400).json({ error: "invalid session id" });
      return;
    }
    const session = await readSession(SESSIONS_DIR, id);
    if (!session) {
      res.status(404).json({ error: "session not found" });
      return;
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/sessions/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidSessionId(id)) {
      res.status(400).json({ error: "invalid session id" });
      return;
    }
    const patch = {};
    if (req.body?.bag !== undefined) patch.bag = sanitizeBag(req.body.bag);
    if (req.body?.draft !== undefined) {
      patch.draft = sanitizeDraft(req.body.draft);
    }
    const session = await patchSession(SESSIONS_DIR, id, patch);
    if (!session) {
      res.status(404).json({ error: "session not found" });
      return;
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "server error" });
});

export { app, SESSIONS_DIR };

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Session API listening on http://localhost:${PORT}`);
    console.log(`Sessions dir: ${SESSIONS_DIR}`);
  });
}
