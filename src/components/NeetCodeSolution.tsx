import { ProblemSolution } from '../data/solutions/types';
import { solutionProse } from '../data/solutions/prose';
import { useProblemSolution } from '../hooks/useProblemSolution';
import CodeBlock from './CodeBlock';
import FollowUpSolution from './FollowUpSolution';
import SolutionComplexity from './SolutionComplexity';
import ExecutionWalkthrough, { hasExecutionWalkthrough } from './walkthroughs/ExecutionWalkthrough';

type Lang = 'python' | 'javascript';

export default function NeetCodeSolution({ id, language }: { id: number; language: Lang }) {
  const { solution, error, retry } = useProblemSolution(id);
  if (!solution) return <div className="text-xs text-gray-400 light:text-gray-600">
    <p role="status">{error ? 'The solution could not load.' : 'Loading solution…'}</p>
    {error && <button type="button" onClick={retry} className="mt-2 text-blue-400 light:text-blue-700 hover:underline">Retry solution</button>}
  </div>;
  return <InlineSolution key={id} solution={solution} language={language}/>;
}

function InlineSolution({ solution, language }: { solution: ProblemSolution; language: Lang }) {
  const showJs = language === 'javascript' && !!solution.jsCode;
  const code = showJs ? solution.jsCode! : solution.code;
  const codeLang: Lang = showJs ? 'javascript' : 'python';
  const prose = solutionProse(solution, codeLang);
  const interactive = hasExecutionWalkthrough(solution.id, undefined, codeLang);

  return (
    <div className="min-w-0 space-y-4">
      {solution.description && (
        <div>
          <h4 className="text-[10px] font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider mb-1.5">Problem</h4>
          <p className="text-xs text-gray-300 light:text-gray-700 leading-relaxed whitespace-pre-line">{solution.description}</p>
        </div>
      )}

      {solution.examples && (
        <pre className="bg-gray-950 light:bg-gray-50 border border-gray-800 light:border-gray-200 rounded-md p-3 text-[11px] text-gray-300 light:text-gray-700 overflow-x-auto whitespace-pre-wrap font-mono">
          {solution.examples}
        </pre>
      )}

      {prose.intuition && (
        <div>
          <h4 className="text-[10px] font-semibold text-cyan-400 light:text-cyan-700 uppercase tracking-wider mb-1.5">Intuition</h4>
          <p className="text-xs text-gray-300 light:text-gray-700 leading-relaxed whitespace-pre-line bg-cyan-950/20 light:bg-cyan-50 border border-cyan-900/30 light:border-cyan-200 rounded-md p-3">
            {prose.intuition}
          </p>
        </div>
      )}

      {prose.approach && (
        <div>
          <h4 className="text-[10px] font-semibold text-blue-400 light:text-blue-700 uppercase tracking-wider mb-1.5">Approach</h4>
          <p className="text-xs text-gray-400 light:text-gray-600 leading-relaxed whitespace-pre-line">{prose.approach}</p>
        </div>
      )}

      <div>
        <h4 className="text-[10px] font-semibold text-emerald-400 light:text-emerald-700 uppercase tracking-wider mb-1.5">
          {solution.solutionTitle && `${solution.solutionTitle} · `}
          {codeLang === 'python' ? 'Python' : 'JavaScript'} Solution
        </h4>
        {!interactive && <CodeBlock code={code} language={codeLang} />}
        {language === 'javascript' && !solution.jsCode && (
          <p className="text-[10px] text-gray-500 light:text-gray-500 mt-1">JavaScript solution not available — showing Python.</p>
        )}
        {interactive ? <ExecutionWalkthrough id={solution.id} code={code} language={codeLang} />
          : showJs && solution.jsWalkthrough && (
          <div className="mt-3 bg-gray-950 light:bg-sky-50 border border-sky-900/30 light:border-sky-200 rounded-md p-3">
            <h4 className="text-[10px] font-semibold text-sky-400 light:text-sky-700 uppercase tracking-wider mb-2">Step-by-Step Walkthrough</h4>
            <pre className="text-sky-200/90 light:text-sky-700 whitespace-pre-wrap overflow-x-auto font-mono text-xs leading-relaxed">{solution.jsWalkthrough}</pre>
          </div>
        )}
      </div>

      {prose.explanation && (
        <div>
          <h4 className="text-[10px] font-semibold text-yellow-400 light:text-yellow-700 uppercase tracking-wider mb-1.5">Explanation</h4>
          <p className="text-xs text-gray-400 light:text-gray-600 leading-relaxed whitespace-pre-line">{prose.explanation}</p>
        </div>
      )}

      <SolutionComplexity solution={solution} language={codeLang} />
      {solution.followUp && <FollowUpSolution solution={solution.followUp} language={language} problemId={solution.id} />}
    </div>
  );
}
