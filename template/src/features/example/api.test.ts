import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchExamplePost, exampleKeys, examplePostQuery } from './api';

describe('example/api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchExamplePost', () => {
    it('should fetch the example post successfully', async () => {
      const mockPost = { id: 1, title: 'Test Post' };
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockPost),
      } as Response;

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const result = await fetchExamplePost();

      expect(result).toEqual(mockPost);
      expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1');
    });

    it('should throw an error if the request fails', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      } as Response;

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      await expect(fetchExamplePost()).rejects.toThrow('Request failed: 404');
      expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1');
    });
  });

  describe('exampleKeys', () => {
    it('should define the base key', () => {
      expect(exampleKeys.all).toEqual(['example']);
    });

    it('should define the post key correctly', () => {
      expect(exampleKeys.post()).toEqual(['example', 'post']);
    });
  });

  describe('examplePostQuery', () => {
    it('should return the correct query options', () => {
      const options = examplePostQuery();
      expect(options.queryKey).toEqual(['example', 'post']);
      expect(options.queryFn).toBe(fetchExamplePost);
    });
  });
});
