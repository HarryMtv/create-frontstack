import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/providers';
import { routeTree } from './routeTree.gen';

import './index.css';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

// Register the router for end-to-end type safety.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container "#root" not found');
}

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
