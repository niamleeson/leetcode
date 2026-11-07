import { lazy, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePersistedOpenSet } from '../hooks/usePersistedOpenSet';
import { NeetCodeTopic, NeetCodeTemplate, NeetCodeProblem, NeetCodeReference } from '../data/neetcode250';
import { uniqueProblems } from '../data/problems';
import { hasSolution as hasStoredSolution } from '../data/solutions/lazy';
import { hasLogicProblem } from '../data/logic';
import CodeBlock from './CodeBlock';
import './neetcodeView.css';

type Lang = 'python' | 'javascript';
type TemplateTab = 'pseudocode' | 'code';
const NeetCodeSolution = lazy(() => import('./NeetCodeSolution'));

function LanguageToggle({ language, setLanguage }: { language: Lang; setLanguage: (l: Lang) => void }) {
  return (
    <div className="inline-flex rounded-md bg-gray-800 light:bg-gray-100 p-0.5">
      <button
        onClick={() => setLanguage('javascript')}
        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
          language === 'javascript' ? 'bg-yellow-600 text-white' : 'text-gray-400 light:text-gray-600 hover:text-gray-200 light:hover:text-gray-800'
        }`}
      >
        JavaScript
      </button>
      <button
        onClick={() => setLanguage('python')}
        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
          language === 'python' ? 'bg-blue-600 text-white' : 'text-gray-400 light:text-gray-600 hover:text-gray-200 light:hover:text-gray-800'
        }`}
      >
        Python
      </button>
    </div>
  );
}

function difficultyColor(d: NeetCodeProblem['difficulty']) {
  if (d === 'Easy') return 'text-emerald-400 light:text-emerald-700';
  if (d === 'Medium') return 'text-amber-400 light:text-amber-700';
  return 'text-red-400 light:text-red-700';
}


