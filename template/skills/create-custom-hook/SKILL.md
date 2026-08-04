---
name: create-custom-hook
description: Scaffold a typed custom React hook with a colocated Vitest test, using the project's Query/Zustand conventions.
---

# Create a custom hook

## When to use which hook type

- Data from the server → a **Query** hook (see `add-query-hook`); do not write a bespoke fetch hook.
- Cross-component client/UI state → read/write a **Zustand** store (see `add-store-slice`), not a hook with module state.
- Truly local, reusable client logic (debounce, media query, etc.) → a custom hook here.

## Steps

1. Create `src/hooks/use-<name>.ts` (or `src/features/<feature>/use-<name>.ts` for feature-local logic):
   ```ts
   import { useEffect, useState } from 'react';

   export function useDebouncedValue<T>(value: T, delayMs = 300): T {
     const [debounced, setDebounced] = useState(value);
     useEffect(() => {
       const id = setTimeout(() => setDebounced(value), delayMs);
       return () => clearTimeout(id);
     }, [value, delayMs]);
     return debounced;
   }
   ```
2. Export the return type if callers need it: `export type …`.
3. Add a colocated test `use-<name>.test.ts` (see `write-vitest-test`).
4. Run `pnpm typecheck && pnpm test`.

## Conventions

- Prefix with `use` and return a typed value (or a small object, not a sprawling tuple).
- Pure logic that needs no React → a plain function in `src/lib/`, not a hook.
