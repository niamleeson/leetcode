import { useState, useMemo } from 'react';
import { ProblemProgress } from '../types';
import { uniqueProblems } from '../data/problems';
import ProblemCard from './ProblemCard';

interface SearchViewProps {
  getProgress: (id: number) => ProblemProgress;
}

export default function SearchView({ getProgress }: SearchViewProps) {
  const [query, setQuery] = useState('');

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
      .sort((a, b) => b.score - a.score)
      .map(r => r.problem)
      .slice(0, 50);
  }, [query]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-3">Search</h2>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by problem name, number, topic, or difficulty..."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm"
          autoFocus
        />
      </div>

      {query.trim() && (
        <p className="text-xs text-gray-500">{results.length} results</p>
      )}

      <div className="space-y-2">
        {results.map(p => (
          <ProblemCard key={p.id} problem={p} progress={getProgress(p.id)} />
        ))}
        {query.trim() && results.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No problems found for "{query}"
          </div>
        )}
        {!query.trim() && (
          <div className="text-center py-12 text-gray-500">
            Type to search across all problems
          </div>
        )}
      </div>
    </div>
  );
}
