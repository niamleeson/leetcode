/**
 * Interleaved study queue builder.
 *
 * Given a set of chunks in scope, return an ordered list of (chunk, modality)
 * review items such that consecutive items never share a tag when avoidable.
 *
 * Rationale: Rohrer & Taylor's interleaving research shows that practicing the
 * *same* skill back-to-back teaches execution but not discrimination. We want
 * discrimination to be the primary outcome, so the queue is shuffled across
 * tags by construction.
 *
 * Priority ordering inside the shuffle:
 *   1. Never-reviewed chunks — all 5 modalities are queued so the learner
 *      gets the full rotation (Probe → Recall → Explain → Discriminate →
 *      Palace) on first exposure.
 *   2. Everything else that is currently due, sorted by longest-overdue first.
 *
 * New chunks are rate-limited: at most `newPerSession` brand new chunks are
 * introduced per session, to prevent cognitive-load spikes (Sweller).
 */

import { Modality, ReviewState, isDue } from '../../utils/fsrs-lite';
import { ALL_MODALITIES } from '../../store/useStudyStore';
import { StudyChunk } from './chunk';

export interface QueueItem {
  chunk: StudyChunk;
  modality: Modality;
  isNew: boolean;
}

export interface BuildQueueOptions {
  chunks: StudyChunk[];
  /** Resolver for current review state of a (chunkId, modality). */
  getState: (chunkId: string, modality: Modality) => ReviewState;
  /** Max items in the returned queue. Default = no cap. */
  maxItems?: number;
  /** Max number of never-reviewed chunks to introduce. Default = no cap. */
  newPerSession?: number;
}

export function buildStudyQueue({
  chunks,
  getState,
  maxItems = Infinity,
  newPerSession = Infinity,
}: BuildQueueOptions): QueueItem[] {
  // Pool: all (chunk, modality) pairs that are due or never reviewed.
  type Candidate = QueueItem & {
    dueDaysAgo: number;
    tag: string;
  };

  const due: Candidate[] = [];
  const neverSeen: Candidate[] = [];

  for (const chunk of chunks) {
    for (const modality of ALL_MODALITIES) {
      const state = getState(chunk.id, modality);
      const neverReviewed = state.due === null;
      if (!isDue(state) && !neverReviewed) continue;

      const dueDaysAgo = state.due
        ? Math.max(
            0,
            (Date.now() - Date.parse(state.due)) / 86_400_000,
          )
        : 0;

      const candidate: Candidate = {
        chunk,
        modality,
        isNew: neverReviewed,
        dueDaysAgo,
        tag: chunk.meta.tags[0] ?? 'misc',
      };

      if (neverReviewed) neverSeen.push(candidate);
      else due.push(candidate);
    }
  }

  // Rate-limit new *chunks* (not modalities). All 5 modalities for each
  // admitted chunk are included so the learner gets the full rotation
  // (Probe → Recall → Explain → Discriminate → Palace) in a single session.
  const admittedChunks = new Set<string>();
  const onramp: Candidate[] = [];
  for (const c of neverSeen) {
    // First time seeing this chunk — admit it (up to the cap).
    if (!admittedChunks.has(c.chunk.id)) {
      if (admittedChunks.size >= newPerSession) continue;
      admittedChunks.add(c.chunk.id);
    }
    onramp.push(c);
  }

  // Sort due reviews by longest-overdue first.
  due.sort((a, b) => b.dueDaysAgo - a.dueDaysAgo);

  // Combine: the onramp interleaves into the stream so new chunks do not all
  // cluster at the start (otherwise the session feels like a wall of new).
  const combined: Candidate[] = [];
  let rampIdx = 0;
  for (let i = 0; i < due.length; i++) {
    combined.push(due[i]);
    // Insert a new-chunk onramp every 3rd item.
    if (i % 3 === 2 && rampIdx < onramp.length) {
      combined.push(onramp[rampIdx++]);
    }
  }
  while (rampIdx < onramp.length) combined.push(onramp[rampIdx++]);

  // Interleaving pass: greedy reorder so no two consecutive items share a tag
  // AND the same chunk does not appear twice in a row for different modalities.
  const result: Candidate[] = [];
  const remaining = [...combined];
  let lastTag: string | null = null;
  let lastChunkId: string | null = null;

  while (remaining.length > 0 && result.length < maxItems) {
    // Try to find an item whose tag differs from lastTag AND chunk differs
    // from lastChunkId. Fall back to different chunk only, then anything.
    let pickIdx = remaining.findIndex(
      (c) => c.tag !== lastTag && c.chunk.id !== lastChunkId,
    );
    if (pickIdx === -1) {
      pickIdx = remaining.findIndex((c) => c.chunk.id !== lastChunkId);
    }
    if (pickIdx === -1) pickIdx = 0;

    const picked = remaining.splice(pickIdx, 1)[0];
    result.push(picked);
    lastTag = picked.tag;
    lastChunkId = picked.chunk.id;
  }

  return result.map(({ chunk, modality, isNew }) => ({
    chunk,
    modality,
    isNew,
  }));
}
