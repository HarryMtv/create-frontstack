---
name: run-quality-gate
description: Run pnpm check (typecheck + lint + test) and fix issues until the whole gate is green.
---

# Run the quality gate

Run this before considering work done, and before any commit/push.

## Steps

1. Full gate:
   ```sh
   pnpm check        # typecheck + lint + test
   pnpm build        # also exercises the production bundle + route codegen
   ```
2. Read failures top-down: typecheck errors first, then lint, then test.
3. Auto-fix formatting/lint where possible:
   ```sh
   pnpm lint:fix
   pnpm format
   ```
4. Common fixes:
   - `tsc` errors from a stale route tree → run `pnpm generate:routes` (or `pnpm typecheck`, which prefixes it).
   - `react-refresh/only-export-components` outside `routes/` or `components/ui/` → split non-component exports into another file.
   - Type-only import errors → use `import type { … }` (the project enables `verbatimModuleSyntax`).
5. Do not stop at "mostly green" — the gate must pass fully before commit.

## Notes

- `eslint .` is **type-aware**; type errors can surface as lint errors too.
- `routeTree.gen.ts` is generated and excluded from lint/coverage — never edit it.
