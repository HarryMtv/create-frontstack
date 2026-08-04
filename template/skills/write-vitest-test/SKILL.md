---
name: write-vitest-test
description: Write a Vitest + Testing Library test for a component or hook, using src/test/setup.ts and happy-dom.
---

# Write a Vitest test

Unit/component tests run in **Vitest** under `happy-dom`, scoped to `src/**`. `src/test/setup.ts` registers jest-dom matchers and cleans up after each test.

## Steps

1. Colocate the test next to the code: `src/components/Example.tsx` → `src/components/Example.test.tsx`. (Hooks/stores: `.test.ts`.)
2. Component test:
   ```tsx
   import { render, screen } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { describe, expect, it } from 'vitest';
   import { Example } from './Example';

   describe('Example', () => {
     it('calls onClick when clicked', async () => {
       const onClick = vi.fn();
       const user = userEvent.setup();
       render(<Example onClick={onClick} />);
       await user.click(screen.getByRole('button'));
       expect(onClick).toHaveBeenCalledOnce();
     });
   });
   ```
3. Use `vi.fn()` for mocks; prefer `userEvent` over firing events directly.
4. Run the affected test, then the whole suite:
   ```sh
   pnpm test            # vitest run
   pnpm test:watch      # during development
   ```

## Conventions

- jest-dom matchers (`toBeInTheDocument`, `toHaveBeenCalledOnce`, …) are already available — no need to import them per test.
- E2E (browser) tests are separate — put those in `e2e/` with Playwright.
- Never import `src/routeTree.gen.ts` in unit tests.
