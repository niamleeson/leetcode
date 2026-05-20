import { useState } from 'react';
import { solutionMap } from '../data/solutions';
import { sdiVol2Problems } from '../data/problems-sdi-vol2';
import ReactMarkdown from 'react-markdown';

const SDI_V2_CATEGORIES = [
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
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-white light:text-gray-900 mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-blue-300 light:text-blue-700 mt-4 mb-2 pb-1 border-b border-gray-800 light:border-gray-200">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-200 light:text-gray-800 mt-3 mb-1">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-gray-400 light:text-gray-600 leading-relaxed mb-2">{children}</p>,
          ul: ({ children }) => <ul className="space-y-1 mb-3 ml-1">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1 mb-3 ml-1 list-decimal list-inside">{children}</ol>,
          li: ({ children }) => (
            <li className="text-sm text-gray-400 light:text-gray-600 flex gap-2">
              <span className="text-blue-500 mt-0.5 shrink-0">&bull;</span>
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => <strong className="text-gray-200 light:text-gray-800 font-semibold">{children}</strong>,
          em: ({ children }) => <em className="text-gray-300 light:text-gray-700">{children}</em>,
          code: ({ className: codeClassName, children, ...props }) => {
            const hasLang = codeClassName?.startsWith('language-');
            const content = String(children);
            const isBlock = hasLang || content.includes('\n');
            if (isBlock) {
              const lang = hasLang ? codeClassName!.replace('language-', '') : 'text';
              return (
                <pre className="!bg-gray-950 light:!bg-gray-50 !border !border-gray-800 light:!border-gray-200 !rounded-md !p-4 !text-xs overflow-x-auto !leading-relaxed !m-0 mb-3">
                  <code className={lang !== 'text' ? `language-${lang}` : 'text-gray-300 light:text-gray-700 font-mono whitespace-pre'}>
                    {content.trim()}
                  </code>
                </pre>
              );
            }
            return (
              <code className="bg-gray-800 light:bg-gray-100 text-blue-300 light:text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-blue-500 pl-3 my-2 text-gray-400 light:text-gray-600 italic text-sm">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-xs text-gray-400 light:text-gray-600 border border-gray-800 light:border-gray-200 rounded">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-800/50 light:bg-gray-100">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 text-left text-gray-300 light:text-gray-700 font-semibold border border-gray-800 light:border-gray-200">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 border border-gray-800 light:border-gray-200">{children}</td>,
          hr: () => <hr className="border-gray-800 light:border-gray-200 my-4" />,
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
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 light:bg-blue-100 text-blue-400 light:text-blue-700 text-xs font-bold shrink-0">
        {step}
      </span>
      <h4 className="text-sm font-semibold text-white light:text-gray-900">{title}</h4>
      <span className="text-xs text-gray-600 light:text-gray-500 ml-auto">{time}</span>
    </div>
  );
}

function ChapterCard({ problemId }: { problemId: number }) {
  const [expanded, setExpanded] = useState(false);

  const problem = sdiVol2Problems.find(p => p.id === problemId);
  const solution = solutionMap[problemId];

  if (!problem || !solution) return null;

  const chapterNum = problemId - 9200;

  return (
    <div className="bg-gray-900 light:bg-white border border-gray-800 light:border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 light:hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 light:text-gray-500 font-mono w-12">Ch {chapterNum}</span>
          <h3 className="text-white light:text-gray-900 font-semibold">{problem.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded ${
            problem.difficulty === 'Easy' ? 'bg-emerald-950/50 light:bg-emerald-50 text-emerald-400 light:text-emerald-700' :
            problem.difficulty === 'Medium' ? 'bg-yellow-950/50 light:bg-amber-50 text-yellow-400 light:text-yellow-700' :
            'bg-red-950/50 light:bg-red-50 text-red-400 light:text-red-700'
          }`}>
            {problem.difficulty}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 light:text-gray-500 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-800 light:border-gray-200 p-4 space-y-1">
          {solution.intuition && (
            <div className="bg-gray-800/40 light:bg-gray-100 border border-gray-700/50 light:border-gray-300 rounded-lg p-4 mb-4">
              <h4 className="text-xs font-semibold text-blue-300 light:text-blue-700 uppercase tracking-wider mb-2">Key Insight</h4>
              <MarkdownContent content={solution.intuition} />
            </div>
          )}

          <StepHeader step={1} title="Understand the Problem & Establish Scope" time="3-10 min" />
          {solution.description && <MarkdownContent content={solution.description} />}

          <hr className="border-gray-800 light:border-gray-200 my-5" />

          <StepHeader step={2} title="Propose High-Level Design & Get Buy-In" time="10-15 min" />
          {solution.approach && <MarkdownContent content={solution.approach} />}
          {solution.code && <MarkdownContent content={solution.code} />}

          <hr className="border-gray-800 light:border-gray-200 my-5" />

          <StepHeader step={3} title="Design Deep Dive" time="10-25 min" />
          {solution.jsCode && <MarkdownContent content={solution.jsCode} />}

          <hr className="border-gray-800 light:border-gray-200 my-5" />

          <StepHeader step={4} title="Wrap Up" time="3-5 min" />
          {solution.explanation && <MarkdownContent content={solution.explanation} />}
          {solution.examples && (
            <div className="mt-4">
              <MarkdownContent content={solution.examples} />
            </div>
          )}
          {solution.hints && solution.hints.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-blue-300 light:text-blue-700 uppercase tracking-wider mb-2">Common Pitfalls</h4>
              <ul className="space-y-2">
                {solution.hints.map((hint, i) => (
                  <li key={i} className="text-sm text-gray-400 light:text-gray-600 flex gap-2 bg-gray-800/30 light:bg-gray-100 rounded-lg p-3">
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

export default function SDIVol2Reference() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white light:text-gray-900">System Design Interview - Vol. 2</h1>
        <p className="text-gray-400 light:text-gray-600 mt-1 text-sm">
          13 advanced system design problems covering proximity services, distributed infrastructure, payments, and real-time systems — rewritten with clear explanations, architecture diagrams, and the 4-step interview framework.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-950/40 to-gray-900/40 light:from-blue-50 light:to-gray-50 border border-blue-900/30 light:border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-300 light:text-blue-700 mb-3">System Design Interview Framework</h3>

        <h4 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider mt-2 mb-1">Step 1: Understand the Problem & Establish Scope (3-10 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 light:text-gray-600 mb-3">
          <div><span className="text-blue-400 light:text-blue-700">Ask clarifying questions</span> → Don't jump to a solution</div>
          <div><span className="text-blue-400 light:text-blue-700">Functional requirements?</span> → What should the system do?</div>
          <div><span className="text-blue-400 light:text-blue-700">Non-functional requirements?</span> → Scale, latency, availability, consistency</div>
          <div><span className="text-blue-400 light:text-blue-700">Users and scale?</span> → DAU, QPS, storage, bandwidth estimates</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider mb-1">Step 2: Propose High-Level Design & Get Buy-In (10-15 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 light:text-gray-600 mb-3">
          <div><span className="text-blue-400 light:text-blue-700">Draw box diagrams</span> → Clients, APIs, servers, DB, cache, CDN, queues</div>
          <div><span className="text-blue-400 light:text-blue-700">Define API endpoints</span> → RESTful contracts for core operations</div>
          <div><span className="text-blue-400 light:text-blue-700">Data model & schema</span> → Tables, key-value pairs, relationships</div>
          <div><span className="text-blue-400 light:text-blue-700">Get buy-in</span> → Collaborate with interviewer before deep dive</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider mb-1">Step 3: Design Deep Dive (10-25 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 light:text-gray-600 mb-3">
          <div><span className="text-blue-400 light:text-blue-700">Prioritize components</span> → Focus on what the interviewer cares about</div>
          <div><span className="text-blue-400 light:text-blue-700">Drill into bottlenecks</span> → Where does the system break at scale?</div>
          <div><span className="text-blue-400 light:text-blue-700">Key algorithms</span> → Geohash, consistent hashing, event sourcing</div>
          <div><span className="text-blue-400 light:text-blue-700">Failure handling</span> → Idempotency, exactly-once, circuit breakers</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider mb-1">Step 4: Wrap Up (3-5 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 light:text-gray-600 mb-3">
          <div><span className="text-blue-400 light:text-blue-700">Identify bottlenecks</span> → Never say "it's perfect"</div>
          <div><span className="text-blue-400 light:text-blue-700">Error cases</span> → Server failure, network loss, data corruption</div>
          <div><span className="text-blue-400 light:text-blue-700">Operational concerns</span> → Monitoring, alerting, rollout strategy</div>
          <div><span className="text-blue-400 light:text-blue-700">Trade-offs made</span> → Consistency vs availability, push vs pull</div>
        </div>
      </div>

      {SDI_V2_CATEGORIES.map(category => (
        <div key={category.name}>
          <h2 className="text-lg font-semibold text-gray-200 light:text-gray-800 mb-3 border-b border-gray-800 light:border-gray-200 pb-2">
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
