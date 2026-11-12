import { lazy, Suspense, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { uniqueProblems } from '../data/problems';
import { hasSolution } from '../data/solutions/lazy';
import { solutionProse } from '../data/solutions/prose';
import { hasLogicProblem } from '../data/logic';
import { useProblemSolution } from '../hooks/useProblemSolution';
import { ProblemProgress } from '../types';
import { useProgrammingLanguage } from '../hooks/useProgrammingLanguage';
import LanguageToggle from './ProgrammingLanguageToggle';
import CodeBlock from './CodeBlock';
import GlossaryHighlighter from './GlossaryHighlighter';
import FollowUpSolution from './FollowUpSolution';
import SolutionComplexity from './SolutionComplexity';

const CatalogProblemContent = lazy(() => import('./CatalogProblemContent'));

interface ProblemPageProps {
  getProgress: (id: number) => ProblemProgress;
  onRate: (id: number, quality: number) => void;
  onUpdateNotes: (id: number, notes: string) => void;
  onReset: (id: number) => void;
}

const difficultyColors = {
  Easy: 'text-emerald-400 light:text-emerald-700 bg-emerald-400/10 border-emerald-400/20',
  Medium: 'text-yellow-400 light:text-yellow-700 bg-yellow-400/10 border-yellow-400/20',
  Hard: 'text-red-400 light:text-red-700 bg-red-400/10 border-red-400/20',
};

const qualityLabels = [
  { value: 0, label: 'Blackout', desc: 'No idea how to approach', color: 'bg-red-600 hover:bg-red-500' },
  { value: 1, label: 'Wrong', desc: 'Recognized but got it wrong', color: 'bg-red-500 hover:bg-red-400' },
  { value: 2, label: 'Hard', desc: 'Solved with major difficulty', color: 'bg-orange-500 hover:bg-orange-400' },
  { value: 3, label: 'OK', desc: 'Solved with some hesitation', color: 'bg-yellow-500 hover:bg-yellow-400' },
  { value: 4, label: 'Good', desc: 'Solved with minor hesitation', color: 'bg-emerald-500 hover:bg-emerald-400' },
  { value: 5, label: 'Easy', desc: 'Perfect, no hesitation', color: 'bg-emerald-400 hover:bg-emerald-300' },
];

/**
 * Build terse natural-language pseudocode from approach + explanation.
 * Uses the approach as a summary line, then extracts key steps from the
 * explanation (which is already numbered), keeping only the most
 * important 5-8 steps.
 */
/**
 * Build pseudocode: a one-liner core concept, then numbered steps.
 * Returns { concept, steps } for separate rendering.
 */
function buildPseudocode(approach: string, explanation: string): { concept: string; steps: string[] } {
  // Get the core concept — first sentence of approach
  const concept = approach
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=\.)\s+/)[0]
    ?.replace(/\.$/, '') || approach.trim();

  // Extract steps from explanation (usually numbered "1. ...\n2. ...")
  const stepPattern = /(?:^|\n)\s*(?:\d+[\.\)]\s*|[-•]\s*)/;
  const rawSteps = explanation
    .split(stepPattern)
    .map(s => s.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(s => s.length > 10);

  let steps: string[];

  if (rawSteps.length >= 2) {
    // Use explanation steps, keep each concise
    steps = rawSteps.slice(0, 7).map(step => {
      const firstSentence = step.split(/(?<=\.)\s/)[0];
      return (firstSentence.length > 140
        ? firstSentence.substring(0, 137) + '...'
        : firstSentence
      ).replace(/\.$/, '');
    });
  } else {
    // Fallback: split approach + explanation into sentences
    const allSentences = [
      ...approach.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
        .split(/(?<=\.)\s+/).slice(1), // skip first (already used as concept)
      ...explanation.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
        .split(/(?<=\.)\s+/),
    ]
      .map(s => s.trim().replace(/\.$/, ''))
      .filter(s => s.length > 10);

    // Deduplicate
    const unique: string[] = [];
    for (const s of allSentences) {
      const isDuplicate = unique.some(prev => {
        const words = new Set(s.toLowerCase().split(/\s+/));
        const prevWords = prev.toLowerCase().split(/\s+/);
        const overlap = prevWords.filter(w => words.has(w)).length;
        return overlap / Math.max(prevWords.length, 1) > 0.7;
      });
      if (!isDuplicate) unique.push(s);
    }
    steps = unique.slice(0, 7);
  }

  return { concept, steps };
}

