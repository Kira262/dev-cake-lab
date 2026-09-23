import { ADMIN_API } from "../data/admin.js";

async function adminPost(path, password, body = {}) {
  let res;
  try {
    res = await fetch(`${ADMIN_API}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the admin desk. Check the Worker is deployed.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Admin request failed.");
  }
  return data;
}

export function unlockAdmin(password) {
  return adminPost("/unlock", password);
}

export function generatePhotos(password, payload) {
  return adminPost("/generate", password, payload);
}

export function publishProduct(password, product) {
  return adminPost("/publish", password, product);
}

export function deleteProduct(password, slug) {
  return adminPost("/delete", password, { slug });
}
