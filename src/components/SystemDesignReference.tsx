import { useState } from 'react';
import { Link } from 'react-router-dom';
import { solutionMap, ProblemSolution } from '../data/solutions';
import { systemDesignProblems } from '../data/problems-system-design';
import CodeBlock from './CodeBlock';
import ReactMarkdown from 'react-markdown';

const SD_CATEGORIES = [
  {
    name: 'Core System Design Problems',
    ids: [9001, 9002, 9003, 9004, 9005],
  },
  {
    name: 'Storage & Data Systems',
    ids: [9006, 9007, 9008, 9009, 9010],
  },
  {
    name: 'E-Commerce & Marketplace',
    ids: [9011, 9012, 9013, 9014, 9015],
  },
  {
    name: 'Infrastructure & Platform',
    ids: [9016, 9017, 9018, 9019, 9020],
  },
  {
    name: 'Social & Real-Time Systems',
    ids: [9021, 9022, 9023, 9024],
  },
  {
    name: 'Data & Analytics',
    ids: [9025, 9026, 9027, 9028, 9029, 9030],
  },
];

function MarkdownContent({ content, className }: { content: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-blue-300 mt-4 mb-2 pb-1 border-b border-gray-800">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-200 mt-3 mb-1">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-gray-400 leading-relaxed mb-2">{children}</p>,
          ul: ({ children }) => <ul className="space-y-1 mb-3 ml-1">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1 mb-3 ml-1 list-decimal list-inside">{children}</ol>,
          li: ({ children }) => (
            <li className="text-sm text-gray-400 flex gap-2">
              <span className="text-blue-500 mt-0.5 shrink-0">&bull;</span>
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => <strong className="text-gray-200 font-semibold">{children}</strong>,
          em: ({ children }) => <em className="text-gray-300">{children}</em>,
          code: ({ className: codeClassName, children }) => {
            const isBlock = codeClassName?.startsWith('language-');
            if (isBlock) {
              const lang = codeClassName?.replace('language-', '') || 'javascript';
              return <CodeBlock code={String(children).trim()} language={lang} />;
            }
            return (
              <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-blue-500 pl-3 my-2 text-gray-400 italic text-sm">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-xs text-gray-400 border border-gray-800 rounded">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-800/50">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 text-left text-gray-300 font-semibold border border-gray-800">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 border border-gray-800">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function ProblemCard({ problemId }: { problemId: number }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'code' | 'tradeoffs' | 'exercises'>('architecture');

  const problem = systemDesignProblems.find(p => p.id === problemId);
  const solution = solutionMap[problemId];

  if (!problem || !solution) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 font-mono w-8">#{problemId - 9000}</span>
          <h3 className="text-white font-semibold">{problem.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/problem/${problemId}`}
            onClick={e => e.stopPropagation()}
            className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-950/30 hover:bg-blue-950/50 transition-colors"
          >
            Practice
          </Link>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-800">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {([
              { key: 'architecture', label: 'Architecture' },
              { key: 'code', label: 'Code' },
              { key: 'tradeoffs', label: 'Trade-offs' },
              { key: 'exercises', label: 'Exercises' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? tab.key === 'tradeoffs'
                      ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-950/20'
                      : tab.key === 'code'
                      ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-950/20'
                      : 'text-blue-400 border-b-2 border-blue-400 bg-blue-950/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4">
            {activeTab === 'architecture' && (
              <>
                {/* Intuition */}
                {solution.intuition && (
                  <div className="bg-gradient-to-r from-purple-950/30 to-gray-900/30 border border-purple-900/30 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Key Insight</h4>
                    <MarkdownContent content={solution.intuition} />
                  </div>
                )}

                {/* Requirements */}
                {solution.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">Requirements & Capacity</h4>
                    <MarkdownContent content={solution.description} />
                  </div>
                )}

                {/* Approach / Architecture */}
                {solution.approach && (
                  <div>
                    <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">Architecture & Components</h4>
                    <MarkdownContent content={solution.approach} />
                  </div>
                )}
              </>
            )}

            {activeTab === 'code' && (
              <div className="space-y-4">
                {solution.code && (
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                      Core Implementation (JavaScript)
                    </h4>
                    <CodeBlock code={solution.code} language="javascript" />
                  </div>
                )}
                {solution.jsCode && (
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                      Additional Implementation
                    </h4>
                    <CodeBlock code={solution.jsCode} language="javascript" />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tradeoffs' && (
              <>
                {solution.explanation && (
                  <div>
                    <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">Scaling & Trade-offs</h4>
                    <MarkdownContent content={solution.explanation} />
                  </div>
                )}

                {/* Performance characteristics */}
                <div className="grid grid-cols-2 gap-3">
                  {solution.timeComplexity && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                      <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Performance</h5>
                      <p className="text-xs text-gray-300">{solution.timeComplexity}</p>
                    </div>
                  )}
                  {solution.spaceComplexity && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                      <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Storage</h5>
                      <p className="text-xs text-gray-300">{solution.spaceComplexity}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'exercises' && (
              <div className="space-y-3">
                {solution.examples && (
                  <div>
                    <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">Design Exercises</h4>
                    <MarkdownContent content={solution.examples} />
                  </div>
                )}
                {solution.hints && solution.hints.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">Expert Tips & Common Pitfalls</h4>
                    <ul className="space-y-2">
                      {solution.hints.map((hint, i) => (
                        <li key={i} className="text-sm text-gray-400 flex gap-2 bg-gray-800/30 rounded-lg p-3">
                          <span className="text-emerald-500 mt-0.5 shrink-0 font-bold">{i + 1}.</span>
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SystemDesignReference() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">System Design Reference</h1>
        <p className="text-gray-400 mt-1 text-sm">
          30 complete system design problems with architecture, JavaScript implementations, scaling strategies, and trade-off analysis.
        </p>
      </div>

      {/* Quick Decision Guide */}
      <div className="bg-gradient-to-r from-indigo-950/40 to-gray-900/40 border border-indigo-900/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-indigo-300 mb-3">System Design Interview Framework</h3>

        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2 mb-1">Step 1: Requirements (5 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
          <div><span className="text-indigo-400">Functional requirements?</span> → What should the system do?</div>
          <div><span className="text-indigo-400">Non-functional requirements?</span> → Scale, latency, availability, consistency</div>
          <div><span className="text-indigo-400">Users and scale?</span> → DAU, MAU, peak QPS</div>
          <div><span className="text-indigo-400">Constraints?</span> → Budget, region, compliance</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Step 2: Capacity Estimation (5 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
          <div><span className="text-indigo-400">QPS?</span> → DAU × actions/day ÷ 86,400</div>
          <div><span className="text-indigo-400">Storage?</span> → items/day × item_size × retention</div>
          <div><span className="text-indigo-400">Bandwidth?</span> → QPS × avg_response_size</div>
          <div><span className="text-indigo-400">Memory (cache)?</span> → QPS × response_size × cache_duration</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Step 3: High-Level Design (10 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
          <div><span className="text-indigo-400">Read-heavy system?</span> → Cache + Read Replicas + CDN</div>
          <div><span className="text-indigo-400">Write-heavy system?</span> → Message Queue + Async Processing</div>
          <div><span className="text-indigo-400">Real-time delivery?</span> → WebSockets + Pub/Sub</div>
          <div><span className="text-indigo-400">Search functionality?</span> → Inverted Index (Elasticsearch)</div>
          <div><span className="text-indigo-400">Geospatial queries?</span> → Geohash / QuadTree + Redis GEO</div>
          <div><span className="text-indigo-400">Distributed transactions?</span> → Saga Pattern + Compensating Actions</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Step 4: Key Trade-offs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
          <div><span className="text-indigo-400">Consistency vs Availability?</span> → CAP theorem (pick CP or AP)</div>
          <div><span className="text-indigo-400">Push vs Pull?</span> → Fan-out on write vs fan-out on read</div>
          <div><span className="text-indigo-400">SQL vs NoSQL?</span> → ACID transactions vs horizontal scale</div>
          <div><span className="text-indigo-400">Sync vs Async?</span> → Immediate response vs eventual processing</div>
          <div><span className="text-indigo-400">Cache invalidation?</span> → TTL vs event-driven vs write-through</div>
          <div><span className="text-indigo-400">Monolith vs Microservices?</span> → Simplicity vs independent scaling</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Capacity Benchmarks</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-xs text-gray-400">
          <div><span className="text-indigo-400">Web server:</span> ~1K QPS</div>
          <div><span className="text-indigo-400">DB reads:</span> ~10K QPS</div>
          <div><span className="text-indigo-400">DB writes:</span> ~1K QPS</div>
          <div><span className="text-indigo-400">Redis:</span> ~100K QPS</div>
          <div><span className="text-indigo-400">Kafka:</span> ~1M msg/sec</div>
          <div><span className="text-indigo-400">1 day:</span> 86,400 sec ≈ 100K sec</div>
        </div>
      </div>

      {/* Categories */}
      {SD_CATEGORIES.map(category => (
        <div key={category.name}>
          <h2 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">
            {category.name}
          </h2>
          <div className="space-y-3">
            {category.ids.map(id => (
              <ProblemCard key={id} problemId={id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
