/**
 * StudyMode — the route component for /train/sdi and /train/dsa.
 *
 * Reads ?scope=... from the URL, builds an interleaved queue of (chunk,
 * modality) review items, walks through them one at a time, and persists
 * grades to useStudyStore.
 *
 * The `source` prop selects which chunk store to study (SDI book vs DSA
 * reference). The scope indirection means the same component can serve
 * "study whole thing", "study one category", and "study one chapter/topic".
 */

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  filterChunksByScope as filterSdiByScope,
  sdiChunks,
} from '../../data/chunks-sdi';
import { filterDsaByScope } from '../../data/chunks-dsa';
import { useStudyStore } from '../../store/useStudyStore';
import { Modality, StudyGrade } from '../../utils/fsrs-lite';
import { buildStudyQueue, QueueItem } from './buildQueue';
import { StudyChunk } from './chunk';
import Recognize from './modalities/Recognize';
import Recall from './modalities/Recall';
import Discriminate from './modalities/Discriminate';
import Explain from './modalities/Explain';
import Palace from './modalities/Palace';

type StudySource = 'sdi' | 'dsa';

interface StudyModeProps {
  source: StudySource;
}

function scopeLabel(scope: string, source: StudySource): string {
  if (source === 'sdi') {
    if (!scope || scope === 'all') return 'All SDI chapters';
    if (scope === 'vol1') return 'Volume 1 only';
    if (scope === 'vol2') return 'Volume 2 only';
    if (scope.startsWith('cat:')) return decodeURIComponent(scope.slice(4));
    if (scope.startsWith('ch:')) {
      const id = Number(scope.slice(3));
      const chunk = sdiChunks.find((c) => c.problemId === id);
      return chunk?.title ?? `Chapter ${id}`;
    }
    return scope;
  }
  // DSA
  if (!scope || scope === 'all') return 'All DSA topics';
  if (scope.startsWith('cat:')) return decodeURIComponent(scope.slice(4));
  if (scope.startsWith('topic:')) return decodeURIComponent(scope.slice(6));
  return scope;
}

function modalityLabel(m: Modality): string {
  return (
    {
      recognize: 'Probe drill',
      recall: 'Recall',
      discriminate: 'Discriminate',
      explain: 'Explain',
      palace: 'Palace walk',
    }[m] ?? m
  );
}

