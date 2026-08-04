import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient with sensible defaults. Server-state lives here; do NOT
 * mirror it into Zustand stores (see the project state-management convention).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
