/**
 * fsrs-lite — per-(chunk, modality) spaced repetition for the study tool.
 *
 * Not a full FSRS implementation. Uses SM-2-flavored math, intentionally kept
 * simple and dependency-free, but keyed on (chunkId, modality) so the same
 * chunk can be scheduled independently for each review type.
 *
 * Grade scale (matches Anki):
 *   0 = Again    (reset interval, regress)
 *   1 = Hard     (shorter advance)
 *   2 = Good     (normal advance)
 *   3 = Easy     (longer advance)
 */

export type StudyGrade = 0 | 1 | 2 | 3;

export type Modality =
  | 'recognize'
  | 'recall'
  | 'discriminate'
  | 'explain'
  | 'palace';

export interface ReviewState {
  /** Chunk identifier, e.g. "sdi-9104". */
  chunkId: string;
  /** Which review form. */
  modality: Modality;
  /** Days until next review (0 = due today). */
  interval: number;
  /** SM-2 ease factor, clamped to [1.3, 2.8]. */
  ease: number;
  /** Consecutive successful reviews at Good or better. */
  streak: number;
  /** Total reviews ever. */
  reps: number;
  /** ISO date of last review, or null if never reviewed. */
  lastReviewed: string | null;
  /** ISO date when this review becomes due. Null = new, always due. */
  due: string | null;
}

export function defaultReviewState(
  chunkId: string,
  modality: Modality,
): ReviewState {
  return {
    chunkId,
    modality,
    interval: 0,
    ease: 2.5,
    streak: 0,
    reps: 0,
    lastReviewed: null,
    due: null,
  };
}

const today = (): string => new Date().toISOString().split('T')[0];

/** Upper bound on any single interval. Retention past ~10 years is noise, and
 *  without a cap the ease-factor × growth multiplier overflows Date math. */
const MAX_INTERVAL_DAYS = 3650;

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Apply a grade and return the updated state. Pure function.
 *
 * Intervals are deliberately a bit shorter than vanilla SM-2 because a review
 * here costs more time (the user is writing prose or code, not flipping a
 * flashcard) and desirable-difficulties research (Bjork) says slightly harder
 * schedules produce better long-term retention.
 */
export function applyGrade(
  state: ReviewState,
  grade: StudyGrade,
): ReviewState {
  const now = today();
  let { interval, ease, streak, reps } = state;
  reps += 1;

  if (grade === 0) {
    // Again: full reset. Due tomorrow at the earliest.
    interval = 0;
    streak = 0;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    streak += 1;
    // Ease adjustment: Hard shrinks, Good stable, Easy grows.
    const easeDelta = grade === 1 ? -0.15 : grade === 2 ? 0 : 0.1;
    ease = Math.min(2.8, Math.max(1.3, ease + easeDelta));

    if (streak === 1) {
      // First successful pass: 1 day for Good/Easy, 0 (retry today) for Hard.
      interval = grade === 1 ? 0 : 1;
    } else if (streak === 2) {
      interval = grade === 1 ? 2 : grade === 2 ? 3 : 5;
    } else {
      // Steady state.
      const growth = grade === 1 ? 1.2 : grade === 2 ? ease : ease * 1.3;
      interval = Math.max(1, Math.round(interval * growth));
    }
  }

  // Clamp to the maximum interval regardless of path.
  interval = Math.min(interval, MAX_INTERVAL_DAYS);

  const due = addDays(now, Math.max(0, interval));
  return {
    ...state,
    interval,
    ease,
    streak,
    reps,
    lastReviewed: now,
    due,
  };
}

export function isDue(state: ReviewState): boolean {
  // Never reviewed → always due.
  if (state.due === null) return true;
  return state.due <= today();
}

/**
 * Retrievability estimate in [0, 1]. Rough exponential decay from last review.
 * Used only for prioritization / display, not for the core schedule.
 */
export function retrievability(state: ReviewState): number {
  if (state.due === null || state.lastReviewed === null) return 0;
  const daysSince =
    (Date.parse(today()) - Date.parse(state.lastReviewed)) / 86_400_000;
  if (state.interval <= 0) return 0;
  // Target 90% retention at interval; decay from there.
  return Math.max(0, Math.min(1, Math.pow(0.9, daysSince / state.interval)));
}
