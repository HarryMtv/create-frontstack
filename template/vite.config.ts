import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// Vite+ bundles Vite, Vitest, Oxlint and Oxfmt behind one `vp` CLI.
import { defineConfig } from 'vite-plus';

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
  lint: {
    plugins: ['oxc', 'typescript', 'react'],
    ignorePatterns: [
      'dist/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'src/routeTree.gen.ts',
    ],
    options: {
      // tsrs (Rust port of TypeScript 7) drives type-aware lint and `vp check`'s
      // type check; both switches are required for `vp check --no-fmt --no-lint`.
      typeAware: true,
      typeCheck: true,
    },
    env: {
      builtin: true,
      es2024: true,
    },
    rules: {
      // React Compiler's Rules of Hooks (react-hooks/hooks upstream).
      'react/hooks': 'error',
      'react/exhaustive-deps': 'warn',
      'react/only-export-components': ['warn', { allowConstantExport: true }],
      // React Compiler checks that the previous react-hooks lint plugin enabled.
      'react/purity': 'error',
      'react/refs': 'error',
      'react/set-state-in-effect': 'error',
      'react/set-state-in-render': 'error',
      'react/static-components': 'error',
      'react/immutability': 'error',
      'react/preserve-manual-memoization': 'error',
      'react/unsupported-syntax': 'error',
      'react/incompatible-library': 'error',
      'react/error-boundaries': 'error',
      // Type-aware TypeScript rules (require lint.options.typeAware).
      'typescript/no-floating-promises': 'error',
      'typescript/no-misused-promises': 'error',
    },
    overrides: [
      {
        files: ['src/**/*.{ts,tsx}'],
        env: { browser: true },
      },
      {
        files: ['e2e/**/*.ts'],
        env: { node: true },
      },
      {
        // Root config files belong to tsconfig.node.json.
        files: ['*.config.ts'],
        env: { node: true },
      },
      {
        // Routes export `Route` and shadcn components export variants — neither
        // is a Fast Refresh violation.
        files: ['src/routes/**/*.{ts,tsx}', 'src/components/ui/**/*.{ts,tsx}'],
        rules: {
          'react/only-export-components': 'off',
        },
      },
    ],
  },
  fmt: {
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
    sortTailwindcss: {
      stylesheet: './src/index.css',
      functions: ['cn', 'clsx', 'cva'],
    },
    ignorePatterns: [
      'dist/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'bun.lock',
      'src/routeTree.gen.ts',
    ],
  },
});
