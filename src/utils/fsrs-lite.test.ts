import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  applyGrade,
  defaultReviewState,
  isDue,
  retrievability,
  ReviewState,
} from './fsrs-lite';

const FIXED = new Date('2026-04-11T12:00:00Z').getTime();

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED);
});
afterAll(() => {
  vi.useRealTimers();
});

describe('fsrs-lite', () => {
  it('defaults to due now and zero interval', () => {
    const s = defaultReviewState('sdi-9101', 'recall');
    expect(s.interval).toBe(0);
    expect(s.ease).toBeCloseTo(2.5);
    expect(s.streak).toBe(0);
    expect(s.due).toBeNull();
    expect(isDue(s)).toBe(true);
  });

  it('a Good grade on a new chunk schedules it 1 day out and starts a streak', () => {
    const s = applyGrade(defaultReviewState('c', 'recall'), 2);
    expect(s.streak).toBe(1);
    expect(s.interval).toBe(1);
    expect(s.due).toBe('2026-04-12');
    expect(s.reps).toBe(1);
  });

  it('an Again grade resets streak, drops ease, and makes it due today', () => {
    let s = applyGrade(defaultReviewState('c', 'recall'), 2);
    s = applyGrade(s, 2);
    s = applyGrade(s, 0);
    expect(s.streak).toBe(0);
    expect(s.interval).toBe(0);
    expect(s.ease).toBeLessThan(2.5);
    expect(s.due).toBe('2026-04-11');
  });

  it('three consecutive Goods produce an expanding interval', () => {
    let s = applyGrade(defaultReviewState('c', 'recall'), 2);
    expect(s.interval).toBe(1);
    s = applyGrade(s, 2);
    expect(s.interval).toBe(3);
    s = applyGrade(s, 2);
    expect(s.interval).toBeGreaterThan(3);
  });

  it('Easy grades grow ease and interval faster than Good', () => {
    let sGood: ReviewState = defaultReviewState('g', 'recall');
    let sEasy: ReviewState = defaultReviewState('e', 'recall');
    for (let i = 0; i < 4; i++) {
      sGood = applyGrade(sGood, 2);
      sEasy = applyGrade(sEasy, 3);
    }
    expect(sEasy.interval).toBeGreaterThan(sGood.interval);
    expect(sEasy.ease).toBeGreaterThan(sGood.ease);
  });

  it('ease is clamped to [1.3, 2.8]', () => {
    let s = defaultReviewState('c', 'recall');
    for (let i = 0; i < 20; i++) s = applyGrade(s, 0);
    expect(s.ease).toBeGreaterThanOrEqual(1.3);
    s = defaultReviewState('c', 'recall');
    for (let i = 0; i < 20; i++) s = applyGrade(s, 3);
    expect(s.ease).toBeLessThanOrEqual(2.8);
  });

  it('retrievability returns 0 for a never-reviewed state', () => {
    expect(retrievability(defaultReviewState('c', 'recall'))).toBe(0);
  });
});
