import { Link } from 'react-router-dom';
import { Problem, ProblemProgress } from '../types';

interface ProblemCardProps {
  problem: Problem;
  progress: ProblemProgress;
}

const difficultyColors = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const statusIcons: Record<string, string> = {
  unseen: '',
  attempted: '~',
  solved: '✓',
};

const statusColors: Record<string, string> = {
  unseen: 'text-gray-600',
  attempted: 'text-yellow-400',
  solved: 'text-emerald-400',
};

export default function ProblemCard({ problem, progress }: ProblemCardProps) {
  const today = new Date().toISOString().split('T')[0];
  const isDue = progress.nextReview && progress.nextReview <= today;

  return (
    <Link
      to={`/problem/${problem.id}`}
      className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800/70 hover:border-gray-700 transition-colors group"
    >
      <span className={`text-base font-bold w-5 text-center ${statusColors[progress.status]}`}>
        {statusIcons[progress.status]}
      </span>
      <span className="text-gray-500 text-xs font-mono w-10">#{problem.id}</span>
      <span className="font-medium text-gray-200 group-hover:text-white flex-1 truncate">
        {problem.title}
        {problem.isPremium && <span className="text-amber-400 ml-1 text-xs">$</span>}
      </span>
      <span className={`text-xs px-2 py-0.5 rounded border shrink-0 ${difficultyColors[problem.difficulty]}`}>
        {problem.difficulty}
      </span>
      <div className="hidden sm:flex gap-1 flex-wrap justify-end max-w-[180px] shrink-0">
        {problem.topics.slice(0, 2).map(t => (
          <span key={t} className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-500 rounded">
            {t}
          </span>
        ))}
      </div>
      {isDue && (
        <span className="text-xs text-red-400 font-medium shrink-0">Due</span>
      )}
      <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
