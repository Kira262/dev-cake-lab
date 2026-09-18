export const SESSION_ID_KEY = "devCakeLab.sessionId";
const LEGACY_BAG_KEY = "devCakeLab.bag";
const LEGACY_DRAFT_KEY = "devCakeLab.enquiryDraft";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(
  /\/$/,
  "",
);

let cache = {
  id: "",
  bag: [],
  draft: {},
};
let ready = false;
let initPromise = null;
let saveTimer = null;
let pendingPatch = null;

function readLegacyBag() {
  try {
    const raw = localStorage.getItem(LEGACY_BAG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLegacyDraft() {
  try {
    const raw = localStorage.getItem(LEGACY_DRAFT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function clearLegacyStorage() {
  try {
    localStorage.removeItem(LEGACY_BAG_KEY);
    localStorage.removeItem(LEGACY_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

function readStoredSessionId() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("sid");
    if (fromUrl) return fromUrl;
    return localStorage.getItem(SESSION_ID_KEY) || "";
  } catch {
    return "";
  }
}

function persistSessionId(id) {
  try {
    localStorage.setItem(SESSION_ID_KEY, id);
  } catch {
    /* ignore */
  }
}

async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = new Error(`session api ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function createRemoteSession() {
  const data = await api("/api/sessions", { method: "POST" });
  return data.session || data;
}

async function loadRemoteSession(id) {
  try {
    return await api(`/api/sessions/${id}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function patchRemoteSession(id, patch) {
  return api(`/api/sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

function scheduleSave() {
  if (!ready || !cache.id) return;
  pendingPatch = {
    bag: cache.bag,
    draft: cache.draft,
  };
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const payload = pendingPatch;
    pendingPatch = null;
    if (!payload || !cache.id) return;
    try {
      await patchRemoteSession(cache.id, payload);
    } catch {
      /* keep local cache; retry on next edit */
    }
  }, 400);
}

async function ensureRemoteSession() {
  let id = readStoredSessionId();
  let session = id ? await loadRemoteSession(id) : null;

  if (!session) {
    session = await createRemoteSession();
    id = session.id;
  }

  persistSessionId(id);
  cache = {
    id,
    bag: Array.isArray(session.bag) ? session.bag : [],
    draft:
      session.draft && typeof session.draft === "object" ? session.draft : {},
  };
}

async function migrateLegacyData() {
  const legacyBag = readLegacyBag();
  const legacyDraft = readLegacyDraft();
  if (!legacyBag.length && !Object.keys(legacyDraft).length) return;

  const patch = {};
  if (legacyBag.length) patch.bag = legacyBag;
  if (Object.keys(legacyDraft).length) patch.draft = legacyDraft;

  try {
    const session = await patchRemoteSession(cache.id, patch);
    cache.bag = Array.isArray(session.bag) ? session.bag : cache.bag;
    cache.draft =
      session.draft && typeof session.draft === "object"
        ? session.draft
        : cache.draft;
    clearLegacyStorage();
  } catch {
    /* keep legacy keys for a later attempt */
  }
}

export function isSessionReady() {
  return ready;
}

export function getSessionId() {
  return cache.id;
}

export function getBag() {
  return cache.bag;
}

export function setBag(bag) {
  cache.bag = Array.isArray(bag) ? bag : [];
  scheduleSave();
}

export function getDraft() {
  return cache.draft;
}

export function patchDraft(patch) {
  cache.draft = { ...cache.draft, ...patch };
  scheduleSave();
}

export async function initSession() {
  if (ready) return cache;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await ensureRemoteSession();
    await migrateLegacyData();
    ready = true;
    return cache;
  })();

  try {
    return await initPromise;
  } catch (err) {
    initPromise = null;
    throw err;
  }
}

export function flushSession() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (!ready || !cache.id || !pendingPatch) return Promise.resolve();
  const payload = pendingPatch;
  pendingPatch = null;
  return patchRemoteSession(cache.id, payload).catch(() => {});
}
