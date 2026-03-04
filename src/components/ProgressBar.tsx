interface ProgressBarProps {
  solved: number;
  attempted: number;
  total: number;
  showLabels?: boolean;
  height?: string;
}

export default function ProgressBar({ solved, attempted, total, showLabels = true, height = 'h-3' }: ProgressBarProps) {
  const solvedPct = total > 0 ? (solved / total) * 100 : 0;
  const attemptedPct = total > 0 ? (attempted / total) * 100 : 0;

  return (
    <div>
      <div className={`w-full bg-gray-800 rounded-full ${height} overflow-hidden`}>
        <div className="h-full flex">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${solvedPct}%` }}
          />
          <div
            className="bg-yellow-500 transition-all duration-500"
            style={{ width: `${attemptedPct}%` }}
          />
        </div>
      </div>
      {showLabels && (
        <div className="flex gap-4 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {solved} solved
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
            {attempted} attempted
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-800 inline-block border border-gray-700" />
            {total - solved - attempted} remaining
          </span>
        </div>
      )}
    </div>
  );
}
