import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('mounts to the DOM with the right element and children', () => {
    // Direct DOM assertion. If the test environment ever silently fails to
    // commit a render (the container is left empty), getByRole below would fail
    // with a misleading "element not found" — this assertion pins the failure
    // to the render itself.
    const { container } = render(<Button>Mounted</Button>);
    expect(container.innerHTML).not.toBe('');
    const button = container.querySelector('button[data-slot="button"]');
    expect(button).not.toBeNull();
    expect(button).toHaveTextContent('Mounted');
  });

  it('renders its children as a button', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button', { name: /delete/i })).toHaveClass('bg-destructive');
  });

  it('applies size classes', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button', { name: /small/i })).toHaveClass('h-8');
  });
});
