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
    <div className="bg-gray-900 border-b border-gray-800">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <Link to="/" className="flex items-center">
            <h1 className="text-lg font-bold text-white">LeetCode Trainer</h1>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{solvedToday}/{dailyGoal} today</span>
          <div className="w-16 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, (solvedToday / dailyGoal) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Collapsible menu */}
      {open && (
        <div className="border-t border-gray-800 px-4 py-3">
          {/* Navigation */}
          <div className="flex flex-wrap gap-2 mb-3">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              const badge = item.badgeKey === 'due' ? dueCount : 0;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
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
          </div>

          {/* Topics */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Topics</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
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
                  className={`px-2 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <span className="flex-1 truncate text-xs">{topic}</span>
                  <span className="text-xs text-gray-600 whitespace-nowrap">{tStats.solved}/{tStats.total}</span>
                  <div className="w-6 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
