---
name: add-store-slice
description: Add a new typed Zustand store in src/stores/ for client/UI state only — with selectors and no server-state.
---

# Add a Zustand store

Client/UI state (theme, sidebar, ephemeral flags) lives in **Zustand**. **Never** put server data here — that belongs to TanStack Query (see `add-query-hook`).

## Steps

1. Create `src/stores/<domain>-store.ts`:
   ```ts
   import { create } from 'zustand';

   type CartState = {
     itemCount: number;
     addItem: () => void;
     clear: () => void;
   };

   export const useCartStore = create<CartState>((set) => ({
     itemCount: 0,
     addItem: () => set((s) => ({ itemCount: s.itemCount + 1 })),
     clear: () => set({ itemCount: 0 }),
   }));
   ```
2. Consume with **selectors** to avoid re-rendering on unrelated changes:
   ```ts
   const itemCount = useCartStore((s) => s.itemCount);
   const addItem = useCartStore((s) => s.addItem);
   ```
3. (Optional) colocate a test `<domain>-store.test.ts` — Zustand stores are plain functions and test without a provider.

## Conventions

- One small store per domain in `src/stores/`.
- Keep state serializable where possible.
- If you're about to store API data → stop and use Query instead.
