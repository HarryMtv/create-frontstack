## Purpose

Provides the Docker configuration shipped in the generated project so the same codebase runs identically in development (live Vite dev server with HMR) and in production (static SPA served by nginx), both built on Node 26 and reproducible via a committed lockfile.

## ADDED Requirements

### Requirement: Production multi-stage image on Node 26
The generated project SHALL include a multi-stage `Dockerfile` whose base is `node:26-alpine`, enables pnpm via corepack, installs dependencies from a committed `pnpm-lock.yaml` with `--frozen-lockfile`, builds the app, and serves the resulting static bundle from an nginx runtime image.

#### Scenario: Production image serves the built app
- **WHEN** the production image is built and run
- **THEN** nginx serves the Vite `dist/` output on port 80 and the SPA routes resolve

### Requirement: Frozen lockfile requires committed lockfile
The Docker build SHALL install with `pnpm install --frozen-lockfile`, which requires a committed `pnpm-lock.yaml`. The template SHALL document that the lockfile is generated on first install and committed.

#### Scenario: Build fails fast on lockfile drift
- **WHEN** `pnpm-lock.yaml` is missing or out of sync with `package.json`
- **THEN** the Docker dependency stage fails rather than mutating the lockfile

### Requirement: nginx SPA routing and asset caching
The generated `docker/nginx.conf` SHALL send all non-asset requests to `index.html` (SPA fallback) and SHALL set long-lived, immutable cache headers on hashed assets under `/assets/`.

#### Scenario: Deep link loads the SPA
- **WHEN** a request for `/about` hits nginx
- **THEN** nginx returns `index.html` (client-side routing handles the path)
#### Scenario: Hashed assets are cached immutably
- **WHEN** a request under `/assets/` is served
- **THEN** the response carries a `Cache-Control: public, immutable` header with a long max-age

### Requirement: Development image and compose with HMR
The generated project SHALL include a `Dockerfile.dev` running the Vite dev server on port 5173 bound to `0.0.0.0`, and a `docker-compose.yml` that mounts the source, preserves the container `node_modules` via an anonymous volume, and enables watch polling for reliable HMR under Docker.

#### Scenario: Dev compose starts with HMR
- **WHEN** `docker compose up` runs against `Dockerfile.dev`
- **THEN** the dev server is reachable on host port 5173 and source edits trigger hot reload

### Requirement: Dockerignore excludes non-production artifacts
The generated `.dockerignore` SHALL exclude `node_modules`, `dist`, `coverage`, `playwright-report`, `test-results`, `e2e`, `.git`, `.github`, editor dirs, logs, and the Docker files themselves from the build context.

#### Scenario: Build context excludes tests and CI artifacts
- **WHEN** the production build context is assembled
- **THEN** none of `e2e/`, `playwright-report/`, `coverage/`, or `.git/` is sent to the builder
