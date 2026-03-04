import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { uniqueProblems } from '../data/problems';
import { solutionMap } from '../data/solutions';
import { ProblemProgress } from '../types';
import CodeBlock from './CodeBlock';

interface ProblemPageProps {
  getProgress: (id: number) => ProblemProgress;
  onRate: (id: number, quality: number) => void;
  onUpdateNotes: (id: number, notes: string) => void;
  onReset: (id: number) => void;
}

const difficultyColors = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
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

  const problemId = Number(id);
  const problem = uniqueProblems.find(p => p.id === problemId);
  if (!problem) return <Navigate to="/problems" replace />;

  const solution = solutionMap[problem.id];
  const progress = getProgress(problem.id);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white transition-colors mt-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-500 text-sm font-mono">#{problem.id}</span>
            <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
            <span className={`text-xs px-2 py-0.5 rounded border ${difficultyColors[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap mt-2">
            {problem.topics.map(t => (
              <span key={t} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-md">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {solution ? (
        <>
          {/* ── Problem Description ── */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Problem</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{solution.description}</p>
            <pre className="bg-gray-950 border border-gray-800 rounded-md p-3 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono">
              {solution.examples}
            </pre>
          </section>

          {/* ── Approach ── */}
          <section>
            <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Approach</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{solution.approach}</p>
          </section>

          {/* ── Hints ── */}
          {solution.hints.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hints</h2>
              {solution.hints.map((hint, i) => (
                <div key={i}>
                  {i < revealedHints ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-md p-3 text-sm text-gray-300">
                      <span className="text-blue-400 font-semibold mr-2">Hint {i + 1}:</span>
                      {hint}
                    </div>
                  ) : i === revealedHints ? (
                    <button
                      onClick={() => setRevealedHints(prev => prev + 1)}
                      className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md px-3 py-2 text-sm text-blue-400 transition-colors w-full text-left"
                    >
                      Reveal Hint {i + 1}
                    </button>
                  ) : null}
                </div>
              ))}
            </section>
          )}

          {/* ── Python Solution ── */}
          <section>
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Python Solution</h2>
            <CodeBlock code={solution.code} />
          </section>

          {/* ── Pseudocode ── */}
          {(() => {
            const pseudo = buildPseudocode(solution.approach, solution.explanation);
            return (
              <section>
                <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Pseudocode (for memorization)</h2>
                <div className="bg-gray-950 border border-purple-900/30 rounded-md p-4 text-sm leading-relaxed">
                  <p className="text-purple-300 font-semibold mb-3">{pseudo.concept}</p>
                  <ol className="space-y-1 text-purple-200/90 list-decimal list-inside">
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
            <h2 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-2">Explanation</h2>
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{solution.explanation}</p>
          </section>

          {/* ── Complexity ── */}
          <div className="flex gap-6 text-sm text-gray-500">
            <span>Time: <strong className="text-gray-300">{solution.timeComplexity}</strong></span>
            <span>Space: <strong className="text-gray-300">{solution.spaceComplexity}</strong></span>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-500">
          <p>Solution content not yet available for this problem.</p>
          <a href={problem.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            View on LeetCode
          </a>
        </div>
      )}

      {/* ── Rating ── */}
      <section className="pt-4 border-t border-gray-800">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rate your confidence</h2>
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
          <p className="text-xs text-gray-600 mt-2">
            Last reviewed: {progress.lastReviewed} &middot; Interval: {progress.interval}d &middot; Ease: {progress.easeFactor.toFixed(2)}
          </p>
        )}
      </section>

      {/* ── Notes ── */}
      <section>
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showNotes ? 'Hide notes' : 'Add notes...'}
        </button>
        {showNotes && (
          <textarea
            className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-md p-3 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-y"
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
          className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-md transition-colors"
        >
          Open on LeetCode
        </a>
        {progress.status !== 'unseen' && (
          <button
            onClick={() => onReset(problem.id)}
            className="text-xs bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-md transition-colors ml-auto"
          >
            Reset Progress
          </button>
        )}
      </div>
    </div>
  );
}
