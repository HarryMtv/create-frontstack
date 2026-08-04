import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-b">
        <nav className="mx-auto flex max-w-3xl items-center gap-6 p-4">
          <Link to="/" activeProps={{ className: 'font-bold' }} className="text-sm">
            Home
          </Link>
          <Link to="/about" activeProps={{ className: 'font-bold' }} className="text-sm">
            About
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        <Outlet />
      </main>

      {/* No-op in production builds. */}
      <TanStackRouterDevtools />
    </div>
  );
}
