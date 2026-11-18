# syntax=docker/dockerfile:1

# ---- Base: Node 26 + Bun (vp runs on Node; Bun is the package manager) ----
FROM node:26-alpine AS base
# Vite+ native binaries (oxlint/oxfmt/tsrs) are linked against libstdc++ on musl.
RUN apk add --no-cache libstdc++
COPY --from=oven/bun:1.3.14-alpine /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

# ---- Install dependencies (cacheable layer) ----
FROM base AS deps
COPY package.json bun.lock ./
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# ---- Runtime: static files served by nginx ----
FROM nginx:1.30-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
