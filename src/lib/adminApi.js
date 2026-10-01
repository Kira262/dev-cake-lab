import { ADMIN_API } from "../data/admin.js";

const TOKEN_KEY = "cakelab-admin-token";

export function getAdminToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setAdminToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function adminTokenExpired(token = getAdminToken()) {
  if (!token) return true;
  const [payloadB64] = String(token).split(".");
  if (!payloadB64) return true;
  try {
    const padded = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const payload = JSON.parse(atob(padded + pad));
    return !payload?.exp || payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

async function adminPost(path, { password, body = {} } = {}) {
  const headers = { "content-type": "application/json" };
  if (path === "/unlock") {
    if (password) {
      Object.assign(body, { password });
    }
  } else {
    const token = getAdminToken();
    if (!token) {
      throw new Error("Session expired. Unlock again.");
    }
    headers.authorization = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(`${ADMIN_API}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the admin desk. Check the Worker is deployed.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && path !== "/unlock") clearAdminToken();
    const error = new Error(data.error || "Admin request failed.");
    error.status = res.status;
    throw error;
  }
  return data;
}

export function unlockAdmin(password) {
  return adminPost("/unlock", { password }).then((data) => {
    if (data.token) setAdminToken(data.token);
    return data;
  });
}

export function generatePhotos(payload) {
  return adminPost("/generate", { body: payload });
}

export function publishProduct(product) {
  return adminPost("/publish", { body: product });
}

export function deleteProduct(slug) {
  return adminPost("/delete", { body: { slug } });
}
