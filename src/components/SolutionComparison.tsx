import type { DailySavedSolution } from '../data/daily-questions/types';
import StudySolution from './StudySolution';
import './solutionComparison.css';

export default function SolutionComparison({ solutions, dfsLabel = 'DFS' }: { solutions: DailySavedSolution[]; dfsLabel?: string }) {
  return <section aria-label="DFS and DP solutions" className="solution-comparison">
    {solutions.map((solution, index) => <StudySolution
      key={solution.title}
      solution={solution}
      index={index}
      label={index === 0 ? dfsLabel : 'Bottom-up DP'}
    />)}
  </section>;
}