export default function ProblemPage({ getProgress, onRate, onUpdateNotes, onReset }: ProblemPageProps) {
  const { id } = useParams();
  const [showNotes, setShowNotes] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [language, setLanguage] = useProgrammingLanguage();

  const problemId = Number(id);
  const { solution, error, retry } = useProblemSolution(problemId);
  const problem = uniqueProblems.find(p => p.id === problemId);
  if (!problem) return <Navigate to="/problems" replace />;

  const progress = getProgress(problem.id);
  const prose = solutionProse(solution, language === 'javascript' && solution?.jsCode ? 'javascript' : 'python');

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => window.history.back()}
          className="text-gray-400 light:text-gray-600 hover:text-white light:hover:text-gray-900 transition-colors mt-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-500 light:text-gray-500 text-sm font-mono">#{problem.id}</span>
            <h1 className="text-2xl font-bold text-white light:text-gray-900">{problem.title}</h1>
            <span className={`text-xs px-2 py-0.5 rounded border ${difficultyColors[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap mt-2">
            {problem.topics.map(t => (
              <span key={t} className="text-xs px-2 py-1 bg-gray-800 light:bg-gray-100 text-gray-300 light:text-gray-700 rounded-md">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {hasLogicProblem(problem.id) && <Link to={`/practice/${problem.id}`}
        className="inline-flex items-center min-h-11 px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium text-sm">Practice the approach and implementation</Link>}

      {solution ? (
        <>
          {/* ── Problem Description ── */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider">Problem</h2>
            <GlossaryHighlighter text={solution.description} className="text-sm text-gray-300 light:text-gray-700 leading-relaxed whitespace-pre-line" />
            <pre className="bg-gray-950 light:bg-white border border-gray-800 light:border-gray-200 rounded-md p-3 text-xs text-gray-300 light:text-gray-700 overflow-x-auto whitespace-pre-wrap font-mono">
              {solution.examples}
            </pre>
          </section>

          {/* ── Intuition ── */}
          {prose.intuition && (
            <section>
              <h2 className="text-xs font-semibold text-cyan-400 light:text-cyan-700 uppercase tracking-wider mb-2">Intuition</h2>
              <div className="text-sm text-gray-300 light:text-gray-700 leading-relaxed whitespace-pre-line bg-cyan-950/20 light:bg-cyan-50 border border-cyan-900/30 light:border-cyan-200 rounded-md p-4"><GlossaryHighlighter text={prose.intuition} /></div>
            </section>
          )}

          {/* ── Approach ── */}
          <section>
            <h2 className="text-xs font-semibold text-blue-400 light:text-blue-700 uppercase tracking-wider mb-2">Approach</h2>
            <GlossaryHighlighter text={prose.approach} className="text-sm text-gray-400 light:text-gray-600 leading-relaxed" />
          </section>

          {/* ── Hints ── */}
          {solution.hints.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider">Hints</h2>
              {solution.hints.map((hint, i) => (
                <div key={i}>
                  {i < revealedHints ? (
                    <div className="bg-gray-800 light:bg-gray-100 border border-gray-700 light:border-gray-300 rounded-md p-3 text-sm text-gray-300 light:text-gray-700">
                      <span className="text-blue-400 light:text-blue-700 font-semibold mr-2">Hint {i + 1}:</span>
                      {hint}
                    </div>
                  ) : i === revealedHints ? (
                    <button
                      onClick={() => setRevealedHints(prev => prev + 1)}
                      className="bg-gray-800 light:bg-gray-100 hover:bg-gray-700 light:hover:bg-gray-200 border border-gray-700 light:border-gray-300 rounded-md px-3 py-2 text-sm text-blue-400 light:text-blue-700 transition-colors w-full text-left"
                    >
                      Reveal Hint {i + 1}
                    </button>
                  ) : null}
                </div>
              ))}
            </section>
          )}

          {/* ── Solution ── */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h2 className="text-xs font-semibold text-emerald-400 light:text-emerald-700 uppercase tracking-wider">
                {solution.solutionTitle && `${solution.solutionTitle} · `}
                {language === 'javascript' && solution.jsCode ? 'JavaScript' : 'Python'} Solution
              </h2>
              <LanguageToggle language={language} setLanguage={setLanguage}/>
            </div>
            <CodeBlock
              code={language === 'javascript' && solution.jsCode ? solution.jsCode : solution.code}
              language={language === 'javascript' && solution.jsCode ? 'javascript' : 'python'}
            />
            {language === 'javascript' && !solution.jsCode && (
              <p className="text-xs text-gray-500 light:text-gray-500 mt-1">JavaScript solution not available, showing Python.</p>
            )}
            {language === 'javascript' && solution.jsWalkthrough && (
              <div className="mt-3 bg-gray-950 light:bg-sky-50 border border-sky-900/30 light:border-sky-200 rounded-md p-4 text-sm leading-relaxed">
                <h3 className="text-xs font-semibold text-sky-400 light:text-sky-700 uppercase tracking-wider mb-3">Step-by-Step Walkthrough</h3>
                <pre className="text-sky-200/90 light:text-sky-700 whitespace-pre-wrap font-mono text-xs leading-relaxed">{solution.jsWalkthrough}</pre>
              </div>
            )}
          </section>

          {/* ── Pseudocode ── */}
          {(() => {
            const pseudo = buildPseudocode(prose.approach, prose.explanation);
            return (
              <section>
                <h2 className="text-xs font-semibold text-purple-400 light:text-purple-700 uppercase tracking-wider mb-2">Pseudocode (for memorization)</h2>
                <div className="bg-gray-950 light:bg-purple-50 border border-purple-900/30 light:border-purple-200 rounded-md p-4 text-sm leading-relaxed">
                  <p className="text-purple-300 light:text-purple-700 font-semibold mb-3">{pseudo.concept}</p>
                  <ol className="space-y-1 text-purple-200/90 light:text-purple-700 list-decimal list-inside">
                    {pseudo.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </section>
            );
          })()}

          {/* ── Explanation ── */}
          <section>
            <h2 className="text-xs font-semibold text-yellow-400 light:text-yellow-700 uppercase tracking-wider mb-2">Explanation</h2>
            <GlossaryHighlighter text={prose.explanation} className="text-sm text-gray-400 light:text-gray-600 leading-relaxed whitespace-pre-line" />
          </section>

          {/* ── Complexity ── */}
          <SolutionComplexity solution={solution} language={language === 'javascript' && solution.jsCode ? 'javascript' : 'python'} />
          {solution.followUp && <FollowUpSolution solution={solution.followUp} language={language} problemId={solution.id} />}
        </>
      ) : hasSolution(problem.id) ? (
        <div className="text-sm text-gray-500 light:text-gray-500">
          <p role="status">{error ? 'The solution could not load.' : 'Loading solution…'}</p>
          {error && <button type="button" onClick={retry} className="mt-2 text-blue-400 light:text-blue-700 hover:underline">Retry solution</button>}
        </div>
      ) : (
        <Suspense fallback={<p role="status" className="text-sm text-gray-400 light:text-gray-600">Loading problem…</p>}>
          <CatalogProblemContent key={problem.id} id={problem.id}/>
        </Suspense>
      )}

      {/* ── Rating ── */}
      <section className="pt-4 border-t border-gray-800 light:border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider mb-3">Rate your confidence</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {qualityLabels.map(q => (
            <button
              key={q.value}
              onClick={() => onRate(problem.id, q.value)}
              className={`${q.color} text-white text-xs py-2.5 px-2 rounded-md transition-colors`}
              title={q.desc}
            >
              <div className="font-bold text-sm">{q.value}</div>
              <div className="opacity-80">{q.label}</div>
            </button>
          ))}
        </div>
        {progress.lastReviewed && (
          <p className="text-xs text-gray-600 light:text-gray-500 mt-2">
            Last reviewed: {progress.lastReviewed} &middot; Interval: {progress.interval}d &middot; Ease: {progress.easeFactor.toFixed(2)}
          </p>
        )}
      </section>

      {/* ── Notes ── */}
      <section>
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs text-gray-500 light:text-gray-500 hover:text-gray-300 light:hover:text-gray-700 transition-colors"
        >
          {showNotes ? 'Hide notes' : 'Add notes...'}
        </button>
        {showNotes && (
          <textarea
            className="w-full mt-2 bg-gray-800 light:bg-gray-100 border border-gray-700 light:border-gray-300 rounded-md p-3 text-sm text-gray-200 light:text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-y"
            placeholder="Your notes (patterns, approach, key insight)..."
            value={progress.notes}
            onChange={e => onUpdateNotes(problem.id, e.target.value)}
            rows={3}
          />
        )}
      </section>

      {/* ── Actions ── */}
      <div className="flex gap-2 pb-8">
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-gray-700 light:bg-gray-200 hover:bg-gray-600 light:hover:bg-gray-300 text-gray-200 light:text-gray-800 px-3 py-1.5 rounded-md transition-colors"
        >
          Open on LeetCode
        </a>
        {progress.status !== 'unseen' && (
          <button
            onClick={() => onReset(problem.id)}
            className="text-xs bg-gray-800 light:bg-gray-100 hover:bg-red-900/50 light:hover:bg-red-50 text-gray-400 light:text-gray-600 hover:text-red-400 light:hover:text-red-700 px-3 py-1.5 rounded-md transition-colors ml-auto"
          >
            Reset Progress
          </button>
        )}
      </div>
    </div>
  );
}
