---
name: setup-project
description: One-time initialization of a freshly generated repo — install deps, commit the lockfile, init git, and run the first quality gate.
---

# Set up the project

Use right after `create-frontstack` generates this repo, before any feature work.

## Steps

1. Confirm the Node version matches `.nvmrc` (26). pnpm is enabled via corepack:
   ```sh
   corepack enable
   ```
2. Install dependencies (this also generates `pnpm-lock.yaml`):
   ```sh
   pnpm install
   ```
3. Initialize git (if not already) and commit the lockfile:
   ```sh
   git init
   git add -A
   git commit -m "chore: initial commit"
   ```
4. Install Playwright browsers for E2E + the playwright/chrome-devtools MCP:
   ```sh
   npx playwright install
   ```
5. Run the quality gate and fix anything red before starting:
   ```sh
   pnpm check
   pnpm build
   ```

`pnpm-lock.yaml` MUST be committed — the Docker build uses `--frozen-lockfile`.
