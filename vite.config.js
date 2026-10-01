import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = path.dirname(fileURLToPath(import.meta.url));
const extrasPath = path.join(root, "public", "data", "extra-products.json");
const extrasVersion = createHash("sha256")
  .update(readFileSync(extrasPath))
  .digest("hex")
  .slice(0, 12);

// Project Pages live at https://<user>.github.io/dev-cake-lab/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/dev-cake-lab/" : "/",
  define: {
    __EXTRAS_VERSION__: JSON.stringify(extrasVersion),
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    include: ["src/test/**/*.{test,spec}.{js,jsx}"],
  },
});
