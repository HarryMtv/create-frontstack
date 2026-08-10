# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`create-frontstack` is a scaffolder published to npm. Running it produces a React + TypeScript + Vite frontend repo (TanStack Router/Query, Zustand, shadcn/ui, Docker, agent skills, MCP).

## The two-codebase split

This is the single most important thing to understand before editing anything.

The repo contains **two separate codebases with two separate toolchains**:

|          | Packager                                                        | Template                                                   |
| -------- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| Code     | `bin/index.js`, `test/**`                                       | `template/**`                                              |
| Runtime  | Node built-ins only, **zero runtime deps**                      | React 19 / TS 6 / Vite 8                                   |
| ESLint   | `eslint.config.js` (ignores `template/**`)                      | `template/eslint.config.js`                                |
| Prettier | `prettier.config.js` + `.prettierignore` (ignores `template/`)  | `template/prettier.config.js` + `template/.prettierignore` |
| Vitest   | `vitest.config.js` (`include: test/**`, `exclude: template/**`) | `template/vite.config.ts` (`include: src/**`)              |

They are mutually excluded on purpose. **Root `pnpm lint` / `pnpm format` / `pnpm test` never touch `template/`.** Nothing under `template/` is linted, formatted, typechecked, or tested by any root command — see "Working on the template" for how to do that.

## Commands

```sh
pnpm install
pnpm test                  # packager unit tests (vitest run)
pnpm test:watch
pnpm lint                  # eslint (bin/ + test/ only)
pnpm check                 # lint + test
pnpm format                # prettier — root files only, NOT template/
```

Single test file / single test:

```sh
pnpm vitest run test/cli.test.js
pnpm vitest run -t 'parses a positional name'
```

The generation gate (see below) is opt-in and skipped by default:

```sh
RUN_GENERATION_GATE=1 pnpm vitest run test/generation-gate.test.js
```

Publish safety — the packager ships only `files: ["bin", "template"]`, so verify nothing was dropped:

```sh
npm pack --dry-run
```

CI (`.github/workflows/ci.yml`) runs three jobs: packager lint+test, the generation gate with `RUN_GENERATION_GATE=1`, and `npm pack --dry-run`.

## Design decisions

Settled during a validation spike. The planning tree that recorded them has been removed, so the reasoning lives here — treat these as constraints, not preferences.

- **The CLI has zero runtime dependencies.** `npx` must be instant and the supply-chain surface minimal, so arg parsing and prompts are hand-rolled on `node:readline` instead of pulling `commander`/`prompts`. The cost is bespoke code; it is kept in small exported helpers that are unit-tested.
- **Copy, don't template.** The only substitution needed is `{{PROJECT_NAME}}` plus three dotfile renames, so files are copied byte-for-byte rather than run through a templating engine — that keeps binaries safe.
- **Symlinks are materialized after the copy, never stored in the template**, because npm publish and cross-platform git mangle or drop them.
- **MCP is fixed and unconditional; skills are the only opt-in surface.** Keeping the two concerns separate keeps the wizard simple.
- **The generated project is the unit under test** — see the generation gate below.

Non-goals, deliberately: no backend/database/auth in the template, no monorepo, no per-MCP-server selection, no router/state alternatives, no auto-bumping of pins.

Version pins are deliberate: exact versions, no `^` ranges except `@types/node`. Notably **TypeScript is pinned to 6.0.3, not 7** — `typescript-eslint@8` exits non-zero under TS 7, which would mean no linting at all, not merely degraded linting. **React and react-dom are pinned to 19.2.7, not the latest 19.2.8** — react@19.2.8 changed `createRoot().render()` so the initial commit is no longer flushed synchronously, and under Vitest 4 + `@testing-library/react` every component test renders an empty container (no error, just missing elements); `template/src/test/render.test.tsx` is the regression guard. Revert to 19.2.7 only when a testing-library release flushes 19.2.x. Bumping pins means re-running the generation gate.

## How the CLI works (`bin/index.js`)

Zero runtime dependencies by design — hand-rolled arg parsing and `node:readline` prompts, so `npx` is instant. Pure helpers are exported for unit tests; the entry point runs only when the file is invoked directly, not when imported.

