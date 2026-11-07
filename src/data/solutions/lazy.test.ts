import { afterEach, expect, it, vi } from 'vitest';
import { hasSolution, loadSolution } from './lazy';

afterEach(() => vi.unstubAllGlobals());

it('fetches only the requested hashed document and reuses concurrent and completed requests', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 1, code: 'def twoSum(): pass', description: 'Two Sum' }) });
  vi.stubGlobal('fetch', fetcher);
  expect(hasSolution(1)).toBe(true);
  const first = loadSolution(1);
  expect(loadSolution(1)).toBe(first);
  expect((await first).id).toBe(1);
  expect(loadSolution(1)).toBe(first);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0][0]).toMatch(/\/solutions\/1-[a-f0-9]{16}\.json$/);
  await expect(loadSolution(-1)).rejects.toThrow('No curated solution');
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it('evicts failed and incorrect documents so retry can recover', async () => {
  const fetcher = vi.fn()
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 999, code: 'wrong', description: 'wrong' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, code: 'def addTwoNumbers(): pass', description: 'Add Two Numbers' }) });
  vi.stubGlobal('fetch', fetcher);
  await expect(loadSolution(2)).rejects.toThrow('could not load');
  await expect(loadSolution(2)).rejects.toThrow('invalid');
  expect((await loadSolution(2)).id).toBe(2);
  expect(fetcher).toHaveBeenCalledTimes(3);
});
