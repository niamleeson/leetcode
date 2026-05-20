import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProblemProgress, Difficulty } from '../types';
import { uniqueProblems } from '../data/problems';
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

  const filterStatus = (VALID_STATUSES.includes(searchParams.get('status') as FilterStatus)
    ? searchParams.get('status') as FilterStatus
    : 'all');
  const filterDifficulty = (VALID_DIFFICULTIES.includes(searchParams.get('difficulty') as any)
    ? searchParams.get('difficulty') as Difficulty | 'All'
    : 'All');
  const page = Math.max(0, Number(searchParams.get('page') || 0));
  const pageSize = 50;

  const setParam = useCallback((key: string, value: string, resetPage = true) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if ((key === 'status' && value === 'all') ||
          (key === 'difficulty' && value === 'All') ||
          (key === 'page' && value === '0')) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      if (resetPage && key !== 'page') next.delete('page');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const today = new Date().toISOString().split('T')[0];

  const filtered = useMemo(() => {
    let result = uniqueProblems;

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

    return result.sort((a, b) => a.id - b.id);
  }, [filterDifficulty, filterStatus, getProgress, today]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const paged = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white light:text-gray-900">All Problems</h2>
        <p className="text-sm text-gray-400 light:text-gray-600">{uniqueProblems.length} problems</p>
      </div>

      <ProgressBar solved={stats.solved} attempted={stats.attempted} total={stats.total} />

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
        <span className="text-xs text-gray-500 light:text-gray-500 ml-auto">{filtered.length} results</span>
      </div>

      {/* Problems */}
      <div className="space-y-2">
        {paged.map(p => (
          <ProblemCard key={p.id} problem={p} progress={getProgress(p.id)} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
        </div>
      )}
    </div>
  );
}
