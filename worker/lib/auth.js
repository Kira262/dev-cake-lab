import { TOKEN_TTL_SECONDS, UNLOCK_LOCK_SECONDS, UNLOCK_MAX_FAILURES } from "./constants.js";

function toBase64Url(bytes) {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const bin = atob(padded + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function timingSafeEqualBytes(a, b) {
  if (a.length !== b.length) return false;
  if (typeof crypto.subtle?.timingSafeEqual === "function") {
    return crypto.subtle.timingSafeEqual(a, b);
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  return crypto.subtle.digest("SHA-256", data);
}

async function hmacSign(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
}

export function clientIp(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  if (origin !== "https://kira262.github.io") {
    return {};
  }
  return {
    "access-control-allow-origin": "https://kira262.github.io",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-max-age": "86400",
  };
}

export async function passwordsMatch(given, expected) {
  if (!given || !expected) return false;
  const [a, b] = await Promise.all([sha256(given), sha256(expected)]);
  const left = new Uint8Array(a);
  const right = new Uint8Array(b);
  return timingSafeEqualBytes(left, right);
}

export async function signAdminToken(env) {
  const secret = env.TOKEN_SECRET;
  if (!secret) throw new Error("TOKEN_SECRET is not configured.");
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = JSON.stringify({ exp });
  const payloadB64 = toBase64Url(new TextEncoder().encode(payload));
  const sig = await hmacSign(secret, payloadB64);
  return `${payloadB64}.${toBase64Url(sig)}`;
}

export async function verifyAdminToken(request, env) {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return false;
  const secret = env.TOKEN_SECRET;
  if (!secret) return false;
  const [payloadB64, sigB64] = match[1].split(".");
  if (!payloadB64 || !sigB64) return false;
  try {
    const expected = await hmacSign(secret, payloadB64);
    const given = fromBase64Url(sigB64);
    const expSig = new Uint8Array(expected);
    if (!timingSafeEqualBytes(given, expSig)) return false;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function isUnlockLocked(env, ip) {
  if (!env.ADMIN_KV) return false;
  const raw = await env.ADMIN_KV.get(`lock:${ip}`);
  if (!raw) return false;
  const until = Number(raw);
  if (!until || until <= Date.now()) {
    await env.ADMIN_KV.delete(`lock:${ip}`);
    return false;
  }
  return true;
}

export async function recordUnlockFailure(env, ip) {
  if (!env.ADMIN_KV) return;
  const key = `fail:${ip}`;
  const count = Number(await env.ADMIN_KV.get(key)) || 0;
  const next = count + 1;
  if (next >= UNLOCK_MAX_FAILURES) {
    await env.ADMIN_KV.put(
      `lock:${ip}`,
      String(Date.now() + UNLOCK_LOCK_SECONDS * 1000),
      { expirationTtl: UNLOCK_LOCK_SECONDS + 60 },
    );
    await env.ADMIN_KV.delete(key);
    return;
  }
  await env.ADMIN_KV.put(key, String(next), { expirationTtl: UNLOCK_LOCK_SECONDS });
}

export async function clearUnlockFailures(env, ip) {
  if (!env.ADMIN_KV) return;
  await env.ADMIN_KV.delete(`fail:${ip}`);
  await env.ADMIN_KV.delete(`lock:${ip}`);
}

export async function checkPostRateLimit(request, env, options = {}) {
  const ip = clientIp(request);
  const limit = Number(options.limit) || 5;
  const bucketName = options.bucket || "post";
  const limiter = options.binding ? env[options.binding] : env.ADMIN_RATE;
  if (limiter?.limit) {
    const { success } = await limiter.limit({ key: `${bucketName}:${ip}` });
    return Boolean(success);
  }
  if (!env.ADMIN_KV) return true;
  const window = Math.floor(Date.now() / 60000);
  const key = `${bucketName}:${ip}:${window}`;
  const count = Number(await env.ADMIN_KV.get(key)) || 0;
  if (count >= limit) return false;
  await env.ADMIN_KV.put(key, String(count + 1), { expirationTtl: 120 });
  return true;
}
