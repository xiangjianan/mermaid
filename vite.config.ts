import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, "tests/**/*.spec.ts"],
    environment: "jsdom",
    setupFiles: ["@testing-library/jest-dom/vitest"]
  }
});
