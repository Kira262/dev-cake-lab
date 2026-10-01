export function parseStore(decoded) {
  const text = String(decoded ?? "").trim();
  if (!text) return { items: [], deletedSlugs: [] };
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return { items: parsed, deletedSlugs: [] };
  return {
    items: Array.isArray(parsed?.items) ? parsed.items : [],
    deletedSlugs: (Array.isArray(parsed?.deletedSlugs) ? parsed.deletedSlugs : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean),
  };
}

export function assertExtrasBody(size, decoded) {
  const text = String(decoded ?? "").trim();
  if (size > 0 && !text) {
    throw new Error(
      "Extra products file looks empty but GitHub reports a size. Nothing was saved.",
    );
  }
}

function githubHeaders(env) {
  return {
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    accept: "application/vnd.github+json",
    "user-agent": "dev-cake-lab-admin",
  };
}

export async function putGithubFile(env, repoPath, contentB64, message) {
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || "main";
  const url = `https://api.github.com/repos/${repo}/contents/${repoPath}`;
  const existing = await fetch(`${url}?ref=${branch}`, {
    headers: githubHeaders(env),
  });
  let sha;
  if (existing.status !== 404) {
    const file = await existing.json().catch(() => ({}));
    if (!existing.ok) {
      const error = new Error(file.message || "Could not read file from GitHub.");
      error.status = existing.status;
      throw error;
    }
    sha = file.sha;
  }
  const body = { message, content: contentB64, branch };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      ...githubHeaders(env),
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || "Could not save photo to GitHub.");
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function readExtras(env) {
  const repo = env.GITHUB_REPO;
  const path = env.GITHUB_PATH;
  const branch = env.GITHUB_BRANCH || "main";
  const metaRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
    { headers: githubHeaders(env) },
  );
  if (metaRes.status === 404) return { sha: null, items: [], deletedSlugs: [] };
  const file = await metaRes.json().catch(() => ({}));
  if (!metaRes.ok) {
    throw new Error(file.message || "Could not read extra products from GitHub.");
  }
  const size = Number(file.size) || 0;
  const rawRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        ...githubHeaders(env),
        accept: "application/vnd.github.raw+json",
      },
    },
  );
  if (!rawRes.ok) {
    throw new Error("Could not read extra products from GitHub.");
  }
  const decoded = await rawRes.text();
  assertExtrasBody(size, decoded);
  let store;
  try {
    store = parseStore(decoded);
  } catch {
    throw new Error("Extra products file is unreadable. Nothing was saved.");
  }
  return { sha: file.sha, ...store };
}

export async function writeExtras(env, store, sha, message) {
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

export async function commitStore(env, mutate, message) {
  let lastError = new Error("Could not publish to GitHub.");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readExtras(env);
    const store = await mutate(current);
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
