import { SolutionFollowUp } from '../data/solutions/types';
import CodeBlock from './CodeBlock';
import ExecutionWalkthrough, { hasExecutionWalkthrough } from './walkthroughs/ExecutionWalkthrough';

export default function FollowUpSolution({ solution, language, problemId }: {
  solution: SolutionFollowUp;
  language: 'python' | 'javascript';
  problemId?: number;
}) {
  const showJs = language === 'javascript' && !!solution.jsCode;
  const interactive = showJs && problemId !== undefined && !!solution.walkthroughVariant && hasExecutionWalkthrough(problemId,solution.walkthroughVariant);

  return (
    <section className="follow-up-solution space-y-3 rounded-lg border border-blue-900/40 light:border-blue-200 bg-blue-950/10 light:bg-blue-50/50 p-4">
      <h3 className="text-sm font-semibold text-blue-300 light:text-blue-700">{solution.label || 'Follow-up'}: {solution.title}</h3>
      <p className="text-sm text-gray-400 light:text-gray-600 leading-relaxed whitespace-pre-line">{solution.approach}</p>
      <h4 className="text-xs font-semibold text-emerald-400 light:text-emerald-700">{showJs ? 'JavaScript' : 'Python'} Solution</h4>
      {interactive ? <ExecutionWalkthrough id={problemId!} variant={solution.walkthroughVariant} code={solution.jsCode!} />
        : <CodeBlock code={showJs ? solution.jsCode! : solution.code} language={showJs ? 'javascript' : 'python'} />}
      {language === 'javascript' && !solution.jsCode && (
        <p className="text-xs text-gray-500">JavaScript solution not available, showing Python.</p>
      )}
      {!interactive && showJs && solution.jsWalkthrough && (
        <div>
          <h4 className="text-xs font-semibold text-sky-400 light:text-sky-700 mb-2">Step-by-Step Walkthrough</h4>
          <pre className="text-xs text-gray-300 light:text-gray-700 whitespace-pre-wrap leading-relaxed">{solution.jsWalkthrough}</pre>
        </div>
      )}
      <h4 className="text-xs font-semibold text-yellow-400 light:text-yellow-700">Explanation</h4>
      <p className="text-sm text-gray-400 light:text-gray-600 leading-relaxed whitespace-pre-line">{solution.explanation}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 light:text-gray-600">
        <span>Time: <strong className="text-gray-300 light:text-gray-700">{solution.timeComplexity}</strong></span>
        <span>Space: <strong className="text-gray-300 light:text-gray-700">{solution.spaceComplexity}</strong></span>
      </div>
    </section>
  );
}
