## Purpose

Defines the frontend project that `create-frontstack` generates: a single-package (non-monorepo) React + TypeScript + Vite application with file-based routing, server/client state separation, type-aware linting, unit + E2E testing, and the exact dependency versions and scripts that make the template reproducible and green across the full quality gate.

## ADDED Requirements

### Requirement: Pinned, validated dependency set
The generated `package.json` SHALL pin every runtime and dev dependency to an exact version (no `^`), with the sole exception of `@types/node` which SHALL use a caret range to track Node 26 minor releases. The pinned set SHALL match `docs/SPEC.md` §2.

#### Scenario: Exact pins for reproducibility
- **WHEN** the generated project's `package.json` is inspected
- **THEN** all dependencies and devDependencies are exact versions except `@types/node`

### Requirement: TypeScript 6.0.3 (not 7)
The generated project SHALL use TypeScript `6.0.3`. It SHALL NOT adopt TypeScript 7, because `typescript-eslint` does not yet support TS 7 and adoption would disable linting entirely (see SPEC §11).

#### Scenario: Type-aware linting works
- **WHEN** `pnpm lint` runs on the generated project
- **THEN** type-checked rules (e.g. `no-floating-promises`) are active and enforced

### Requirement: TypeScript solution-style config without baseUrl
The generated `tsconfig.*` SHALL use solution-style configuration: a root `tsconfig.json` referencing `tsconfig.app.json` (browser code) and `tsconfig.node.json` (Vite/Vitest configs). `tsconfig.app.json` SHALL set `strict`, `moduleResolution: bundler`, and path aliases `@/*` via relative paths with NO `baseUrl`, so the config remains compatible with a future TS 7.

#### Scenario: Alias resolves without baseUrl
- **WHEN** the generated project is typechecked with `pnpm typecheck`
- **THEN** `@/*` imports resolve correctly and the config contains no `baseUrl` key

### Requirement: Vite config with native path resolution and router codegen
The generated `vite.config.ts` SHALL load the TanStack Router Vite plugin first (before React), enable Vite 8 native `resolve.tsconfigPaths` for `@/*` aliases, and configure the Vitest `test` section with `environment: 'happy-dom'`, `globals: true`, setup files, and v8 coverage. The generated `src/routeTree.gen.ts` SHALL be excluded from ESLint, Prettier, and coverage.

#### Scenario: Build runs router codegen then typecheck then bundle
- **WHEN** `pnpm build` runs
- **THEN** `tsr generate` executes before `tsc --noEmit` and `vite build`, and the build succeeds

### Requirement: Type-aware ESLint flat config with route/ui overrides
The generated `eslint.config.js` SHALL use flat config combining `@eslint/js`, type-aware `typescript-eslint` (`recommendedTypeChecked` + `projectService`), `eslint-plugin-react-hooks`, and `react-refresh`. The `react-refresh/only-export-components` rule SHALL be disabled for `src/routes/**` (routes export `Route`) and `src/components/ui/**` (shadcn exports variants). `src/routeTree.gen.ts` SHALL be ignored.

#### Scenario: Routes and shadcn components lint clean
- **WHEN** a route file exports `Route` and a shadcn component exports variants
- **THEN** `eslint .` does not flag either for the react-refresh rule

### Requirement: Tailwind v4 CSS-first configuration
The generated project SHALL use Tailwind v4 with NO `tailwind.config.js`: the `@tailwindcss/vite` plugin, `@import "tailwindcss"`, and design tokens defined in CSS (`:root` / `.dark` in oklch, `@theme inline`). shadcn SHALL be configured for v4 (`components.json` with empty tailwind config and `cssVariables: true`).

#### Scenario: No Tailwind JS config exists
- **WHEN** the generated project is inspected
- **THEN** there is no `tailwind.config.js`/`tailwind.config.ts` and Tailwind utility classes work via the CSS-first setup

### Requirement: File-based routing with generated route tree
The generated project SHALL use TanStack Router file-based routing: routes in `src/routes/`, a `__root.tsx` layout, and a generated `src/routeTree.gen.ts`. The generated file SHALL be gitignored and SHALL NOT be hand-edited.

#### Scenario: Generated route tree is not committed
- **WHEN** the generated project's git status is checked after a fresh build
- **THEN** `src/routeTree.gen.ts` is listed in `.gitignore` and changes to it are ignored by git

### Requirement: Separation of server-state and client-state
The generated project SHALL treat server-state (backend data, caching, invalidation) as the domain of TanStack Query, with fetch functions in `features/<name>/api.ts` and hooks in `features/<name>/use-*.ts`. Client/UI state SHALL use Zustand stores in `src/stores/`. Server-state SHALL NOT be duplicated into Zustand stores.

#### Scenario: Example feature follows the split
- **WHEN** the example feature under `src/features/example/` is inspected
- **THEN** it contains a Query-based hook backed by an `api.ts` fetch function, and the example Zustand store in `src/stores/` holds only client/UI state

### Requirement: Provider and routing composition
The generated `main.tsx` SHALL create the router from the generated route tree, declare the router module types, and wrap `<RouterProvider>` in an `AppProviders` component that supplies the `QueryClientProvider` and dev-only devtools. The root route SHALL render an `<Outlet/>` and dev-only router devtools.

#### Scenario: Devtools are no-op in production
- **WHEN** the production build runs
- **THEN** the Query and Router devtools contribute no runtime cost (tree-shaken / no-op)

### Requirement: Testing layers do not overlap
The generated project SHALL run unit/component tests with Vitest scoped to `src/**` under `happy-dom`, and E2E tests with Playwright scoped to `e2e/**`. The two layers SHALL be configured separately and SHALL NOT collect each other's tests.

#### Scenario: Unit and E2E suites are disjoint
- **WHEN** `pnpm test` and `pnpm test:e2e` run
- **THEN** Vitest discovers only `src/**` tests and Playwright discovers only `e2e/**` specs

### Requirement: Standard npm script set
The generated project SHALL expose the full script set from SPEC §5, including `dev`, `generate:routes`, `build`, `preview`, `typecheck`, `lint`/`lint:fix`, `format`/`format:check`, `test`/`test:watch`/`test:ui`/`test:coverage`, `test:e2e`/`test:e2e:ui`, `check`, and `ui:add`.

#### Scenario: check runs the quality gates
- **WHEN** `pnpm check` runs
- **THEN** it executes `typecheck`, `lint`, and `test` and passes

### Requirement: Node engines target 26 with broad minimum
The generated `package.json` SHALL declare `engines.node: ">=22.12.0"` (the Vite 8 minimum) while the template, `.nvmrc`, and Docker images target Node 26.

#### Scenario: Runs on supported Node versions
- **WHEN** the project is installed and built on Node 22.12+ or Node 26
- **THEN** install, build, typecheck, lint, and test all succeed
