import { Link } from 'react-router-dom';
import { orderedLogicProblems } from '../../data/logic/order';

export default function ProblemNavigation({ id, language }: { id: number; language: 'javascript' | 'python' }) {
  const index = orderedLogicProblems.findIndex(problem => problem.id === id);
  if (index < 0) return null;
  const neighbors = [
    { direction: 'previous', label: 'Previous problem', problem: orderedLogicProblems[index - 1] },
    { direction: 'next', label: 'Next problem', problem: orderedLogicProblems[index + 1] },
  ];
  return <nav className="logic-problem-navigation" aria-label="Problem navigation">
    {neighbors.map(({ direction, label, problem }) => problem ? (
      <Link key={direction} className="logic-problem-link" data-direction={direction} rel={direction === 'previous' ? 'prev' : 'next'} to={`/practice/${problem.id}?language=${language}`}>
        <span>{direction === 'previous' && <span aria-hidden="true">← </span>}{label}{direction === 'next' && <span aria-hidden="true"> →</span>}</span>
        <strong>#{problem.id} · {problem.title}</strong>
      </Link>
    ) : <button key={direction} type="button" className="logic-problem-link" data-direction={direction} disabled>{label}</button>)}
  </nav>;
}
