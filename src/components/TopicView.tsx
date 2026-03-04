import { useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Topic, ProblemProgress, Difficulty } from '../types';
import { uniqueProblems } from '../data/problems';
import ProblemCard from './ProblemCard';
import ProgressBar from './ProgressBar';
import LessonPanel from './LessonPanel';

interface TopicViewProps {
  topic: Topic;
  getProgress: (id: number) => ProblemProgress;
}

type FilterStatus = 'all' | 'unseen' | 'attempted' | 'solved' | 'due';
type SortBy = 'id' | 'difficulty' | 'status';
const VALID_STATUSES: FilterStatus[] = ['all', 'unseen', 'attempted', 'solved', 'due'];
const VALID_DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const;
const VALID_SORTS: SortBy[] = ['id', 'difficulty', 'status'];

export default function TopicView({ topic, getProgress }: TopicViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filterStatus = (VALID_STATUSES.includes(searchParams.get('status') as FilterStatus)
    ? searchParams.get('status') as FilterStatus
    : 'all');
  const filterDifficulty = (VALID_DIFFICULTIES.includes(searchParams.get('difficulty') as any)
    ? searchParams.get('difficulty') as Difficulty | 'All'
    : 'All');
  const sortBy = (VALID_SORTS.includes(searchParams.get('sort') as SortBy)
    ? searchParams.get('sort') as SortBy
    : 'difficulty');

  const setParam = useCallback((key: string, value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      const defaults: Record<string, string> = { status: 'all', difficulty: 'All', sort: 'difficulty' };
      if (value === defaults[key]) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const topicProblems = useMemo(() => {
    return uniqueProblems.filter(p => p.topics.includes(topic));
  }, [topic]);

  const today = new Date().toISOString().split('T')[0];

  const filteredProblems = useMemo(() => {
    let result = topicProblems;

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

    const diffOrder: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };
    const statusOrder: Record<string, number> = { unseen: 0, attempted: 1, solved: 2 };

    result = [...result].sort((a, b) => {
      if (sortBy === 'difficulty') return diffOrder[a.difficulty] - diffOrder[b.difficulty];
      if (sortBy === 'status') return statusOrder[getProgress(a.id).status] - statusOrder[getProgress(b.id).status];
      return a.id - b.id;
    });

    return result;
  }, [topicProblems, filterDifficulty, filterStatus, sortBy, getProgress, today]);

  const stats = useMemo(() => {
    let solved = 0, attempted = 0;
    for (const p of topicProblems) {
      const prog = getProgress(p.id);
      if (prog.status === 'solved') solved++;
      else if (prog.status === 'attempted') attempted++;
    }
    return { total: topicProblems.length, solved, attempted };
  }, [topicProblems, getProgress]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{topic}</h2>
          <p className="text-sm text-gray-400">{stats.solved}/{stats.total} problems solved</p>
        </div>
      </div>

      <ProgressBar solved={stats.solved} attempted={stats.attempted} total={stats.total} />

      {/* Topic lesson */}
      <LessonPanel topic={topic} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          {VALID_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setParam('status', s)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterStatus === s
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          {VALID_DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setParam('difficulty', d)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterDifficulty === d
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={e => setParam('sort', e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-300 focus:outline-none ml-auto"
        >
          <option value="difficulty">Sort: Difficulty</option>
          <option value="id">Sort: Problem #</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      <p className="text-xs text-gray-500">{filteredProblems.length} problems</p>

      {/* Problems list */}
      <div className="space-y-2">
        {filteredProblems.map(p => (
          <ProblemCard
            key={p.id}
            problem={p}
            progress={getProgress(p.id)}
          />
        ))}
        {filteredProblems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No problems match your filters
          </div>
        )}
      </div>
    </div>
  );
}