function ProblemRow({
  problem,
  language,
  inApp,
  open,
  onToggle,
}: {
  problem: NeetCodeProblem;
  language: Lang;
  inApp: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const externalSolution = hasStoredSolution(problem.id);
  const inlineSolution = problem.solution;
  const hasSolution = !!externalSolution || !!inlineSolution;

  return (
    <div className="neetcode-problem min-w-0 border-b border-gray-800 light:border-gray-200">
      <div className="w-full flex items-center gap-2 py-3">
        <span className="text-xs text-gray-500 light:text-gray-500 font-mono w-10 shrink-0">#{problem.id}</span>
        <button
          type="button"
          onClick={hasSolution ? onToggle : undefined}
          disabled={!hasSolution}
          aria-expanded={open}
          aria-label={hasSolution ? (open ? 'Collapse solution' : 'Expand solution') : undefined}
          className={`flex-1 min-w-0 truncate text-left text-sm transition-colors ${
            hasSolution
              ? 'text-gray-200 light:text-gray-800 hover:text-blue-300 light:hover:text-blue-700 cursor-pointer'
              : 'text-gray-200 light:text-gray-800 cursor-default'
          }`}
        >
          {problem.title}
        </button>
        <span className={`text-xs font-medium ${difficultyColor(problem.difficulty)}`}>{problem.difficulty}</span>
        {hasLogicProblem(problem.id) && <Link to={`/practice/${problem.id}`}
          className="py-2 text-xs font-medium text-cyan-400 light:text-cyan-700"
          aria-label={`Build Python for ${problem.title}`}>Build</Link>}
        <a
          href={problem.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-400 light:text-blue-700 hover:text-blue-300 light:hover:text-blue-600 underline"
          title="Open on LeetCode"
        >
          LC
        </a>
        {inApp ? (
          <Link
            to={`/problem/${problem.id}`}
            className="text-gray-500 light:text-gray-500 hover:text-gray-200 light:hover:text-gray-800 text-xs w-4 text-right"
            title="Open problem page"
            aria-label="Open problem page"
          >
            ▸
          </Link>
        ) : (
          <span className="text-[10px] text-gray-600 light:text-gray-500 italic w-4 text-right">—</span>
        )}
      </div>

      {open && hasSolution && (
        <div className="neetcode-solution min-w-0 border-t border-gray-800 light:border-gray-200 py-4">
          {externalSolution ? (
            <Suspense fallback={<p role="status" className="text-xs text-gray-400 light:text-gray-600">Loading solution…</p>}>
              <NeetCodeSolution id={problem.id} language={language} />
            </Suspense>
          ) : (
            inlineSolution && (
              <div className="space-y-3">
                {inlineSolution.explanation && (
                  <p className="text-xs text-gray-400 light:text-gray-600 leading-relaxed">{inlineSolution.explanation}</p>
                )}
                <CodeBlock
                  code={language === 'python' ? inlineSolution.python : inlineSolution.javascript}
                  language={language}
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function CodeReference({ reference, code }: { reference: NeetCodeReference; code: string }) {
  return (
    <section aria-label={reference.title} className="min-w-0 space-y-3 pt-3">
      <h3 className="text-base font-semibold text-white light:text-gray-900">{reference.title}</h3>
      <p className="text-xs text-gray-300 light:text-gray-700 leading-relaxed whitespace-pre-line">{reference.description}</p>
      <CodeBlock code={code} language="javascript" />
      <h4 className="text-sm font-semibold text-white light:text-gray-900">Usage</h4>
      <CodeBlock code={reference.usage} language="javascript" />
      <p className="text-xs text-gray-500 light:text-gray-500">{reference.complexity}</p>
    </section>
  );
}

function TemplateCard({
  template,
  problems,
  language,
  tab,
  setTab,
  inAppIds,
  isProblemOpen,
  onToggleProblem,
}: {
  template: NeetCodeTemplate;
  problems: NeetCodeProblem[];
  language: Lang;
  tab: TemplateTab;
  setTab: (tab: TemplateTab) => void;
  inAppIds: Set<number>;
  isProblemOpen: (id: number) => boolean;
  onToggleProblem: (id: number) => void;
}) {
  const templateProblems = template.problemIds
    .map((id) => problems.find((p) => p.id === id))
    .filter((p): p is NeetCodeProblem => !!p);

  return (
    <div className="neetcode-template min-w-0">
      <div className="py-3">
        <h3 className="text-base font-semibold text-white light:text-gray-900">{template.name}</h3>
        <p className="text-xs text-sky-300 light:text-sky-700 italic mt-1">&ldquo;{template.mnemonic}&rdquo;</p>
      </div>

      <div className="flex border-b border-gray-800 light:border-gray-200">
        {(['pseudocode', 'code'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`flex-1 px-4 py-2 text-xs font-medium capitalize transition-colors ${
              tab === t
                ? 'text-blue-400 light:text-blue-700 border-b-2 border-blue-400 bg-blue-950/20 light:bg-blue-50'
                : 'text-gray-500 light:text-gray-500 hover:text-gray-300 light:hover:text-gray-700'
            }`}
          >
            {t === 'pseudocode' ? 'Pseudocode (memorize)' : language === 'python' ? 'Python' : 'JavaScript'}
          </button>
        ))}
      </div>

      <div className="min-w-0 py-3">
        {tab === 'pseudocode' ? (
          <pre tabIndex={0} aria-label="Template pseudocode" className="text-xs text-gray-300 light:text-gray-700 leading-relaxed whitespace-pre overflow-x-auto font-mono bg-gray-950 light:bg-gray-50 border border-gray-800 light:border-gray-200 rounded-md p-2 sm:p-3">
            {template.pseudocode}
          </pre>
        ) : language === 'javascript' && template.reference ? (
          <CodeReference reference={template.reference} code={template.javascript} />
        ) : (
          <CodeBlock
            code={language === 'python' ? template.python : template.javascript}
            language={language}
          />
        )}
      </div>

      <div className="min-w-0 border-t border-gray-800 light:border-gray-200 pt-4">
        <h4 className="text-xs font-semibold text-blue-300 light:text-blue-700 uppercase tracking-wider mb-3">
          Questions solved by this template ({templateProblems.length})
        </h4>
        <div className="min-w-0">
          {templateProblems.map((p) => (
            <ProblemRow
              key={p.id}
              problem={p}
              language={language}
              inApp={inAppIds.has(p.id)}
              open={isProblemOpen(p.id)}
              onToggle={() => onToggleProblem(p.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TopicSection({
  topic,
  language,
  tab,
  setTab,
  inAppIds,
  expanded,
  onToggle,
  isProblemOpen,
  onToggleProblem,
}: {
  topic: NeetCodeTopic;
  language: Lang;
  tab: TemplateTab;
  setTab: (tab: TemplateTab) => void;
  inAppIds: Set<number>;
  expanded: boolean;
  onToggle: () => void;
  isProblemOpen: (id: number) => boolean;
  onToggleProblem: (id: number) => void;
}) {
  return (
    <div className="neetcode-topic min-w-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 py-3 border-b border-gray-800 light:border-gray-200 hover:bg-gray-800/50 light:hover:bg-gray-100 transition-colors text-left"
      >
        <div>
          <h2 className="text-lg font-bold text-white light:text-gray-900">{topic.name}</h2>
          <p className="text-xs text-gray-500 light:text-gray-500 mt-1">
            {topic.templates.length} template{topic.templates.length === 1 ? '' : 's'} &middot;{' '}
            {topic.problems.length} problem{topic.problems.length === 1 ? '' : 's'}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 light:text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="min-w-0 space-y-6">
          {topic.reference && (
            <CodeReference reference={topic.reference} code={topic.reference.javascript} />
          )}
          {topic.templates.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              problems={topic.problems}
              language={language}
              tab={tab}
              setTab={setTab}
              inAppIds={inAppIds}
              isProblemOpen={isProblemOpen}
              onToggleProblem={onToggleProblem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export interface NeetCodeViewProps {
  topics: NeetCodeTopic[];
  storagePrefix: string;
  title: string;
  description: string;
}

export default function NeetCodeView({ topics, storagePrefix, title, description }: NeetCodeViewProps) {
  const [language, setLanguage] = useLocalStorage<Lang>(`${storagePrefix}-language`, 'javascript');
  const [tab, setTab] = useLocalStorage<TemplateTab>(`${storagePrefix}-template-tab`, 'pseudocode');
  const inAppIds = useMemo(() => new Set(uniqueProblems.map((p) => p.id)), []);
  const topicsOpen = usePersistedOpenSet<string>(`${storagePrefix}-open-topics`);
  const problemsOpen = usePersistedOpenSet<number>(`${storagePrefix}-open-problems`);

  return (
    <div className="neetcode-page min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white light:text-gray-900">{title}</h1>
          <p className="text-gray-400 light:text-gray-600 mt-1 text-sm">{description}</p>
          <p className="text-gray-500 light:text-gray-500 mt-1 text-xs">Complexities assume O(1) arithmetic and FIFO queue operations, expected O(1) hash lookups, and amortized O(1) array append.</p>
        </div>
        <LanguageToggle language={language} setLanguage={setLanguage} />
      </div>

      <div className="space-y-3">
        {topics.map((topic) => (
          <TopicSection
            key={topic.name}
            topic={topic}
            language={language}
            tab={tab === 'code' ? 'code' : 'pseudocode'}
            setTab={setTab}
            inAppIds={inAppIds}
            expanded={topicsOpen.isOpen(topic.name)}
            onToggle={() => topicsOpen.toggle(topic.name)}
            isProblemOpen={problemsOpen.isOpen}
            onToggleProblem={problemsOpen.toggle}
          />
        ))}
      </div>
    </div>
  );
}
