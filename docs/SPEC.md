# Спецификация: `create-frontstack`

Публикуемый npm-пакет-скаффолдер (по аналогии с `full-stack-fastapi-template`), который одной командой создаёт репозиторий с современным фронтенд-стеком (React + TypeScript + Vite), готовой Docker-конфигурацией и набором agent skills.

> Статус: **спецификация** (реализация пакета не выполнена). Совместимость стека **проверена спайком** — полный тулчейн зелёный, см. раздел 11. Ниже зафиксированы решения, версии, структура и содержимое ключевых файлов.

---

## 1. Цели

- Одна команда — новый готовый к работе репозиторий: `pnpm create frontstack my-app`.
- Самые свежие версии инструментов (проверены по npm registry на 31 июля 2026).
- Единые конвенции для «почти всех продуктов»: тесты (unit + E2E), линт, формат, Tailwind, shadcn.
- Готовый Docker (dev + prod).
- Встроенный набор **agent skills** (формат `SKILL.md`, совместимый с Claude Code и др. агентами) и **MCP-серверы** из коробки (shadcn, context7, playwright, chrome-devtools).
- Пакет публикуется в npm и запускается через `npm create` / `pnpm create` / `npx`.

---

## 2. Целевой стек и зафиксированные версии

Все версии — точные пины (без `^`), чтобы шаблон был воспроизводимым. Диапазон `^` оставлен только для `@types/node`, чтобы следовать за минорными Node 26.

### Рантайм / тулинг

| Компонент | Версия | Заметка |
|---|---|---|
| **Node.js** | `26` | `node:26-alpine`, `.nvmrc=26`; Current-релиз, Active LTS — окт 2026. |
| **pnpm** | `11.18.0` | Указан в `packageManager`, активируется через corepack. |
| **TypeScript** | `6.0.3` | Последняя JS-версия. TS 7 (нативный) отложен — ломает ESLint, см. п. 8 и раздел 11. |

### Зависимости приложения (`dependencies`)

| Пакет | Версия | Роль |
|---|---|---|
| `react` | `19.2.8` | UI-библиотека |
| `react-dom` | `19.2.8` | Рендер в DOM |
| `@tanstack/react-router` | `1.170.18` | Роутинг (типобезопасный, file-based) |
| `@tanstack/react-query` | `5.101.4` | Server-state / кэш запросов |
| `zustand` | `5.0.14` | Клиентский/UI-стейт |
| `@radix-ui/react-slot` | `1.3.3` | shadcn (asChild) |
| `class-variance-authority` | `0.7.1` | shadcn (варианты) |
| `clsx` | `2.1.1` | Классы |
| `tailwind-merge` | `3.6.0` | `cn()` |
| `lucide-react` | `1.28.0` | Иконки |

### Dev-зависимости (`devDependencies`)

