# Tasks: implement-create-frontstack

Source of truth for all versions, file contents, and configs: `docs/SPEC.md`. Where a task says "per SPEC §X", reproduce that section exactly. Built-and-verified target: the generated project passes `pnpm check` + `pnpm build` on Node 26.

## 1. Packager repo scaffolding

- [x] 1.1 Create root `package.json` for `create-frontstack`: `name`, `version`, `bin.create-frontstack`, `files: ["bin","template"]`, `license: MIT`, `engines.node ">=22.12.0"`, `packageManager: pnpm@11.18.0`, dev-only deps (eslint/prettier/vitest for testing the CLI), `publishConfig.access: public` (SPEC §9)
- [x] 1.2 Create `LICENSE` (MIT) and `README.md` (usage: `pnpm create frontstack`, `npm create frontstack@latest`, `npx create-frontstack`; publish steps) at repo root
- [x] 1.3 Create `.gitignore` (node_modules, dist, coverage, *.log, .DS_Store) for the packager repo

## 2. CLI core (`bin/index.js`, zero runtime deps) — `scaffolder-cli` capability

- [x] 2.1 Implement `process.argv` parser: positional `<project-name>`, flags `--skills=claude,agents` and `--no-skills`; detect TTY to switch interactive vs non-interactive (SPEC §7.4, §9)
- [x] 2.2 Implement target-dir resolution + guard: create `<name>/`, abort with clear error if it exists and is non-empty (spec: Target directory already exists and is non-empty)
- [x] 2.3 Implement recursive, binary-safe copy of `template/` → target (Node `fs` recursion, no glob lib)
- [x] 2.4 Implement dotfile rename during copy: `_gitignore`→`.gitignore`, `_npmrc`→`.npmrc`, `_nvmrc`→`.nvmrc`; ensure no `_`-prefixed residue remains (SPEC §3 note)
- [x] 2.5 Implement `{{PROJECT_NAME}}` substitution on UTF-8 text targets (`package.json`, `README.md`, etc.); assert zero residual placeholders after substitution
- [x] 2.6 Implement interactive prompts via `readline`: package manager (default pnpm) (SPEC §9 step 1); skills step (yes/no → multi-select `.claude` default, `.agents`) (SPEC §7.4)
- [x] 2.7 Implement package-manager selection feeding the next-steps output

## 3. CLI skills + symlinks step — `agent-skills` capability

- [x] 3.1 Copy canonical `skills/` folder into the target project as real files when skills enabled (SPEC §7.1)
- [x] 3.2 Create relative client symlinks per selection: `.claude/skills -> ../skills` (default), `.agents/skills -> ../skills` (SPEC §7.3)
- [x] 3.3 Implement Windows/permission fallback: directory junction → plain copy + warning when `fs.symlinkSync` fails (SPEC §7.4 step 5)
- [x] 3.4 Copy `.mcp.json` verbatim into target (fixed 4 servers, no selection) (SPEC §7.5)

## 4. CLI next-steps + help

- [x] 4.1 Print next steps on success using chosen package manager, including `npx playwright install` (SPEC §9 step 4)
- [x] 4.2 Add `--help`/usage text covering positional name and flags

## 5. Template: `package.json` + pinned deps + scripts — `frontend-template`

- [x] 5.1 Create `template/package.json` with `{{PROJECT_NAME}}` name placeholder, `engines.node ">=22.12.0"`, `packageManager: pnpm@11.18.0`, type module (SPEC §2, §5)
- [x] 5.2 Add all `dependencies` at exact pins per SPEC §2 (react/react-dom, tanstack router/query, zustand, radix slot, cva, clsx, tailwind-merge, lucide-react)
- [x] 5.3 Add all `devDependencies` at exact pins per SPEC §2 (vite 8 + plugins, tailwind v4, tw-animate-css, shadcn, typescript 6.0.3, typescript-eslint, eslint 10, @eslint/js 10.0.1, react-hooks/refresh plugins, globals, prettier + tailwind plugin, vitest 4 + coverage/ui, happy-dom, testing-library set, playwright, @types/react/dom, `@types/node` ^26) — no `^` except @types/node (vite-tsconfig-paths omitted: native Vite 8 paths used per SPEC §8/§11)
- [x] 5.4 Add the full npm script set per SPEC §5 (dev, generate:routes, build, preview, typecheck, lint/lint:fix, format/format:check, test/test:watch/test:ui/test:coverage, test:e2e/test:e2e:ui, check, ui:add)

