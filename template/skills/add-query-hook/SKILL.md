---
name: add-query-hook
description: Add the features/<name> data layer — a typed fetch function in api.ts plus a useQuery/useMutation hook with query keys and invalidation.
---

# Add a Query data layer

Server-state lives in **TanStack Query** — never mirror it into Zustand. Put fetch functions and hooks in a feature folder.

## Steps

1. Create `src/features/<feature>/api.ts`:
   ```ts
   export type User = { id: string; name: string };

   export async function fetchUsers(): Promise<User[]> {
     const res = await fetch('/api/users');
     if (!res.ok) throw new Error(`fetchUsers failed: ${res.status}`);
     return res.json();
   }

   // Centralized query keys → safe invalidation.
   export const usersKeys = {
     all: ['users'] as const,
     list: () => [...usersKeys.all, 'list'] as const,
     detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
   };

   export function usersQuery() {
     return { queryKey: usersKeys.list(), queryFn: fetchUsers };
   }
   ```
2. Create `src/features/<feature>/use-users.ts`:
   ```ts
   import { useQuery } from '@tanstack/react-query';
   import { usersKeys, usersQuery } from './api';

   export function useUsers() {
     return useQuery(usersQuery());
   }
   ```
3. For mutations, invalidate the relevant keys on success:
   ```ts
   import { useMutation, useQueryClient } from '@tanstack/react-query';

   export function useCreateUser() {
     const qc = useQueryClient();
     return useMutation({
       mutationFn: (input: { name: string }) =>
         fetch('/api/users', { method: 'POST', body: JSON.stringify(input) }),
       onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
     });
   }
   ```
4. Run `pnpm typecheck && pnpm test`.

## Conventions

- One source of truth for keys (an `xxxKeys` object) — never inline raw arrays.
- Reuse `queryClient` from `@/lib/query-client` for loaders and prefetching.
- Return typed data; let Query own loading/error state.
