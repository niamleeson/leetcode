import { Fragment } from 'react';
import type { DailySavedSolution } from '../data/daily-questions/types';
import StudySolution from './StudySolution';
import './solutionComparison.css';

export default function SolutionComparison({ solutions, dfsLabel = 'DFS', memoizedDfs }: {
  solutions: DailySavedSolution[];
  dfsLabel?: string;
  memoizedDfs?: DailySavedSolution;
}) {
  return <section aria-label="DFS and DP solutions" className={`solution-comparison${memoizedDfs ? ' solution-comparison--with-memo' : ''}`}>
    {solutions.map((solution, index) => <Fragment key={solution.title}>
      {index === 1 && memoizedDfs && <StudySolution solution={memoizedDfs} index={2} label="DFS + memoization" />}
      <StudySolution
        solution={solution}
        index={index}
        label={index === 0 ? dfsLabel : 'Bottom-up DP'}
      />
    </Fragment>)}
  </section>;
}
