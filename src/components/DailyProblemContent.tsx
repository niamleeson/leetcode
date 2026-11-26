import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dailyQuestions, formatDailyDate, loadDailyQuestion } from '../data/daily-questions';
import type { DailyQuestionDocument } from '../data/daily-questions/types';
import CatalogProblemContent, { RichText } from './CatalogProblemContent';
import CodeBlock from './CodeBlock';

const textLink = 'text-sm text-blue-400 hover:underline light:text-blue-700';

export default function DailyProblemContent({ id, date }: { id: number; date: string }) {
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
      {document.solutions.map((solution, solutionIndex) => <section key={solution.title} aria-label={`Saved solution: ${solution.title}`} className="space-y-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 light:text-emerald-700">{solutionIndex === 0 ? 'Saved JavaScript solution' : 'Alternative JavaScript solution'}</p>
          <h2 className="text-lg font-semibold text-white light:text-gray-900">{solution.title}</h2>
        </div>
        <RichText text={solution.approach} />
        <p className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-gray-300 light:text-gray-700">{solution.example}</p>
        {solution.notes?.map(note => <p key={note} className="text-sm leading-relaxed text-amber-300 light:text-amber-800">{note}</p>)}
        <CodeBlock code={solution.code} language="javascript" />
        <dl className="space-y-1 text-sm text-gray-400 light:text-gray-600">
          <div><dt className="inline font-medium">Time: </dt><dd className="inline">{solution.timeComplexity}</dd></div>
          <div><dt className="inline font-medium">Extra space: </dt><dd className="inline">{solution.spaceComplexity}</dd></div>
          {Object.entries(solution.variables).map(([variable, meaning]) => <div key={variable}><dt className="inline font-mono">{variable}</dt><dd className="inline"> — {meaning}</dd></div>)}
        </dl>
        {solution.walkthroughMarkdown && <section aria-label={`${solution.title} walkthrough`} className="space-y-3">
          <h3 className="font-semibold text-white light:text-gray-900">Example walkthrough</h3>
          <RichText text={solution.walkthroughMarkdown} />
        </section>}
      </section>)}

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
