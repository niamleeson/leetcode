import type { ProblemSolution } from './types';

/** Match the explanation to the displayed implementation when languages differ. */
export function solutionProse(solution: ProblemSolution | null | undefined, language: 'python' | 'javascript') {
  const javascript = language === 'javascript';
  return {
    intuition: (javascript ? solution?.jsIntuition : undefined) ?? solution?.intuition ?? '',
    approach: (javascript ? solution?.jsApproach : undefined) ?? solution?.approach ?? '',
    explanation: (javascript ? solution?.jsExplanation : undefined) ?? solution?.explanation ?? '',
  };
}
