/**
 * Recall modality — free-recall retrieval practice with structured scaffold.
 *
 * User fills in a structured scaffold from memory, then the LLM grades
 * automatically. Falls back to key-point reveal + self-grade when Ollama
 * is off.
 */

import { useEffect, useRef, useState } from 'react';
import { StudyChunk, isSdiChunk } from '../chunk';
import { StudyGrade } from '../../../utils/fsrs-lite';
import LlmGradeCard from '../LlmGradeCard';
import ShowHint from '../ShowHint';

interface Props {
  chunk: StudyChunk;
  onGrade: (grade: StudyGrade) => void;
}

const SDI_SCAFFOLD = `Functional requirements:
1.
2.
3.

Non-functional (latency/availability/consistency target):

Core components (4-6 boxes):
-
-
-
-

Storage choice + rejected alternative:

Biggest scaling bottleneck + how it's fixed:

Hardest trade-off:`;

const DSA_SCAFFOLD = `When you'd reach for this pattern (2 concrete triggers):
-
-

Template (pseudocode, control flow only):


Invariant:

Time + space complexity + one-line justification:

One edge case a naive version gets wrong:`;

export default function Recall({ chunk, onGrade }: Props) {
  const scaffold = isSdiChunk(chunk) ? SDI_SCAFFOLD : DSA_SCAFFOLD;
  const [text, setText] = useState(scaffold);
  const [submitted, setSubmitted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(Date.now());

  const canonical = chunk.meta.keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n');
  const graderQuestion =
    'Free-recall of a study chunk. The learner filled a structured scaffold with section headings. Grade the content they wrote in those sections against the canonical key points; ignore the scaffold headers themselves.';

  useEffect(() => {
    startRef.current = Date.now();
    const iv = setInterval(() => {
      setElapsed(Math.round((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(iv);
  }, [chunk.id]);

  const canSubmit = text.trim().length >= scaffold.trim().length + 50;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider mb-1">
          Recall · Fill in every section
        </div>
        <div className="text-white text-lg font-semibold">{chunk.title}</div>
        <div className="text-xs text-gray-500 mt-1">
          Fill in each section from memory <span className="text-amber-300">before</span> submitting.
          Blank sections count against your grade.
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitted}
        className="w-full h-80 bg-gray-900/60 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 font-mono leading-relaxed resize-y focus:outline-none focus:border-sky-800 whitespace-pre disabled:opacity-60"
      />

      {!submitted ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubmitted(true)}
            disabled={!canSubmit}
            className="bg-sky-900/60 hover:bg-sky-800/80 disabled:opacity-40 border border-sky-800/60 text-sky-100 text-sm px-4 py-2 rounded-md transition-colors"
          >
            Submit ({elapsed}s)
          </button>
          <ShowHint canonical={canonical} />
        </div>
      ) : (
        <LlmGradeCard
          request={{
            question: graderQuestion,
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
