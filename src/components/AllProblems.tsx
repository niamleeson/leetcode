import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType, useSearchParams } from 'react-router-dom';
import { ProblemProgress, Difficulty } from '../types';
import { uniqueProblems } from '../data/problems';
import { catalogManifest } from '../data/catalog';
import ProblemCard from './ProblemCard';
import ProgressBar from './ProgressBar';

interface AllProblemsProps {
  getProgress: (id: number) => ProblemProgress;
  stats: {
    total: number;
    solved: number;
    attempted: number;
  };
}

type FilterStatus = 'all' | 'unseen' | 'attempted' | 'solved' | 'due';
const VALID_STATUSES: FilterStatus[] = ['all', 'unseen', 'attempted', 'solved', 'due'];
const VALID_DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const;

export default function AllProblems({ getProgress, stats }: AllProblemsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlParams = searchParams.toString();
  const urlQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(urlQuery);
  const pendingParams = useRef<string | null>(null);
  const { key: locationKey } = useLocation();
  const navigationType = useNavigationType();

  // Keep typing immediate while the router updates the URL in a transition.
  // Older URL updates must not overwrite characters that were just entered.
  useEffect(() => {
    if (navigationType !== 'REPLACE' || pendingParams.current === null) {
      pendingParams.current = null;
      setQuery(urlQuery);
    } else if (urlParams === pendingParams.current) {
      pendingParams.current = null;
    }
  }, [urlQuery, urlParams, locationKey, navigationType]);

  const filterStatus = (VALID_STATUSES.includes(searchParams.get('status') as FilterStatus)
    ? searchParams.get('status') as FilterStatus
    : 'all');
  const filterDifficulty = (VALID_DIFFICULTIES.includes(searchParams.get('difficulty') as any)
    ? searchParams.get('difficulty') as Difficulty | 'All'
    : 'All');
  const requestedPage = Number(searchParams.get('page') || 0);
  const page = query === urlQuery && Number.isFinite(requestedPage) ? Math.max(0, Math.floor(requestedPage)) : 0;
  const pageSize = 50;

  const setParam = useCallback((key: string, value: string, resetPage = true) => {
    // Consecutive input/filter changes must build on the latest pending change,
    // even when the router has not rendered that URL yet.
    const next = new URLSearchParams(pendingParams.current ?? searchParams);
    if ((key === 'status' && value === 'all') ||
        (key === 'difficulty' && value === 'All') ||
        (key === 'q' && value === '') ||
        (key === 'page' && value === '0')) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (resetPage && key !== 'page') next.delete('page');
    pendingParams.current = next.toString();
    setSearchParams(next, { replace: true });
  }, [setSearchParams, searchParams]);

  function updateQuery(value: string) {
    setQuery(value);
    setParam('q', value);
  }

  const today = new Date().toISOString().split('T')[0];

  const filtered = useMemo(() => {
    let result = uniqueProblems;
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean).map(term => term.replace(/^#(?=\d+$)/, ''));

    if (terms.length > 0) {
      result = result.filter(problem => {
        const text = `${problem.id} ${problem.title} ${problem.topics.join(' ')} ${(problem.sourceTopics ?? []).join(' ')} ${problem.difficulty}`.toLowerCase();
        return terms.every(term => text.includes(term));
      });
    }

    if (filterDifficulty !== 'All') {
      result = result.filter(p => p.difficulty === filterDifficulty);
    }

    if (filterStatus !== 'all') {
      result = result.filter(p => {
        const prog = getProgress(p.id);
        if (filterStatus === 'due') {
          return prog.nextReview && prog.nextReview <= today;
        }
        return prog.status === filterStatus;
      });
    }

    return [...result].sort((a, b) => a.id - b.id);
  }, [query, filterDifficulty, filterStatus, getProgress, today]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const paged = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white light:text-gray-900">All Problems</h2>
        <p className="text-sm text-gray-400 light:text-gray-600">{catalogManifest.total.toLocaleString()} LeetCode problems · {uniqueProblems.length - catalogManifest.total} additional study problems</p>
      </div>

      <ProgressBar solved={stats.solved} attempted={stats.attempted} total={stats.total} />

      <div className="relative">
        <input
          type="search"
          aria-label="Search all problems"
          value={query}
          onChange={event => updateQuery(event.target.value)}
          placeholder="Search by name, number, topic, or difficulty…"
          className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 pl-4 pr-20 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none light:border-gray-300 light:bg-white light:text-gray-900 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && <button
          type="button"
          aria-label="Clear search"
          onClick={() => updateQuery('')}
          className="absolute inset-y-0 right-2 min-w-12 px-2 text-sm text-gray-400 hover:text-white light:text-gray-600 light:hover:text-gray-900"
        >Clear</button>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 bg-gray-900 light:bg-white rounded-lg p-1">
          {VALID_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setParam('status', s)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterStatus === s ? 'bg-gray-700 light:bg-gray-200 text-white light:text-gray-900' : 'text-gray-400 light:text-gray-600 hover:text-white light:hover:text-gray-900'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-900 light:bg-white rounded-lg p-1">
          {VALID_DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setParam('difficulty', d)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterDifficulty === d ? 'bg-gray-700 light:bg-gray-200 text-white light:text-gray-900' : 'text-gray-400 light:text-gray-600 hover:text-white light:hover:text-gray-900'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <span role="status" className="text-xs text-gray-500 light:text-gray-500 ml-auto">{filtered.length} results</span>
      </div>

      {/* Problems */}
      <div className="space-y-2">
        {paged.map(p => (
          <ProblemCard key={p.id} problem={p} progress={getProgress(p.id)} />
        ))}
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-gray-500 light:text-gray-500">
          {query.trim() ? 'No problems match your search and filters.' : 'No problems match the selected filters.'}
        </p>}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Problem result pages" className="flex items-center justify-center gap-2">
          <button
            onClick={() => setParam('page', String(safePage - 1), false)}
            disabled={safePage === 0}
            className="bg-gray-800 light:bg-gray-100 hover:bg-gray-700 light:hover:bg-gray-200 disabled:opacity-30 text-gray-300 light:text-gray-700 px-3 py-1.5 rounded-md text-sm"
          >
            Prev
          </button>
          <span className="text-sm text-gray-400 light:text-gray-600">
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setParam('page', String(safePage + 1), false)}
            disabled={safePage >= totalPages - 1}
            className="bg-gray-800 light:bg-gray-100 hover:bg-gray-700 light:hover:bg-gray-200 disabled:opacity-30 text-gray-300 light:text-gray-700 px-3 py-1.5 rounded-md text-sm"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