| Пакет | Версия | Роль |
|---|---|---|
| `@tanstack/react-query-devtools` | `5.101.4` | Devtools Query (no-op в prod) |
| `@tanstack/router-plugin` | `1.168.23` | Vite-плагин: кодоген `routeTree.gen.ts` из `src/routes/` |
| `@tanstack/router-cli` | `1.167.21` | Standalone-генерация route tree (`tsr generate`) для typecheck/CI |
| `@tanstack/react-router-devtools` | `1.167.0` | Devtools роутера (dev) |
| `vite` | `8.2.0` | Сборщик/дев-сервер |
| `@vitejs/plugin-react` | `6.0.5` | React + Fast Refresh |
| `vite-tsconfig-paths` | `6.1.1` | Алиасы `@/*` (опционально — Vite 8 умеет нативно, см. п. 8) |
| `@tailwindcss/vite` | `4.3.3` | Tailwind v4 (CSS-first, без `tailwind.config.js`) |
| `tailwindcss` | `4.3.3` | Ядро Tailwind v4 |
| `tw-animate-css` | `1.4.0` | Анимации (замена `tailwindcss-animate` для v4) |
| `shadcn` | `4.16.1` | CLI shadcn/ui (v4, Tailwind v4) |
| `typescript` | `6.0.3` | Компилятор (TS 7 отложен, см. п. 8) |
| `typescript-eslint` | `8.65.0` | Пресеты + парсер для ESLint |
| `eslint` | `10.8.0` | Линтер (flat config) |
| `@eslint/js` | `10.0.1` | Базовый JS-пресет (версия ≠ версии `eslint`) |
| `eslint-plugin-react-hooks` | `7.1.1` | Правила хуков |
| `eslint-plugin-react-refresh` | `0.5.3` | Правила Fast Refresh |
| `globals` | `17.8.0` | Наборы глобалов |
| `prettier` | `3.9.6` | Форматтер |
| `prettier-plugin-tailwindcss` | `0.8.1` | Сортировка Tailwind-классов |
| `vitest` | `4.1.10` | Тест-раннер |
| `@vitest/coverage-v8` | `4.1.10` | Покрытие |
| `@vitest/ui` | `4.1.10` | UI тестов |
| `happy-dom` | `20.11.1` | DOM-окружение для тестов (быстрее jsdom) |
| `@testing-library/react` | `16.3.2` | Рендер компонентов в тестах |
| `@testing-library/dom` | `10.4.0` | Пир-зависимость RTL |
| `@testing-library/jest-dom` | `7.0.0` | Матчеры `toBeInTheDocument` и т.д. |
| `@testing-library/user-event` | `14.6.1` | Симуляция действий пользователя |
| `@playwright/test` | `1.62.1` | E2E-тесты (реальный браузер) |
| `@types/react` | `19.2.18` | Типы React |
| `@types/react-dom` | `19.2.4` | Типы ReactDOM |
| `@types/node` | `^26` | Типы Node (под Node 26) |

---

## 3. Структура репозитория пакета-скаффолдера

```
create-frontstack/
├── package.json              # метаданные CLI: bin, files, publishConfig
├── README.md                 # как пользоваться и публиковать
├── LICENSE
├── bin/
│   └── index.js              # точка входа CLI (Node built-ins, без рантайм-зависимостей)
└── template/                 # то, что копируется в новый проект
    ├── _gitignore            # → .gitignore при скаффолдинге
    ├── _npmrc                # → .npmrc
    ├── _nvmrc                # → .nvmrc  (26)
    ├── package.json          # с плейсхолдером {{PROJECT_NAME}}
    ├── index.html
    ├── vite.config.ts
    ├── playwright.config.ts  # конфиг E2E (Playwright)
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── eslint.config.js
    ├── prettier.config.js
    ├── components.json       # конфиг shadcn/ui
    ├── README.md
    ├── Dockerfile            # prod, multi-stage
    ├── Dockerfile.dev        # dev-сервер
    ├── docker-compose.yml
    ├── .dockerignore
    ├── docker/
    │   └── nginx.conf        # SPA-роутинг + кэш
    ├── .github/
    │   └── workflows/ci.yml  # typecheck + lint + test + build
    ├── src/
    │   ├── main.tsx          # createRouter(routeTree) → <AppProviders><RouterProvider/></AppProviders>
    │   ├── providers.tsx     # QueryClientProvider + devtools (+ будущие провайдеры)
    │   ├── routeTree.gen.ts  # генерируется плагином (в .gitignore, не редактируется вручную)
    │   ├── routes/           # file-based маршруты TanStack Router
    │   │   ├── __root.tsx    # корневой layout: <Outlet/>, devtools, навигация
    │   │   ├── index.tsx     # маршрут "/"
    │   │   └── about.tsx     # маршрут "/about"
    │   ├── index.css         # Tailwind v4 + токены shadcn
    │   ├── vite-env.d.ts
    │   ├── lib/
    │   │   ├── utils.ts      # cn()
    │   │   └── query-client.ts   # инстанс QueryClient + дефолты
    │   ├── features/         # пример: features/<name>/{api,hooks,components}
    │   │   └── example/
    │   │       ├── api.ts        # fetch-функции
    │   │       └── use-example.ts # useQuery-хук
    │   ├── stores/           # Zustand-сторы (клиентский стейт)
    │   │   └── ui-store.ts   # пример: тема/сайдбар
    │   ├── components/ui/    # предустановленные компоненты shadcn (button, ...)
    │   │   ├── button.tsx
    │   │   └── button.test.tsx   # тесты колокируются рядом с кодом
    │   └── test/setup.ts     # jest-dom matchers
    ├── e2e/                  # E2E-тесты Playwright
    │   └── home.spec.ts
    ├── skills/               # ЕДИНЫЙ источник agent skills (обычные файлы, см. раздел 7)
    │   ├── add-shadcn-component/SKILL.md
    │   └── ...
    ├── .claude/
    │   └── skills -> ../skills   # СИМЛИНК, создаётся CLI (клиент по умолчанию)
    └── .mcp.json             # MCP Claude Code: shadcn, context7, playwright, chrome-devtools
```

