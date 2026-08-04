/** Example feature: fetch functions live here, typed Query hooks wrap them. */

export interface ExamplePost {
  id: number;
  title: string;
}

/** Demo fetch — replace with your real API calls. */
export async function fetchExamplePost(): Promise<ExamplePost> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as ExamplePost;
}

// Centralized query keys → safe invalidation.
export const exampleKeys = {
  all: ['example'] as const,
  post: () => [...exampleKeys.all, 'post'] as const,
};

export function examplePostQuery() {
  return { queryKey: exampleKeys.post(), queryFn: fetchExamplePost };
}
