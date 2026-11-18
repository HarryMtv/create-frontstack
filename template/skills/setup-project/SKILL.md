---
name: setup-project
description: One-time initialization of a freshly generated repo — install deps, commit the lockfile, init git, and run the first quality gate.
---

# Set up the project

Use right after `create-frontstack` generates this repo, before any feature work.

## Steps

1. Confirm the Node version matches `.nvmrc` (26) and Bun 1.3.14 is installed:
   ```sh
   node --version
   bun --version
   ```
2. Install dependencies (this also generates `bun.lock`):
   ```sh
   bun install
   ```
3. Initialize git (if not already) and commit the lockfile:
   ```sh
   git init
   git add -A
   git commit -m "chore: initial commit"
   ```
4. Install Playwright browsers for E2E + the playwright/chrome-devtools MCP:
   ```sh
   bunx playwright install
   ```
5. Run the quality gate and fix anything red before starting:
   ```sh
   bun run check
   bun run build
   ```

`bun.lock` MUST be committed — the Docker build uses `--frozen-lockfile`.
