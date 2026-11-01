import { ProblemSolution } from './types';
import { Runtime } from './runtime-breakdown';
import { arrayRuntimes } from './runtime-arrays';
import { structureRuntimes } from './runtime-structures';
import { treeHeapRuntimes } from './runtime-trees-heaps';
import { backtrackingRuntimes } from './runtime-backtracking';
import { dpRuntimes } from './runtime-dp';
import { greedyIntervalRuntimes } from './runtime-greedy-intervals';
import { mathBitRuntimes } from './runtime-math-bits';

// The graph versions are attached separately after BFS-first ordering. These
// entries cover the remaining NeetCode 250 code, including its non-player follow-up.
export const neetcodeRuntimes: Record<string, Runtime> = {
  ...arrayRuntimes, ...structureRuntimes, ...treeHeapRuntimes,
  ...backtrackingRuntimes, ...dpRuntimes, ...greedyIntervalRuntimes, ...mathBitRuntimes,
};

export function withNeetCodeRuntimeBreakdown(solution: ProblemSolution): ProblemSolution {
  const primary = neetcodeRuntimes[String(solution.id)];
  if (!primary) return solution;
  const followUp = solution.followUp;
  const alternative = followUp
    ? neetcodeRuntimes[`${solution.id}-${followUp.walkthroughVariant ?? 'follow-up'}`]
    : undefined;
  return {
    ...solution,
    ...primary,
    ...(followUp && alternative ? { followUp: { ...followUp, ...alternative } } : {}),
  };
}
