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
    color: 'bg-red-950/40 hover:bg-red-900/60 border-red-900/50 text-red-300',
  },
  {
    grade: 1,
    label: 'Hard',
    hint: 'Got it with effort',
    color: 'bg-orange-950/40 hover:bg-orange-900/60 border-orange-900/50 text-orange-300',
  },
  {
    grade: 2,
    label: 'Good',
    hint: 'Hit the key points',
    color: 'bg-blue-950/40 hover:bg-blue-900/60 border-blue-900/50 text-blue-300',
  },
  {
    grade: 3,
    label: 'Easy',
    hint: 'Instant, thorough',
    color: 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-900/50 text-emerald-300',
  },
];

export default function StudyRubric({ onGrade, disabledReason }: Props) {
  return (
    <div className="border-t border-gray-800 pt-4 mt-4">
      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
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
        <p className="text-xs text-gray-600 mt-2">{disabledReason}</p>
      )}
    </div>
  );
}
