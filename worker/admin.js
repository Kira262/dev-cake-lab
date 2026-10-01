import {
  checkPostRateLimit,
  clearUnlockFailures,
  clientIp,
  corsHeaders,
  isUnlockLocked,
  passwordsMatch,
  recordUnlockFailure,
  signAdminToken,
  verifyAdminToken,
} from "./lib/auth.js";
import {
  GENERIC_DELETE_ERROR,
  GENERIC_GENERATE_ERROR,
  GENERIC_PUBLISH_ERROR,
  GENERATE_DAILY_CAP,
  POST_RATE_PER_MINUTE,
  WRITE_RATE_PER_MINUTE,
} from "./lib/constants.js";
import { commitStore, extraPathsToDelete } from "./lib/store.js";
import {
  resolvePhotoForStore,
  validatePublishBody,
} from "./lib/validate.js";

export { assertExtrasBody, extraPathsToDelete, parseStore } from "./lib/store.js";
export { roundPrice, slugFromName, validatePublishBody } from "./lib/validate.js";

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

function json(data, status, request) {
  const headers = { "content-type": "application/json", ...corsHeaders(request) };
  return new Response(JSON.stringify(data), { status, headers });
}

async function consumeGenerateQuota(env, shots) {
  if (!env.ADMIN_KV) return true;
  const day = new Date().toISOString().slice(0, 10);
  const key = `gen:${day}`;
  const count = Number(await env.ADMIN_KV.get(key)) || 0;
  if (count + shots > GENERATE_DAILY_CAP) return false;
  await env.ADMIN_KV.put(key, String(count + shots), { expirationTtl: 86400 * 3 });
  return true;
}

function nextId(catalogMax, extras) {
  const ids = extras.map((item) => Number(item.id) || 0);
  const top = Math.max(catalogMax, ...ids, 0);
  return top + 1;
}

function buildProduct(validated, id, image, detailImage) {
  const product = {
    id,
    name: validated.name,
    type: validated.type,
    price: validated.price,
    note: validated.note,
    badge: validated.badge,
    art: validated.art || "",
    image,
    detailImage,
    slug: validated.slug,
  };
  if (validated.unit) product.unit = validated.unit;
  if (validated.flavours?.length) product.flavours = validated.flavours;
  if (validated.bestSeller) product.bestSeller = validated.bestSeller;
  return product;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "")) {
      return new Response(null, { status: 204 });
    }

    if (request.method !== "POST") {
      return json({ error: "POST only." }, 405, request);
    }

    const routeLimit =
      url.pathname === "/unlock"
        ? { limit: POST_RATE_PER_MINUTE, binding: "ADMIN_RATE", bucket: "unlock" }
        : { limit: WRITE_RATE_PER_MINUTE, binding: "ADMIN_RATE_WRITE", bucket: "write" };
    if (!(await checkPostRateLimit(request, env, routeLimit))) {
      return json({ error: "Too many requests. Wait a minute and try again." }, 429, request);
    }

    if (url.pathname === "/unlock") {
      const ip = clientIp(request);
      if (await isUnlockLocked(env, ip)) {
        return json({ error: "Too many tries. Try again later." }, 429, request);
      }
      let body = {};
      try {
        body = await request.json();
      } catch {
        return json({ error: "Wrong password." }, 401, request);
      }
      const password = String(body.password || "");
      const ok = await passwordsMatch(password, env.ADMIN_PASSWORD || "");
      if (!ok) {
        await recordUnlockFailure(env, ip);
        return json({ error: "Wrong password." }, 401, request);
      }
      await clearUnlockFailures(env, ip);
      try {
        const token = await signAdminToken(env);
        return json({ ok: true, token }, 200, request);
      } catch (err) {
        console.error("unlock token", err);
        return json({ error: "Admin desk is not configured." }, 500, request);
      }
    }

    if (!(await verifyAdminToken(request, env))) {
      return json({ error: "Session expired. Unlock again." }, 401, request);
    }

    if (url.pathname === "/generate") {
      try {
        const body = await request.json();
        const name = String(body.name || "").trim();
        const type = String(body.type || "").trim();
        if (!name || !type) {
          return json({ error: "Name and category are required." }, 400, request);
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
        const shots =
          body.shot === "hero" || body.shot === "detail" ? 1 : 2;
        if (!(await consumeGenerateQuota(env, shots))) {
          return json(
            { error: "Daily photo limit reached. Try again tomorrow." },
            429,
            request,
          );
        }
        if (body.shot === "hero" || body.shot === "detail") {
          const image = await generateImage(
            env,
            body.shot === "detail" ? detailPrompt(payload) : heroPrompt(payload),
          );
          return json(
            body.shot === "detail" ? { detail: image } : { hero: image },
            200,
            request,
          );
        }
        const hero = await generateImage(env, heroPrompt(payload));
        const detail = await generateImage(env, detailPrompt(payload));
        return json({ hero, detail }, 200, request);
      } catch (err) {
        console.error("generate", err);
        const message = err instanceof Error ? err.message : "";
        const timedOut = /timeout|3046/i.test(message);
        return json(
          {
            error: timedOut
              ? "Photo generation took too long. Try again."
              : GENERIC_GENERATE_ERROR,
          },
          500,
          request,
        );
      }
    }

    if (url.pathname === "/publish") {
      try {
        const body = await request.json();
        const checked = validatePublishBody(body);
        if (!checked.ok) {
          return json({ error: checked.error }, 400, request);
        }
        const validated = checked.value;
        let product;
        await commitStore(env, async (current) => {
          const catalogMax = Number(env.CATALOG_MAX_ID) || 30;
          const existing = current.items.find((item) => item.slug === validated.slug);
          const id =
            existing?.id || Number(validated.id) || nextId(catalogMax, current.items);
          const hero = await resolvePhotoForStore(validated.image, validated.slug, "hero");
          const detail = await resolvePhotoForStore(
            validated.detailImage,
            validated.slug,
            "detail",
          );
          product = buildProduct(validated, id, hero.asset, detail.asset);
          const items = current.items
            .filter((item) => item.slug !== product.slug)
            .concat(product);
          return {
            store: {
              items,
              deletedSlugs: current.deletedSlugs.filter((item) => item !== product.slug),
            },
            files: [hero.file, detail.file].filter(Boolean),
            deletes: extraPathsToDelete(current.items, items),
          };
        }, `Update ${validated.name} on the shop`);
        return json({ product }, 200, request);
      } catch (err) {
        console.error("publish", err);
        if (err instanceof Error && /required|allowed|JPEG|configured/i.test(err.message)) {
          return json({ error: err.message }, 400, request);
        }
        return json({ error: GENERIC_PUBLISH_ERROR }, 500, request);
      }
    }

    if (url.pathname === "/delete") {
      try {
        const body = await request.json();
        const slug = String(body.slug || "").trim();
        if (!slug) return json({ error: "Product slug is required." }, 400, request);
        await commitStore(
          env,
          (current) => {
            const items = current.items.filter((item) => item.slug !== slug);
            return {
              store: {
                items,
                deletedSlugs: current.deletedSlugs.includes(slug)
                  ? current.deletedSlugs
                  : [...current.deletedSlugs, slug],
              },
              deletes: extraPathsToDelete(current.items, items),
            };
          },
          `Remove ${slug} from the shop`,
        );
        return json({ ok: true, slug }, 200, request);
      } catch (err) {
        console.error("delete", err);
        return json({ error: GENERIC_DELETE_ERROR }, 500, request);
      }
    }

    return json({ error: "Unknown admin route." }, 404, request);
  },
};
