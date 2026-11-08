import { TimeComplexityBreakdown, TimeComplexityCalculation } from '../data/solutions/types';
import ComplexityVariables from './ComplexityVariables';

function Calculation({ calculation }: { calculation: TimeComplexityCalculation }) {
  return <>
    {calculation.title && <p className="font-semibold text-gray-300 light:text-gray-700">{calculation.title}</p>}
    <ol className="list-decimal pl-5 space-y-1">
      {calculation.phases.map(({ label, cost }) => (
        <li key={label}>{label}: <code className="text-gray-300 light:text-gray-700">{cost}</code></li>
      ))}
    </ol>
    <pre className="complexity-equation whitespace-pre-wrap break-words font-mono text-gray-300 light:text-gray-700">
      {calculation.phases.map(phase => phase.cost).join(' + ')}
      {calculation.simplifications.map(expression => `\n= ${expression}`).join('')}
    </pre>
    <p>{calculation.note}</p>
  </>;
}

export default function SolutionComplexity({ solution, language = 'javascript' }: {
  language?: 'javascript' | 'python';
  solution: {
    timeComplexity: string;
    spaceComplexity: string;
    timeComplexityBreakdown?: TimeComplexityBreakdown;
    pythonTimeComplexity?: string;
    pythonTimeComplexityBreakdown?: TimeComplexityBreakdown;
    complexityVariables?: Record<string, string>;
    pythonComplexityVariables?: Record<string, string>;
  };
}) {
  const breakdown = language === 'python' ? solution.pythonTimeComplexityBreakdown ?? solution.timeComplexityBreakdown : solution.timeComplexityBreakdown;
  const time = language === 'python' ? solution.pythonTimeComplexity ?? solution.timeComplexity : solution.timeComplexity;
  if (!time && !solution.spaceComplexity) return null;
  if (!breakdown) return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 light:text-gray-500">
      {time && <span>Time: <strong className="text-gray-300 light:text-gray-700">{time}</strong></span>}
      {solution.spaceComplexity && <span>Space: <strong className="text-gray-300 light:text-gray-700">{solution.spaceComplexity}</strong></span>}
      <ComplexityVariables solution={solution} language={language} />
    </div>
  );

  return (
    <div className="solution-complexity min-w-0 space-y-2 text-xs leading-relaxed text-gray-400 light:text-gray-600">
      <p className="font-semibold text-gray-300 light:text-gray-700">Time complexity</p>
      <p>{breakdown.variables}</p>
      <ComplexityVariables solution={solution} language={language} />
      <Calculation calculation={breakdown} />
      {breakdown.operations?.map(operation => <Calculation key={operation.title} calculation={operation} />)}
      {solution.spaceComplexity && (
        <p>Space: <strong className="text-gray-300 light:text-gray-700">{solution.spaceComplexity}</strong></p>
      )}
    </div>
  );
}
