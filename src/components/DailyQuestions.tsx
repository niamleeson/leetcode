import { Link } from 'react-router-dom';
import { dailyQuestions, formatDailyDate } from '../data/daily-questions';
import { uniqueProblems } from '../data/problems';

const problemsById = new Map(uniqueProblems.map(problem => [problem.id, problem]));

const difficultyColors = {
  Easy: 'text-emerald-400 light:text-emerald-700 bg-emerald-400/10 border-emerald-400/20',
  Medium: 'text-yellow-400 light:text-yellow-700 bg-yellow-400/10 border-yellow-400/20',
  Hard: 'text-red-400 light:text-red-700 bg-red-400/10 border-red-400/20',
};

export default function DailyQuestions() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-white light:text-gray-900">Daily Questions</h1>
        <p className="mt-1 text-sm text-gray-400 light:text-gray-600">{dailyQuestions.length} questions · Newest first</p>
      </header>

      <ol aria-label="Daily questions" className="space-y-2">
        {dailyQuestions.map(({ date, problemId }) => {
          const problem = problemsById.get(problemId)!;
          return (
            <li key={date}>
              <Link
                to={`/problem/${problem.id}?daily=${date}`}
                className="group flex min-h-20 items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700 hover:bg-gray-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 light:border-gray-200 light:bg-white light:hover:border-gray-300 light:hover:bg-gray-100"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 light:text-gray-600">
                    <time dateTime={date}>{formatDailyDate(date)}</time>
                    <span className="font-mono text-gray-500 light:text-gray-500">#{problem.id}</span>
                  </div>
                  <h2 className="mt-1 break-words font-medium leading-6 text-gray-200 group-hover:text-white light:text-gray-800 light:group-hover:text-gray-900">{problem.title}</h2>
                </div>
                <span className={`shrink-0 rounded border px-2 py-0.5 text-xs ${difficultyColors[problem.difficulty]}`}>{problem.difficulty}</span>
                <svg aria-hidden="true" className="hidden h-4 w-4 shrink-0 text-gray-500 group-hover:text-gray-300 sm:block light:group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
