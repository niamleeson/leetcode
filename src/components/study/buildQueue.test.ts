import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { buildStudyQueue } from './buildQueue';
import { defaultReviewState, Modality, ReviewState } from '../../utils/fsrs-lite';
import { SdiChunk } from '../../data/chunks-sdi';

const FIXED = new Date('2026-04-11T12:00:00Z').getTime();
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED);
});
afterAll(() => vi.useRealTimers());

function makeChunk(id: string, tag: string): SdiChunk {
  return {
    id,
    problemId: Number(id.replace('sdi-', '')),
    title: id,
    difficulty: 'Medium',
    volume: 'vol1',
    category: 'x',
    oneLiner: '',
    meta: {
      triggerSignals: ['signal'],
      keyPoints: ['kp1'],
      discriminators: [],
      palaceProbes: ['probe'],
      tags: [tag],
    },
  };
}

describe('buildStudyQueue', () => {
  it('returns an empty queue when no chunks supplied', () => {
    const q = buildStudyQueue({ chunks: [], getState: (a, b) => defaultReviewState(a, b), maxItems: 10 });
    expect(q).toEqual([]);
  });

  it('never puts two consecutive items with the same tag when alternatives exist', () => {
    const chunks = [
      makeChunk('sdi-1', 'infra'),
      makeChunk('sdi-2', 'infra'),
      makeChunk('sdi-3', 'web'),
      makeChunk('sdi-4', 'web'),
      makeChunk('sdi-5', 'storage'),
    ];
    const q = buildStudyQueue({
      chunks,
      getState: (a, b) => defaultReviewState(a, b),
      maxItems: 20,
      newPerSession: 10,
    });
    for (let i = 1; i < q.length; i++) {
      const prevTag = q[i - 1].chunk.meta.tags[0];
      const curTag = q[i].chunk.meta.tags[0];
      // With 3 tags in the pool, the greedy reorder should always find an alt.
      expect(curTag).not.toBe(prevTag);
    }
  });

  it('never puts the same chunk back-to-back', () => {
    const chunks = [makeChunk('sdi-1', 'a'), makeChunk('sdi-2', 'b')];
    const q = buildStudyQueue({
      chunks,
      getState: (a, b) => defaultReviewState(a, b),
      maxItems: 20,
      newPerSession: 10,
    });
    for (let i = 1; i < q.length; i++) {
      expect(q[i].chunk.id).not.toBe(q[i - 1].chunk.id);
    }
  });

  it('rate-limits new chunks per session', () => {
    const chunks = Array.from({ length: 10 }, (_, i) =>
      makeChunk(`sdi-${i}`, `tag${i}`),
    );
    const q = buildStudyQueue({
      chunks,
      getState: (a, b) => defaultReviewState(a, b),
      maxItems: 20,
      newPerSession: 2,
    });
    const uniqueNewChunks = new Set(q.filter((item) => item.isNew).map((item) => item.chunk.id));
    expect(uniqueNewChunks.size).toBeLessThanOrEqual(2);
  });

  it('skips items that are not due and not new', () => {
    const chunks = [makeChunk('sdi-1', 'a'), makeChunk('sdi-2', 'b')];
    // Pretend every review is far in the future.
    const fakeState = (chunkId: string, modality: Modality): ReviewState => ({
      chunkId,
      modality,
      interval: 30,
      ease: 2.5,
      streak: 3,
      reps: 3,
      lastReviewed: '2026-04-10',
      due: '2026-05-10',
    });
    const q = buildStudyQueue({
      chunks,
      getState: fakeState,
      maxItems: 20,
      newPerSession: 10,
    });
    expect(q).toEqual([]);
  });
});
