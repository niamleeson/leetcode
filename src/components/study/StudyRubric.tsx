/**
 * Shared self-grade rubric. Every modality ends with these 4 buttons.
 *
 * Note: intentionally no "correct/incorrect" binary. The research on
 * metacognitive monitoring (Dunlosky) shows that forcing a graded
 * self-assessment is a *second* retrieval event — harder and more durable
 * than a binary hit/miss.
 */

import { StudyGrade } from '../../utils/fsrs-lite';

interface Props {
  onGrade: (grade: StudyGrade) => void;
  /** If set, the rubric is disabled and shows a brief explanation. */
  disabledReason?: string;
}

const BUTTONS: { grade: StudyGrade; label: string; hint: string; color: string }[] = [
  {
    grade: 0,
    label: 'Again',
    hint: 'Missed entirely',
    color: 'bg-red-950/40 light:bg-red-50 hover:bg-red-900/60 light:hover:bg-red-100 border-red-900/50 light:border-red-200 text-red-300 light:text-red-700',
  },
  {
    grade: 1,
    label: 'Hard',
    hint: 'Got it with effort',
    color: 'bg-orange-950/40 light:bg-orange-50 hover:bg-orange-900/60 light:hover:bg-orange-100 border-orange-900/50 light:border-orange-200 text-orange-300 light:text-orange-700',
  },
  {
    grade: 2,
    label: 'Good',
    hint: 'Hit the key points',
    color: 'bg-blue-950/40 light:bg-blue-50 hover:bg-blue-900/60 light:hover:bg-blue-100 border-blue-900/50 light:border-blue-200 text-blue-300 light:text-blue-700',
  },
  {
    grade: 3,
    label: 'Easy',
    hint: 'Instant, thorough',
    color: 'bg-emerald-950/40 light:bg-emerald-50 hover:bg-emerald-900/60 light:hover:bg-emerald-100 border-emerald-900/50 light:border-emerald-200 text-emerald-300 light:text-emerald-700',
  },
];

export default function StudyRubric({ onGrade, disabledReason }: Props) {
  return (
    <div className="border-t border-gray-800 light:border-gray-200 pt-4 mt-4">
      <p className="text-xs text-gray-500 light:text-gray-500 mb-2 uppercase tracking-wider">
        Rate your recall honestly — the schedule depends on it
      </p>
      <div className="grid grid-cols-4 gap-2">
        {BUTTONS.map((b) => (
          <button
            key={b.grade}
            disabled={!!disabledReason}
            onClick={() => onGrade(b.grade)}
            className={`px-3 py-3 rounded-lg border text-left transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${b.color}`}
          >
            <div className="font-semibold text-sm">{b.label}</div>
            <div className="text-[11px] opacity-70">{b.hint}</div>
          </button>
        ))}
      </div>
      {disabledReason && (
        <p className="text-xs text-gray-600 light:text-gray-500 mt-2">{disabledReason}</p>
      )}
    </div>
  );
}
