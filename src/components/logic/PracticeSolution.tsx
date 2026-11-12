import { useProblemSolution } from '../../hooks/useProblemSolution';
import { solutionProse } from '../../data/solutions/prose';
import CodeBlock from '../CodeBlock';
import ComplexityVariables from '../ComplexityVariables';

export default function PracticeSolution({ id, language = 'python', approach, explanation }: { id: number; language?: 'python' | 'javascript'; approach?: string; explanation?: string }) {
  const { solution, loading, error, retry } = useProblemSolution(id);
  const languageName = language === 'javascript' ? 'JavaScript' : 'Python';
  const code = language === 'javascript' ? solution?.jsCode : solution?.code;
  const prose = solutionProse(solution, language);

  return (
    <div className="logic-solution-content">
      <h2>{languageName} solution</h2>
      {loading ? (
        <p role="status">Loading {languageName} solution…</p>
      ) : error ? (
        <div>
          <p role="alert">{error.message}</p>
          <button type="button" className="logic-small-button" onClick={retry}>Retry solution</button>
        </div>
      ) : solution && code ? (
        <>
          <h3>Approach</h3>
          <p className="whitespace-pre-line">{approach ?? prose.approach}</p>
          <CodeBlock code={code} language={language} />
          <h3>Explanation</h3>
          <p className="whitespace-pre-line">{explanation ?? prose.explanation}</p>
          <dl>
            <div><dt>Time</dt><dd>{language === 'python' ? solution.pythonTimeComplexity ?? solution.timeComplexity : solution.timeComplexity}</dd></div>
            <div><dt>Space</dt><dd>{solution.spaceComplexity}</dd></div>
          </dl>
          <ComplexityVariables solution={solution} language={language} />
        </>
      ) : (
        <p>A {languageName} solution is not available for this problem.</p>
      )}
    </div>
  );
}
