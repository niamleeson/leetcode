import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { neetcodeTopics } from '../neetcode250';
import { solutionMap } from './index';

type Case = { args: unknown[]; expected: unknown };
const cases: Record<number, Case[]> = { 684: [], 721: [], 1584: [], 1489: [], 2709: [] };
const entries: Record<number, string> = { 684: 'findRedundantConnection', 721: 'accountsMerge', 1584: 'minCostConnectPoints', 1489: 'findCriticalAndPseudoCriticalEdges', 2709: 'canTraverseAllPairs' };
const connected = (n: number, edges: number[][]) => {
  const reached = new Set([0]);
  for (let pass = 0; pass < n; pass++) for (const [a, b] of edges) {
    if (reached.has(a)) reached.add(b);
    if (reached.has(b)) reached.add(a);
  }
  return reached.size === n;
};
let seed = 194;
const random = (limit: number) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % limit; };

// Enumerate every simple unicyclic graph through five nodes. Independently
// remove edges backwards to find the last edge whose removal leaves a tree.
for (let n = 3; n <= 5; n++) {
  const pairs: number[][] = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) pairs.push([a, b]);
  for (let mask = 0; mask < 2 ** pairs.length; mask++) {
    const edges = pairs.filter((_, bit) => mask & (1 << bit));
    if (edges.length !== n || !connected(n, edges)) continue;
    for (let order = 0; order < 3; order++) {
      const shuffled = edges.map(edge => edge.slice());
      for (let i = shuffled.length - 1; i > 0; i--) { const j = random(i + 1); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      const index = shuffled.map((_, i) => i).reverse().find(i => connected(n, shuffled.filter((_, j) => j !== i)))!;
      cases[684].push({ args: [shuffled.map(([a, b]) => [a + 1, b + 1])], expected: shuffled[index].map(value => value + 1) });
    }
  }
}

// Merge sets until they no longer intersect; account names never establish a link.
for (let trial = 0; trial < 200; trial++) {
  const accounts = Array(1 + random(8)).fill(null).map(() => {
    const emails = new Set<string>();
    for (let i = 0, count = 1 + random(4); i < count; i++) emails.add(`e${random(9)}@x`);
    return ['Owner', ...emails];
  });
  const groups = accounts.map(account => new Set(account.slice(1)));
  for (let changed = true; changed;) {
    changed = false;
    for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) {
      if (![...groups[i]].some(email => groups[j].has(email))) continue;
      for (const email of groups[j]) groups[i].add(email);
      groups.splice(j--, 1); changed = true;
    }
  }
  cases[721].push({ args: [accounts], expected: groups.map(group => ['Owner', ...[...group].sort()]) });
}
cases[721].push({ args: [[['A', 'a@x'], ['B', 'b@x'], ['A', 'c@x']]], expected: [['A', 'a@x'], ['B', 'b@x'], ['A', 'c@x']] });

// Prim's algorithm is independent of the two Kruskal implementations.
for (let trial = 0; trial < 150; trial++) {
  const points: number[][] = [];
  while (points.length < 1 + trial % 8) {
    const point = [random(21) - 10, random(21) - 10];
    if (!points.some(([x, y]) => x === point[0] && y === point[1])) points.push(point);
  }
  const used = new Set<number>(), costs = Array(points.length).fill(Infinity);
  costs[0] = 0; let total = 0;
  while (used.size < points.length) {
    let best = -1;
    for (let i = 0; i < points.length; i++) if (!used.has(i) && (best === -1 || costs[i] < costs[best])) best = i;
    used.add(best); total += costs[best];
    points.forEach(([x, y], i) => { costs[i] = Math.min(costs[i], Math.abs(x - points[best][0]) + Math.abs(y - points[best][1])); });
  }
  cases[1584].push({ args: [points], expected: total });
}

// Enumerate all spanning trees to identify edges in every/some/no minimum tree.
for (let trial = 0; trial < 100; trial++) {
  const n = 2 + trial % 4, edges: number[][] = [];
  for (let node = 1; node < n; node++) edges.push([random(node), node, 1 + random(4)]);
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
    if (!edges.some(([u, v]) => u === a && v === b) && random(2)) edges.push([a, b, 1 + random(4)]);
  }
  let minimum = Infinity; const trees: number[][] = [];
  for (let mask = 0; mask < 2 ** edges.length; mask++) {
    const indices = edges.map((_, i) => i).filter(i => mask & (1 << i));
    if (indices.length !== n - 1 || !connected(n, indices.map(i => edges[i]))) continue;
    const cost = indices.reduce((sum, i) => sum + edges[i][2], 0);
    if (cost < minimum) { minimum = cost; trees.length = 0; }
    if (cost === minimum) trees.push(indices);
  }
  const critical: number[] = [], pseudo: number[] = [];
  edges.forEach((_, i) => {
    if (trees.every(tree => tree.includes(i))) critical.push(i);
    else if (trees.some(tree => tree.includes(i))) pseudo.push(i);
  });
  cases[1489].push({ args: [n, edges], expected: [critical, pseudo] });
}

