import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Topic, ProblemProgress } from '../types';
import { uniqueProblems } from '../data/problems';
import ProblemCard from './ProblemCard';

interface StudySessionProps {
  topic: Topic | null;
  getProgress: (id: number) => ProblemProgress;
  getStudyQueue: (topic: Topic | null, count?: number) => number[];
  dueCount: number;
}

export default function StudySession({
  topic,
  getProgress,
  getStudyQueue,
  dueCount,
}: StudySessionProps) {
  const [sessionSize, setSessionSize] = useState(10);
  const [sessionStarted, setSessionStarted] = useState(false);

  const queue = useMemo(
    () => getStudyQueue(topic, sessionSize),
    [topic, sessionSize, getStudyQueue]
  );

  const problemsMap = useMemo(() => {
    const map: Record<number, typeof uniqueProblems[0]> = {};
    for (const p of uniqueProblems) map[p.id] = p;
    return map;
  }, []);

  if (!sessionStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Study Session</h2>
          <p className="text-gray-400 text-sm mt-1">
            {topic ? `Topic: ${topic}` : 'All topics'}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-white font-medium">Problems due for review</p>
              <p className="text-3xl font-bold text-red-400">{dueCount}</p>
            </div>
            <div className="ml-8">
              <p className="text-white font-medium">Queue size</p>
              <p className="text-3xl font-bold text-blue-400">{queue.length}</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Session size</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20, 30].map(n => (
                <button
                  key={n}
                  onClick={() => setSessionSize(n)}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    sessionSize === n
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Prioritizes: due reviews &rarr; unseen easy &rarr; unseen medium &rarr; unseen hard
          </p>

          <button
            onClick={() => setSessionStarted(true)}
            disabled={queue.length === 0}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {queue.length > 0 ? `Start (${queue.length} problems)` : 'No problems available'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Study Session</h2>
          <p className="text-sm text-gray-400">
            {topic ? topic : 'All topics'} &middot; {queue.length} problems
          </p>
        </div>
        <button
          onClick={() => setSessionStarted(false)}
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md transition-colors"
        >
          End Session
        </button>
      </div>

      <p className="text-xs text-gray-500">Click a problem to study it. Rate your confidence on the problem page.</p>

      <div className="space-y-2">
        {queue.map((id, i) => {
          const problem = problemsMap[id];
          if (!problem) return null;
          return (
            <div key={id} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-mono w-6 text-right shrink-0">{i + 1}.</span>
              <div className="flex-1">
                <ProblemCard problem={problem} progress={getProgress(id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