Three transformations happen during the copy, all in `copyDir`:

1. **Dotfile restore.** npm mangles dotfiles on publish, so the template stores them underscore-prefixed and `DOTFILE_MAP` renames them back: `_gitignore` → `.gitignore`, `_npmrc` → `.npmrc`, `_nvmrc` → `.nvmrc`. Any new npm-mangled dotfile must be added there. (Other dotfiles — `.mcp.json`, `.dockerignore`, `.prettierignore` — survive publish and are stored as-is.)
2. **Placeholder substitution.** `{{PROJECT_NAME}}` is the only placeholder, substituted in every copied file.
3. **Skills wiring.** `template/skills/` ships as **real files** because symlinks don't survive npm publish. `skills/` is skipped in the main copy and only copied when skills are enabled; then `linkSkills` materializes a _relative_ `../skills` symlink into `.claude/` and/or `.agents/`, falling back symlink → Windows junction → plain copy, warning on the two fallbacks.

MCP (`template/.mcp.json`, four fixed servers) is always copied and never selectable; skills are the only opt-in agent surface.

Interactive vs non-interactive is decided by `process.stdin.isTTY`. Non-interactive requires a positional name and always uses pnpm — that is what makes CI deterministic.

## Working on the template

`template/` is **not a runnable project in place**: no `node_modules`, dotfiles are underscore-prefixed, and `{{PROJECT_NAME}}` is unsubstituted. To exercise it, generate a project:

```sh
cd $(mktemp -d)
node /path/to/create-frontstack/bin/index.js myapp --no-skills
cd myapp && pnpm install && pnpm check
```

**The generation gate is the real verification**: the generated project is the unit under test, because the packager's own lint/test prove nothing about the template. `test/generation-gate.test.js` scaffolds into a temp dir and runs `pnpm install` + `pnpm check` + `pnpm build` there. Run it after any template change.

Note `pnpm check` in the generated project is `typecheck + lint + test` — it does **not** include `format:check`. Formatting regressions in the template pass the gate silently.

### Formatting template files

`template/prettier.config.js` loads `prettier-plugin-tailwindcss`, and **Prettier resolves plugins relative to the CWD, not to the config file**. Formatting `template/` from the repo root fails with `Cannot find package 'prettier-plugin-tailwindcss'` — and with `--write` it fails _silently_, changing nothing. Run Prettier from inside a generated project that has the plugin installed, pointing at the template:

```sh
cd /path/to/generated-app
./node_modules/.bin/prettier --config ./prettier.config.js --write /path/to/create-frontstack/template
```

Without the plugin, Tailwind class ordering is left unsorted and `pnpm format:check` still fails in generated projects.

### Type-aware linting in the template

`template/eslint.config.js` applies type-aware rules only to files a tsconfig project actually covers — `src/**` (`tsconfig.app.json`) and `e2e/**` (`tsconfig.node.json`). Adding a new top-level TS directory means adding it to a tsconfig `include` _and_ to the eslint `files` list; the eslint change alone gives no type information. Root config files belong to no project and stay on the untyped baseline.

`src/routeTree.gen.ts` is generated by the router plugin and must stay excluded from ESLint, Prettier, and coverage. `typecheck`/`build` prefix `tsr generate` so the file exists before `tsc` runs.

## Agent skills in this repo

Two unrelated sets of skills — don't confuse them:

- **`skills/` at the repo root** — vendored third-party skills (`mattpocock/skills`), tracked by `skills-lock.json` with source hashes. `.claude/skills`, `.agents/skills`, and `.codex/skills` are symlinks to it. Not authored here; out of scope for review and edits.
- **`template/skills/`** — the 11 skills shipped _to generated projects_ (`add-route`, `add-query-hook`, `write-vitest-test`, …). These are the documented coding conventions for template code, so `template/src/**` must obey them: query keys live in an `xxxKeys` factory rather than inline arrays, tests are colocated (`button.tsx` → `button.test.tsx`), and so on. Template code that contradicts its own SKILL.md is a defect.
