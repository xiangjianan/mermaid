import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, "tests/**/*.spec.ts"],
    environment: "jsdom",
    setupFiles: ["@testing-library/jest-dom/vitest"]
  }
});
