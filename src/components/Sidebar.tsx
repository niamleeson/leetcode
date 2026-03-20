import { useState } from 'react';
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
  { path: '/dsa', label: 'DSA Reference' },
  { path: '/system-design', label: 'System Design' },
  { path: '/glossary', label: 'Glossary' },
  { path: '/search', label: 'Search' },
];

export default function Sidebar({
  dueCount,
  solvedToday,
  dailyGoal,
  getTopicStats,
}: SidebarProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button - static, scrolls with page */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="absolute top-3 left-3 z-50 p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 h-screen flex flex-col overflow-hidden transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link to="/" onClick={() => setOpen(false)}>
            <h1 className="text-lg font-bold text-white">DSA</h1>
            <p className="text-xs text-gray-500 mt-1">Master algorithms with spaced repetition</p>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
                onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
    </>
  );
}
