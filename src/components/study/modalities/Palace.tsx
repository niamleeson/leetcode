/**
 * Palace modality — method-of-loci probe.
 *
 * LLM auto-grades when available; falls back to self-grade.
 */

import { useMemo, useState } from 'react';
import { StudyChunk, canonicalExplanation } from '../chunk';
import { StudyGrade } from '../../../utils/fsrs-lite';
import LlmGradeCard from '../LlmGradeCard';
import ShowHint from '../ShowHint';

interface Props {
  chunk: StudyChunk;
  onGrade: (grade: StudyGrade) => void;
  onSkip: () => void;
}

export default function Palace({ chunk, onGrade, onSkip }: Props) {
  const probes = chunk.meta.palaceProbes;
  const probe = useMemo(() => {
    if (probes.length === 0) return null;
    return probes[Math.floor(Math.random() * probes.length)];
  }, [chunk.id, probes]);

  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const canonical = canonicalExplanation(chunk);

  if (!probe) {
    return (
      <div className="space-y-3 text-sm text-gray-400">
        <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
          Palace walk
        </div>
        <p>No probe questions authored for this chapter yet. Skipping.</p>
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
          Palace walk · One probe
        </div>
        <div className="text-xs text-gray-500 mb-2">
          Context: <span className="text-gray-300">{chunk.title}</span>
        </div>
        <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-md p-4">
          <div className="text-xs text-indigo-300 uppercase tracking-wider mb-1">
            Probe
          </div>
          <div className="text-gray-100 text-sm leading-relaxed">{probe}</div>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Answer out loud or here. Don't search — pull it from memory."
        disabled={submitted}
        className="w-full h-28 bg-gray-900/60 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 leading-relaxed resize-y focus:outline-none focus:border-sky-800 disabled:opacity-60"
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
          <ShowHint canonical={canonical} />
        </div>
      ) : (
        <LlmGradeCard
          request={{
            question: `Method-of-loci probe for "${chunk.title}": ${probe}`,
            canonical,
            userAnswer: text,
          }}
          onApply={onGrade}
          onRetry={() => setSubmitted(false)}
        />
      )}
    </div>
  );
}
