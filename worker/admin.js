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

const LOOK = {
  Cheesecakes: "a slice of cheesecake with a biscuit base",
  "Cookie Lava Tins": "a round metal tin filled with a gooey cookie and a molten center",
  Cookies: "one thick round bakery cookie",
  "Cake Bowls": "a clear glass bowl of layered cake and cream",
  Cupcakes: "one cupcake in a paper liner with swirled frosting",
  Brownies: "one square fudgy brownie",
};

const INGREDIENTS = [
  [/biscoff/i, "caramelized Lotus biscuit spread and crumbs"],
  [/nutella/i, "chocolate hazelnut spread"],
  [/oreo/i, "chocolate sandwich cookies"],
];

export function visualNote(note) {
  return String(note || "")
    .replace(/^\s*\d[\d.\s–-]*g\s*(?:·|-|–)?\s*/i, "")
    .replace(/\bper piece\b/gi, "")
    .replace(/\s*·\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function flavourLine(flavours) {
  const items = (Array.isArray(flavours) ? flavours : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 2);
  if (!items.length) return "";
  return `Also showing ${items.join(" and ")}.`;
}

function ingredientHint(name, note) {
  const text = `${name} ${note}`;
  const hits = INGREDIENTS.filter(([pattern]) => pattern.test(text)).map(([, phrase]) => phrase);
  return hits.length ? `Made with ${hits.join(" and ")}.` : "";
}

function kindOf(type) {
  return String(type || "dessert").toLowerCase().replace(/s$/, "");
}

function describeDessert({ name, type, note, flavours }) {
  const look = LOOK[type] || "an artisan bakery dessert";
  const kind = kindOf(type);
  const cleaned = visualNote(note);
  const extra = cleaned && cleaned.toLowerCase() !== String(name || "").trim().toLowerCase()
    ? cleaned
    : "";
  return [
    `${name}: ${look}.`,
    ingredientHint(name, extra || note),
    extra ? `${extra}.` : "",
    `Only this ${kind}.`,
    flavourLine(flavours),
  ]
    .filter(Boolean)
    .join(" ");
}

function photoPrompt(input, camera) {
  const kind = kindOf(input.type);
  return JSON.stringify({
    scene: "a bakery counter with a warm marble top and a cream ceramic plate",
    subjects: [
      {
        type: `${input.name} ${kind}`,
        description: describeDessert(input),
        pose: "presented as one finished bakery serving",
        position: "foreground",
      },
    ],
    style: "photorealistic food photography",
    color_palette: ["cream", "caramel", "cocoa brown"],
    lighting: "soft natural window light",
    mood: "fresh and appetizing",
    background: "warm marble countertop",
    composition: "minimalist negative space",
    camera,
  });
}

export function heroPrompt(input) {
  return photoPrompt(input, {
    angle: "slightly low",
    distance: "medium close-up",
    focus: "sharp on subject",
    lens: "50mm",
    "f-number": "f/2.8",
  });
}

export function detailPrompt(input) {
  return photoPrompt(input, {
    angle: "eye level",
    distance: "close-up",
    focus: "macro focus",
    lens: "85mm",
    "f-number": "f/2.8",
  });
}

async function generateImage(env, prompt) {
  if (!env.AI) {
    throw new Error("Workers AI is not bound on this Worker.");
  }
  const form = new FormData();
  form.append("prompt", String(prompt || "").slice(0, 2048));
  form.append("guidance", "4");
  form.append("width", "1024");
  form.append("height", "1024");
  const formRequest = new Request("http://dummy", {
    method: "POST",
    body: form,
  });
  const result = await env.AI.run("@cf/black-forest-labs/flux-2-klein-4b", {
    multipart: {
      body: formRequest.body,
      contentType: formRequest.headers.get("content-type") || "multipart/form-data",
    },
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
  const parsed = JSON.parse(decoded);
  if (Array.isArray(parsed)) return { items: parsed, deletedSlugs: [] };
  return {
    items: Array.isArray(parsed?.items) ? parsed.items : [],
    deletedSlugs: (Array.isArray(parsed?.deletedSlugs) ? parsed.deletedSlugs : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean),
  };
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
  const binary = atob(String(file.content || "").replace(/\n/g, ""));
  const decoded = new TextDecoder().decode(
    Uint8Array.from(binary, (char) => char.charCodeAt(0)),
  );
  let store;
  try {
    store = parseStore(decoded);
  } catch {
    throw new Error("Extra products file could not be read. Nothing was saved.");
  }
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
    const error = new Error(data.message || "Could not publish to GitHub.");
    error.status = res.status;
    throw error;
  }
  return data;
}

async function commitStore(env, mutate, message) {
  let lastError = new Error("Could not publish to GitHub.");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readExtras(env);
    const store = mutate(current);
    try {
      await writeExtras(env, store, current.sha, message);
      return store;
    } catch (err) {
      lastError = err;
      if (err?.status !== 409) throw err;
    }
  }
  throw lastError;
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
        const flavours = (Array.isArray(body.flavours) ? body.flavours : [])
          .map((item) => String(item || "").trim())
          .filter(Boolean)
          .slice(0, 2);
        const payload = {
          name,
          type,
          note: String(body.note || "").trim(),
          flavours,
        };
        if (body.shot === "hero" || body.shot === "detail") {
          const image = await generateImage(
            env,
            body.shot === "detail" ? detailPrompt(payload) : heroPrompt(payload),
          );
          return json(body.shot === "detail" ? { detail: image } : { hero: image });
        }
        const hero = await generateImage(env, heroPrompt(payload));
        const detail = await generateImage(env, detailPrompt(payload));
        return json({ hero, detail });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generate failed.";
        const timedOut = /timeout|3046/i.test(message);
        return json(
          {
            error: timedOut
              ? "Photo generation took too long. Try again."
              : message,
          },
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
        let product;
        await commitStore(env, (current) => {
          const catalogMax = Number(env.CATALOG_MAX_ID) || 30;
          const slug = String(body.slug || "").trim();
          const existing = current.items.find((item) => item.slug === slug);
          const id = existing?.id || Number(body.id) || nextId(catalogMax, current.items);
          product = toProduct({ ...body, name, type, slug }, id);
          return {
            items: current.items.filter((item) => item.slug !== product.slug).concat(product),
            deletedSlugs: current.deletedSlugs.filter((item) => item !== product.slug),
          };
        }, `Update ${name} on the shop`);
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
        await commitStore(env, (current) => ({
          items: current.items.filter((item) => item.slug !== slug),
          deletedSlugs: current.deletedSlugs.includes(slug)
            ? current.deletedSlugs
            : [...current.deletedSlugs, slug],
        }), `Remove ${slug} from the shop`);
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
