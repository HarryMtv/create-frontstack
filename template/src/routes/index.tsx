import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useExample } from '@/features/example/use-example';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  const { data, isLoading, error } = useExample();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground">
          A modern React + TypeScript + Vite starter with TanStack Router, TanStack Query, Zustand,
          and shadcn/ui.
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-2 font-semibold">Example query</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-destructive">Failed to load example data.</p>
        ) : (
          <p className="text-sm">{data?.title}</p>
        )}
      </div>

      <Button>Get started</Button>
    </div>
  );
}
