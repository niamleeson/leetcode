import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { knapsackProblems, loadKnapsackProblem, type KnapsackDocument } from '../data/knapsack';
import { RichText } from './CatalogProblemContent';
import StudySolution from './StudySolution';

const textLink = 'text-sm text-blue-400 hover:underline light:text-blue-700';

export default function KnapsackProblemContent({ slug }: { slug: string }) {
  const [document, setDocument] = useState<KnapsackDocument>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    window.scrollTo({ top: 0, left: 0 });
    setDocument(undefined);
    setError(undefined);
    loadKnapsackProblem(slug).then(value => {
      if (active) setDocument(value);
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : 'This problem could not be loaded.');
    });
    return () => { active = false; };
  }, [slug, attempt]);

  const index = knapsackProblems.findIndex(problem => problem.slug === slug);
  const previous = knapsackProblems[index - 1];
  const next = knapsackProblems[index + 1];

  return <div className="space-y-6">
    <Link to="/daily" className={textLink}>← Daily Questions</Link>
    {!document ? <div role={error ? 'alert' : 'status'} className="space-y-2 text-sm text-gray-400 light:text-gray-600">
      <p>{error ?? 'Loading knapsack problem…'}</p>
      {error && <button type="button" className={textLink} onClick={() => setAttempt(value => value + 1)}>Retry</button>}
    </div> : <>
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 light:text-emerald-700">Knapsack practice</p>
        <h1 className="text-2xl font-bold text-white light:text-gray-900">{document.title}</h1>
      </header>
      <section aria-label="Problem description">
        <h2 className="catalog-section-title">Problem &amp; examples</h2>
        <RichText text={document.descriptionMarkdown} />
      </section>
      {document.solutions.map((solution, solutionIndex) => <StudySolution key={solution.title} solution={solution} index={solutionIndex} />)}
      <nav aria-label="Adjacent knapsack problems" className="flex justify-between gap-4 border-t border-gray-800 pt-4 light:border-gray-200">
        {previous ? <Link className={`${textLink} py-2`} to={`/daily?practice=${previous.slug}`}>← Previous problem</Link> : <span />}
        {next && <Link className={`${textLink} py-2 text-right`} to={`/daily?practice=${next.slug}`}>Next problem →</Link>}
      </nav>
    </>}
  </div>;
}
