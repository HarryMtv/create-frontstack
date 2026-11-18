# create-frontstack

> One command → a modern, production-ready React + TypeScript frontend repo with Docker, TanStack Router/Query, Zustand, shadcn/ui, and a curated set of agent skills + MCP servers.

```sh
bun create frontstack my-app
# or: npx create-frontstack my-app
# or: npm create frontstack@latest my-app
```

## What you get

A single-package (non-monorepo) frontend project, ready for solo development:

- **React 19 + TypeScript + Vite 8** (Tailwind v4, CSS-first)
- **Vite+** (`vp`) — one toolchain for dev, build, tests, type checks, linting and formatting
- **TanStack Router** (file-based, type-safe) + **TanStack Query** (server state)
- **Zustand** (client/UI state) — server-state lives in Query, never duplicated in stores
- **shadcn/ui** (v4) with a starter `Button`
- **Vitest + happy-dom** (unit/component) and **Playwright** (E2E) as separate layers
- **Oxlint** (type-aware, via Vite+) + **Oxfmt**
- **Bun** as the package manager (Docker, CI and docs are Bun-based)
- **Docker** — multi-stage production image (nginx) + dev image + compose
- **Agent skills** (`skills/`, wired to `.claude` by default) and a fixed **MCP** bundle (shadcn, context7, playwright, chrome-devtools)

The CLI has **zero runtime dependencies** (Node built-ins only), so `npx` is instant.

## Usage

```sh
bun create frontstack my-app
cd my-app
bun install
bunx playwright install   # E2E + playwright/chrome-devtools MCP
bun run dev
```

Flags for non-interactive / CI use:

```sh
npx create-frontstack my-app --skills=claude,agents   # pick skill clients
npx create-frontstack my-app --no-skills              # skip skills entirely
```

Then run the quality gate:

```sh
bun run check      # format + lint + typecheck + test
bun run build      # route codegen + typecheck + bundle
```

## Development of this package

```sh
bun install
bun run check               # format + lint + test the CLI
bun run test                # unit tests (the generation gate is opt-in)
RUN_GENERATION_GATE=1 bun run test   # also scaffold + gate a temp project
```

The generated project is itself the unit under test: the suite runs the CLI into a temp dir and (when Bun/Docker are available) exercises `bun run check` / `bun run format:check` / `bun run build` on the output.

## Publishing

```sh
npm pack --dry-run          # confirm bin/ + template/ (incl. underscore dotfiles) are included
npm version <patch|minor|major>
npm publish --access public --provenance
```

`files: ["bin", "template"]` — only those are published. Dotfiles that npm mangles on publish are stored in the template as `_gitignore` / `_npmrc` / `_nvmrc` and renamed to real dotfiles at generation time.

## License

MIT © Igor Martynov