> **Про дотфайлы.** npm при публикации искажает/выкидывает `.gitignore` и `.npmrc`. Поэтому в шаблоне они лежат как `_gitignore` / `_npmrc` / `_nvmrc`, а CLI переименовывает их при копировании. На этапе имплементации это подтверждается через `npm pack --dry-run` (проверить, что ни один нужный файл не выпал из tarball).

---

## 4. Структура генерируемого проекта

Однопакетный (не монорепо) фронтенд-проект — под соло-разработку. Основные файлы и их назначение перечислены в дереве выше. Ключевые конфиги:

- **`tsconfig.*`** — solution-style: корневой `tsconfig.json` со ссылками на `tsconfig.app.json` (браузерный код, `moduleResolution: bundler`, `strict`, `paths: { "@/*": ["./src/*"] }` — **без `baseUrl`**, пути относительные, чтобы конфиг был совместим и с TS 7) и `tsconfig.node.json` (конфиги Vite/Vitest).
- **`vite.config.ts`** — плагины `tanstackRouter({ target: 'react', autoCodeSplitting: true })` (первым, до react), `react()`, `tailwindcss()`. Алиасы `@/*` — через нативный `resolve.tsconfigPaths: true` (Vite 8; плагин `vite-tsconfig-paths` больше не нужен). Секция `test` для Vitest (`environment: 'happy-dom'`, `globals: true`, `setupFiles`, `coverage: v8`). Сгенерированный `src/routeTree.gen.ts` исключается из ESLint, Prettier и покрытия.
- **`eslint.config.js`** — flat config; `@eslint/js` + `typescript-eslint` **type-aware** (`recommendedTypeChecked` + `parserOptions.projectService`) + `eslint-plugin-react-hooks` (импорт `configs.flat['recommended-latest']`) + react-refresh. Оверрайд: `react-refresh/only-export-components` выключен для `src/routes/**` (маршруты экспортируют `Route`) и `src/components/ui/**` (shadcn экспортирует варианты). В ignore — `src/routeTree.gen.ts`.
- **`src/index.css`** — Tailwind v4: `@import "tailwindcss"`, `@import "tw-animate-css"`, `@custom-variant dark`, токены `:root`/`.dark` (oklch), `@theme inline`.
- **`playwright.config.ts`** — E2E: `testDir: './e2e'`, `webServer` поднимает `pnpm dev` (или `preview`) перед прогоном, `baseURL` на локальный порт. Отдельно от Vitest (`src/**`).
- **Провайдеры и роутинг.** File-based роутинг TanStack Router: маршруты в `src/routes/`, `routeTree.gen.ts` генерируется плагином на лету. `main.tsx` создаёт роутер (`createRouter({ routeTree })`), регистрирует типы через `declare module '@tanstack/react-router'` и монтирует `<AppProviders>` (из `providers.tsx`) вокруг `<RouterProvider router={router} />`. `providers.tsx` содержит `QueryClientProvider` + `<ReactQueryDevtools />` (no-op в prod). `__root.tsx` рендерит `<Outlet/>` и `<TanStackRouterDevtools />` в dev. Zustand-сторы провайдера не требуют — импортируются напрямую.

### 4.1 Стратегия управления состоянием

Чёткое разделение на два вида состояния:

- **Server-state** (данные с бэкенда, кэш, инвалидция, ретраи, background refetch) → **TanStack Query**. Fetch-функции живут в `features/<name>/api.ts`, обёртки-хуки (`useQuery`/`useMutation`) — в `features/<name>/use-*.ts`.
- **Client/UI-state** (тема, открытость сайдбара/модалок, локальные флаги, in-memory токен) → **Zustand**. По одному небольшому стору на домен в `src/stores/`.

