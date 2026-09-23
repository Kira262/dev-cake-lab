const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, x-admin-password",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-max-age": "86400",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });
}

function checkPassword(request, env) {
  const password = request.headers.get("x-admin-password") || "";
  return Boolean(env.ADMIN_PASSWORD && password === env.ADMIN_PASSWORD);
}

function heroPrompt({ name, type, note }) {
  return [
    "Square professional food photograph, 1:1.",
    `Artisan bakery ${String(type || "dessert").toLowerCase()}: ${name}.`,
    note,
    "Cream ceramic plate, warm marble countertop, soft natural window light.",
    "Photorealistic. No logo, no watermark, no text, no labels.",
  ]
    .filter(Boolean)
    .join(" ");
}

function detailPrompt({ name, type, note }) {
  return [
    "Extreme close-up square food photograph, 1:1.",
    `${name}, ${String(type || "dessert").toLowerCase()}.`,
    note,
    "Tight crop filling the frame, photorealistic texture.",
    "No logo, no watermark, no text.",
  ]
    .filter(Boolean)
    .join(" ");
}

async function generateImage(env, prompt) {
  if (!env.AI) {
    throw new Error("Workers AI is not bound on this Worker.");
  }
  const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
    prompt: String(prompt || "").slice(0, 2048),
    steps: 4,
  });
  const b64 = result?.image;
  if (!b64) throw new Error("Image generation returned no photo.");
  return `data:image/jpeg;base64,${b64}`;
}

function githubHeaders(env) {
  return {
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    accept: "application/vnd.github+json",
    "user-agent": "dev-cake-lab-admin",
  };
}

function parseStore(decoded) {
  try {
    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed)) return { items: parsed, deletedSlugs: [] };
    return {
      items: Array.isArray(parsed?.items) ? parsed.items : [],
      deletedSlugs: (Array.isArray(parsed?.deletedSlugs) ? parsed.deletedSlugs : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean),
    };
  } catch {
    return { items: [], deletedSlugs: [] };
  }
}

async function readExtras(env) {
  const repo = env.GITHUB_REPO;
  const path = env.GITHUB_PATH;
  const branch = env.GITHUB_BRANCH || "main";
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
    { headers: githubHeaders(env) },
  );
  if (res.status === 404) return { sha: null, items: [], deletedSlugs: [] };
  const file = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(file.message || "Could not read extra products.");
  }
  const decoded = atob(String(file.content || "").replace(/\n/g, ""));
  const store = parseStore(decoded);
  return { sha: file.sha, ...store };
}

async function writeExtras(env, store, sha, message) {
  const repo = env.GITHUB_REPO;
  const path = env.GITHUB_PATH;
  const branch = env.GITHUB_BRANCH || "main";
  const payload = {
    items: store.items || [],
    deletedSlugs: [...new Set(store.deletedSlugs || [])],
  };
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2)))),
    branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        ...githubHeaders(env),
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Could not publish to GitHub.");
  }
  return data;
}

function nextId(catalogMax, extras) {
  const ids = extras.map((item) => Number(item.id) || 0);
  const top = Math.max(catalogMax, ...ids, 0);
  return top + 1;
}

function toProduct(body, id) {
  const product = {
    id,
    name: String(body.name || "").trim(),
    type: String(body.type || "").trim(),
    price: Number(body.price) || 0,
    note: String(body.note || ""),
    badge: String(body.badge || ""),
    art: body.art || "",
    image: body.image,
    detailImage: body.detailImage,
    slug: String(body.slug || "").trim(),
  };
  if (body.unit) product.unit = body.unit;
  if (Array.isArray(body.flavours) && body.flavours.length) {
    product.flavours = body.flavours;
  }
  if (body.bestSeller) product.bestSeller = body.bestSeller;
  return product;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "")) {
      return json({ ok: true, service: "cakelab-admin-api" });
    }
    if (request.method !== "POST") {
      return json({ error: "POST only." }, 405);
    }
    if (!checkPassword(request, env)) {
      return json({ error: "Wrong password." }, 401);
    }

    if (url.pathname === "/unlock") {
      return json({ ok: true });
    }

    if (url.pathname === "/generate") {
      try {
        const body = await request.json();
        const name = String(body.name || "").trim();
        const type = String(body.type || "").trim();
        if (!name || !type) {
          return json({ error: "Name and category are required." }, 400);
        }
        const payload = { name, type, note: String(body.note || "").trim() };
        const [hero, detail] = await Promise.all([
          generateImage(env, heroPrompt(payload)),
          generateImage(env, detailPrompt(payload)),
        ]);
        return json({ hero, detail });
      } catch (err) {
        return json(
          { error: err instanceof Error ? err.message : "Generate failed." },
          500,
        );
      }
    }

    if (url.pathname === "/publish") {
      try {
        const body = await request.json();
        const name = String(body.name || "").trim();
        const type = String(body.type || "").trim();
        if (!name || !type || !body.image || !body.detailImage) {
          return json({ error: "Product details and both photos are required." }, 400);
        }
        const { sha, items, deletedSlugs } = await readExtras(env);
        const catalogMax = Number(env.CATALOG_MAX_ID) || 30;
        const slug = String(body.slug || "").trim();
        const existing = items.find((item) => item.slug === slug);
        const id = existing?.id || Number(body.id) || nextId(catalogMax, items);
        const product = toProduct({ ...body, name, type, slug }, id);
        const next = items.filter((item) => item.slug !== product.slug);
        next.push(product);
        await writeExtras(
          env,
          {
            items: next,
            deletedSlugs: deletedSlugs.filter((item) => item !== product.slug),
          },
          sha,
          existing || Number(body.id) ? `Update ${product.name} on the shop` : `Add ${product.name} to the shop`,
        );
        return json({ product });
      } catch (err) {
        return json(
          { error: err instanceof Error ? err.message : "Publish failed." },
          500,
        );
      }
    }

    if (url.pathname === "/delete") {
      try {
        const body = await request.json();
        const slug = String(body.slug || "").trim();
        if (!slug) return json({ error: "Product slug is required." }, 400);
        const { sha, items, deletedSlugs } = await readExtras(env);
        const nextItems = items.filter((item) => item.slug !== slug);
        const nextDeleted = deletedSlugs.includes(slug)
          ? deletedSlugs
          : [...deletedSlugs, slug];
        await writeExtras(
          env,
          { items: nextItems, deletedSlugs: nextDeleted },
          sha,
          `Remove ${slug} from the shop`,
        );
        return json({ ok: true, slug });
      } catch (err) {
        return json(
          { error: err instanceof Error ? err.message : "Delete failed." },
          500,
        );
      }
    }

    return json({ error: "Unknown admin route." }, 404);
  },
};
