import { Link } from 'react-router-dom';
import { Topic } from '../types';
import { uniqueProblems, STUDY_ORDER } from '../data/problems';
import { topicToSlug } from '../App';
import ProgressBar from './ProgressBar';

interface DashboardProps {
  stats: {
    total: number;
    solved: number;
    attempted: number;
    unseen: number;
    byDifficulty: Record<string, { total: number; solved: number; attempted: number }>;
  };
  dueCount: number;
  solvedToday: number;
  dailyGoal: number;
  setDailyGoal: (n: number) => void;
  getTopicStats: (topic: Topic) => { total: number; solved: number; attempted: number; unseen: number };
}

export default function Dashboard({
  stats,
  dueCount,
  solvedToday,
  dailyGoal,
  setDailyGoal,
  getTopicStats,
}: DashboardProps) {
  const streak = solvedToday >= dailyGoal;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
        <p className="text-gray-400 text-sm">
          {uniqueProblems.length} problems across {STUDY_ORDER.length} topics
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Problems" value={stats.total} color="text-white" />
        <StatCard label="Solved" value={stats.solved} color="text-emerald-400" />
        <StatCard label="Due for Review" value={dueCount} color="text-red-400" />
        <StatCard
          label="Today"
          value={`${solvedToday}/${dailyGoal}`}
          color={streak ? 'text-emerald-400' : 'text-yellow-400'}
        />
      </div>

      {/* Overall progress */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Overall Progress</h3>
        <ProgressBar solved={stats.solved} attempted={stats.attempted} total={stats.total} />
        <p className="text-gray-400 text-sm mt-2">
          {Math.round((stats.solved / stats.total) * 100)}% complete
        </p>
      </div>

      {/* Difficulty breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {(['Easy', 'Medium', 'Hard'] as const).map(diff => {
          const d = stats.byDifficulty[diff];
          const colors = {
            Easy: 'border-emerald-400/30',
            Medium: 'border-yellow-400/30',
            Hard: 'border-red-400/30',
          };
          return (
            <div key={diff} className={`bg-gray-900 border ${colors[diff]} rounded-lg p-4`}>
              <h4 className="text-sm text-gray-400 mb-1">{diff}</h4>
              <p className="text-xl font-bold text-white">
                {d.solved}<span className="text-gray-500 text-sm">/{d.total}</span>
              </p>
              <ProgressBar solved={d.solved} attempted={d.attempted} total={d.total} showLabels={false} height="h-1.5" />
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link
          to="/study"
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Start Study Session
          {dueCount > 0 && ` (${dueCount} due)`}
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-gray-400">Daily goal:</label>
          <select
            value={dailyGoal}
            onChange={e => setDailyGoal(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {[5, 10, 15, 20, 25, 30].map(n => (
              <option key={n} value={n}>{n} problems</option>
            ))}
          </select>
        </div>
      </div>

      {/* Topic grid */}
      <div>
        <h3 className="text-white font-semibold mb-3">Topics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {STUDY_ORDER.map(topic => {
            const ts = getTopicStats(topic as Topic);
            const pct = ts.total > 0 ? Math.round((ts.solved / ts.total) * 100) : 0;
            return (
              <Link
                key={topic}
                to={`/topic/${topicToSlug(topic)}`}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg p-3 text-left transition-colors group"
              >
                <h4 className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                  {topic}
                </h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold text-white">{ts.solved}</span>
                  <span className="text-xs text-gray-500">/ {ts.total}</span>
                  <span className="text-xs text-gray-600 ml-auto">{pct}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
