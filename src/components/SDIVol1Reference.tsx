import { useState } from 'react';
import { solutionMap } from '../data/solutions';
import { sdiVol1Problems } from '../data/problems-sdi-vol1';
import { sdiVol2Problems } from '../data/problems-sdi-vol2';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const allProblems = [...sdiVol1Problems, ...sdiVol2Problems];

const SDI_VOL1_CATEGORIES = [
  {
    name: 'Foundational Concepts',
    ids: [9101, 9102, 9103],
  },
  {
    name: 'Core Infrastructure',
    ids: [9104, 9105, 9106, 9107],
  },
  {
    name: 'Web & Data Systems',
    ids: [9108, 9109, 9110, 9111],
  },
  {
    name: 'Communication, Search & Storage',
    ids: [9112, 9113, 9114, 9115],
  },
];

const SDI_VOL2_CATEGORIES = [
  {
    name: 'Location & Maps',
    ids: [9201, 9202, 9203],
  },
  {
    name: 'Infrastructure & Data Processing',
    ids: [9204, 9205, 9206],
  },
  {
    name: 'Booking, Email & Storage',
    ids: [9207, 9208, 9209],
  },
  {
    name: 'Gaming, Payments & Finance',
    ids: [9210, 9211, 9212, 9213],
  },
];

