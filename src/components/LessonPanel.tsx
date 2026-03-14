import { useState } from 'react';
import { lessons } from '../data/lessons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import CodeBlock from './CodeBlock';
import GlossaryHighlighter from './GlossaryHighlighter';

function WalkthroughSection({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 border border-sky-900/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-sky-950/20 hover:bg-sky-950/30 transition-colors cursor-pointer"
      >
        <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Step-by-Step Walkthrough</span>
        <span className="text-sky-600 text-xs">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <pre className="p-4 text-xs text-sky-200/90 leading-relaxed whitespace-pre-wrap font-mono">{text}</pre>
      )}
    </div>
  );
}

interface LessonPanelProps {
  topic: string;
}

export default function LessonPanel({ topic }: LessonPanelProps) {
  const lesson = lessons[topic];
  const [expanded, setExpanded] = useState(true);
  const [language, setLanguage] = useLocalStorage<'python' | 'javascript'>('lc-language', 'javascript');

  if (!lesson) return null;

  const showJs = language === 'javascript' && lesson.jsTemplate;

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
            <GlossaryHighlighter text={lesson.overview} className="text-sm text-gray-400 leading-relaxed whitespace-pre-line" />
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
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-blue-300">
                {showJs ? 'JavaScript' : 'Python'} Template
              </h4>
              <div className="inline-flex rounded-md bg-gray-800 p-0.5">
                <button
                  onClick={() => setLanguage('javascript')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    language === 'javascript'
                      ? 'bg-yellow-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  JavaScript
                </button>
                <button
                  onClick={() => setLanguage('python')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    language === 'python'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Python
                </button>
              </div>
            </div>
            <CodeBlock
              code={showJs ? lesson.jsTemplate! : lesson.template}
              language={showJs ? 'javascript' : 'python'}
            />
            {language === 'javascript' && !lesson.jsTemplate && (
              <p className="text-xs text-yellow-500/70 mt-2 italic">
                JavaScript template not available. Showing Python.
              </p>
            )}
            {showJs && lesson.jsTemplateWalkthrough && (
              <WalkthroughSection text={lesson.jsTemplateWalkthrough} />
            )}
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
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Memorization Techniques</h4>
              <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-line bg-gray-800/40 border border-gray-700/40 rounded-md p-3">
                <GlossaryHighlighter text={lesson.memorization!} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
