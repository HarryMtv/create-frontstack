import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// Typed `test` block requires Vitest's defineConfig, not Vite's.
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Router plugin FIRST so routeTree.gen.ts is available to the rest of the build.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    // Vite 8 resolves tsconfig "paths" natively — single source of truth for @/* aliases.
    tsconfigPaths: true,
  },
  server: {
    // Reliable HMR under Docker when CHOKIDAR_USEPOLLING=true is set (see docker-compose).
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      exclude: ['src/routeTree.gen.ts'],
    },
  },
});
