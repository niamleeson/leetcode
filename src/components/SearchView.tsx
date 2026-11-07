import { useState, useMemo } from 'react';
import { ProblemProgress } from '../types';
import { uniqueProblems } from '../data/problems';
import ProblemCard from './ProblemCard';

interface SearchViewProps {
  getProgress: (id: number) => ProblemProgress;
}

export default function SearchView({ getProgress }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/);

    return uniqueProblems
      .map(p => {
        const searchText = `${p.id} ${p.title} ${p.topics.join(' ')} ${p.difficulty}`.toLowerCase();
        const matchCount = terms.filter(t => searchText.includes(t)).length;
        return { problem: p, score: matchCount };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score || a.problem.id - b.problem.id)
      .map(r => r.problem);
  }, [query]);
  const totalPages = Math.ceil(results.length / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleResults = results.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white light:text-gray-900 mb-3">Search</h2>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(0); }}
          placeholder="Search by problem name, number, topic, or difficulty..."
          className="w-full bg-gray-900 light:bg-white border border-gray-700 light:border-gray-300 rounded-lg px-4 py-3 text-white light:text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm"
          autoFocus
        />
      </div>

      {query.trim() && (
        <p className="text-xs text-gray-500 light:text-gray-500">{results.length} results</p>
      )}

      <div className="space-y-2">
        {visibleResults.map(p => (
          <ProblemCard key={p.id} problem={p} progress={getProgress(p.id)} />
        ))}
        {query.trim() && results.length === 0 && (
          <div className="text-center py-12 text-gray-500 light:text-gray-500">
            No problems found for "{query}"
          </div>
        )}
        {!query.trim() && (
          <div className="text-center py-12 text-gray-500 light:text-gray-500">
            Type to search across all problems
          </div>
        )}
      </div>
      {totalPages > 1 && <nav aria-label="Search result pages" className="flex items-center justify-center gap-3 pb-6 text-sm text-gray-300 light:text-gray-700">
        <button type="button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="rounded bg-gray-800 px-3 py-2 disabled:opacity-30 light:bg-gray-100">Prev</button>
        <span>Page {safePage + 1} of {totalPages}</span>
        <button type="button" disabled={safePage === totalPages - 1} onClick={() => setPage(safePage + 1)} className="rounded bg-gray-800 px-3 py-2 disabled:opacity-30 light:bg-gray-100">Next</button>
      </nav>}
    </div>
  );
}
