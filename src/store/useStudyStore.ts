/**
 * Study store — per-(chunk, modality) FSRS-lite state in localStorage.
 *
 * Deliberately separate from useStore.ts so it cannot interfere with the
 * existing problem-progress tracker. The key is a composite "chunkId:modality",
 * which lets the same chunk live in five independent review tracks.
 */

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  applyGrade,
  defaultReviewState,
  isDue,
  Modality,
  ReviewState,
  StudyGrade,
} from '../utils/fsrs-lite';

const STORAGE_KEY = 'study-fsrs-v1';

type Store = Record<string, ReviewState>;

function compositeKey(chunkId: string, modality: Modality): string {
  return `${chunkId}:${modality}`;
}

export const ALL_MODALITIES: Modality[] = [
  'recognize',
  'recall',
  'discriminate',
  'explain',
  'palace',
];

export function useStudyStore() {
  const [store, setStore] = useLocalStorage<Store>(STORAGE_KEY, {});

  const getState = useCallback(
    (chunkId: string, modality: Modality): ReviewState => {
      const key = compositeKey(chunkId, modality);
      return store[key] ?? defaultReviewState(chunkId, modality);
    },
    [store],
  );

  const grade = useCallback(
    (chunkId: string, modality: Modality, g: StudyGrade) => {
      const key = compositeKey(chunkId, modality);
      setStore((prev) => {
        const current = prev[key] ?? defaultReviewState(chunkId, modality);
        return { ...prev, [key]: applyGrade(current, g) };
      });
    },
    [setStore],
  );

  const reset = useCallback(
    (chunkId: string, modality?: Modality) => {
      setStore((prev) => {
        const next: Store = {};
        for (const k of Object.keys(prev)) {
          if (modality) {
            if (k === compositeKey(chunkId, modality)) continue;
          } else {
            if (k.startsWith(`${chunkId}:`)) continue;
          }
          next[k] = prev[k];
        }
        return next;
      });
    },
    [setStore],
  );

  const dueCount = useMemo(() => {
    let count = 0;
    for (const state of Object.values(store)) {
      if (isDue(state)) count++;
    }
    return count;
  }, [store]);

  /** Given a list of chunk ids, return the count of (chunk, modality) pairs
   *  currently due. Used by scope-specific badges. */
  const dueCountForChunks = useCallback(
    (chunkIds: string[]): number => {
      let count = 0;
      for (const id of chunkIds) {
        for (const m of ALL_MODALITIES) {
          const state = store[compositeKey(id, m)];
          // Chunks never reviewed in a modality count as due.
          if (!state || isDue(state)) count++;
        }
      }
      return count;
    },
    [store],
  );

  return {
    store,
    getState,
    grade,
    reset,
    dueCount,
    dueCountForChunks,
  };
}

export { compositeKey };
