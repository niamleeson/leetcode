import { ProblemProgress } from '../types';

/**
 * SM-2 Spaced Repetition Algorithm
 * quality: 0-5 (0 = complete blackout, 5 = perfect recall)
 */
export function calculateNextReview(
  progress: ProblemProgress,
  quality: number
): ProblemProgress {
  const now = new Date().toISOString().split('T')[0];
  let { easeFactor, interval, repetitions } = progress;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response - reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    ...progress,
    easeFactor,
    interval,
    repetitions,
    confidence: quality,
    lastReviewed: now,
    nextReview: nextDate.toISOString().split('T')[0],
    status: quality >= 3 ? 'solved' : 'attempted',
  };
}

export function createDefaultProgress(problemId: number): ProblemProgress {
  return {
    problemId,
    status: 'unseen',
    confidence: 0,
    lastReviewed: null,
    nextReview: null,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    notes: '',
  };
}

export function isDueForReview(progress: ProblemProgress): boolean {
  if (!progress.nextReview) return false;
  const today = new Date().toISOString().split('T')[0];
  return progress.nextReview <= today;
}

export function getDueProblems(
  allProgress: Record<number, ProblemProgress>
): number[] {
  return Object.values(allProgress)
    .filter(isDueForReview)
    .sort((a, b) => {
      // Prioritize: lower confidence first, then earlier due date
      if (a.confidence !== b.confidence) return a.confidence - b.confidence;
      return (a.nextReview || '').localeCompare(b.nextReview || '');
    })
    .map(p => p.problemId);
}
