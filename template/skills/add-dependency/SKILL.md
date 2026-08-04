---
name: add-dependency
description: Add a dependency with an exact pin via pnpm, following the project's no-caret policy for runtime/dev packages.
---

# Add a dependency

This project pins **exact** versions (no `^`) for reproducibility. Only `@types/node` uses a caret.

## Steps

1. Install with an exact version:
   ```sh
   pnpm add <pkg>@<version>          # dependency
   pnpm add -D <pkg>@<version>       # devDependency
   ```
   If you don't pin a version, pnpm writes a caret — fix it in `package.json` afterward so the value is exact.
2. (Optional) use the **context7** MCP to confirm current docs/API for the package before integrating.
3. Commit the updated `package.json` **and** `pnpm-lock.yaml` together.
4. Run the gate:
   ```sh
   pnpm check && pnpm build
   ```

## Conventions

- Runtime (`dependencies`) vs build/test (`devDependencies`) — place correctly.
- Keep the lockfile committed; the Docker build relies on `--frozen-lockfile`.
- Prefer exact pins matching the rest of the stack.
