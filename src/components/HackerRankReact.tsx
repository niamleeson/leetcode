import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { reactChallenges, type ReactChallenge } from '../data/hackerrank-react';
import CodeBlock from './CodeBlock';

const basePath = '/hackerrank-react';
const panel = 'rounded-xl border border-gray-800 bg-gray-900/40 p-4 sm:p-6 light:border-gray-200 light:bg-gray-50';
const muted = 'text-sm leading-relaxed text-gray-400 light:text-gray-600';
const heading = 'text-lg font-semibold text-white light:text-gray-900';
const link = 'text-sm text-blue-400 hover:underline light:text-blue-700';
type GreatFrontendSort = 'default' | 'easy-first' | 'hard-first';
const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };
const collections = ['HackerRank', 'Suno', 'Anduril', 'GreatFrontEnd', 'Practice', 'Reference'] as const;
const collectionTitles = {
  HackerRank: 'HackerRank React',
  Suno: 'Suno AI interview questions',
  Anduril: 'Other interview questions',
  GreatFrontEnd: 'GreatFrontEnd React',
  Practice: 'Additional practice',
  Reference: 'Interview reference',
};

function solutionText(challenge: ReactChallenge) {
  return challenge.code || challenge.solutionSections?.map(section =>
    [section.title, section.body, section.code].filter(Boolean).join('\n\n'),
  ).join('\n\n') || '';
}

