import { useQuery } from '@tanstack/react-query';
import { examplePostQuery } from './api';

/** Server-state hook: data source of truth is Query, never a Zustand store. */
export function useExample() {
  return useQuery(examplePostQuery());
}
