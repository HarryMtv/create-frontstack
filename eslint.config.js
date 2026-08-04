import js from '@eslint/js';
import globals from 'globals';

// ESLint config for the packager repo (bin/ + tests). The generated template
// ships its own eslint.config.js and is excluded here.
export default [
  {
    ignores: ['template/**', 'openspec/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
];
