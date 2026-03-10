import { useState } from 'react';
import { lessons, TopicLesson } from '../data/lessons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import CodeBlock from './CodeBlock';

const DSA_CATEGORIES = [
  {
    name: 'Data Structures',
    topics: [
      'Arrays & Hashing',
      'Stack',
      'Linked List',
      'Trees',
      'Tries',
      'Heap / Priority Queue',
      'Union Find',
      'Monotonic Stack',
      'Monotonic Queue',
      'Segment Tree',
      'Binary Indexed Tree',
    ],
  },
  {
    name: 'Algorithms & Techniques',
    topics: [
      'Two Pointers',
      'Sliding Window',
      'Binary Search',
      'Backtracking',
      'Graphs',
      'Dynamic Programming',
      'Greedy',
      'Divide & Conquer',
      'String Algorithms',
      'Minimum Spanning Tree',
      'Topological Sort',
    ],
  },
  {
    name: 'Specialized Topics',
    topics: [
      'Intervals',
      'Math & Geometry',
      'Bit Manipulation',
    ],
  },
  {
    name: 'Concurrency',
    topics: [
      'Concurrency',
    ],
  },
];

function LanguageToggle({ language, setLanguage }: {
  language: 'python' | 'javascript';
  setLanguage: (lang: 'python' | 'javascript') => void;
}) {
  return (
    <div className="inline-flex rounded-md bg-gray-800 p-0.5">
      <button
        onClick={() => setLanguage('python')}
        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
          language === 'python'
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        Python
      </button>
      <button
        onClick={() => setLanguage('javascript')}
        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
          language === 'javascript'
            ? 'bg-yellow-600 text-white'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        JavaScript
      </button>
    </div>
  );
}