export default function StudyMode({ source }: StudyModeProps) {
  const [params] = useSearchParams();
  const scope = params.get('scope') || 'all';
  const [started, setStarted] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  const { getState, grade, dueCountForChunks } = useStudyStore();

  const backLink = source === 'sdi' ? '/sdi-book' : '/dsa';
  const backLabel = source === 'sdi' ? '← SDI Book' : '← DSA Reference';

  const scopedChunks: StudyChunk[] = useMemo(
    () =>
      source === 'sdi' ? filterSdiByScope(scope) : filterDsaByScope(scope),
    [scope, source],
  );
  const scopedIds = useMemo(
    () => scopedChunks.map((c) => c.id),
    [scopedChunks],
  );
  const dueCount = dueCountForChunks(scopedIds);

  const queue = useMemo(
    () =>
      started
        ? buildStudyQueue({
            chunks: scopedChunks,
            getState,
            // No caps — the user wants the whole scope in one pass.
            maxItems: Infinity,
            newPerSession: Infinity,
          })
        : [],
    [started, scopedChunks, getState],
  );

  const current: QueueItem | undefined = queue[cursor];

  const handleGrade = (g: StudyGrade) => {
    if (!current) return;
    grade(current.chunk.id, current.modality, g);
    setCursor((c) => c + 1);
  };

  const handleSkip = () => {
    if (!current) return;
    setSkipped((prev) => new Set(prev).add(current.chunk.id + current.modality));
    setCursor((c) => c + 1);
  };

  // ── Pre-session landing ────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 light:text-gray-500">
            <Link to={backLink} className="hover:text-sky-400 light:hover:text-sky-700">
              {backLabel}
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-white light:text-gray-900 mt-2">Study Mode</h2>
          <p className="text-gray-400 light:text-gray-600 text-sm mt-1">
            Scope: <span className="text-sky-300 light:text-sky-700">{scopeLabel(scope, source)}</span>
          </p>
        </div>

        <div className="bg-gray-900 light:bg-white border border-gray-800 light:border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex gap-8">
            <div>
              <p className="text-gray-400 light:text-gray-600 text-xs uppercase tracking-wider">
                Chunks in scope
              </p>
              <p className="text-3xl font-bold text-sky-400 light:text-sky-700">
                {scopedChunks.length}
              </p>
            </div>
            <div>
              <p className="text-gray-400 light:text-gray-600 text-xs uppercase tracking-wider">
                (Chunk × modality) due
              </p>
              <p className="text-3xl font-bold text-amber-400 light:text-amber-700">{dueCount}</p>
            </div>
          </div>

          <div className="text-xs text-gray-500 light:text-gray-500 space-y-1">
            <p>· Items are interleaved — you will not see two of the same tag in a row.</p>
            <p>· You will go through <span className="text-gray-300 light:text-gray-700">every due (chunk × modality)</span> pair in this scope.</p>
            <p>· Grade yourself honestly. The schedule depends on it.</p>
            <p>· End the session any time — your grades so far are already saved.</p>
          </div>

          <button
            onClick={() => {
              setStarted(true);
              setCursor(0);
              setSkipped(new Set());
            }}
            disabled={scopedChunks.length === 0}
            className="bg-sky-700 hover:bg-sky-600 disabled:bg-gray-700 light:disabled:bg-gray-200 disabled:text-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Start session
          </button>
        </div>
      </div>
    );
  }

  // ── Session complete ────────────────────────────────────────────────────
  if (!current) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white light:text-gray-900">Session complete</h2>
          <p className="text-gray-400 light:text-gray-600 text-sm mt-1">
            {queue.length} reviews graded, {skipped.size} skipped.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setStarted(false);
              setCursor(0);
            }}
            className="bg-sky-700 hover:bg-sky-600 text-white text-sm px-4 py-2 rounded-md"
          >
            Start another session
          </button>
          <Link
            to={backLink}
            className="bg-gray-800 light:bg-gray-100 hover:bg-gray-700 light:hover:bg-gray-200 text-gray-200 light:text-gray-800 text-sm px-4 py-2 rounded-md inline-flex items-center"
          >
            {source === 'sdi' ? 'Back to book' : 'Back to reference'}
          </Link>
        </div>
      </div>
    );
  }

  // ── Active review ───────────────────────────────────────────────────────
  const progress = `${cursor + 1} / ${queue.length}`;
  const { chunk, modality, isNew } = current;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 light:text-gray-500">
            <Link to={backLink} className="hover:text-sky-400 light:hover:text-sky-700">
              {backLabel}
            </Link>
            <span>·</span>
            <span>{scopeLabel(scope, source)}</span>
          </div>
          <h2 className="text-lg font-semibold text-white light:text-gray-900 mt-1">
            {modalityLabel(modality)}{' '}
            {isNew && (
              <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-400 light:text-amber-700 border border-amber-900/50 light:border-amber-200 bg-amber-950/30 light:bg-amber-50 px-1.5 py-0.5 rounded">
                new
              </span>
            )}
          </h2>
        </div>
        <div className="text-sm text-gray-400 light:text-gray-600">
          <span className="text-white light:text-gray-900 font-mono">{progress}</span>
        </div>
      </div>

      {/*
       * `key={cursor}` is load-bearing: without it, React reuses the same
       * modality component instance across cursor changes and the internal
       * useState hooks (`picked`, `text`, `revealed`, ...) leak from the
       * previous chunk into the next one. Bumping the key on every advance
       * forces an unmount + remount so every item starts fresh.
       */}
      <div key={cursor} className="bg-gray-900 light:bg-white border border-gray-800 light:border-gray-200 rounded-lg p-5">
        {modality === 'recognize' && (
          <Recognize chunk={chunk} onGrade={handleGrade} />
        )}
        {modality === 'recall' && <Recall chunk={chunk} onGrade={handleGrade} />}
        {modality === 'discriminate' && (
          <Discriminate chunk={chunk} onGrade={handleGrade} onSkip={handleSkip} />
        )}
        {modality === 'explain' && <Explain chunk={chunk} onGrade={handleGrade} />}
        {modality === 'palace' && (
          <Palace chunk={chunk} onGrade={handleGrade} onSkip={handleSkip} />
        )}
      </div>

      <div className="flex justify-between text-xs text-gray-500 light:text-gray-500">
        <button
          onClick={handleSkip}
          className="hover:text-gray-300 light:hover:text-gray-700"
        >
          Skip this one
        </button>
        <button
          onClick={() => {
            setStarted(false);
            setCursor(0);
          }}
          className="hover:text-gray-300 light:hover:text-gray-700"
        >
          End session
        </button>
      </div>
    </div>
  );
}
