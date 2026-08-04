import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { PropsWithChildren } from 'react';
import { queryClient } from '@/lib/query-client';

/** Wraps the app in shared context providers (Query, devtools, …). */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* No-op in production builds. */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