Правило: **не дублировать server-state в Zustand**. Если данные приходят с сервера — их источник истины Query, а не стор.

---

## 5. npm-скрипты генерируемого проекта

| Скрипт | Команда |
|---|---|
| `dev` | `vite` |
| `generate:routes` | `tsr generate` |
| `build` | `tsr generate && tsc --noEmit -p tsconfig.app.json && vite build` |
| `preview` | `vite preview` |
| `typecheck` | `tsr generate && tsc --noEmit -p tsconfig.app.json` |
| `lint` / `lint:fix` | `eslint .` / `eslint . --fix` |
| `format` / `format:check` | `prettier --write .` / `prettier --check .` |
| `test` / `test:watch` | `vitest run` / `vitest` |
| `test:ui` / `test:coverage` | `vitest --ui` / `vitest run --coverage` |
| `test:e2e` / `test:e2e:ui` | `playwright test` / `playwright test --ui` |
| `check` | `pnpm typecheck && pnpm lint && pnpm test` |
| `ui:add` | `shadcn add` |

---

## 6. Docker-конфигурация

Основана на Node 26. Три файла + nginx-конфиг + `.dockerignore`.

### 6.1 `Dockerfile` (production, multi-stage)

```dockerfile
# syntax=docker/dockerfile:1

# ---- Base: Node 26 + pnpm через corepack ----
FROM node:26-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---- Установка зависимостей (кэшируемый слой) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- Сборка ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---- Runtime: статика через nginx ----
FROM nginx:1.27-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 6.2 `docker/nginx.conf` (SPA-роутинг + кэш хэшированных ассетов)

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### 6.3 `Dockerfile.dev` (дев-сервер Vite)

```dockerfile
FROM node:26-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
```

### 6.4 `docker-compose.yml` (dev)

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules      # не перетирать node_modules из контейнера
    environment:
      - CHOKIDAR_USEPOLLING=true   # надёжный HMR под Docker
    command: pnpm dev --host 0.0.0.0
```

### 6.5 `.dockerignore`

```
node_modules
dist
coverage
playwright-report
test-results
e2e
.git
.github
.vscode
.idea
*.log
Dockerfile*
docker-compose*
.dockerignore
```

**Заметки к реализации Docker:**
- `--frozen-lockfile` требует наличия `pnpm-lock.yaml` — он генерируется при первом `pnpm install` и коммитится.
- Если в Node 26 corepack окажется недоступен/выпилен, фолбэк: `RUN npm i -g pnpm@11.18.0`.
- Для HMR под Docker в `vite.config.ts` может понадобиться `server.watch.usePolling: true`.
- E2E (Playwright) в prod-образ не входит; браузеры ставятся отдельно (`npx playwright install`) в CI/локально.

---

## 7. Agent skills и MCP

> **Самостоятельный раздел.** Держится отдельно от остальной спеки намеренно: skills и MCP-серверы будут пополняться независимо от стека. Расширение = добавить строку в таблицу, не трогая прочие разделы.

### 7.1 Модель хранения: одна папка + симлинки под клиентов

Единый источник истины — папка **`skills/`** в корне репозитория (обычные файлы). Под каждый агент-клиент CLI создаёт **симлинк** на эту папку в ожидаемом клиентом месте. Дублирования файлов нет — все клиенты читают один и тот же набор.

```
repo/
├── skills/                     # canonical source (реальные файлы)
│   └── <skill-name>/SKILL.md
├── .claude/
│   └── skills -> ../skills     # симлинк (клиент по умолчанию)
└── .mcp.json                   # MCP Claude Code (4 сервера, см. 7.5)
```

- **По умолчанию поддерживается только `.claude`** (Claude Code). Прочие клиенты — опционально, отдельным выбором.
- Симлинки **не** лежат в npm-шаблоне (npm/git их искажают) — их создаёт CLI при скаффолдинге, после чего пользователь коммитит. Git восстанавливает симлинки при клоне, если `core.symlinks=true` (дефолт на macOS/Linux).

### 7.2 Формат скиллы

