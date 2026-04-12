/**
 * DSA study chunks. One chunk per TopicLesson in lessons.ts.
 *
 * Chunks reference lessons[topic] for all long-form content (overview, template,
 * memorization, etc.). The per-topic metadata below only holds trigger signals,
 * discriminators, and palace probes. For topics without explicit metadata, we
 * synthesize defaults from lesson.keyPatterns and lesson.commonMistakes.
 */

import { lessons, TopicLesson } from './lessons';
import type { Discriminator, SdiChunkMeta } from './chunks-sdi';

export interface DsaChunk {
  id: string;              // "dsa-sliding-window"
  topic: string;           // Key into lessons[]
  title: string;
  category: string;        // Data Structures / Algorithms & Techniques / etc.
  oneLiner: string;        // First sentence of lesson.overview.
  meta: SdiChunkMeta;      // Same shape as SDI — deliberate reuse.
}

// The four top-level DSA categories mirror DSAReference.tsx.
const DSA_CATEGORIES: { name: string; topics: string[] }[] = [
  {
    name: 'Data Structures',
    topics: [
      'Arrays & Hashing',
      'Stack',
      'Linked List',
      'Trees',
      'Tries',
      'Heap / Priority Queue',
      'Union Find',
      'Monotonic Stack',
      'Monotonic Queue',
      'Segment Tree',
      'Binary Indexed Tree',
    ],
  },
  {
    name: 'Algorithms & Techniques',
    topics: [
      'Two Pointers',
      'Sliding Window',
      'Binary Search',
      'Backtracking',
      'Graphs',
      'Dynamic Programming',
      'Greedy',
      'Divide & Conquer',
      'String Algorithms',
      'Minimum Spanning Tree',
      'Topological Sort',
    ],
  },
  {
    name: 'Specialized Topics',
    topics: ['Intervals', 'Math & Geometry', 'Bit Manipulation'],
  },
  {
    name: 'Concurrency',
    topics: ['Concurrency'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Per-topic metadata overrides. Partial — missing topics fall back to defaults.
// ─────────────────────────────────────────────────────────────────────────────

const META: Record<string, Partial<SdiChunkMeta>> = {
  'Arrays & Hashing': {
    triggerSignals: [
      'find pair sums to target',
      'count occurrences',
      'subarray sum equals k',
      'anagrams grouping',
      'product of array except self',
    ],
    keyPoints: [
      'Hash map for O(1) complement lookup (Two Sum)',
      'Counter/defaultdict for frequency counting',
      'Hash set for O(1) existence',
      'Prefix sum + hash map for subarray sum queries',
      'Tuple/frozenset as hash key to group equivalents',
    ],
    discriminators: [
      { vs: 'dsa-two-pointers', how: 'Hashing = O(n) extra space, no order needed. Two pointers = O(1) space but requires sorted input.' },
    ],
    palaceProbes: [
      'When is hashing worse than sorting + two pointers?',
      'Why prefix sum + hash map instead of nested loops?',
    ],
    tags: ['data-structures', 'hashing'],
  },
  'Two Pointers': {
    triggerSignals: ['sorted array pair', 'palindrome check', '3sum', 'remove duplicates in place'],
    keyPoints: [
      'Opposite ends for sorted-array pair problems',
      'Fast/slow for in-place dedup and cycle detection',
      'Fixed one pointer, sweep other — 3Sum pattern',
      'Move the smaller side for container problems',
    ],
    discriminators: [
      { vs: 'dsa-sliding-window', how: 'Two pointers shrink OR grow monotonically. Sliding window oscillates: right expands, left retreats.' },
    ],
    palaceProbes: ['Why does sorting unlock two-pointer solutions?'],
    tags: ['algorithms', 'linear-scan'],
  },
  'Sliding Window': {
    triggerSignals: [
      'longest substring with condition',
      'shortest window containing',
      'fixed window of size k',
      'max sum subarray size k',
    ],
    keyPoints: [
      'Expand right, shrink left while invariant broken',
      'Variable window: track best length while valid',
      'Fixed window: slide by 1, add right, remove left',
      'Frequency map for "contains all of" problems',
    ],
    discriminators: [
      { vs: 'dsa-two-pointers', how: 'Sliding window maintains a *contiguous subarray state*. Two pointers just move two indices.' },
    ],
    palaceProbes: [
      'Why is the inner loop still O(n) amortized?',
      'What goes wrong if you shrink with an `if` instead of a `while`?',
    ],
    tags: ['algorithms', 'linear-scan'],
  },
  'Binary Search': {
    triggerSignals: [
      'sorted array search',
      'first/last occurrence',
      'minimum x such that',
      'search in rotated',
      'koko eating bananas',
    ],
    keyPoints: [
      'Classic: left ≤ right, mid = l + (r-l)/2',
      'Boundary: left < right, shrink without touching target',
      'Binary search on answer: monotonic feasibility check',
      'Rotated array: determine which half is sorted, then branch',
    ],
    discriminators: [
      { vs: 'dsa-two-pointers', how: 'Binary search halves the space each step (O(log n)). Two pointers is linear (O(n)).' },
    ],
    palaceProbes: [
      'When is the answer you are binary-searching-on *not* a position but a value?',
      'Why `l + (r-l)/2` instead of `(l+r)/2`?',
    ],
    tags: ['algorithms', 'divide'],
  },
  'Stack': {
    triggerSignals: ['balanced brackets', 'next greater', 'histogram largest rectangle', 'evaluate rpn', 'decode string'],
    keyPoints: [
      'Push open, pop on close for bracket matching',
      'Monotonic stack for next-greater/next-smaller',
      'Stack of operands for RPN',
      'Context stack for nested encodings',
    ],
    discriminators: [
      { vs: 'dsa-monotonic-stack', how: 'Plain stack is LIFO with arbitrary pushes. Monotonic stack maintains an ordering invariant and pops violators.' },
    ],
    palaceProbes: ['How does the monotonic invariant let you compute "next greater" in O(n) total?'],
    tags: ['data-structures', 'stack'],
  },
  'Monotonic Stack': {
    triggerSignals: ['next greater', 'previous smaller', 'daily temperatures', 'histogram'],
    keyPoints: [
      'Decreasing stack → next greater element',
      'Increasing stack → next smaller element',
      'Each element pushed and popped at most once → O(n)',
      'Store indices, not values, when you need distance',
    ],
    discriminators: [
      { vs: 'dsa-stack', how: 'Monotonic stack pops *violators* of an ordering invariant; plain stack pops on explicit cue.' },
    ],
    palaceProbes: ['Why O(n) even though there is a while-loop inside a for-loop?'],
    tags: ['data-structures', 'stack'],
  },
  'Heap / Priority Queue': {
    triggerSignals: ['top k', 'kth largest', 'merge k sorted', 'running median', 'task scheduler'],
    keyPoints: [
      'Min-heap of size K for Top-K largest (push, pop when size>K)',
      'Two heaps (max-left + min-right) for running median',
      'Heap of (priority, id) tuples for Dijkstra',
      'Lazy deletion when you cannot remove arbitrary elements',
    ],
    discriminators: [
      { vs: 'dsa-sorting', how: 'Heap gives streaming top-K in O(n log k). Full sort gives top-K in O(n log n) — worse when k << n.' },
    ],
    palaceProbes: ['Why a min-heap for the Top-K *largest*?'],
    tags: ['data-structures', 'ordering'],
  },
  'Union Find': {
    triggerSignals: ['connected components', 'number of islands', 'accounts merge', 'redundant edge'],
    keyPoints: [
      'parent[] and rank[]/size[] arrays',
      'Path compression in find()',
      'Union by rank or size',
      'Near O(1) amortized with both optimizations',
    ],
    discriminators: [
      { vs: 'dsa-graphs', how: 'Union-Find answers "are these two connected?" online. BFS/DFS computes components offline.' },
    ],
    palaceProbes: ['What goes wrong without path compression?'],
    tags: ['data-structures', 'graphs'],
  },
  'Backtracking': {
    triggerSignals: ['all subsets', 'all permutations', 'combinations summing to target', 'n queens', 'word search'],
    keyPoints: [
      'Template: choose → recurse → unchoose',
      'Use start index to avoid duplicate subsets',
      'Sort + skip duplicates at the same depth',
      'Prune early on infeasible branches',
    ],
    discriminators: [
      { vs: 'dsa-dynamic-programming', how: 'Backtracking enumerates. DP memoizes overlapping subproblems — use DP when the same state is reachable by many paths.' },
    ],
    palaceProbes: ['When do you restore state vs. pass an immutable copy down?'],
    tags: ['algorithms', 'search'],
  },
  'Graphs': {
    triggerSignals: ['shortest path', 'connected components', 'topological order', 'cycle detection', 'dijkstra'],
    keyPoints: [
      'BFS for unweighted shortest path',
      'Dijkstra (min-heap) for weighted positive',
      'Bellman-Ford for negative weights',
      'Topological sort via Kahn (BFS of in-degree) or DFS postorder',
      '3-state DFS (white/gray/black) for cycle detection in directed graphs',
    ],
    discriminators: [
      { vs: 'dsa-union-find', how: 'Graphs = traversal/search. Union-Find = online connectivity queries.' },
    ],
    palaceProbes: ['Why does BFS work for unweighted but not weighted shortest path?'],
    tags: ['algorithms', 'graphs'],
  },
  'Dynamic Programming': {
    triggerSignals: ['count number of ways', 'maximum you can achieve', 'longest common subsequence', 'edit distance', 'coin change'],
    keyPoints: [
      'Identify state: what parameters uniquely describe a subproblem?',
      'Write the recurrence: dp[state] in terms of smaller states',
      'Base cases and iteration order',
      '1D rolling array when only last row matters',
      'Top-down memo is easier to write; bottom-up is easier to optimize',
    ],
    discriminators: [
      { vs: 'dsa-backtracking', how: 'DP caches overlapping subproblems. Backtracking explores disjoint branches.' },
      { vs: 'dsa-greedy', how: 'DP considers all options. Greedy commits to one option per step — only works when the greedy choice is provably optimal.' },
    ],
    palaceProbes: ['If you cannot figure out the DP state, what should you write first?'],
    tags: ['algorithms', 'dp'],
  },
  'Greedy': {
    triggerSignals: ['minimum number of', 'earliest deadline', 'can you reach the end', 'jump game', 'gas station'],
    keyPoints: [
      'Sort by some key, then sweep',
      'Pick locally optimal choice when exchange argument proves it is global',
      'Often interval-based: sort by start or end time',
    ],
    discriminators: [
      { vs: 'dsa-dynamic-programming', how: 'Greedy commits without revisiting. DP explores. Use greedy only when provably optimal.' },
    ],
    palaceProbes: ['How do you prove a greedy choice is optimal?'],
    tags: ['algorithms', 'greedy'],
  },
  'Intervals': {
    triggerSignals: ['merge intervals', 'insert interval', 'meeting rooms', 'non-overlapping intervals'],
    keyPoints: [
      'Sort by start time',
      'Merge adjacent if current.start ≤ prev.end',
      'For max overlap: sort starts and ends separately, sweep',
      'For non-overlap max: sort by end time, greedy',
    ],
    discriminators: [],
    palaceProbes: ['Why sort by end time for the non-overlap problem?'],
    tags: ['algorithms', 'intervals'],
  },
  'Trees': {
    triggerSignals: ['tree depth', 'validate bst', 'lowest common ancestor', 'path sum', 'serialize tree'],
    keyPoints: [
      'DFS (recursive): base case + combine children results',
      'BFS (queue): level-by-level traversal',
      'BST validation with min/max bounds',
      'LCA via DFS returning found-or-null',
    ],
    discriminators: [
      { vs: 'dsa-graphs', how: 'Trees are a special acyclic case. Graph algorithms need visited sets; tree DFS typically does not.' },
    ],
    palaceProbes: ['When does a tree DFS need a visited set after all?'],
    tags: ['data-structures', 'trees'],
  },
  'Linked List': {
    triggerSignals: ['reverse list', 'detect cycle', 'middle node', 'merge sorted lists', 'lru cache'],
    keyPoints: [
      'Iterative reversal: prev/curr/next dance',
      'Floyd cycle detection: fast/slow pointers',
      'Dummy head node for merge/remove-nth-from-end',
      'LRU = hash map + doubly linked list',
    ],
    discriminators: [],
    palaceProbes: ['Why do you need a dummy head for merge?'],
    tags: ['data-structures', 'pointers'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Default metadata synthesis.
// ─────────────────────────────────────────────────────────────────────────────

function firstSentence(text: string): string {
  const stripped = text.replace(/[*_`#>\n]/g, ' ').trim();
  const m = stripped.match(/^(.*?[.!?])(\s|$)/);
  return (m ? m[1] : stripped.slice(0, 160)).trim();
}

function deriveDefaultMeta(lesson: TopicLesson): SdiChunkMeta {
  return {
    triggerSignals: lesson.keyPatterns.slice(0, 3).map((p) => p.split(':')[0].trim().toLowerCase()),
    keyPoints: lesson.keyPatterns.slice(0, 6),
    discriminators: [] as Discriminator[],
    palaceProbes: lesson.commonMistakes.slice(0, 2),
    tags: ['dsa'],
  };
}

function mergeMeta(lesson: TopicLesson, partial: Partial<SdiChunkMeta> | undefined): SdiChunkMeta {
  const base = deriveDefaultMeta(lesson);
  if (!partial) return base;
  return {
    triggerSignals: partial.triggerSignals ?? base.triggerSignals,
    keyPoints: partial.keyPoints && partial.keyPoints.length ? partial.keyPoints : base.keyPoints,
    discriminators: partial.discriminators ?? base.discriminators,
    palaceProbes: partial.palaceProbes && partial.palaceProbes.length ? partial.palaceProbes : base.palaceProbes,
    tags: partial.tags ?? base.tags,
  };
}

function slugify(topic: string): string {
  return topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function categoryOf(topic: string): string {
  for (const cat of DSA_CATEGORIES) {
    if (cat.topics.includes(topic)) return cat.name;
  }
  return 'Uncategorized';
}

// ─────────────────────────────────────────────────────────────────────────────
// Build.
// ─────────────────────────────────────────────────────────────────────────────

export function buildDsaChunks(): DsaChunk[] {
  const out: DsaChunk[] = [];
  for (const cat of DSA_CATEGORIES) {
    for (const topic of cat.topics) {
      const lesson = lessons[topic];
      if (!lesson) continue;
      out.push({
        id: `dsa-${slugify(topic)}`,
        topic,
        title: topic,
        category: cat.name,
        oneLiner: firstSentence(lesson.overview),
        meta: mergeMeta(lesson, META[topic]),
      });
    }
  }
  return out;
}

export const dsaChunks: DsaChunk[] = buildDsaChunks();

export function getDsaChunk(id: string): DsaChunk | undefined {
  return dsaChunks.find((c) => c.id === id);
}

export function filterDsaByScope(scope: string): DsaChunk[] {
  if (!scope || scope === 'all') return dsaChunks;
  if (scope.startsWith('cat:')) {
    const name = decodeURIComponent(scope.slice(4));
    return dsaChunks.filter((c) => c.category === name);
  }
  if (scope.startsWith('topic:')) {
    const topic = decodeURIComponent(scope.slice(6));
    return dsaChunks.filter((c) => c.topic === topic);
  }
  return dsaChunks;
}
