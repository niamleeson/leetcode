import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { reactChallenges, type ReactChallenge } from '../data/hackerrank-react';
import CodeBlock from './CodeBlock';

const basePath = '/hackerrank-react';
const panel = 'rounded-xl border border-gray-800 bg-gray-900/40 p-4 sm:p-6 light:border-gray-200 light:bg-gray-50';
const muted = 'text-sm leading-relaxed text-gray-400 light:text-gray-600';
const heading = 'text-lg font-semibold text-white light:text-gray-900';
const link = 'text-sm text-blue-400 hover:underline light:text-blue-700';

function Difficulty({ value }: { value: ReactChallenge['difficulty'] }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
      value === 'Hard'
        ? 'bg-rose-500/10 text-rose-400 light:bg-rose-100 light:text-rose-700'
        : 'bg-amber-500/10 text-amber-400 light:bg-amber-100 light:text-amber-800'
    }`}>
      {value}
    </span>
  );
}

function ChallengeIndex() {
  const [query, setQuery] = useState('');
  const search = query.trim().toLowerCase();
  const filtered = reactChallenges.filter(challenge =>
    [challenge.title, challenge.summary, ...challenge.topics].join(' ').toLowerCase().includes(search),
  );

  return (
    <div className="space-y-6 pb-8">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 light:text-emerald-700">React practice</p>
        <h1 className="text-2xl font-bold text-white light:text-gray-900">HackerRank React</h1>
        <p className={`mt-2 ${muted}`}>
          All {reactChallenges.length} public practice questions, with JavaScript solutions, step-by-step explanations, and edge cases to check.
        </p>
        <a className={`mt-3 inline-block ${link}`} href="https://www.hackerrank.com/domains/react" target="_blank" rel="noopener noreferrer">
          Open HackerRank’s React catalog ↗
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
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(challenge => (
            <Link
              key={challenge.slug}
              to={`${basePath}/${challenge.slug}`}
              className="group rounded-xl border border-gray-800 bg-gray-900/40 p-5 transition-colors hover:border-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 light:border-gray-200 light:bg-gray-50 light:hover:border-blue-500"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-gray-500">{String(reactChallenges.indexOf(challenge) + 1).padStart(2, '0')}</span>
                <Difficulty value={challenge.difficulty} />
              </div>
              <h2 className="font-semibold text-white group-hover:text-blue-300 light:text-gray-900 light:group-hover:text-blue-700">{challenge.title}</h2>
              <p className={`mt-2 ${muted}`}>{challenge.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {challenge.topics.map(topic => <span key={topic} className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 light:bg-gray-200 light:text-gray-700">{topic}</span>)}
              </div>
              <p className="mt-4 text-xs font-medium text-blue-400 light:text-blue-700">Read solution →</p>
            </Link>
          ))}
        </div>
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

  async function copySolution() {
    try {
      await navigator.clipboard.writeText(challenge.code);
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
          <span className="text-xs text-gray-500">Question {index + 1} of {reactChallenges.length}</span>
          <Difficulty value={challenge.difficulty} />
        </div>
        <h1 className="text-2xl font-bold text-white light:text-gray-900">{challenge.title}</h1>
        <p className={`mt-2 ${muted}`}>{challenge.summary}</p>
        <a className={`mt-3 inline-block ${link}`} href={challenge.sourceUrl} target="_blank" rel="noopener noreferrer">Original question on HackerRank ↗</a>
      </header>

      <section className={panel} aria-labelledby="prompt-heading">
        <h2 id="prompt-heading" className={heading}>Problem prompt</h2>
        <p className={`mt-3 ${muted}`}>{challenge.prompt}</p>
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
        <h3 className="mt-5 text-sm font-semibold text-gray-200 light:text-gray-800">Requirements</h3>
        <ul className={`mt-3 list-disc space-y-2 pl-5 ${muted}`}>
          {challenge.requirements.map(requirement => <li key={requirement}>{requirement}</li>)}
        </ul>
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

      <section aria-labelledby="solution-heading" className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="solution-heading" className={heading}>JavaScript + React solution</h2>
          <button onClick={copySolution} className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-gray-700 light:border-gray-300 light:bg-gray-100 light:text-gray-800 light:hover:bg-gray-200">
            {copyStatus === 'copied' ? 'Copied!' : 'Copy solution'}
          </button>
        </div>
        <p className={muted}>Use this standalone implementation as a reference. In HackerRank’s starter project, keep its existing component exports and test selectors.</p>
        {copyStatus !== 'idle' && <p role="status" className={muted}>{copyStatus === 'copied' ? 'Solution copied to clipboard.' : 'Clipboard access is unavailable. Select and copy the code below.'}</p>}
        <CodeBlock code={challenge.code} language="jsx" />
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
        <h2 id="approach-heading" className={heading}>How it works</h2>
        <ol className={`mt-3 list-decimal space-y-3 pl-5 ${muted}`}>
          {challenge.steps.map(step => <li key={step} className="pl-1">{step}</li>)}
        </ol>
        <div className="mt-5 border-t border-gray-800 pt-4 light:border-gray-200">
          <h3 className="text-sm font-semibold text-gray-200 light:text-gray-800">Time and space</h3>
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
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [slug]);
  if (!slug) return <ChallengeIndex />;
  const challenge = reactChallenges.find(item => item.slug === slug);
  if (!challenge) {
    return <div className="space-y-3"><h1 className={heading}>React question not found</h1><Link className={link} to={basePath}>View all React questions</Link></div>;
  }
  return <ChallengeDetail key={slug} challenge={challenge} />;
}
