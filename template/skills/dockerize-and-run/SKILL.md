---
name: dockerize-and-run
description: Build and run the app with Docker and docker-compose according to the project's Dockerfile.dev / Dockerfile / nginx setup.
---

# Dockerize and run

The repo ships a **dev** image (Vite dev server) and a **production** multi-stage image (nginx serving static files). Both target Node 26.

## Dev (with HMR)

```sh
docker compose up          # http://localhost:5173, HMR via CHOKIDAR_USEPOLLING
```

The compose file binds `./` into the container and protects `node_modules` with an anonymous volume, so `pnpm install` runs once.

## Production

```sh
docker build -t <image> .                    # multi-stage: install → build → nginx
docker run --rm -p 8080:80 <image>           # http://localhost:8080
```

nginx serves `dist/`, sends deep links to `index.html` (SPA fallback), and caches hashed assets immutably.

## Requirements / gotchas

- `pnpm-lock.yaml` must be committed (production build uses `pnpm install --frozen-lockfile`).
- E2E (Playwright) and its browsers are **not** in the production image — run those locally or in CI.
- If corepack is unavailable on the Node image, fall back to `RUN npm i -g pnpm@11.18.0`.
