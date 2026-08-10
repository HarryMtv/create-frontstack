import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges standard classes', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('merges tailwind classes and resolves conflicts', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('handles conditional classes', () => {
      const conditionTrue = true;
      const conditionFalse = false;
      expect(cn('class1', conditionTrue && 'class2', conditionFalse && 'class3')).toBe('class1 class2');
    });

    it('handles arrays and objects', () => {
      expect(cn(['class1', 'class2'], { class3: true, class4: false })).toBe('class1 class2 class3');
    });

    it('handles undefined, null, and empty string', () => {
      expect(cn('class1', undefined, null, '', 'class2')).toBe('class1 class2');
    });
  });
});
