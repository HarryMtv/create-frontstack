import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'src/routeTree.gen.ts'] },

  // Base linting for every JS/TS file (no type information required).
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Type-aware rules for everything covered by a tsconfig project: app source
  // (tsconfig.app.json) and e2e specs (tsconfig.node.json). E2E specs are async
  // Playwright code, so no-floating-promises matters most there. Plain config
  // files (eslint.config.js, prettier.config.js) belong to no project and stay
  // on the untyped baseline above.
  {
    files: ['src/**/*.{ts,tsx}', 'e2e/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      ecmaVersion: 2024,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['e2e/**/*.ts'],
    languageOptions: { globals: globals.node },
  },

  // React rules apply to app code only.
  {
    files: ['src/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat['recommended-latest'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Routes export `Route` and shadcn components export variants — neither is a
  // Fast Refresh violation.
  {
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);
