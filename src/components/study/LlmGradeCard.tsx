/**
 * LlmGradeCard — auto-firing LLM grader for text-entry modalities.
 *
 * Renders one of three states:
 *   loading   → request auto-fires on mount (spinner)
 *   ready     → suggested grade + correct/missing bullets + "accept"
 *   error     → grading failed; auto-advances with grade Good (2) after
 *               a brief message so the session is never stuck.
 *
 * No idle state — grading starts immediately.
 */
import { useEffect, useRef, useState } from 'react';
import { gradeAnswer, GradeRequest, LlmGrade } from '../../utils/localLlm';
import { StudyGrade } from '../../utils/fsrs-lite';
import MarkdownContent from '../MarkdownContent';

interface Props {
  /** Payload to grade — grading fires automatically on mount. */
  request: GradeRequest;
  /** Called when the user accepts the LLM grade (or auto-advances on error). */
  onApply: (grade: StudyGrade) => void;
  /** Called when the user wants to revise their answer and resubmit. */
  onRetry?: () => void;
}

const GRADE_LABELS: Record<StudyGrade, { label: string; className: string }> = {
  0: { label: 'Again', className: 'text-red-300 light:text-red-700 border-red-900/50 light:border-red-200 bg-red-950/30 light:bg-red-50' },
  1: { label: 'Hard', className: 'text-orange-300 light:text-orange-700 border-orange-900/50 light:border-orange-200 bg-orange-950/30 light:bg-orange-50' },
  2: { label: 'Good', className: 'text-blue-300 light:text-blue-700 border-blue-900/50 light:border-blue-200 bg-blue-950/30 light:bg-blue-50' },
  3: { label: 'Easy', className: 'text-emerald-300 light:text-emerald-700 border-emerald-900/50 light:border-emerald-200 bg-emerald-950/30 light:bg-emerald-50' },
};

export default function LlmGradeCard({ request, onApply, onRetry }: Props) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [result, setResult] = useState<LlmGrade | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    gradeAnswer(request).then((res) => {
      if (!res) {
        setState('error');
        return;
      }
      setResult(res);
      setState('ready');
    });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  if (state === 'loading') {
    return (
      <div className="border border-indigo-900/40 light:border-indigo-200 bg-indigo-950/20 light:bg-indigo-50 rounded-md p-3">
        <div className="text-xs text-indigo-200 light:text-indigo-700 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          Grading your answer — first call of a session can take ~10–15s.
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="border border-amber-900/40 light:border-amber-200 bg-amber-950/20 light:bg-amber-50 rounded-md p-3 space-y-2">
        <div className="text-xs text-amber-300 light:text-amber-700">Grader unavailable — advancing as Good.</div>
        <button
          onClick={() => onApply(2)}
          className="bg-indigo-800 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md w-full"
        >
          Continue
        </button>
      </div>
    );
  }

  if (!result) return null;
  const badge = GRADE_LABELS[result.suggestedGrade];

  return (
    <div className="border border-indigo-900/40 light:border-indigo-200 bg-indigo-950/20 light:bg-indigo-50 rounded-md p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className={`text-sm px-2.5 py-0.5 rounded border font-semibold ${badge.className}`}>
          {badge.label}
        </span>
        <span className="text-[10px] text-gray-500 light:text-gray-500">
          {result.model} · {(result.elapsedMs / 1000).toFixed(1)}s
        </span>
      </div>

      {result.rationale && (
        <div className="text-xs text-gray-300 light:text-gray-700 italic">"{result.rationale}"</div>
      )}

      {result.correct.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-emerald-400 light:text-emerald-700 uppercase tracking-wider mb-1">
            Got right
          </div>
          <ul className="space-y-0.5 text-xs text-gray-300 light:text-gray-700">
            {result.correct.map((c, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-emerald-500 light:text-emerald-700 shrink-0">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.missing.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-amber-400 light:text-amber-700 uppercase tracking-wider mb-1">
            Missed
          </div>
          <ul className="space-y-0.5 text-xs text-gray-300 light:text-gray-700">
            {result.missing.map((m, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-amber-500 light:text-amber-700 shrink-0">×</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {request.canonical && (
        <ShowAnswerToggle canonical={request.canonical} />
      )}

      <div className="flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-gray-800 light:bg-gray-100 hover:bg-gray-700 light:hover:bg-gray-200 text-gray-200 light:text-gray-800 text-sm px-4 py-2 rounded-md flex-1"
          >
            Try again
          </button>
        )}
        <button
          onClick={() => onApply(result.suggestedGrade)}
          className="bg-indigo-800 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md flex-1"
        >
          Accept and advance
        </button>
      </div>
    </div>
  );
}

function ShowAnswerToggle({ canonical }: { canonical: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button
        onClick={() => setShow(!show)}
        className="text-xs text-gray-500 light:text-gray-500 hover:text-gray-300 light:hover:text-gray-700 underline underline-offset-2"
      >
        {show ? 'Hide answer' : 'Show answer'}
      </button>
      {show && (
        <div className="mt-2 border border-gray-800 light:border-gray-200 bg-gray-900/60 light:bg-gray-50 rounded-md p-3 max-h-60 overflow-y-auto">
          <MarkdownContent content={canonical} />
        </div>
      )}
    </div>
  );
}