function MarkdownContent({ content, className }: { content: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
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
          code: ({ className: codeClassName, children, ...props }) => {
            const hasLang = codeClassName?.startsWith('language-');
            const content = String(children);
            const isBlock = hasLang || content.includes('\n');
            if (isBlock) {
              const lang = hasLang ? codeClassName!.replace('language-', '') : 'text';
              return (
                <pre className="!bg-gray-950 !border !border-gray-800 !rounded-md !p-4 !text-xs overflow-x-auto !leading-relaxed !m-0 mb-3">
                  <code className={lang !== 'text' ? `language-${lang}` : 'text-gray-300 font-mono whitespace-pre'}>
                    {content.trim()}
                  </code>
                </pre>
              );
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
          hr: () => <hr className="border-gray-800 my-4" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function StepHeader({ step, title, time }: { step: number; title: string; time: string }) {
  return (
    <div className="flex items-center gap-3 mt-6 first:mt-0 mb-3">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold shrink-0">
        {step}
      </span>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <span className="text-xs text-gray-600 ml-auto">{time}</span>
    </div>
  );
}

function ChapterCard({ problemId }: { problemId: number }) {
  const [expanded, setExpanded] = useState(false);

  const problem = allProblems.find(p => p.id === problemId);
  const solution = solutionMap[problemId];

  if (!problem || !solution) return null;

  const chapterNum = problemId >= 9200 ? problemId - 9200 : problemId - 9100;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 font-mono w-12">Ch {chapterNum}</span>
          <h3 className="text-white font-semibold">{problem.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded ${
            problem.difficulty === 'Easy' ? 'bg-emerald-950/50 text-emerald-400' :
            problem.difficulty === 'Medium' ? 'bg-yellow-950/50 text-yellow-400' :
            'bg-red-950/50 text-red-400'
          }`}>
            {problem.difficulty}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-800 p-4 space-y-1">
          {/* Key Insight */}
          {solution.intuition && (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 mb-4">
              <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">Key Insight</h4>
              <MarkdownContent content={solution.intuition} />
            </div>
          )}

          {/* Step 1: Requirements */}
          <StepHeader step={1} title="Understand the Problem & Establish Scope" time="3-10 min" />
          {solution.description && <MarkdownContent content={solution.description} />}

          <hr className="border-gray-800 my-5" />

          {/* Step 2: High-Level Design */}
          <StepHeader step={2} title="Propose High-Level Design & Get Buy-In" time="10-15 min" />
          {solution.approach && <MarkdownContent content={solution.approach} />}
          {solution.code && <MarkdownContent content={solution.code} />}

          <hr className="border-gray-800 my-5" />

          {/* Step 3: Deep Dive */}
          <StepHeader step={3} title="Design Deep Dive" time="10-25 min" />
          {solution.jsCode && <MarkdownContent content={solution.jsCode} />}

          <hr className="border-gray-800 my-5" />

          {/* Step 4: Wrap Up */}
          <StepHeader step={4} title="Wrap Up" time="3-5 min" />
          {solution.explanation && <MarkdownContent content={solution.explanation} />}
          {solution.examples && (
            <div className="mt-4">
              <MarkdownContent content={solution.examples} />
            </div>
          )}
          {solution.hints && solution.hints.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">Common Pitfalls</h4>
              <ul className="space-y-2">
                {solution.hints.map((hint, i) => (
                  <li key={i} className="text-sm text-gray-400 flex gap-2 bg-gray-800/30 rounded-lg p-3">
                    <span className="text-blue-500 mt-0.5 shrink-0 font-bold">{i + 1}.</span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SDIVol1Reference() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">System Design Interview — Book Notes</h1>
        <p className="text-gray-400 mt-1 text-sm">
          28 chapters from Alex Xu's System Design Interview Vol. 1 & Vol. 2 — rewritten with clear explanations, architecture diagrams, and the 4-step interview framework.
        </p>
      </div>

      {/* Quick Decision Guide */}
      <div className="bg-gradient-to-r from-blue-950/40 to-gray-900/40 border border-blue-900/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-300 mb-3">System Design Interview Framework</h3>

        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2 mb-1">Step 1: Understand the Problem & Establish Scope (3-10 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
          <div><span className="text-blue-400">Ask clarifying questions</span> → Don't jump to a solution</div>
          <div><span className="text-blue-400">Functional requirements?</span> → What should the system do?</div>
          <div><span className="text-blue-400">Non-functional requirements?</span> → Scale, latency, availability, consistency</div>
          <div><span className="text-blue-400">Users and scale?</span> → DAU, QPS, storage, bandwidth estimates</div>
          <div><span className="text-blue-400">Constraints?</span> → Budget, region, existing tech stack</div>
          <div><span className="text-blue-400">Back-of-envelope</span> → DAU × actions/day ÷ 86,400 = QPS</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Step 2: Propose High-Level Design & Get Buy-In (10-15 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
          <div><span className="text-blue-400">Draw box diagrams</span> → Clients, APIs, servers, DB, cache, CDN, queues</div>
          <div><span className="text-blue-400">Define API endpoints</span> → RESTful contracts for core operations</div>
          <div><span className="text-blue-400">Data model & schema</span> → Tables, key-value pairs, relationships</div>
          <div><span className="text-blue-400">Walk through use cases</span> → Trace the flow through your diagram</div>
          <div><span className="text-blue-400">Get buy-in</span> → Collaborate with interviewer before deep dive</div>
          <div><span className="text-blue-400">Read vs Write heavy?</span> → Cache + Replicas vs Queue + Async</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Step 3: Design Deep Dive (10-25 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
          <div><span className="text-blue-400">Prioritize components</span> → Focus on what the interviewer cares about</div>
          <div><span className="text-blue-400">Drill into bottlenecks</span> → Where does the system break at scale?</div>
          <div><span className="text-blue-400">Key algorithms</span> → Hashing, sharding, replication strategies</div>
          <div><span className="text-blue-400">Data partitioning</span> → How to shard, consistent hashing</div>
          <div><span className="text-blue-400">Failure handling</span> → Replication, failover, circuit breakers</div>
          <div><span className="text-blue-400">Time management</span> → Don't get lost in one component</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Step 4: Wrap Up (3-5 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
          <div><span className="text-blue-400">Identify bottlenecks</span> → Never say "it's perfect"</div>
          <div><span className="text-blue-400">Error cases</span> → Server failure, network loss, data corruption</div>
          <div><span className="text-blue-400">Operational concerns</span> → Monitoring, alerting, rollout strategy</div>
          <div><span className="text-blue-400">Next scale curve</span> → 1M → 10M users: what changes?</div>
          <div><span className="text-blue-400">Recap your design</span> → Refresh interviewer's memory</div>
          <div><span className="text-blue-400">Trade-offs made</span> → Consistency vs availability, push vs pull</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Capacity Benchmarks</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-xs text-gray-400">
          <div><span className="text-blue-400">Web server:</span> ~1K QPS</div>
          <div><span className="text-blue-400">DB reads:</span> ~10K QPS</div>
          <div><span className="text-blue-400">DB writes:</span> ~1K QPS</div>
          <div><span className="text-blue-400">Redis:</span> ~100K QPS</div>
          <div><span className="text-blue-400">Kafka:</span> ~1M msg/sec</div>
          <div><span className="text-blue-400">1 day:</span> 86,400 sec ≈ 100K sec</div>
        </div>
      </div>

      {/* Volume 1 */}
      <h2 className="text-xl font-bold text-white border-b border-blue-900/50 pb-2">
        Volume 1 — An Insider's Guide
      </h2>
      {SDI_VOL1_CATEGORIES.map(category => (
        <div key={category.name}>
          <h2 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">
            {category.name}
          </h2>
          <div className="space-y-3">
            {category.ids.map(id => (
              <ChapterCard key={id} problemId={id} />
            ))}
          </div>
        </div>
      ))}

      {/* Volume 2 */}
      <h2 className="text-xl font-bold text-white border-b border-blue-900/50 pb-2 mt-12">
        Volume 2 — An Insider's Guide
      </h2>
      {SDI_VOL2_CATEGORIES.map(category => (
        <div key={category.name}>
          <h2 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">
            {category.name}
          </h2>
          <div className="space-y-3">
            {category.ids.map(id => (
              <ChapterCard key={id} problemId={id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
