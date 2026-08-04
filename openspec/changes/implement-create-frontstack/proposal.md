## Why

Solo/small teams repeatedly hand-wire the same modern frontend foundation — React + TypeScript + Vite, routing, data/state, testing, lint/format, Docker — with version drift, broken type-aware linting, and missing agent tooling. There is no reproducible, one-command starter that also ships a curated set of agent skills and MCP servers. The stack is already spike-validated green (see `docs/SPEC.md` §11), so now is the time to package it as a publishable `create-frontstack` npm scaffolder.

## What Changes

- **New publishable npm package** `create-frontstack` (unscoped, MIT) with a zero-runtime-dependency CLI (`bin/index.js`, Node built-ins only) launched via `pnpm create frontstack` / `npm create frontstack@latest` / `npx create-frontstack`.
- **Scaffolding wizard** that copies `template/`, renames npm-mangled dotfiles (`_gitignore`/`_npmrc`/`_nvmrc` → dotfiles), substitutes `{{PROJECT_NAME}}`, lets the user pick a package manager (default pnpm), configures agent skills (with symlink + Windows fallback), and prints next steps.
- **Full frontend template** at a fixed, pinned stack (React 19, TS 6.0.3, Vite 8, Tailwind v4 CSS-first, TanStack Router + Query, Zustand, shadcn/ui, Vitest + happy-dom, Playwright E2E, ESLint flat + type-aware, Prettier) with the exact configs and npm scripts from §4–§5.
- **Docker setup**: multi-stage prod `Dockerfile` (nginx static), `Dockerfile.dev`, `docker-compose.yml`, `docker/nginx.conf`, `.dockerignore` — all on Node 26.
- **Agent skills + MCP**: a single canonical `skills/` folder wired to clients via symlinks (`.claude` default, `.agents` generic), a base set of 11 `SKILL.md` skills, and a fixed `.mcp.json` (shadcn, context7, playwright, chrome-devtools).

## Capabilities

### New Capabilities
- `scaffolder-cli`: The `create-frontstack` CLI wizard — interactive/non-interactive project creation, template copy with dotfile renaming and name substitution, package-manager choice, the skills-configuration step (symlink creation + Windows fallback), next-steps output, and npm packaging/publishing.
- `frontend-template`: The generated frontend project — pinned dependency set, repository structure, all configs (`tsconfig.*`, `vite.config.ts`, `eslint.config.js`, `prettier.config.js`, `playwright.config.ts`, `components.json`), providers/routing/state strategy, and the npm scripts.
- `docker-config`: Docker dev and production images, nginx SPA config, compose file, and `.dockerignore` on Node 26.
- `agent-skills`: Canonical single-source `skills/` folder, client symlink model and matrix, the base skill set, and the fixed `.mcp.json` MCP server bundle.

### Modified Capabilities
<!-- None — greenfield package, no existing specs. -->

## Impact

- **New code/artifacts:** `package.json`, `bin/index.js`, `LICENSE`, `README.md` (packager repo); the entire `template/` tree (configs, `src/`, `e2e/`, `skills/`, Docker, `.github/`, `.mcp.json`).
- **Dependencies:** Only at template-generation time — the CLI itself has zero runtime deps; the template carries the pinned dep set from §2.
- **Tooling/CI:** Packager gets a GitHub Actions workflow (lint/test of the CLI); the generated project gets its own CI (`typecheck + lint + test + build`).
- **Distribution:** `npm publish --access public` with provenance; `npm pack --dry-run` must confirm no template file (including dotfiles-as-underscore) is dropped from the tarball.
- **Non-goals:** Not a monorepo; no backend/database; no per-MCP-server selection flags; non-`.claude`/`.agents` clients (Cursor, Codex) are planned-but-deferred.
