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

export function extraAssetRepoPath(value) {
  const path = String(value || "").split("?")[0].split("#")[0].replace(/\\/g, "/");
  const marker = "assets/extra/";
  const at = path.indexOf(marker);
  if (at < 0) return null;
  const file = path.slice(at + marker.length);
  if (!file || file.includes("/") || file.includes("..") || file.includes("\\")) {
    return null;
  }
  return `public/assets/extra/${file}`;
}

export function extraPathsToDelete(previousItems, nextItems) {
  const next = new Set();
  for (const item of nextItems || []) {
    for (const key of ["image", "detailImage"]) {
      const repoPath = extraAssetRepoPath(item?.[key]);
      if (repoPath) next.add(repoPath);
    }
  }
  const stale = [];
  for (const item of previousItems || []) {
    for (const key of ["image", "detailImage"]) {
      const repoPath = extraAssetRepoPath(item?.[key]);
      if (repoPath && !next.has(repoPath) && !stale.includes(repoPath)) {
        stale.push(repoPath);
      }
    }
  }
  return stale;
}

function encodeUtf8Base64(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

async function githubJson(env, urlPath, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.github.com${urlPath}`, {
    method,
    headers: {
      ...githubHeaders(env),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || "Could not publish to GitHub.");
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function commitTree(env, { message, store, files = [], deletes = [] }) {
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || "main";
  const ref = await githubJson(env, `/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  const parentSha = ref.object?.sha;
  if (!parentSha) throw new Error("Could not read the shop branch.");
  const parent = await githubJson(env, `/repos/${repo}/git/commits/${parentSha}`);
  const payload = {
    items: store.items || [],
    deletedSlugs: [...new Set(store.deletedSlugs || [])],
  };
  const uploads = [
    ...files,
    {
      path: env.GITHUB_PATH,
      contentBase64: encodeUtf8Base64(JSON.stringify(payload, null, 2)),
    },
  ];
  const uploadPaths = new Set(uploads.map((file) => file.path));
  const tree = [];
  for (const file of uploads) {
    const blob = await githubJson(env, `/repos/${repo}/git/blobs`, {
      method: "POST",
      body: { content: file.contentBase64, encoding: "base64" },
    });
    tree.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }
  for (const path of deletes) {
    if (!path || uploadPaths.has(path)) continue;
    tree.push({ path, mode: "100644", type: "blob", sha: null });
  }
  const nextTree = await githubJson(env, `/repos/${repo}/git/trees`, {
    method: "POST",
    body: { base_tree: parent.tree.sha, tree },
  });
  const nextCommit = await githubJson(env, `/repos/${repo}/git/commits`, {
    method: "POST",
    body: { message, tree: nextTree.sha, parents: [parentSha] },
  });
  try {
    await githubJson(env, `/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: "PATCH",
      body: { sha: nextCommit.sha },
    });
  } catch (err) {
    if (err?.status === 422) err.status = 409;
    throw err;
  }
}

export async function commitStore(env, mutate, message) {
  let lastError = new Error("Could not publish to GitHub.");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readExtras(env);
    const result = await mutate(current);
    const store = result?.store || result;
    const files = result?.files || [];
    const deletes = result?.deletes || [];
    try {
      await commitTree(env, { message, store, files, deletes });
      return store;
    } catch (err) {
      lastError = err;
      if (err?.status !== 409) throw err;
    }
  }
  throw lastError;
}
