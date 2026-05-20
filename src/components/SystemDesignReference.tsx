import { useState } from 'react';
import { Link } from 'react-router-dom';
import { solutionMap } from '../data/solutions';
import { systemDesignProblems } from '../data/problems-system-design';
import MarkdownContent from './MarkdownContent';

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

function ProblemCard({ problemId }: { problemId: number }) {
  const [expanded, setExpanded] = useState(false);

  const problem = systemDesignProblems.find(p => p.id === problemId);
  const solution = solutionMap[problemId];

  if (!problem || !solution) return null;

  return (
    <div className="bg-gray-900 light:bg-white border border-gray-800 light:border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 light:hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 light:text-gray-500 font-mono w-8">#{problemId - 9000}</span>
          <h3 className="text-white light:text-gray-900 font-semibold">{problem.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/problem/${problemId}`}
            onClick={e => e.stopPropagation()}
            className="text-xs text-blue-400 light:text-blue-700 hover:text-blue-300 light:hover:text-blue-600 px-2 py-1 rounded bg-blue-950/30 light:bg-blue-50 hover:bg-blue-950/50 light:hover:bg-blue-100 transition-colors"
          >
            Practice
          </Link>
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
          {/* Key Insight */}
          {solution.intuition && (
            <div className="bg-gray-800/40 light:bg-gray-100 border border-gray-700/50 light:border-gray-300 rounded-lg p-4 mb-4">
              <h4 className="text-xs font-semibold text-blue-300 light:text-blue-700 uppercase tracking-wider mb-2">Key Insight</h4>
              <MarkdownContent content={solution.intuition} />
            </div>
          )}

          {/* Step 1: Requirements */}
          <StepHeader step={1} title="Understand the Problem & Establish Scope" time="3-10 min" />
          {solution.description && <MarkdownContent content={solution.description} />}

          <hr className="border-gray-800 light:border-gray-200 my-5" />

          {/* Step 2: High-Level Design */}
          <StepHeader step={2} title="Propose High-Level Design & Get Buy-In" time="10-15 min" />
          {solution.approach && <MarkdownContent content={solution.approach} />}
          {solution.code && <MarkdownContent content={solution.code} />}

          <hr className="border-gray-800 light:border-gray-200 my-5" />

          {/* Step 3: Deep Dive */}
          <StepHeader step={3} title="Design Deep Dive" time="10-25 min" />
          {solution.jsCode && <MarkdownContent content={solution.jsCode} />}

          <hr className="border-gray-800 light:border-gray-200 my-5" />

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

export default function SystemDesignReference() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white light:text-gray-900">System Design Reference</h1>
        <p className="text-gray-400 light:text-gray-600 mt-1 text-sm">
          30 complete system design problems with architecture, JavaScript implementations, scaling strategies, and trade-off analysis.
        </p>
      </div>

      {/* Quick Decision Guide */}
      <div className="bg-gradient-to-r from-blue-950/40 to-gray-900/40 light:from-blue-50 light:to-gray-50 border border-blue-900/30 light:border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-300 light:text-blue-700 mb-3">System Design Interview Framework</h3>

        <h4 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider mt-2 mb-1">Step 1: Understand the Problem & Establish Scope (3-10 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 light:text-gray-600 mb-3">
          <div><span className="text-blue-400 light:text-blue-700">Ask clarifying questions</span> → Don't jump to a solution</div>
          <div><span className="text-blue-400 light:text-blue-700">Functional requirements?</span> → What should the system do?</div>
          <div><span className="text-blue-400 light:text-blue-700">Non-functional requirements?</span> → Scale, latency, availability, consistency</div>
          <div><span className="text-blue-400 light:text-blue-700">Users and scale?</span> → DAU, QPS, storage, bandwidth estimates</div>
          <div><span className="text-blue-400 light:text-blue-700">Constraints?</span> → Budget, region, existing tech stack</div>
          <div><span className="text-blue-400 light:text-blue-700">Back-of-envelope</span> → DAU × actions/day ÷ 86,400 = QPS</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider mb-1">Step 2: Propose High-Level Design & Get Buy-In (10-15 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 light:text-gray-600 mb-3">
          <div><span className="text-blue-400 light:text-blue-700">Draw box diagrams</span> → Clients, APIs, servers, DB, cache, CDN, queues</div>
          <div><span className="text-blue-400 light:text-blue-700">Define API endpoints</span> → RESTful contracts for core operations</div>
          <div><span className="text-blue-400 light:text-blue-700">Data model & schema</span> → Tables, key-value pairs, relationships</div>
          <div><span className="text-blue-400 light:text-blue-700">Walk through use cases</span> → Trace the flow through your diagram</div>
          <div><span className="text-blue-400 light:text-blue-700">Get buy-in</span> → Collaborate with interviewer before deep dive</div>
          <div><span className="text-blue-400 light:text-blue-700">Read vs Write heavy?</span> → Cache + Replicas vs Queue + Async</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider mb-1">Step 3: Design Deep Dive (10-25 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 light:text-gray-600 mb-3">
          <div><span className="text-blue-400 light:text-blue-700">Prioritize components</span> → Focus on what the interviewer cares about</div>
          <div><span className="text-blue-400 light:text-blue-700">Drill into bottlenecks</span> → Where does the system break at scale?</div>
          <div><span className="text-blue-400 light:text-blue-700">Key algorithms</span> → Hashing, sharding, replication strategies</div>
          <div><span className="text-blue-400 light:text-blue-700">Data partitioning</span> → How to shard, consistent hashing</div>
          <div><span className="text-blue-400 light:text-blue-700">Failure handling</span> → Replication, failover, circuit breakers</div>
          <div><span className="text-blue-400 light:text-blue-700">Time management</span> → Don't get lost in one component</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider mb-1">Step 4: Wrap Up (3-5 min)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 light:text-gray-600 mb-3">
          <div><span className="text-blue-400 light:text-blue-700">Identify bottlenecks</span> → Never say "it's perfect"</div>
          <div><span className="text-blue-400 light:text-blue-700">Error cases</span> → Server failure, network loss, data corruption</div>
          <div><span className="text-blue-400 light:text-blue-700">Operational concerns</span> → Monitoring, alerting, rollout strategy</div>
          <div><span className="text-blue-400 light:text-blue-700">Next scale curve</span> → 1M → 10M users: what changes?</div>
          <div><span className="text-blue-400 light:text-blue-700">Recap your design</span> → Refresh interviewer's memory</div>
          <div><span className="text-blue-400 light:text-blue-700">Trade-offs made</span> → Consistency vs availability, push vs pull</div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider mb-1">Capacity Benchmarks</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-xs text-gray-400 light:text-gray-600">
          <div><span className="text-blue-400 light:text-blue-700">Web server:</span> ~1K QPS</div>
          <div><span className="text-blue-400 light:text-blue-700">DB reads:</span> ~10K QPS</div>
          <div><span className="text-blue-400 light:text-blue-700">DB writes:</span> ~1K QPS</div>
          <div><span className="text-blue-400 light:text-blue-700">Redis:</span> ~100K QPS</div>
          <div><span className="text-blue-400 light:text-blue-700">Kafka:</span> ~1M msg/sec</div>
          <div><span className="text-blue-400 light:text-blue-700">1 day:</span> 86,400 sec ≈ 100K sec</div>
        </div>
      </div>

      {/* Categories */}
      {SD_CATEGORIES.map(category => (
        <div key={category.name}>
          <h2 className="text-lg font-semibold text-gray-200 light:text-gray-800 mb-3 border-b border-gray-800 light:border-gray-200 pb-2">
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
