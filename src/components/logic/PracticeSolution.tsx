import { useProblemSolution } from '../../hooks/useProblemSolution';
import CodeBlock from '../CodeBlock';

export default function PracticeSolution({ id }: { id: number }) {
  const { solution, loading, error, retry } = useProblemSolution(id);

  return (
    <div className="logic-solution-content">
      <h2>Python solution</h2>
      {loading ? (
        <p role="status">Loading Python solution…</p>
      ) : error ? (
        <div>
          <p role="alert">{error.message}</p>
          <button type="button" className="logic-small-button" onClick={retry}>Retry solution</button>
        </div>
      ) : solution ? (
        <>
          <h3>Approach</h3>
          <p className="whitespace-pre-line">{solution.approach}</p>
          <CodeBlock code={solution.code} language="python" />
          <h3>Explanation</h3>
          <p className="whitespace-pre-line">{solution.explanation}</p>
          <dl>
            <div><dt>Time</dt><dd>{solution.pythonTimeComplexity ?? solution.timeComplexity}</dd></div>
            <div><dt>Space</dt><dd>{solution.spaceComplexity}</dd></div>
          </dl>
        </>
      ) : (
        <p>A Python solution is not available for this problem.</p>
      )}
    </div>
  );
}
