import { useState } from 'react';
import { lessons } from '../data/lessons';
import CodeBlock from './CodeBlock';

interface LessonPanelProps {
  topic: string;
}

export default function LessonPanel({ topic }: LessonPanelProps) {
  const lesson = lessons[topic];
  const [expanded, setExpanded] = useState(true);

  if (!lesson) return null;

  return (
    <div className="bg-gray-900 border border-blue-900/40 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold text-lg">i</span>
          <h3 className="text-white font-semibold">Pattern Guide: {topic}</h3>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
          {/* Overview */}
          <div>
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Overview</h4>
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{lesson.overview}</p>
          </div>

          {/* Key Patterns */}
          <div>
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Key Patterns</h4>
            <ul className="space-y-1.5">
              {lesson.keyPatterns.map((pattern, i) => (
                <li key={i} className="text-sm text-gray-400 flex gap-2">
                  <span className="text-blue-500 mt-0.5 shrink-0">&bull;</span>
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Code Template */}
          <div>
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Python Template</h4>
            <CodeBlock code={lesson.template} />
          </div>

          {/* Complexity */}
          <div>
            <h4 className="text-sm font-semibold text-blue-300 mb-1">Complexity</h4>
            <p className="text-sm text-gray-400">{lesson.complexity}</p>
          </div>

          {/* Common Mistakes */}
          <div>
            <h4 className="text-sm font-semibold text-red-300 mb-2">Common Mistakes</h4>
            <ul className="space-y-1">
              {lesson.commonMistakes.map((mistake, i) => (
                <li key={i} className="text-sm text-gray-400 flex gap-2">
                  <span className="text-red-500 mt-0.5 shrink-0">&times;</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div>
            <h4 className="text-sm font-semibold text-emerald-300 mb-2">Tips</h4>
            <ul className="space-y-1">
              {lesson.tips.map((tip, i) => (
                <li key={i} className="text-sm text-gray-400 flex gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">&#10003;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Memorization Techniques */}
          {lesson.memorization && (
            <div>
              <h4 className="text-sm font-semibold text-purple-300 mb-2">Memorization Techniques</h4>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line bg-purple-950/20 border border-purple-900/30 rounded-md p-3">
                {lesson.memorization}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
