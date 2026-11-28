import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dailyQuestions, formatDailyDate, loadDailyQuestion } from '../data/daily-questions';
import type { DailyQuestionDocument } from '../data/daily-questions/types';
import CatalogProblemContent from './CatalogProblemContent';
import StudySolution from './StudySolution';
import SolutionComparison from './SolutionComparison';

const textLink = 'text-sm text-blue-400 hover:underline light:text-blue-700';

export default function DailyProblemContent({ id, date, compareSolutions = false }: { id: number; date: string; compareSolutions?: boolean }) {
  const [document, setDocument] = useState<DailyQuestionDocument>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { window.scrollTo({ top: 0, left: 0 }); }, [date]);
  useEffect(() => {
    let active = true;
    setError(undefined);
    setDocument(undefined);
    loadDailyQuestion(date).then(value => {
      if (active) setDocument(value);
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : 'These daily notes could not be loaded.');
    });
    return () => { active = false; };
  }, [date, attempt]);

  const index = dailyQuestions.findIndex(question => question.date === date);
  const previous = dailyQuestions[index - 1];
  const next = dailyQuestions[index + 1];

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link to="/daily" className={textLink}>← Daily Questions</Link>
      <time dateTime={date} className="text-sm text-gray-400 light:text-gray-600">{formatDailyDate(date)}</time>
    </div>

    <CatalogProblemContent id={id} descriptionOnly />

    {!document ? <div role={error ? 'alert' : 'status'} className="space-y-2 text-sm text-gray-400 light:text-gray-600">
      <p>{error ?? 'Loading saved solutions…'}</p>
      {error && <button type="button" className={textLink} onClick={() => setAttempt(value => value + 1)}>Retry saved solutions</button>}
    </div> : <>
      {compareSolutions ? <SolutionComparison solutions={document.solutions} dfsLabel="DFS + memoization" />
        : document.solutions.map((solution, solutionIndex) => <StudySolution key={solution.title} solution={solution} index={solutionIndex} />)}

      <section aria-label="Solution comparison" className="space-y-3 border-t border-gray-800 pt-5 light:border-gray-200">
        <h2 className="text-lg font-semibold text-white light:text-gray-900">Compared with the existing app solution</h2>
        <p className="text-sm leading-relaxed text-gray-300 light:text-gray-700">{document.comparison.summary}</p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-400 light:text-gray-600">
          {document.comparison.details.map(detail => <li key={detail}>{detail}</li>)}
        </ul>
        <Link to={`/problem/${id}`} className={`${textLink} inline-block py-2`}>View existing app solution</Link>
      </section>
    </>}

    <nav aria-label="Adjacent daily questions" className="flex justify-between gap-4 border-t border-gray-800 pt-4 light:border-gray-200">
      {previous ? <Link className={`${textLink} py-2`} to={`/problem/${previous.problemId}?daily=${previous.date}`}>← Previous question</Link> : <span />}
      {next && <Link className={`${textLink} py-2 text-right`} to={`/problem/${next.problemId}?daily=${next.date}`}>Next question →</Link>}
    </nav>
  </div>;
}