function Difficulty({ value }: { value: ReactChallenge['difficulty'] }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
      value === 'Hard'
        ? 'bg-rose-500/10 text-rose-400 light:bg-rose-100 light:text-rose-700'
        : value === 'Easy'
          ? 'bg-emerald-500/10 text-emerald-400 light:bg-emerald-100 light:text-emerald-800'
          : 'bg-amber-500/10 text-amber-400 light:bg-amber-100 light:text-amber-800'
    }`}>
      {value}
    </span>
  );
}

function ChallengeIndex({ greatFrontendSort, onSortChange }: {
  greatFrontendSort: GreatFrontendSort;
  onSortChange: (sort: GreatFrontendSort) => void;
}) {
  const [query, setQuery] = useState('');
  const search = query.trim().toLowerCase();
  const filtered = reactChallenges.filter(challenge =>
    [challenge.collection ?? 'HackerRank', challenge.kind ?? 'coding', challenge.title, challenge.summary, ...challenge.topics].join(' ').toLowerCase().includes(search),
  );

  return (
    <div className="space-y-6 pb-8">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 light:text-emerald-700">React practice</p>
        <h1 className="text-2xl font-bold text-white light:text-gray-900">React questions</h1>
        <p className={`mt-2 ${muted}`}>
          {reactChallenges.length} questions and references for React and JavaScript interviews, with solutions, explanations, and examples.
        </p>
        <a className={`mt-3 inline-block ${link}`} href="https://www.hackerrank.com/domains/react" target="_blank" rel="noopener noreferrer">
          Open HackerRank’s React catalog ↗
        </a>
        <a className={`mt-3 ml-4 inline-block ${link}`} href="https://www.greatfrontend.com/questions/react-coding-interview-questions" target="_blank" rel="noopener noreferrer">
          Open GreatFrontEnd’s React catalog ↗
        </a>
      </header>

      <div>
        <label htmlFor="react-question-search" className="mb-2 block text-sm font-medium text-gray-200 light:text-gray-800">Find a question or concept</label>
        <input
          id="react-question-search"
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search sorting, forms, state…"
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 light:border-gray-300 light:bg-white light:text-gray-900"
        />
        <p className={`mt-2 ${muted}`} role="status">{filtered.length} of {reactChallenges.length} questions</p>
      </div>

      {filtered.length === 0 ? (
        <div className={panel}>
          <p className={muted}>No questions match “{query}”.</p>
          <button className={`mt-3 ${link}`} onClick={() => setQuery('')}>Clear search</button>
        </div>
      ) : (
        collections.map(collection => {
          const questions = filtered.filter(challenge => (challenge.collection ?? 'HackerRank') === collection);
          if (questions.length === 0) return null;
          if (collection === 'GreatFrontEnd' && greatFrontendSort !== 'default') {
            const direction = greatFrontendSort === 'easy-first' ? 1 : -1;
            questions.sort((a, b) => direction * (difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]));
          }
          return (
            <section key={collection} aria-labelledby={`collection-${collection}`} className="space-y-4">
              <div>
                <h2 id={`collection-${collection}`} className={heading}>{collectionTitles[collection]}</h2>
                {collection === 'Suno' && <p className={`mt-2 ${muted}`}>Candidate-reported Suno tasks adapted into React exercises. The reports are from Staff Software Engineer and Growth Engineer interviews; each original solution labels its practice assumptions. Difficulty labels are study estimates.</p>}
                {collection === 'Anduril' && <p className={`mt-2 ${muted}`}>Candidate reports establish the broad tasks. Each practice solution states its assumptions where the original requirements are unavailable. Difficulty labels are study estimates.</p>}
                {collection === 'GreatFrontEnd' && <p className={`mt-2 ${muted}`}>40 UI problems and 31 hooks, keeping the highest numbered level in each series. Original study solutions include summarized prompts, examples, and explicit assumptions.</p>}
                {collection === 'GreatFrontEnd' && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label htmlFor="greatfrontend-sort" className="text-sm font-medium text-gray-200 light:text-gray-800">Sort by</label>
                    <select
                      id="greatfrontend-sort"
                      value={greatFrontendSort}
                      onChange={event => onSortChange(event.target.value as GreatFrontendSort)}
                      className="max-w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 light:border-gray-300 light:bg-white light:text-gray-800"
                    >
                      <option value="default">Default order</option>
                      <option value="easy-first">Difficulty: easy to hard</option>
                      <option value="hard-first">Difficulty: hard to easy</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {questions.map(challenge => (
                  <Link
                    key={challenge.slug}
                    to={`${basePath}/${challenge.slug}`}
                    className="group rounded-xl border border-gray-800 bg-gray-900/40 p-5 transition-colors hover:border-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 light:border-gray-200 light:bg-gray-50 light:hover:border-blue-500"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-gray-500">{String(reactChallenges.indexOf(challenge) + 1).padStart(2, '0')}</span>
                      <Difficulty value={challenge.difficulty} />
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-blue-300 light:text-gray-900 light:group-hover:text-blue-700">{challenge.title}</h3>
                    {challenge.kind && challenge.kind !== 'coding' && <p className="mt-2 text-xs font-medium text-emerald-400 light:text-emerald-700">{challenge.collection === 'Reference' ? 'Interview reference' : challenge.kind === 'design' ? 'System design / problem framing' : 'Interview discussion'}</p>}
                    <p className={`mt-2 ${muted}`}>{challenge.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {challenge.topics.map(topic => <span key={topic} className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 light:bg-gray-200 light:text-gray-700">{topic}</span>)}
                    </div>
                    <p className="mt-4 text-xs font-medium text-blue-400 light:text-blue-700">{challenge.collection === 'Reference' ? 'Read reference →' : 'Read solution →'}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function ChallengeDetail({ challenge }: { challenge: ReactChallenge }) {
  const navigate = useNavigate();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const index = reactChallenges.findIndex(item => item.slug === challenge.slug);
  const previous = reactChallenges[index - 1];
  const next = reactChallenges[index + 1];
  const isHackerRank = (challenge.collection ?? 'HackerRank') === 'HackerRank';
  const solutionHeading = challenge.solutionTitle ?? 'JavaScript + React solution';

  async function copySolution() {
    try {
      await navigator.clipboard.writeText(solutionText(challenge));
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  return (
    <article className="min-w-0 space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className={link} to={basePath}>← All React questions</Link>
        <label className="flex flex-wrap items-center gap-2 text-xs text-gray-400 light:text-gray-600">
          Jump to question
          <select
            aria-label="Jump to question"
            value={challenge.slug}
            onChange={event => navigate(`${basePath}/${event.target.value}`)}
            className="max-w-full rounded-md border border-gray-700 bg-gray-900 px-2 py-2 text-sm text-gray-200 light:border-gray-300 light:bg-white light:text-gray-800"
          >
            {reactChallenges.map((item, i) => <option key={item.slug} value={item.slug}>{i + 1}. {item.title}</option>)}
          </select>
        </label>
      </div>

      <header>
        <div className="mb-3 flex items-center gap-3">
          <span className="text-xs text-gray-500">Question {index + 1} of {reactChallenges.length} · {challenge.collection ?? 'HackerRank'}</span>
          <Difficulty value={challenge.difficulty} />
        </div>
        <h1 className="text-2xl font-bold text-white light:text-gray-900">{challenge.title}</h1>
        <p className={`mt-2 ${muted}`}>{challenge.summary}</p>
        {challenge.sourceUrl ? (
          <a className={`mt-3 inline-block ${link}`} href={challenge.sourceUrl} target="_blank" rel="noopener noreferrer">{challenge.sourceLabel ?? (isHackerRank ? 'Original question on HackerRank' : 'Public candidate report')} ↗</a>
        ) : challenge.sourceLabel && <p className={`mt-3 ${muted}`}>{challenge.sourceLabel}</p>}
        {challenge.additionalSources?.map(source => <a key={source.url} className={`ml-4 mt-3 inline-block ${link}`} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)}
      </header>

      <section className={panel} aria-labelledby="prompt-heading">
        <h2 id="prompt-heading" className={heading}>Problem prompt</h2>
        <p className={`mt-3 ${muted}`}>{challenge.prompt}</p>
        {challenge.report && <div className="mt-4 border-l-2 border-emerald-700 pl-4"><h3 className="text-sm font-semibold text-gray-200 light:text-gray-800">What was reported</h3><p className={`mt-2 ${muted}`}>{challenge.report}</p></div>}
        {challenge.images?.map(image => (
          <figure key={image.src} className="mt-5">
            <a
              href={image.src}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${challenge.title} reference image at full size`}
              className="block overflow-hidden rounded-lg border border-gray-700 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 light:border-gray-300"
            >
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                className="mx-auto block h-auto max-w-full"
              />
            </a>
            <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 light:text-gray-600">
              <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Original HackerRank reference ↗</a>
              <a href={image.src} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline light:text-blue-700">Open full size ↗</a>
            </figcaption>
          </figure>
        ))}
        <h3 className="mt-5 text-sm font-semibold text-gray-200 light:text-gray-800">{challenge.collection === 'Reference' ? 'What to know' : isHackerRank ? 'Requirements' : 'Practice requirements'}</h3>
        <ul className={`mt-3 list-disc space-y-2 pl-5 ${muted}`}>
          {challenge.requirements.map(requirement => <li key={requirement}>{requirement}</li>)}
        </ul>
        {challenge.assumptions && <div className="mt-5"><h3 className="text-sm font-semibold text-gray-200 light:text-gray-800">Assumptions for this answer</h3><ul className={`mt-3 list-disc space-y-2 pl-5 ${muted}`}>{challenge.assumptions.map(assumption => <li key={assumption}>{assumption}</li>)}</ul></div>}
        <div className="mt-5 border-t border-gray-800 pt-4 light:border-gray-200">
          <h3 className="text-sm font-semibold text-gray-200 light:text-gray-800">Example interaction</h3>
          <dl className={`mt-3 space-y-3 ${muted}`}>
            <div>
              <dt className="font-medium text-gray-200 light:text-gray-800">User actions</dt>
              <dd className="mt-1">{challenge.example.actions}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-200 light:text-gray-800">Expected result</dt>
              <dd className="mt-1">{challenge.example.result}</dd>
            </div>
          </dl>
        </div>
      </section>

      {challenge.sampleData && (
        <section aria-labelledby="sample-data-heading" className="min-w-0 space-y-3">
          <h2 id="sample-data-heading" className={heading}>{challenge.sampleData.title}</h2>
          <p className={muted}>{challenge.sampleData.description}</p>
          <CodeBlock code={challenge.sampleData.code} language="jsx" />
        </section>
      )}

      <section aria-labelledby="solution-heading" className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="solution-heading" className={heading}>{solutionHeading}</h2>
          {challenge.slug !== 'aria-interview-essentials' && (
            <button onClick={copySolution} className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-gray-700 light:border-gray-300 light:bg-gray-100 light:text-gray-800 light:hover:bg-gray-200">
              {copyStatus === 'copied' ? 'Copied!' : 'Copy solution'}
            </button>
          )}
        </div>
        {challenge.code && <p className={muted}>{isHackerRank ? 'Use this standalone implementation as a reference. In HackerRank’s starter project, keep its existing component exports and test selectors.' : 'This implementation follows the practice requirements and assumptions above.'}</p>}
        {copyStatus !== 'idle' && <p role="status" className={muted}>{copyStatus === 'copied' ? 'Solution copied to clipboard.' : 'Clipboard access is unavailable. Select and copy the solution below.'}</p>}
        {challenge.code && <CodeBlock code={challenge.code} language={challenge.codeLanguage ?? 'jsx'} />}
        {challenge.solutionSections?.map(section => <div key={section.title} className={panel}><h3 className="text-sm font-semibold text-gray-200 light:text-gray-800">{section.title}</h3><p className={`mt-3 whitespace-pre-line ${muted}`}>{section.body}</p>{section.code && <div className="mt-4"><CodeBlock code={section.code} language={challenge.codeLanguage ?? 'javascript'} /></div>}</div>)}
        {challenge.integrationNotes && challenge.integrationNotes.length > 0 && (
          <div className={panel}>
            <h3 className="text-sm font-semibold text-gray-200 light:text-gray-800">Using this solution</h3>
            <ul className={`mt-2 list-disc space-y-2 pl-5 ${muted}`}>
              {challenge.integrationNotes.map(note => <li key={note} className="whitespace-pre-wrap break-words">{note}</li>)}
            </ul>
          </div>
        )}
      </section>

      <section className={panel} aria-labelledby="approach-heading">
        <h2 id="approach-heading" className={heading}>{challenge.kind === 'discussion' ? 'How to answer' : 'How it works'}</h2>
        <ol className={`mt-3 list-decimal space-y-3 pl-5 ${muted}`}>
          {challenge.steps.map(step => <li key={step} className="pl-1">{step}</li>)}
        </ol>
        <div className="mt-5 border-t border-gray-800 pt-4 light:border-gray-200">
          <h3 className="text-sm font-semibold text-gray-200 light:text-gray-800">{challenge.kind === 'discussion' ? 'Answer guidance' : 'Time and space'}</h3>
          <p className={`mt-2 ${muted}`}>{challenge.complexity}</p>
        </div>
      </section>

      <section className={panel} aria-labelledby="pitfalls-heading">
        <h2 id="pitfalls-heading" className={heading}>Common mistakes</h2>
        <ul className={`mt-3 list-disc space-y-2 pl-5 ${muted}`}>
          {challenge.pitfalls.map(pitfall => <li key={pitfall}>{pitfall}</li>)}
        </ul>
      </section>

      <section aria-labelledby="checks-heading">
        <h2 id="checks-heading" className={heading}>Check your understanding</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-gray-800 light:border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-gray-200 light:bg-gray-100 light:text-gray-800">
              <tr><th scope="col" className="px-4 py-3 font-medium">Try this</th><th scope="col" className="px-4 py-3 font-medium">Expected behavior</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-400 light:divide-gray-200 light:text-gray-600">
              {challenge.testCases.map(test => <tr key={test.action}><td className="px-4 py-3 align-top">{test.action}</td><td className="px-4 py-3 align-top">{test.expected}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <nav aria-label="React question navigation" className="flex flex-wrap justify-between gap-4 border-t border-gray-800 pt-5 light:border-gray-200">
        {previous ? <Link className={link} to={`${basePath}/${previous.slug}`}>← {previous.title}</Link> : <Link className={link} to={basePath}>← All React questions</Link>}
        {next ? <Link className={link} to={`${basePath}/${next.slug}`}>{next.title} →</Link> : <Link className={link} to={basePath}>Back to all questions →</Link>}
      </nav>
    </article>
  );
}

export default function HackerRankReact() {
  const { slug } = useParams<{ slug?: string }>();
  const [greatFrontendSort, setGreatFrontendSort] = useState<GreatFrontendSort>('default');
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [slug]);
  if (!slug) return <ChallengeIndex greatFrontendSort={greatFrontendSort} onSortChange={setGreatFrontendSort} />;
  const challenge = reactChallenges.find(item => item.slug === slug);
  if (!challenge) {
    return <div className="space-y-3"><h1 className={heading}>React question not found</h1><Link className={link} to={basePath}>View all React questions</Link></div>;
  }
  return <ChallengeDetail key={slug} challenge={challenge} />;
}
