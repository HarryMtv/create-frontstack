import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
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
