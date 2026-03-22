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
import { solutions as concurrency } from './concurrency';
import { solutions as advancedDsa } from './advanced-dsa';
import { solutionsM1 as sdM1 } from './system-design-m1';
import { solutionsM2 as sdM2 } from './system-design-m2';
import { solutionsM3 as sdM3 } from './system-design-m3';
import { solutionsM4 as sdM4 } from './system-design-m4';
import { solutionsM5 as sdM5 } from './system-design-m5';
import { solutionsM6 as sdM6 } from './system-design-m6';
import { sdiVol1M1 } from './sdi-vol1-m1';
import { sdiVol1M2 } from './sdi-vol1-m2';
import { sdiVol1M3 } from './sdi-vol1-m3';
import { sdiVol1M4 } from './sdi-vol1-m4';
import { sdiVol2M1 } from './sdi-vol2-m1';
import { sdiVol2M2 } from './sdi-vol2-m2';
import { sdiVol2M3 } from './sdi-vol2-m3';

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
  ...concurrency,
  ...advancedDsa,
  ...sdM1,
  ...sdM2,
  ...sdM3,
  ...sdM4,
  ...sdM5,
  ...sdM6,
  ...sdiVol1M1,
  ...sdiVol1M2,
  ...sdiVol1M3,
  ...sdiVol1M4,
  ...sdiVol2M1,
  ...sdiVol2M2,
  ...sdiVol2M3,
];

// Build a map for O(1) lookup by problem ID
export const solutionMap: Record<number, ProblemSolution> = {};
for (const sol of allSolutions) {
  solutionMap[sol.id] = sol;
}

export type { ProblemSolution };
export { allSolutions };
