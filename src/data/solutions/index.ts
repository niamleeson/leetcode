import { ProblemSolution } from './types';

// Original solution groups
import { solutions as arraysHashing } from './arrays-hashing';
import { solutions as twoPointersSlidingWindow } from './two-pointers-sliding-window';
import { solutions as stackBinarySearch } from './stack-binary-search';
import { solutions as linkedListTrees } from './linked-list-trees';
import { solutions as graphsBacktracking } from './graphs-backtracking';
import { solutions as dpGreedyOther } from './dp-greedy-other';

// Extra batches filling in remaining problems
import { solutions as batch1Extra } from './batch1-extra';
import { solutions as batch2Extra } from './batch2-extra';
import { solutions as batch3Extra } from './batch3-extra';
import { solutions as batch4Extra } from './batch4-extra';
import { solutions as batch5Extra } from './batch5-extra';
import { solutions as batch6Extra } from './batch6-extra';

const allSolutions: ProblemSolution[] = [
  ...arraysHashing,
  ...twoPointersSlidingWindow,
  ...stackBinarySearch,
  ...linkedListTrees,
  ...graphsBacktracking,
  ...dpGreedyOther,
  ...batch1Extra,
  ...batch2Extra,
  ...batch3Extra,
  ...batch4Extra,
  ...batch5Extra,
  ...batch6Extra,
];

// Build a map for O(1) lookup by problem ID
export const solutionMap: Record<number, ProblemSolution> = {};
for (const sol of allSolutions) {
  solutionMap[sol.id] = sol;
}

export type { ProblemSolution };
export { allSolutions };
