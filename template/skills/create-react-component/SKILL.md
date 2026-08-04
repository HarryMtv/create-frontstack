---
name: create-react-component
description: Scaffold a typed functional React component with a named export, an explicit props type, and a colocated Vitest test.
---

# Create a React component

## Steps

1. Decide where it lives:
   - Reusable UI primitive → `src/components/<name>.tsx`
   - Feature-specific → `src/features/<feature>/components/<name>.tsx`
2. Create the component with a **named export** and an explicit props type. Use `type`-only imports (the project enables `verbatimModuleSyntax`):
   ```tsx
   import type { ComponentProps } from 'react';
   import { cn } from '@/lib/utils';

   export type ExampleProps = ComponentProps<'div'> & {
     title: string;
   };

   export function Example({ title, className, ...props }: ExampleProps) {
     return (
       <div className={cn('rounded-lg border p-4', className)} {...props}>
         {title}
       </div>
     );
   }
   ```
3. Add a colocated test `<name>.test.tsx` (see the `write-vitest-test` skill).
4. Use `cn()` from `@/lib/utils` to merge classes; prefer Tailwind utilities.

## Conventions

- Named exports only (keeps Fast Refresh happy outside `routes/` and `components/ui/`).
- Keep prop types in a `export type … = …` declaration next to the component.
- Default to `asChild` via Radix `Slot` only when building polymorphic primitives.