function TopicCard({ lesson, language, setLanguage }: {
  lesson: TopicLesson;
  language: 'python' | 'javascript';
  setLanguage: (lang: 'python' | 'javascript') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'template' | 'memorization' | 'overview'>('template');

  const showJs = language === 'javascript' && lesson.jsTemplate;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors text-left"
      >
        <h3 className="text-white font-semibold">{lesson.topic}</h3>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!expanded && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-500 line-clamp-2">{lesson.overview.split('\n')[0]}</p>
        </div>
      )}

      {expanded && (
        <div className="border-t border-gray-800">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {(['template', 'memorization', 'overview'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-xs font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-950/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'memorization' ? 'Memorize' : tab}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4">
            {activeTab === 'overview' && (
              <>
                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{lesson.overview}</p>

                <div>
                  <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">Key Patterns</h4>
                  <ul className="space-y-1.5">
                    {lesson.keyPatterns.map((pattern, i) => (
                      <li key={i} className="text-sm text-gray-400 flex gap-2">
                        <span className="text-blue-500 mt-0.5 shrink-0">&bull;</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-red-300 uppercase tracking-wider mb-2">Common Mistakes</h4>
                  <ul className="space-y-1">
                    {lesson.commonMistakes.map((mistake, i) => (
                      <li key={i} className="text-sm text-gray-400 flex gap-2">
                        <span className="text-red-500 mt-0.5 shrink-0">&times;</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">Tips</h4>
                  <ul className="space-y-1">
                    {lesson.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-400 flex gap-2">
                        <span className="text-emerald-500 mt-0.5 shrink-0">&#10003;</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Complexity</h4>
                  <p className="text-sm text-gray-500">{lesson.complexity}</p>
                </div>
              </>
            )}

            {activeTab === 'template' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                    {showJs ? 'JavaScript' : 'Python'} Templates
                  </h4>
                  <LanguageToggle language={language} setLanguage={setLanguage} />
                </div>
                <CodeBlock
                  code={showJs ? lesson.jsTemplate! : lesson.template}
                  language={showJs ? 'javascript' : 'python'}
                />
                {language === 'javascript' && !lesson.jsTemplate && (
                  <p className="text-xs text-yellow-500/70 mt-2 italic">
                    JavaScript template not available for this topic. Showing Python.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'memorization' && (
              <div>
                {lesson.memorization ? (
                  <div className="bg-gray-800/40 border border-gray-700/40 rounded-md p-4">
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line font-mono">
                      {lesson.memorization}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Memorization techniques coming soon for this topic.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AllMnemonics() {
  const allTopics = DSA_CATEGORIES.flatMap(c => c.topics);

  return (
    <div className="space-y-6">
      {/* Table of contents */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Jump to topic</h3>
        <div className="flex flex-wrap gap-2">
          {allTopics.map(name => {
            const lesson = lessons[name];
            if (!lesson?.memorization) return null;
            return (
              <a
                key={name}
                href={`#mnemonic-${name.replace(/[^a-zA-Z0-9]/g, '-')}`}
                className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 transition-colors"
              >
                {name}
              </a>
            );
          })}
        </div>
      </div>

      {/* All mnemonics */}
      {DSA_CATEGORIES.map(category => {
        const topicsWithMnemonics = category.topics.filter(
          name => lessons[name]?.memorization
        );
        if (!topicsWithMnemonics.length) return null;

        return (
          <div key={category.name}>
            <h2 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">
              {category.name}
            </h2>
            <div className="space-y-4">
              {topicsWithMnemonics.map(topicName => {
                const lesson = lessons[topicName]!;
                return (
                  <div
                    key={topicName}
                    id={`mnemonic-${topicName.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4 scroll-mt-4"
                  >
                    <h3 className="text-sm font-bold text-gray-300 mb-2">{lesson.topic}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line font-mono">
                      {lesson.memorization}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DSAReference() {
  const [language, setLanguage] = useLocalStorage<'python' | 'javascript'>('lc-language', 'python');
  const [view, setView] = useState<'topics' | 'mnemonics'>('topics');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">DSA Reference Guide</h1>
            <p className="text-gray-400 mt-1 text-sm">
              {view === 'topics'
                ? 'All data structures, algorithms, and concurrency patterns with templates, intuition, and memorization techniques.'
                : 'All memorization mnemonics in one page.'}
            </p>
          </div>
          {view === 'topics' && (
            <LanguageToggle language={language} setLanguage={setLanguage} />
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setView('topics')}
            className={`text-xs px-3 py-1.5 rounded transition-colors ${
              view === 'topics'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            By Topic
          </button>
          <button
            onClick={() => setView('mnemonics')}
            className={`text-xs px-3 py-1.5 rounded transition-colors ${
              view === 'mnemonics'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Mnemonics
          </button>
        </div>
      </div>

      {view === 'mnemonics' ? (
        <AllMnemonics />
      ) : (
        <>
          {/* Quick reference card */}
          <div className="bg-gradient-to-r from-blue-950/40 to-gray-900/40 border border-blue-900/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">Quick Decision Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400">
              <div><span className="text-blue-400">Find pair with sum?</span> → Hash Map</div>
              <div><span className="text-blue-400">Sorted array pair?</span> → Two Pointers</div>
              <div><span className="text-blue-400">Subarray/substring?</span> → Sliding Window</div>
              <div><span className="text-blue-400">Nested/matching?</span> → Stack</div>
              <div><span className="text-blue-400">Min/max feasible?</span> → Binary Search on Answer</div>
              <div><span className="text-blue-400">Pointer dance?</span> → Linked List</div>
              <div><span className="text-blue-400">Hierarchical?</span> → Tree (DFS/BFS)</div>
              <div><span className="text-blue-400">Prefix lookup?</span> → Trie</div>
              <div><span className="text-blue-400">Top-K / stream?</span> → Heap</div>
              <div><span className="text-blue-400">All combinations?</span> → Backtracking</div>
              <div><span className="text-blue-400">Shortest path?</span> → BFS / Dijkstra</div>
              <div><span className="text-blue-400">Overlapping subproblems?</span> → DP</div>
              <div><span className="text-blue-400">Local optimal = global?</span> → Greedy</div>
              <div><span className="text-blue-400">Ranges/schedules?</span> → Intervals (sort first)</div>
              <div><span className="text-blue-400">Find unique / toggle?</span> → Bit Manipulation (XOR)</div>
              <div><span className="text-blue-400">Thread ordering?</span> → Semaphore / Event</div>
            </div>
          </div>

          {/* Categories */}
          {DSA_CATEGORIES.map(category => (
            <div key={category.name}>
              <h2 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">
                {category.name}
              </h2>
              <div className="space-y-3">
                {category.topics.map(topicName => {
                  const lesson = lessons[topicName];
                  if (!lesson) return null;
                  return (
                    <TopicCard
                      key={topicName}
                      lesson={lesson}
                      language={language}
                      setLanguage={setLanguage}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
