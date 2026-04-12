/**
 * Study chunk — source-agnostic union.
 *
 * SDI and DSA chunks already share the shape {id, title, oneLiner, meta}.
 * The only disjoint field is `problemId` (SDI) vs `topic` (DSA), which lets
 * callers discriminate structurally via `'problemId' in chunk` — no tagged
 * field needed, no migration of either chunk store.
 *
 * Having one union type means `buildStudyQueue`, the modality components,
 * and `StudyMode` can all work with either source with no branching except
 * where canonical long-form content is fetched (Explain modality).
 */

import { SdiChunk, getSdiChunk } from '../../data/chunks-sdi';
import { DsaChunk, getDsaChunk } from '../../data/chunks-dsa';
import { lessons } from '../../data/lessons';
import { solutionMap } from '../../data/solutions';

export type StudyChunk = SdiChunk | DsaChunk;

export function isSdiChunk(chunk: StudyChunk): chunk is SdiChunk {
  return 'problemId' in chunk;
}

export function isDsaChunk(chunk: StudyChunk): chunk is DsaChunk {
  return 'topic' in chunk;
}

/**
 * Resolve a chunk id from either store. Used by Discriminate when authored
 * discriminators reference cross-store ids (e.g. an SDI chunk discriminating
 * against another SDI chunk, or a DSA chunk against another DSA chunk).
 */
export function resolveChunk(id: string): StudyChunk | undefined {
  return getSdiChunk(id) ?? getDsaChunk(id);
}

/**
 * Return the canonical long-form explanation for a chunk. SDI pulls from
 * `solutionMap[problemId].intuition`; DSA pulls from `lessons[topic].overview`.
 * Falls back to the chunk's oneLiner so the caller never gets an empty string.
 */
export function canonicalExplanation(chunk: StudyChunk): string {
  if (isSdiChunk(chunk)) {
    return solutionMap[chunk.problemId]?.intuition || chunk.oneLiner;
  }
  return lessons[chunk.topic]?.overview || chunk.oneLiner;
}
