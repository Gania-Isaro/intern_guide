import { defineConfig } from "vitest/config";

// Unit tests (vitest) live in tests/ as *.test.ts. The Playwright end-to-end
// and accessibility specs live in e2e/ as *.spec.ts and must NOT be picked up
// here - they use @playwright/test, not vitest.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