## 6. Template: dotfiles + entry HTML

- [x] 6.1 Create `template/_gitignore`, `template/_npmrc`, `template/_nvmrc` (=26) (SPEC §3)
- [x] 6.2 Create `template/index.html` mounting `src/main.tsx`

## 7. Template: TypeScript configs (solution-style, no baseUrl)

- [x] 7.1 `template/tsconfig.json` referencing `tsconfig.app.json` + `tsconfig.node.json` (SPEC §4)
- [x] 7.2 `template/tsconfig.app.json`: `strict`, `moduleResolution: bundler`, `paths: {"@/*": ["./src/*"]}` with NO `baseUrl`, jsx, noEmit, include `src` (SPEC §4, §8.2, §11)
- [x] 7.3 `template/tsconfig.node.json` for Vite/Vitest configs (SPEC §4)

## 8. Template: Vite config

- [x] 8.1 `template/vite.config.ts`: plugins `tanstackRouter({target:'react',autoCodeSplitting:true})` FIRST, then `react()`, then `tailwindcss()`; `resolve.tsconfigPaths: true` (Vite 8 native) (SPEC §4, §11)
- [x] 8.2 `test` section: `environment: 'happy-dom'`, `globals: true`, `setupFiles: ['./src/test/setup.ts']`, coverage v8; exclude `src/routeTree.gen.ts` from coverage (SPEC §4)
- [x] 8.3 (Conditional, per design open question) add `server.watch.usePolling: true` if Docker HMR smoke test requires it (SPEC §6 note) — wired to `CHOKIDAR_USEPOLLING` env

## 9. Template: ESLint + Prettier (flat, type-aware)

- [x] 9.1 `template/eslint.config.js` flat: `@eslint/js` + type-aware `typescript-eslint` (`recommendedTypeChecked` + `parserOptions.projectService`) + `react-hooks` (`configs.flat['recommended-latest']`) + `react-refresh`; ignore `src/routeTree.gen.ts` (SPEC §4, §11)
- [x] 9.2 Add overrides disabling `react-refresh/only-export-components` for `src/routes/**` and `src/components/ui/**` (SPEC §4, §11)
- [x] 9.3 `template/prettier.config.js` with `prettier-plugin-tailwindcss` (SPEC §2)

## 10. Template: Tailwind v4 + shadcn config

- [x] 10.1 `template/src/index.css`: `@import "tailwindcss"`, `@import "tw-animate-css"`, `@custom-variant dark`, `:root`/`.dark` tokens (oklch), `@theme inline` (SPEC §4)
- [x] 10.2 `template/components.json` configured for Tailwind v4 (empty tailwind config, `cssVariables: true`, aliases `@/components`, `@/lib/utils`) (SPEC §4, §8.3)
- [x] 10.3 Create `template/src/lib/utils.ts` (`cn()`) (SPEC §3)

## 11. Template: source — routing, providers, state, example feature, UI, tests

