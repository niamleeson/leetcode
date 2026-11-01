import { TimeComplexityBreakdown } from '../data/solutions/types';

export default function SolutionComplexity({ solution }: {
  solution: {
    timeComplexity: string;
    spaceComplexity: string;
    timeComplexityBreakdown?: TimeComplexityBreakdown;
  };
}) {
  const breakdown = solution.timeComplexityBreakdown;
  if (!solution.timeComplexity && !solution.spaceComplexity) return null;
  if (!breakdown) return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 light:text-gray-500">
      {solution.timeComplexity && <span>Time: <strong className="text-gray-300 light:text-gray-700">{solution.timeComplexity}</strong></span>}
      {solution.spaceComplexity && <span>Space: <strong className="text-gray-300 light:text-gray-700">{solution.spaceComplexity}</strong></span>}
    </div>
  );

  return (
    <div className="solution-complexity min-w-0 space-y-2 text-xs leading-relaxed text-gray-400 light:text-gray-600">
      <p className="font-semibold text-gray-300 light:text-gray-700">Time complexity</p>
      <p>{breakdown.variables}</p>
      <ol className="list-decimal pl-5 space-y-1">
        {breakdown.phases.map(({ label, cost }) => (
          <li key={label}>{label}: <code className="text-gray-300 light:text-gray-700">{cost}</code></li>
        ))}
      </ol>
      <pre className="complexity-equation whitespace-pre-wrap break-words font-mono text-gray-300 light:text-gray-700">
        {breakdown.phases.map(phase => phase.cost).join(' + ')}
        {breakdown.simplifications.map(expression => `\n= ${expression}`).join('')}
      </pre>
      <p>{breakdown.note}</p>
      {solution.spaceComplexity && (
        <p>Space: <strong className="text-gray-300 light:text-gray-700">{solution.spaceComplexity}</strong></p>
      )}
    </div>
  );
}
