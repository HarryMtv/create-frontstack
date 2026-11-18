---
name: run-quality-gate
description: Run bun run check (format + lint + typecheck + test) and fix issues until the whole gate is green.
---

# Run the quality gate

Run this before considering work done, and before any commit/push.

## Steps

1. Full gate:
   ```sh
   bun run check     # format + lint + typecheck + test
   bun run build     # also exercises the production bundle + route codegen
   ```
2. Read failures top-down: format errors first, then lint, then typecheck, then tests.
3. Auto-fix formatting/lint where possible:
   ```sh
   bun run format
   bun run lint:fix
   ```
4. Common fixes:
   - Type errors from a stale route tree → run `bun run generate:routes` (or `bun run typecheck`, which prefixes it).
   - `react/only-export-components` outside `routes/` or `components/ui/` → split non-component exports into another file.
   - Type-only import errors → use `import type { … }` (the project enables `verbatimModuleSyntax`).
5. Do not stop at "mostly green" — the gate must pass fully before commit.

## Notes

- `vp lint` is **type-aware**; type errors can surface as lint errors too.
- `vp fmt --check` fails on unsorted Tailwind classes — run `bun run format` to fix.
- `routeTree.gen.ts` is generated and excluded from lint/format/coverage — never edit it.
