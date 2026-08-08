import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchExamplePost, exampleKeys, examplePostQuery } from './api';

const POST_URL = 'https://jsonplaceholder.typicode.com/posts/1';

describe('example/api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchExamplePost', () => {
    it('returns the parsed post on a successful response', async () => {
      const post = { id: 1, title: 'Test Post' };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(post),
      } as Response);

      await expect(fetchExamplePost()).resolves.toEqual(post);
      expect(fetch).toHaveBeenCalledWith(POST_URL);
    });

    it('throws with the status code when the response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 404 } as Response);

      await expect(fetchExamplePost()).rejects.toThrow('Request failed: 404');
      expect(fetch).toHaveBeenCalledWith(POST_URL);
    });
  });

  describe('exampleKeys', () => {
    // The prefix relationship is what makes invalidating `all` reach every
    // derived key, so that — not the literal strings — is what is pinned here.
    it('derives the post key from the base key', () => {
      expect(exampleKeys.post().slice(0, exampleKeys.all.length)).toEqual([...exampleKeys.all]);
    });
  });

  describe('examplePostQuery', () => {
    it('wires the post key and fetcher into query options', () => {
      const options = examplePostQuery();

      expect(options.queryKey).toEqual(exampleKeys.post());
      expect(options.queryFn).toBe(fetchExamplePost);
    });
  });
});
