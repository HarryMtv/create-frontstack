## Context

The repo is greenfield: no `package.json`, `bin/`, or `template/` exist yet — only `docs/SPEC.md` (the authoritative, spike-validated design), the OpenSpec planning tree, and the repo's own agent tooling (`skills/`, `.claude/`, `.agents/`, `.codex/`). This change builds two things in one package: (1) a zero-dependency CLI that copies a template into a new repo, and (2) the template itself. See `proposal.md` for *why*; see `specs/` for the behavior contract. This document covers *how* and the key technical choices. Stack-level rationale (why TanStack Router, why Zustand, why TS 6.0.3 not 7) is already decided in `docs/SPEC.md` §8 and is not re-derived here.

The single source of truth for every pinned version, file, and config in the template is `docs/SPEC.md`. The implementation reproduces it exactly; where this doc and the SPEC appear to differ, the SPEC wins.

## Goals / Non-Goals

**Goals:**
- A CLI that is fast to `npx` (zero runtime deps) and deterministic in CI (fully flag-driven).
- A template that passes the full quality gate (`pnpm check` + `build`) as generated, on Node 26 and the `>=22.12.0` floor.
- A verification harness that proves the *generated* project is green — not just the packager.

**Non-Goals:**
- No backend, database, or auth in the template.
- No monorepo.
- No per-MCP-server selection; no router/state alternatives.
- Cursor / Codex client wiring beyond the documented matrix (planned, deferred).
- No auto-bumping of pinned versions — pins are intentional and bumped deliberately.

## Decisions

### D1. CLI uses only Node built-ins (`readline` + manual arg parsing), no prompt/CLI library
**Why:** `create-frontstack` must run via `npx` with no install tax and a minimal supply-chain surface. Pulling `prompts`/`@inquirer/prompts` + `commander`/`cac` would add runtime deps, violating the zero-dependency requirement (SPEC §9) and slowing cold `npx`. **Alternatives:** `@inquirer/prompts` (nicer UX, richer selects) — rejected for the zero-dep constraint; `cac` for args — rejected, manual `process.argv` parsing is trivial for our small flag set. **Trade-off:** hand-rolled prompts/arg parsing are more code to maintain; we accept this and isolate it in small, well-tested helpers.

### D2. Template copy = recursive binary copy + rename + single placeholder substitution
**Why:** The only templating need is the project name (`{{PROJECT_NAME}}`) and the three dotfile renames (`_gitignore`/`_npmrc`/`_nvmrc`). A full templating engine is unjustified. Files are copied byte-for-byte (binary-safe); text substitution runs only on UTF-8 files matching known targets (`package.json`, `README.md`, etc.) to avoid corrupting binaries. **Alternatives:** a templating lib (ejs/handlebars) — overkill and adds risk; copying then `sed`-ing everything — risks binary corruption. **Edge cases handled:** existing non-empty target dir → abort (per `scaffolder-cli` spec); placeholder must leave zero residual occurrences.

### D3. Symlinks created post-copy with Windows junction/copy fallback; never stored in the template
**Why:** npm publish and cross-platform git mangle/omit symlinks (SPEC §7.1). So the template ships the canonical `skills/` as real files and the CLI materializes the relative symlink(s) after copy. On failure the CLI falls back: directory junction (Windows) → plain folder copy, always with a warning (per `agent-skills` spec). Symlinks are **relative** (`../skills`) so the generated repo is relocatable. **Alternatives:** duplicate `skills/` per client — drift; ship symlinks in tarball — unreliably preserved.

### D4. MCP is fixed and unconditional; skills are the only opt-in agent surface
**Why:** SPEC §7.5 fixes `.mcp.json` to four servers with no selection step, so the CLI copies it verbatim. Only the skills step is interactive/flaggable (`--skills`/`--no-skills`). Keeping these as distinct concerns (MCP = always, skills = opt-in) matches the spec and keeps the wizard simple.

### D5. The generated project is the unit under test
**Why:** The packager's own lint/test don't prove the template works. The verification harness runs the CLI into a temp dir, runs `pnpm install` + `pnpm check` + `pnpm build` (+ a Playwright smoke if browsers are available) in that generated dir, and asserts green. This catches version drift and config breakage that unit tests of the CLI cannot. **Alternatives:** commit a generated fixture — goes stale; skip generation testing — unacceptable given the pinned-version risk.

### D6. Packager layout and publish safety
`files: ["bin", "template"]`; `bin.create-frontstack`. The `.mcp.json`, underscore dotfiles, and `template/skills/**` are the most likely to be silently dropped — `npm pack --dry-run` is a gate. CI runs the packager's lint/test + the D5 generation test on every change.

## Risks / Trade-offs

- [Pinned versions drift out of currency] → Versions are fixed as of SPEC §2 (validated 2026-07-31). Bumps are deliberate, accompanied by re-running the D5 harness. No `^` ranges (except `@types/node`) so a fresh install reproduces the green spike.
- [Zero-dep CLI = more bespoke prompt/arg code] → Isolate in small helpers with unit tests; keep the flag surface minimal (`--skills`, `--no-skills`, positional name).
- [Symlink failure on locked-down Windows] → Junction/copy fallback + explicit warning; documented in the generated `README.md`.
- [TS 7 blocked on `typescript-eslint`] → Pinned to TS 6.0.3 (SPEC §8.2, §11); tracked via typescript-eslint#10940. Upgrading is a future change, not a side effect here.
- [`routeTree.gen.ts` race in build/typecheck] → `build`/`typecheck` scripts prefix `tsr generate` before `tsc` (SPEC §11); the file is gitignored.
- [Cross-platform Node 26 corepack availability] → Dockerfile fallback documented (`npm i -g pnpm@11.18.0`) per SPEC §6.

## Migration Plan

Greenfield — no migration. Rollout: implement → `npm pack --dry-run` gate → local `npx .` smoke into a temp dir → publish `--access public` with provenance → first consumer runs `pnpm create frontstack`. Rollback of a bad publish = unpublish within the window or `npm deprecate` + semver bump.

## Open Questions

- Exact prose of each of the 11 base `SKILL.md` files (SPEC §7.6 fixes the list and format; wording is written during implementation and does not change specs or tasks).
- Whether `server.watch.usePolling: true` is needed in `vite.config.ts` for Docker HMR on all platforms, or only documented (SPEC §6 note) — settled during the Docker smoke test; behavior-neutral.
