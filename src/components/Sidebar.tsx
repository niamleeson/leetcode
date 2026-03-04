import { Link, useLocation } from 'react-router-dom';
import { Topic } from '../types';
import { STUDY_ORDER } from '../data/problems';
import { topicToSlug } from '../App';

interface SidebarProps {
  dueCount: number;
  solvedToday: number;
  dailyGoal: number;
  getTopicStats: (topic: Topic) => { total: number; solved: number; attempted: number };
}

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/study', label: 'Study Session', badgeKey: 'due' as const },
  { path: '/problems', label: 'All Problems' },
  { path: '/search', label: 'Search' },
];

export default function Sidebar({
  dueCount,
  solvedToday,
  dailyGoal,
  getTopicStats,
}: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 h-screen sticky top-0 flex flex-col overflow-hidden">
      {/* Logo */}
      <Link to="/" className="block p-4 border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
        <h1 className="text-lg font-bold text-white">LeetCode Trainer</h1>
        <p className="text-xs text-gray-500 mt-1">Master algorithms with spaced repetition</p>
      </Link>

      {/* Daily progress */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Today's progress</span>
          <span>{solvedToday}/{dailyGoal}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, (solvedToday / dailyGoal) * 100)}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-0.5">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const badge = item.badgeKey === 'due' ? dueCount : 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full block px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
              {badge > 0 && (
                <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Topics */}
      <div className="flex-1 overflow-y-auto border-t border-gray-800 mt-2">
        <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Topics
        </p>
        <div className="px-2 pb-4 space-y-0.5">
          {STUDY_ORDER.map(topic => {
            const tStats = getTopicStats(topic as Topic);
            const pct = tStats.total > 0 ? Math.round((tStats.solved / tStats.total) * 100) : 0;
            const slug = topicToSlug(topic);
            const isSelected = location.pathname === `/topic/${slug}`;

            return (
              <Link
                key={topic}
                to={`/topic/${slug}`}
                className={`w-full block px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
                  isSelected
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <span className="flex-1 truncate">{topic}</span>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {tStats.solved}/{tStats.total}
                </span>
                <div className="w-8 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
