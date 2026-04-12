/**
 * Discriminate modality — boundary drill between two similar systems.
 *
 * LLM auto-grades when available; falls back to reveal + self-grade.
 */

import { useMemo, useState } from 'react';
import { StudyChunk, resolveChunk } from '../chunk';
import { StudyGrade } from '../../../utils/fsrs-lite';
import LlmGradeCard from '../LlmGradeCard';
import ShowHint from '../ShowHint';

interface Props {
  chunk: StudyChunk;
  onGrade: (grade: StudyGrade) => void;
  onSkip: () => void;
}

export default function Discriminate({ chunk, onGrade, onSkip }: Props) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const disc = chunk.meta.discriminators[0];
  const other = useMemo(
    () => (disc ? resolveChunk(disc.vs) : undefined),
    [disc],
  );

  if (!disc || !other) {
    return (
      <div className="space-y-3 text-sm text-gray-400">
        <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
          Discriminate
        </div>
        <p>
          No discriminator pair has been authored for{' '}
          <span className="text-white">{chunk.title}</span> yet. Skipping.
        </p>
        <button
          onClick={onSkip}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm px-4 py-2 rounded-md"
        >
          Skip
        </button>
      </div>
    );
  }

  const canSubmit = text.trim().length >= 10;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider mb-1">
          Discriminate · Boundary drill
        </div>
        <div className="text-sm text-gray-300">
          In one sentence: how do you tell <span className="text-white font-semibold">{chunk.title}</span> apart
          from <span className="text-white font-semibold">{other.title}</span>?
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe the distinguishing feature in one sentence."
        disabled={submitted}
        className="w-full h-24 bg-gray-900/60 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 leading-relaxed resize-y focus:outline-none focus:border-sky-800 disabled:opacity-60"
      />

      {!submitted ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubmitted(true)}
            disabled={!canSubmit}
            className="bg-sky-900/60 hover:bg-sky-800/80 disabled:opacity-40 border border-sky-800/60 text-sky-100 text-sm px-4 py-2 rounded-md"
          >
            Submit answer
          </button>
          <ShowHint canonical={disc.how} />
        </div>
      ) : (
        <LlmGradeCard
          request={{
            question: `In one sentence, how do you tell ${chunk.title} apart from ${other.title}?`,
            canonical: disc.how,
            userAnswer: text,
          }}
          onApply={onGrade}
          onRetry={() => setSubmitted(false)}
        />
      )}
    </div>
  );
}
