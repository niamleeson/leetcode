import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadSolution } from './greatfrontend/testUtils';
import { sunoIntervalChallenge } from './sunoInterval';

type Entry = [number, number];
type Heap = {
  size(): number;
  push(value: Entry): void;
  pop(): Entry | undefined;
  peek(): Entry | undefined;
};

let minInterval: (intervals: number[][], queries: number[]) => number[];
let MinHeap: new () => Heap;

beforeAll(() => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  try {
    // Test the same source readers copy; exports are only a test harness.
    const solution = loadSolution(sunoIntervalChallenge.code + '\nexport { MinHeap, minInterval };');
    minInterval = solution.minInterval;
    MinHeap = solution.MinHeap;
    expect(log.mock.calls.map(([result]) => result)).toEqual([
      [3, 3, 1, 4],
      [2, -1, 4, 6],
      [-1, -1, -1],
    ]);
  } finally {
    log.mockRestore();
  }
});

function bruteForce(intervals: number[][], queries: number[]) {
  return queries.map(query => {
    let best = Infinity;
    for (const [left, right] of intervals) {
      if (left <= query && query <= right) {
        best = Math.min(best, right - left + 1);
      }
    }
    return best === Infinity ? -1 : best;
  });
}

describe('Suno minimum interval displayed practice solution', () => {
  it('answers the supplied examples in their original query order', () => {
    expect(minInterval([[1, 4], [2, 4], [3, 6], [4, 4]], [2, 3, 4, 5]))
      .toEqual([3, 3, 1, 4]);
    expect(minInterval([[2, 3], [2, 5], [1, 8], [20, 25]], [2, 19, 5, 22]))
      .toEqual([2, -1, 4, 6]);
  });

  it('handles inclusive endpoints, duplicate intervals, and repeated unsorted queries', () => {
    expect(minInterval([[2, 4], [4, 4], [2, 4], [10, 12]], [12, 4, 2, 4, 1, 10]))
      .toEqual([3, 1, 3, 1, -1, 3]);
  });

  it('handles empty inputs and a query after every interval has expired', () => {
    expect(minInterval([], [1, 1, 5])).toEqual([-1, -1, -1]);
    expect(minInterval([[1, 2]], [])).toEqual([]);
    expect(minInterval([], [])).toEqual([]);
    expect(minInterval([[1, 1], [1, 2], [2, 3]], [100])).toEqual([-1]);
  });

  it('does not mutate either input, including the interval pairs', () => {
    const intervals = [[20, 25], [2, 3], [1, 8], [2, 5]];
    const queries = [22, 19, 2, 5];
    const originalIntervals = intervals.map(pair => pair.slice());
    const originalQueries = queries.slice();
    minInterval(intervals, queries);
    expect(intervals).toEqual(originalIntervals);
    expect(queries).toEqual(originalQueries);
  });

  it('maintains heap priority through interleaved pushes and removals', () => {
    const heap = new MinHeap();
    expect(heap.size()).toBe(0);
    expect(heap.peek()).toBeUndefined();
    expect(heap.pop()).toBeUndefined();
    heap.push([5, 100]);
    heap.push([1, 9]);
    heap.push([5, 3]);
    heap.push([2, 8]);
    expect(heap.peek()).toEqual([1, 9]);
    expect(heap.pop()).toEqual([1, 9]);
    heap.push([1, 20]);
    expect(heap.pop()).toEqual([1, 20]);
    expect(heap.pop()).toEqual([2, 8]);
    const remaining = [heap.pop()!, heap.pop()!];
    expect(remaining.map(entry => entry[0])).toEqual([5, 5]);
    expect(remaining.map(entry => entry[1]).sort((a, b) => a - b)).toEqual([3, 100]);
    expect(heap.size()).toBe(0);
    expect(heap.pop()).toBeUndefined();
  });

  it('matches a brute-force scan on deterministic randomized inputs', () => {
    let seed = 1851;
    const random = (limit: number) => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed % limit;
    };
    for (let run = 0; run < 300; run++) {
      const intervals = Array.from({ length: random(16) }, () => {
        const left = random(21) - 10;
        return [left, left + random(8)];
      });
      const queries = Array.from({ length: random(16) }, () => random(31) - 15);
      expect(minInterval(intervals, queries)).toEqual(bruteForce(intervals, queries));
    }
  });
});