// Pairwise Euclidean GCD + repeated reachability expansion checks the sparse
// prime-factor construction without sharing its factoring algorithm.
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
for (let trial = 0; trial < 500; trial++) {
  const nums = Array(1 + random(9)).fill(null).map(() => 1 + random(100));
  const edges: number[][] = [];
  for (let a = 0; a < nums.length; a++) for (let b = a + 1; b < nums.length; b++) if (gcd(nums[a], nums[b]) > 1) edges.push([a, b]);
  cases[2709].push({ args: [nums], expected: connected(nums.length, edges) });
}
for (const nums of [[1], [1, 1], [1, 2, 4], [6, 35, 10], [6, 6, 10, 15], [99991, 99989]]) {
  cases[2709].push({ args: [nums], expected: nums.length === 1 || nums[0] === 6 });
}

function normalize(id: number, result: unknown) {
  if (id === 721) return (result as string[][]).map(([name, ...emails]) => [name, ...emails.sort()]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (id === 1489) return (result as number[][]).map(group => [...group].sort((a, b) => a - b));
  return result;
}

it('places BFS before every path-compression solution on the 250 page', () => {
  const pathCompression = neetcodeTopics.flatMap(topic => topic.problems).filter(({ id }) => /path compression/.test(solutionMap[id].followUp?.title || ''));
  expect(pathCompression.map(p => p.id).sort((a, b) => a - b)).toEqual([323, 684, 721, 1489, 1584, 2709]);
  for (const { id } of neetcodeTopics.flatMap(topic => topic.problems)) {
    expect(solutionMap[id].jsCode).not.toMatch(/parent\[parent\[|find\(parent\.get/);
  }
  for (const id of [323, 684, 721, 1462, 1489, 1584, 2709]) {
    expect(solutionMap[id].solutionTitle).toMatch(/BFS/);
    expect(solutionMap[id].followUp!.walkthroughVariant).toBe(id === 1462 ? 'floyd-warshall' : 'union-find');
  }
});

describe.each(['bfs', 'optimized'] as const)('%s graph correctness', variant => {
  const source = (id: number) => variant === 'bfs' ? solutionMap[id] : solutionMap[id].followUp!;
  it.each([684, 721, 1584, 1489, 2709])('%i matches independent answers in JavaScript', id => {
    const result = runInNewContext(`${source(id).jsCode}\ncases.map(({args}) => ${entries[id]}(...args))`, { cases: JSON.parse(JSON.stringify(cases[id])) }, { timeout: 10000 });
    expect(JSON.parse(JSON.stringify(result)).map((value: unknown) => normalize(id, value))).toEqual(cases[id].map(item => normalize(id, item.expected)));
  });
  it('matches the same independent answers in Python', () => {
    const sources = Object.fromEntries(Object.keys(cases).map(id => [id, source(Number(id)).code]));
    const result = spawnSync('python3', ['-c', `
import json, sys
data = json.load(sys.stdin)
def normalize(id, value):
    if id == '721': return sorted([[name] + sorted(emails) for name, *emails in value])
    if id == '1489': return [sorted(group) for group in value]
    return value
for id, cases in data['cases'].items():
    namespace = {}
    exec(data['sources'][id], namespace)
    name = data['entries'][id]
    fn = getattr(namespace['Solution'](), name) if 'Solution' in namespace else namespace[name]
    for case in cases:
        actual = fn(*case['args'])
        assert normalize(id, actual) == normalize(id, case['expected']), (id, case, actual)
`], { input: JSON.stringify({ sources, entries, cases }), encoding: 'utf8', timeout: 15000 });
    expect(result.stderr).toBe(''); expect(result.status).toBe(0);
  });
});

it('keeps the shared-prime BFS sparse for a large connected input', () => {
  const result = runInNewContext(`${solutionMap[2709].jsCode}\ncanTraverseAllPairs(Array(100000).fill(6))`, {}, { timeout: 10000 });
  expect(result).toBe(true);
});
