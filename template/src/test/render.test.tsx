import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

/**
 * Environment health check — verifies React actually commits to the DOM under
 * Vitest + happy-dom. This guards against regressions where `render()` returns
 * an empty container (every `getByRole`/`screen` query then fails with a
 * misleading "element not found"). If this suite goes red, the test
 * environment itself is broken — fix it before chasing component failures.
 */
describe('test environment commits React renders to the DOM', () => {
  it('mounts a host element synchronously', () => {
    const { container } = render(<p>hello</p>);
    expect(container.innerHTML).not.toBe('');
    expect(container.querySelector('p')).toHaveTextContent('hello');
  });

  it('mounts nested structure with the expected child count', () => {
    const { container } = render(
      <ul>
        <li>a</li>
        <li>b</li>
      </ul>,
    );
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });
});
