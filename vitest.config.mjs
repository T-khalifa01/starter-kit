/**
 * vitest.config.mjs
 * ------------------------------------------------------------------
 * Scoped deliberately narrow: tests cover the pure functions in
 * lib/ only (whatsapp.js, validators.js, analytics.js) — not hooks,
 * not components, not API routes. Those all need heavier setup
 * (jsdom, React Testing Library, mocked fetch/Next.js request
 * objects) for comparatively low payoff on a project this size. The
 * lib/ functions are where a silent regression would actually be
 * expensive (a broken WhatsApp link builder affects every dealership
 * site sharing this code at once) — that's what's worth the test
 * investment right now.
 * ------------------------------------------------------------------
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
});