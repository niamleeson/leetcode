import { describe, expect, it, vi } from 'vitest';
import { loadSolution } from './greatfrontend/testUtils';
import { sunoDagChallenge, sunoReferralChallenge } from './sunoAlgorithms';

function loadFunction(code: string, name: string) {
  // Run the displayed examples as well as compiling the displayed function.
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  try {
    return loadSolution(code + '\nexport { ' + name + ' };')[name];
  } finally {
    log.mockRestore();
  }
}

const calculateCredits = loadFunction(sunoReferralChallenge.code, 'calculateCredits') as (
  referrals: number[][], songCreators: number[],
) => Record<string, number>;
const longestPathDAG = loadFunction(sunoDagChallenge.code, 'longestPathDAG') as (
  n: number, edges: number[][],
) => number;

describe('Suno referral credits displayed solution', () => {
  it('matches the published example without mutating inputs', () => {
    const referrals = [[1, 2], [1, 3], [2, 3], [2, 5], [3, 9]];
    const creators = [2, 2, 4, 2, 3, 5, 8];
    const before = JSON.stringify({ referrals, creators });
    expect(calculateCredits(referrals, creators)).toEqual({ 1: 200, 2: 200, 3: 100, 5: 100 });
    expect(JSON.stringify({ referrals, creators })).toBe(before);
  });

  it('uses first-listed attribution and rewards repeated records only once', () => {
    expect(calculateCredits([[7, 2], [8, 2], [7, 2]], [2, 2, 2])).toEqual({ 2: 100, 7: 100 });
    expect(calculateCredits([[8, 2], [7, 2]], [2])).toEqual({ 2: 100, 8: 100 });
  });

  it('caps inviter rewards separately and still pays all referred creators', () => {
    const referrals = [[9, 1], [1, 2], [1, 3], [1, 4], [1, 5]];
    const expected = { 1: 400, 2: 100, 3: 100, 4: 100, 5: 100, 9: 100 };
    expect(calculateCredits(referrals, [1, 2, 3, 4, 5])).toEqual(expected);
    // The cap must remain separate even if the referred bonus arrives last.
    expect(calculateCredits(referrals, [5, 4, 3, 2, 1])).toEqual(expected);
  });

  it('omits users who did not earn credits', () => {
    expect(calculateCredits([], [1, 2, 3])).toEqual({});
    expect(calculateCredits([[1, 2]], [])).toEqual({});
    expect(calculateCredits([[1, 2]], [1, 3])).toEqual({});
  });
});

describe('Suno DAG longest path displayed solution', () => {
  it('matches the example and counts edges rather than vertices', () => {
    const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
    const before = JSON.stringify(edges);
    expect(longestPathDAG(5, edges)).toBe(3);
    expect(JSON.stringify(edges)).toBe(before);
  });

  it('handles empty graphs, isolated vertices, and disconnected components', () => {
    expect(longestPathDAG(0, [])).toBe(0);
    expect(longestPathDAG(3, [])).toBe(0);
    expect(longestPathDAG(6, [[0, 1], [2, 3], [3, 4], [4, 5]])).toBe(3);
  });

  it('waits for longer predecessor paths and propagates the maximum', () => {
    expect(longestPathDAG(6, [[0, 4], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5]])).toBe(5);
  });

  it('rejects cycles even when another component can be processed', () => {
    expect(() => longestPathDAG(1, [[0, 0]])).toThrow('Graph must be acyclic');
    expect(() => longestPathDAG(4, [[0, 1], [2, 3], [3, 2]])).toThrow('Graph must be acyclic');
  });

  it('processes a deep path without recursive stack growth', () => {
    const n = 20000;
    const edges = Array.from({ length: n - 1 }, (_, index) => [index, index + 1]);
    expect(longestPathDAG(n, edges)).toBe(n - 1);
  });
});
