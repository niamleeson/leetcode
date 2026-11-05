import type { ReactChallenge } from './types';

export const sunoIntervalChallenge: ReactChallenge = {
  collection: 'Suno',
  kind: 'coding',
  slug: 'suno-minimum-interval',
  title: 'Minimum Interval — Practice Variant',
  difficulty: 'Hard',
  topics: ['Intervals', 'Sorting', 'Min-heap', 'Offline queries'],
  sourceUrl: 'https://www.glassdoor.co.in/Interview/They-asked-a-classical-algorithm-min-interval-question-QTN_8650469.htm',
  sourceLabel: 'Software Engineer Intern candidate report on Glassdoor',
  additionalSources: [
    {
      label: 'Practice specification: LeetCode 1851',
      url: 'https://leetcode.com/problems/minimum-interval-to-include-each-query/',
    },
  ],
  report: 'A Suno Software Engineer Intern candidate reports a “min interval” algorithm question. The entry does not publish its inputs, outputs, or exact variant. The solution below practices LeetCode 1851; it is not a verified reconstruction of the Suno question.',
  summary: 'Practice finding the smallest interval containing each query with sorting and a min-heap. The reported Suno variant is unspecified.',
  prompt: 'Practice variant: given inclusive integer intervals and query values, return the length of the smallest interval covering each query. Use right - left + 1 for the length and return -1 when no interval covers a query. Return answers in the original query order.',
  assumptions: [
    'The candidate only names a minimum-interval problem. Choosing Minimum Interval to Include Each Query (LeetCode 1851) is a practice interpretation, not a claim about Suno’s exact prompt.',
    'Every interval is a valid pair of integer endpoints with left <= right. Duplicate intervals and repeated query values are allowed.',
    'Both endpoints count as part of the interval. This implementation also handles empty interval and query arrays.',
    'All queries are available before processing, so they can be sorted internally. Input arrays must remain unchanged.',
  ],
  requirements: [
    'Find the smallest covering interval for each query, or return -1 when none covers it.',
    'Keep answers aligned with the query array’s original positions, including repeated values.',
    'Sort copies of the inputs and use a min-heap ordered by interval length.',
    'Include a complete heap implementation without relying on a priority-queue package.',
  ],
  example: {
    actions: 'Evaluate intervals [[1, 4], [2, 4], [3, 6], [4, 4]] for queries [2, 3, 4, 5].',
    result: '[3, 3, 1, 4]. Queries 2 and 3 use [2, 4]; query 4 uses [4, 4]; query 5 uses [3, 6].',
  },
  steps: [
    'Sort a copy of the intervals by left endpoint. Pair each query with its original index, then sort those pairs by query value.',
    'Process queries from left to right. Before answering a query, insert every interval whose left endpoint is at or before it.',
    'Store each heap entry as [intervalLength, rightEndpoint]. The first value determines priority; the second tells us whether the interval has expired.',
    'While the heap’s top ends before the query, remove it. If a valid top remains, its length is the answer; otherwise keep -1.',
    'Write the answer at originalIndex. The processing order can be sorted while the returned order still matches the caller’s input.',
    'For the example, the answers at queries 2, 3, 4, and 5 are 3, 3, 1, and 4. When processing 5, the length-1 and length-3 entries ending at 4 are removed before [3, 6] supplies length 4.',
  ],
  pitfalls: [
    'The report does not identify LeetCode 1851. Clarify the actual interval task before choosing this algorithm.',
    'Inclusive integer intervals have length right - left + 1. A single-point interval has length 1.',
    'An interval expires when right < query, not when right === query.',
    'Expired entries may remain deeper in the heap temporarily. Only the top can supply an answer; discard expired top entries before reading it. Once the top is valid, no remaining entry has a smaller length.',
    'Ascending queries make expiration permanent: an interval that has expired cannot cover a later query.',
    'Do not return answers in sorted query order or sort the caller’s arrays in place.',
  ],
  complexity: 'For N intervals and Q queries, time is O(N log N + Q log Q): sorting dominates alongside at most N heap insertions and N removals. Scanning queries and reading the heap top take O(Q). Space is O(N + Q) for sorted copies, original query indexes, the heap, and answers.',
  integrationNotes: [
    'Run this standalone JavaScript in a browser console or Node.js. The heap is included, and the examples print their results.',
    'Each heap entry is [intervalLength, rightEndpoint], so comparisons use entry[0]. swap exchanges entire entries, keeping each length paired with its right endpoint.',
    'Heap push swaps a new entry with its parent while it is smaller. pop replaces the root with the last entry, then swaps it with the smaller child until heap order is restored. size() returns the number of entries.',
    'Before using this in an interview, establish which minimum-interval variant is intended. This answer applies specifically to the practice specification linked above.',
  ],
  testCases: [
    { action: 'Run the first four-query example.', expected: '[3, 3, 1, 4].' },
    { action: 'Query [2, 19, 5, 22] against [[2, 3], [2, 5], [1, 8], [20, 25]].', expected: '[2, -1, 4, 6], preserving the unsorted input order.' },
    { action: 'Query a single-point interval at its endpoint.', expected: 'Return 1; inclusive boundaries count.' },
    { action: 'Repeat a query or provide empty inputs.', expected: 'Repeated queries receive the same answer; no intervals gives -1 for each query; no queries gives [].' },
    { action: 'Compare the input arrays before and after calling the function.', expected: 'Both arrays and every interval pair remain unchanged.' },
  ],
  solutionTitle: 'JavaScript solution',
  codeLanguage: 'javascript',
  code: String.raw`class MinHeap {
  constructor() {
    this.values = [];
  }

  size() {
    return this.values.length;
  }

  peek() {
    return this.values[0];
  }

  swap(a, b) {
    const temp = this.values[a];
    this.values[a] = this.values[b];
    this.values[b] = temp;
  }

  // Each entry is [intervalLength, rightEndpoint].
  push(value) {
    this.values.push(value);

    let index = this.values.length - 1;

    // Move the new value up, comparing interval lengths.
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.values[parent][0] <= this.values[index][0]) break;

      this.swap(parent, index);
      index = parent;
    }
  }

  pop() {
    if (this.values.length === 0) return undefined;

    const smallest = this.values[0];
    const last = this.values.pop();

    if (this.values.length === 0) return smallest;

    this.values[0] = last;

    let index = 0;

    // Move the replacement down.
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      let smallestIndex = index;

      if (
        left < this.values.length &&
        this.values[left][0] < this.values[smallestIndex][0]
      ) {
        smallestIndex = left;
      }

      if (
        right < this.values.length &&
        this.values[right][0] < this.values[smallestIndex][0]
      ) {
        smallestIndex = right;
      }

      if (smallestIndex === index) break;

      this.swap(index, smallestIndex);
      index = smallestIndex;
    }

    return smallest;
  }
}

function minInterval(intervals, queries) {
  // Copy the arrays before sorting.
  const sortedIntervals = intervals
    .slice()
    .sort((a, b) => a[0] - b[0]);

  // Preserve each query's original position.
  const sortedQueries = queries
    .map((query, index) => [query, index])
    .sort((a, b) => a[0] - b[0]);

  const answers = Array(queries.length).fill(-1);
  const heap = new MinHeap();

  let nextInterval = 0;

  for (const [query, originalIndex] of sortedQueries) {
    // Add intervals that have started by this query.
    while (
      nextInterval < sortedIntervals.length &&
      sortedIntervals[nextInterval][0] <= query
    ) {
      const [left, right] = sortedIntervals[nextInterval++];

      heap.push([
        right - left + 1,
        right,
      ]);
    }

    // Remove expired intervals when they reach the top.
    while (
      heap.size() > 0 &&
      heap.peek()[1] < query
    ) {
      heap.pop();
    }

    if (heap.size() > 0) {
      answers[originalIndex] = heap.peek()[0];
    }
  }

  return answers;
}

console.log(
  minInterval(
    [[1, 4], [2, 4], [3, 6], [4, 4]],
    [2, 3, 4, 5]
  )
);
// [3, 3, 1, 4]

console.log(
  minInterval(
    [[2, 3], [2, 5], [1, 8], [20, 25]],
    [2, 19, 5, 22]
  )
);
// [2, -1, 4, 6]

console.log(minInterval([], [1, 1, 5]));
// [-1, -1, -1]
`,
};
