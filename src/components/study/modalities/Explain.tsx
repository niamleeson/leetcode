/**
 * Explain modality — Feynman teach-it-back.
 *
 * The learner explains the chapter as if teaching it, then the LLM grades
 * automatically. Falls back to reveal + self-grade when Ollama is off.
 */

import { useState } from 'react';
import { StudyChunk, canonicalExplanation } from '../chunk';
import { StudyGrade } from '../../../utils/fsrs-lite';
import LlmGradeCard from '../LlmGradeCard';
import ShowHint from '../ShowHint';

const FEYNMAN_PROMPT =
  'Explain in 4–6 sentences: (1) what problem this design solves, (2) the one non-obvious mechanism that makes it work, (3) what would break if that mechanism were missing.';

interface Props {
  chunk: StudyChunk;
  onGrade: (grade: StudyGrade) => void;
}

export default function Explain({ chunk, onGrade }: Props) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const canonical = canonicalExplanation(chunk);

  const canSubmit = text.trim().length >= 200;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-semibold text-sky-400 light:text-sky-700 uppercase tracking-wider mb-1">
          Explain · Teach it back
        </div>
        <div className="text-white light:text-gray-900 text-lg font-semibold">{chunk.title}</div>
        <div className="text-xs text-gray-500 light:text-gray-500 mt-1 space-y-1">
          <p>
            Imagine a smart friend asks: <span className="text-gray-200 light:text-gray-800">"Why does this design
            actually work, end to end?"</span>
          </p>
          <p>
            Answer in 4–6 sentences. You <span className="text-amber-300 light:text-amber-700">must</span> cover: (1)
            what problem the design solves, (2) the one non-obvious mechanism
            that makes it work, (3) what would break if that mechanism were
            missing. No hand-waving.
          </p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`The problem this solves is ...
The key mechanism is ... — it works because ...
Without that mechanism, the system would ... because ...`}
        disabled={submitted}
        className="w-full h-48 bg-gray-900/60 light:bg-gray-50 border border-gray-800 light:border-gray-200 rounded-md px-3 py-2 text-sm text-gray-200 light:text-gray-800 leading-relaxed resize-y focus:outline-none focus:border-sky-800 disabled:opacity-60"
      />

      {!submitted ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubmitted(true)}
            disabled={!canSubmit}
            className="bg-sky-900/60 light:bg-sky-50 hover:bg-sky-800/80 light:hover:bg-sky-100 disabled:opacity-40 border border-sky-800/60 light:border-sky-200 text-sky-100 light:text-sky-700 text-sm px-4 py-2 rounded-md"
          >
            Submit answer
          </button>
          <ShowHint canonical={canonical} />
        </div>
      ) : (
        <LlmGradeCard
          request={{
            question: FEYNMAN_PROMPT,
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
