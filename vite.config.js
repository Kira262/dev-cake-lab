import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project Pages live at https://<user>.github.io/dev-cake-lab/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/dev-cake-lab/" : "/",
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    include: ["src/test/**/*.{test,spec}.{js,jsx}"],
  },
});
