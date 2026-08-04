---
name: add-shadcn-component
description: Add a shadcn/ui component via the CLI, respecting Tailwind v4, components.json, and the @/ path aliases.
---

# Add a shadcn/ui component

This project uses **shadcn/ui v4 on Tailwind v4** (CSS-first, no `tailwind.config.js`). Components land in `src/components/ui/` and import `cn` from `@/lib/utils`.

## Steps

1. Add the component:
   ```sh
   pnpm ui:add <component>     # e.g. pnpm ui:add dialog
   ```
   `ui:add` is an alias for `shadcn add`, configured by `components.json`.
2. Verify the generated file imports from `@/lib/utils` and `@/components/ui/...` aliases (it should by default).
3. If you need a block (e.g. a login form) instead of a single component, use the shadcn MCP server (`.mcp.json`) to browse the registry.
4. Import and use it:
   ```tsx
   import { Dialog } from '@/components/ui/dialog';
   ```

## Conventions

- Do not edit `src/index.css` tokens unless adding a new theme variable.
- `react-refresh/only-export-components` is disabled for `src/components/ui/**`, so variant exports are fine.
- After adding, run `pnpm lint` and `pnpm typecheck` to confirm the new file passes.
