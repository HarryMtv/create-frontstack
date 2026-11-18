---
name: dockerize-and-run
description: Build and run the app with Docker and docker-compose according to the project's Dockerfile.dev / Dockerfile / nginx setup.
---

# Dockerize and run

The repo ships a **dev** image (Vite dev server) and a **production** multi-stage image (nginx serving static files). Both target Node 26 and copy the Bun binary from `oven/bun:1.3.14-alpine`.

## Dev (with HMR)

```sh
docker compose up          # http://localhost:5173, HMR via CHOKIDAR_USEPOLLING
```

The compose file binds `./` into the container and protects `node_modules` with an anonymous volume, so `bun install` runs once.

## Production

```sh
docker build -t <image> .                    # multi-stage: install → build → nginx
docker run --rm -p 8080:80 <image>           # http://localhost:8080
```

nginx serves `dist/`, sends deep links to `index.html` (SPA fallback), and caches hashed assets immutably.

## Requirements / gotchas

- `bun.lock` must be committed (production build uses `bun install --frozen-lockfile`). Run `bun install` once after scaffolding so the lockfile exists.
- Run `bun install` and `bun run build` locally first; this catches type/lint failures before the slower image build.
- The Dockerfiles install `libstdc++` — Vite+ native binaries (oxlint/oxfmt/tsrs) need it on Alpine (musl).
- `vp` runs on Node, so the images start from `node:26-alpine` and only copy the Bun binary; Node ≥ 26 (current LTS) is still required.
- E2E (Playwright) and its browsers are **not** in the production image — run those locally or in CI.