Как у `mattpocock/skills`: папка = одна скилла со `SKILL.md` (YAML-frontmatter `name` + `description`), опционально `agents/openai.yaml` (кросс-агентные метаданные) и `scripts/`. Формат клиенто-независимый; позже набор можно опубликовать как Claude Code plugin или через skills.sh.

### 7.3 Матрица клиентов (расширяемая)

| Клиент | Симлинк skills | MCP-конфиг | Статус |
|---|---|---|---|
| **Claude Code** | `.claude/skills -> ../skills` | `.mcp.json` (project scope) | **по умолчанию** |
| **Generic / кросс-агент** | `.agents/skills -> ../skills` | — (зависит от агента) | поддерживается |
| Cursor | `.cursor/skills -> ../skills` | `.cursor/mcp.json` | планируется |
| Codex CLI | `.codex/skills -> ../skills` | `~/.codex/config` (глобально) | планируется |

> `.agents/skills/` — общая кросс-агентная директория (конвенция `.agents/`), покрывает агентов, читающих этот путь. Таблица — точка расширения; точные пути специфичных клиентов уточняются при имплементации.

### 7.4 CLI: отдельный шаг настройки skills

Настройка skills — **самостоятельный шаг мастера** (можно пропустить целиком):

1. Спросить: подключать ли agent skills? (Д/н)
2. Если да — мультивыбор клиентов: **Claude** (`.claude/skills`, дефолт) и **Generic** (`.agents/skills`); прочие — по мере добавления в матрицу 7.3.
3. Скопировать папку `skills/` в новый проект (реальные файлы).
4. Для каждого выбранного клиента создать относительный симлинк по матрице 7.3.
5. **Windows-фолбэк:** если симлинки недоступны (нет прав/`core.symlinks=false`) — junction для директории либо копия папки + предупреждение.
6. Флаги CLI для неинтерактивного режима: `--skills=claude,agents` / `--no-skills`.

### 7.5 MCP-серверы

