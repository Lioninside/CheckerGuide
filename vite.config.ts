import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  build: {
    cssCodeSplit: true,
    sourcemap: true,
    target: "es2022",
  },
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    globals: true,
    setupFiles: "./vitest.setup.ts",
  },
});
