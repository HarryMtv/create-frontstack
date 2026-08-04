import { defineConfig } from 'vitest/config';

// Scope the packager's tests to test/** and never pick up the template's own
// test files (template/src/__tests/**, template/e2e/**).
export default defineConfig({
  test: {
    include: ['test/**/*.{test,spec}.js'],
    exclude: ['template/**', 'node_modules/**'],
  },
});