- [x] 11.1 `src/main.tsx`: `createRouter({routeTree})`, `declare module '@tanstack/react-router'`, `<AppProviders><RouterProvider/></AppProviders>` (SPEC §3, §4)
- [x] 11.2 `src/providers.tsx`: `QueryClientProvider` + `<ReactQueryDevtools/>` (dev-only) (SPEC §4)
- [x] 11.3 `src/lib/query-client.ts`: `QueryClient` instance + defaults (SPEC §3)
- [x] 11.4 `src/routes/__root.tsx` (`<Outlet/>` + dev-only router devtools + nav), `index.tsx` (`/`), `about.tsx` (`/about`) (SPEC §3, §4)
- [x] 11.5 `src/routes/__root.tsx` and `.gitignore` entry for `src/routeTree.gen.ts` (generated, not hand-edited) (SPEC §4, §11)
- [x] 11.6 `src/features/example/api.ts` (fetch fns) + `src/features/example/use-example.ts` (`useQuery` hook) (SPEC §3, §4.1)
- [x] 11.7 `src/stores/ui-store.ts` (Zustand example store, client/UI state only) (SPEC §3, §4.1)
- [x] 11.8 `src/components/ui/` with a starter shadcn `button` (SPEC §3)
- [x] 11.9 `src/test/setup.ts` (jest-dom matchers) + `src/__tests__/` example test (component/route) (SPEC §3)
- [x] 11.10 `src/vite-env.d.ts` (SPEC §3)

## 12. Template: Playwright E2E

- [x] 12.1 `template/playwright.config.ts`: `testDir: './e2e'`, `webServer` running dev/preview, `baseURL` on local port (SPEC §4)
- [x] 12.2 `template/e2e/home.spec.ts` smoke test (SPEC §3)

## 13. Template: Docker — `docker-config` capability

- [x] 13.1 `template/Dockerfile` (multi-stage, node:26-alpine, corepack, frozen-lockfile, nginx runtime) per SPEC §6.1
- [x] 13.2 `template/docker/nginx.conf` (SPA fallback + immutable `/assets/`) per SPEC §6.2
- [x] 13.3 `template/Dockerfile.dev` (Vite dev on 5173, `--host 0.0.0.0`) per SPEC §6.3
- [x] 13.4 `template/docker-compose.yml` (dev, anon node_modules volume, CHOKIDAR_USEPOLLING) per SPEC §6.4
- [x] 13.5 `template/.dockerignore` per SPEC §6.5

## 14. Template: CI + README

- [x] 14.1 `template/.github/workflows/ci.yml`: typecheck + lint + test + build on Node 26 (SPEC §3)
- [x] 14.2 `template/README.md` (how to run, scripts, Docker, skills/MCP trust note, MIT) (SPEC §3)

## 15. Agent skills + MCP content — `agent-skills` capability

- [x] 15.1 Create `template/skills/` with the 11 base skills, each `<name>/SKILL.md` with YAML frontmatter `name`+`description` (SPEC §7.6)
- [x] 15.2 Write skill bodies for: setup-project, add-shadcn-component, create-react-component, create-custom-hook, add-route, add-query-hook, add-store-slice, write-vitest-test, add-dependency, run-quality-gate, dockerize-and-run (SPEC §7.6 — wording finalized here)
- [x] 15.3 Create `template/.mcp.json` with the fixed 4 servers (shadcn, context7, playwright, chrome-devtools) per SPEC §7.5

## 16. Verification harness + publish readiness

- [x] 16.1 Unit tests for CLI helpers (arg parse, dotfile rename, placeholder substitution, symlink fallback) (design D1, D2)
- [x] 16.2 Generation test: run CLI into temp dir, assert dotfiles renamed, no `{{PROJECT_NAME}}` residue, skills symlink resolves, `.mcp.json` present (design D5)
- [x] 16.3 Generated-project gate: in the temp dir run `pnpm install`, `pnpm check`, `pnpm build` on Node 26 and assert green (design D5) — verified green manually (install/typecheck/lint/test/build); automated test is env-gated (`RUN_GENERATION_GATE=1`)
- [x] 16.4 `npm pack --dry-run` gate: confirm `bin/`, `template/` incl. underscore dotfiles + `template/skills/**` + `template/.mcp.json` are in the tarball (SPEC §9, design D6) — 66 files, all 11 skills + dotfiles present
- [x] 16.5 Packager CI: lint + test + the generation/gate job on GitHub Actions (design D6)
- [x] 16.6 Final `openspec validate implement-create-frontstack` + `openspec status` green