Файл **`.mcp.json`** в корне (Claude Code, project scope) поставляется в шаблоне сразу с фиксированным набором из четырёх серверов — отдельного шага/флага нет. При клоне Claude Code запросит подтверждение доверия серверам.

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    }
  }
}
```

- **shadcn** — поиск/установка компонентов и блоков из реестров (`components.json → registries`); `shadcn` уже в devDeps.
- **context7** — актуальная, версионно-привязанная документация в контексте (важно для Vite 8 / Tailwind v4 / TanStack — новее train cutoff).
- **playwright** — агент водит браузер через accessibility tree, пишет/чинит E2E; требует установленных браузеров (`npx playwright install`).
- **chrome-devtools** — перф-дебаг: performance-трейсы, LCP, сеть, Lighthouse (только Chrome).

> Для MCP нужен Node ≥ 18 (у нас 26). `playwright` и `chrome-devtools` работают с локальным Chrome/Chromium.

### 7.6 Базовый набор skills

| Скилла | Что делает |
|---|---|
| `setup-project` | Разовая инициализация репо: `pnpm install`, генерация и коммит lockfile, git init, первый прогон `pnpm check`. |
| `add-shadcn-component` | Добавление компонента shadcn/ui через CLI с учётом Tailwind v4, `components.json` и алиасов `@/`. |
| `create-react-component` | Скаффолд типизированного функционального компонента (именованный экспорт, тип пропсов, colocated-тест). |
| `create-custom-hook` | Типизированный кастомный хук + тест. |
| `add-route` | Новый file-based маршрут в `src/routes/` (TanStack Router): типизированный `createFileRoute`, при необходимости — loader на базе Query. |
| `add-query-hook` | Слой `features/<name>`: fetch-функция в `api.ts` + типизированный `useQuery`/`useMutation`-хук с ключами и инвалидацией. |
| `add-store-slice` | Новый Zustand-стор в `stores/` (типизированный, селекторы, без server-state). |
| `write-vitest-test` | Тест на компонент/хук через Vitest + Testing Library с учётом `src/test/setup.ts`. |
| `add-dependency` | Добавление зависимости через pnpm с точным пином (политика no-`^` для рантайма). |
| `run-quality-gate` | Прогон `pnpm check` (typecheck + lint + test) и починка до зелёного. |
| `dockerize-and-run` | Сборка и запуск через Docker/compose согласно конфигам проекта. |

> Точный текст `SKILL.md` пишется на этапе имплементации. Здесь фиксируются состав, формат и модель подключения.

---

## 8. Ключевые технические решения и компромиссы

1. **Node 26 (таргет) при поле `engines.node: ">=22.12.0"`.** Минимум — как у Vite 8 (Node 20.19+/22.12+); рекомендуемая/тестируемая версия — 26 (`.nvmrc=26`, `node:26-alpine`, `@types/node@^26`). Так шаблон запускается на актуальных LTS, но целится в 26. (Спайк прогонялся на Node 22.22 — зелёный.)

2. **TypeScript 6.0.3, НЕ 7 — проверено эмпирически (см. раздел 11).** TS 7 (нативный) отложен: `typescript-eslint@8.65` при установленном TS 7 **падает целиком** (`typescript-eslint does not support TS 7.0`, exit 2) — это не потеря type-aware правил, а **полное отсутствие линтинга**. Плюс TS 7 удалил опцию `baseUrl` (error TS5102). Трекинг поддержки — typescript-eslint#10940 (для TS ≥ 7.1). На **6.0.3** весь тулчейн зелёный, включая **полноценный type-aware линтинг** (`recommendedTypeChecked` + `projectService` — подтверждено: правило `no-floating-promises` срабатывает). Апгрейд на TS 7 — когда typescript-eslint выпустит поддержку.

3. **Tailwind v4 (CSS-first).** Без `tailwind.config.js`: плагин `@tailwindcss/vite`, `@import "tailwindcss"` и токены в CSS. shadcn настроен под v4 (`components.json` с пустым `tailwind.config`, `cssVariables: true`).

4. **Роутер — TanStack Router** (file-based, `@tanstack/router-plugin` для Vite). Выбран как родная пара к TanStack Query (единая экосистема) с end-to-end типобезопасностью: типизированные пути, параметры и search-параметры, интеграция загрузки данных с Query. Цена — Vite-плагин и кодоген `routeTree.gen.ts` (в `.gitignore`, не редактируется вручную).

5. **Стейт-менеджер — Zustand 5.** Server-state покрывает TanStack Query, поэтому на клиентский стейт нужен минимальный инструмент. Zustand: ~1 КБ, без boilerplate, отличный TS, простой для агентов, не конфликтует с Query. Redux Toolkit избыточен когда server-state у Query; Jotai — другая (атомарная) парадигма. Разделение «Query = server-state, Zustand = client-state» зафиксировано в п. 4.1.

6. **Пины без `^`** для воспроизводимости шаблона (кроме `@types/node`).

7. **Однопакетный проект**, не монорепо — под соло-разработку.

8. **E2E — Playwright** (`@playwright/test`) отдельным слоем от unit-тестов (Vitest): спеки в `e2e/`, конфиг `playwright.config.ts`, скрипты `test:e2e` / `test:e2e:ui`. Браузеры ставятся через `npx playwright install`. Vitest ограничен `src/**`, так что слои не пересекаются.

9. **MCP из коробки** — фиксированный `.mcp.json` (Claude Code) с `shadcn`, `context7`, `playwright`, `chrome-devtools`. Без опций/флагов на выбор серверов.

10. **Лицензия — MIT** (файл `LICENSE` в корне пакета и генерируемого проекта).

---

## 9. Упаковка и публикация CLI

- **Имя пакета:** `create-frontstack` (unscoped, свободно в npm). Запуск: `pnpm create frontstack my-app` / `npm create frontstack@latest my-app` / `npx create-frontstack my-app`.
- **`bin`** маппится на имя `create-frontstack`; **`files`: `["bin", "template"]`**.
- **CLI без рантайм-зависимостей** (только Node built-ins). Поток мастера:
  1. Целевая папка + имя проекта, пакетный менеджер (дефолт pnpm).
  2. Рекурсивно скопировать `template/` → переименовать `_gitignore`/`_npmrc`/`_nvmrc` → подставить `{{PROJECT_NAME}}`. `.mcp.json` копируется как есть (фиксированный набор, см. 7.5).
  3. **Шаг skills** (см. 7.4): выбор клиентов (дефолт `.claude`), создание симлинков на `skills/` (Windows-фолбэк). Флаги: `--skills=claude,...` / `--no-skills`.
  4. Вывести next steps (в т.ч. `npx playwright install` для E2E и MCP).
- **Публикация:** `npm publish --access public` (для скоупа), semver-бамп, npm provenance, CI-workflow (lint/test пакета) на GitHub Actions.

---

## 10. Открытые вопросы (согласовать перед имплементацией)

1. ~~Роутер~~ — **решено: TanStack Router** (file-based, родной для TanStack Query).
2. ~~Стейт-менеджер~~ — **решено: Zustand** (server-state → Query, client-state → Zustand).
3. ~~Доп. клиенты skills/MCP~~ — **решено:** `.claude` (дефолт) + `.agents/skills/` (кросс-агент).
4. ~~Набор MCP~~ — **решено:** фиксированный `.mcp.json` — `shadcn`, `context7`, `playwright`, `chrome-devtools`.
5. ~~Node engines~~ — **решено:** `engines.node ">=22.12.0"`, таргет 26.
6. ~~TS 7 vs 6.0.3~~ — **решено: 6.0.3** (проверено: TS 7 ломает ESLint; на 6.0.3 доступен полный type-aware линтинг — см. раздел 11).
7. ~~Имя/скоуп пакета~~ — **решено: `create-frontstack`** (unscoped; `npm create frontstack`).
8. ~~Тестовое окружение~~ — **решено: happy-dom**.
9. ~~Лицензия~~ — **решено: MIT**.

---

## 11. Проверка сборки (эмпирическая валидация)

Собран репрезентативный спайк (TanStack Router + Query + Zustand + shadcn-компонент `Button` + happy-dom-тест) и прогнан полный тулчейн. Итог с **TypeScript 6.0.3** — всё зелёное:

| Гейт | Команда | Результат |
|---|---|---|
| install | `pnpm install` | ✅ (pnpm 11.18.0) |
| build | `tsr generate && … && vite build` | ✅ (Vite 8, кодоген route tree, Tailwind v4) |
| typecheck | `tsr generate && tsc --noEmit` | ✅ |
| lint | `eslint .` (type-aware) | ✅ (проверено: `no-floating-promises` срабатывает) |
| test | `vitest run` (happy-dom) | ✅ |

Прогон на Node 22.22 (в пределах `engines >=22.12.0`).

### Что спайк выявил и что зафиксировано в спеке

- **TS 7 несовместим с ESLint сейчас:** `typescript-eslint@8.65` падает при установленном TS 7 (`does not support TS 7.0`). → выбран **TS 6.0.3** (трекинг TS 7: typescript-eslint#10940).
- **TS 7 удалил `baseUrl`** (TS5102). → `paths` в tsconfig оставлены относительными **без `baseUrl`** (совместимо и с 6.x, и с будущим 7.x).
- **`@eslint/js` не следует версии `eslint`:** актуальная — **`10.0.1`**, а не `10.8.0`. → пин исправлен.
- **pnpm 11.18 игнорирует поле `pnpm` в package.json** (`peerDependencyRules` не читается). → поле убрано; на 6.0.3 оно и не нужно.
- **`eslint-plugin-react-hooks@7.1.1`:** flat-конфиг переехал в `configs.flat['recommended-latest']` (старый `configs['recommended-latest']` — legacy-формат, ESLint 10 его отвергает). → импорт исправлен.
- **`react-refresh/only-export-components`** краснит на каждый route-файл (экспорт `Route`) и на shadcn-компоненты (экспорт вариантов). → добавлены оверрайды для `src/routes/**` и `src/components/ui/**`.
- **Порядок сборки:** `routeTree.gen.ts` должен генерироваться до `tsc`. → в `build`/`typecheck` добавлен префикс `tsr generate` (пакет `@tanstack/router-cli`).
- **Vite 8 резолвит tsconfig-paths нативно** (`resolve.tsconfigPaths: true`). → плагин `vite-tsconfig-paths` помечен как опциональный/удаляемый.

> Все пункты закрыты — спека готова к имплементации.
