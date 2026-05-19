import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePersistedOpenSet } from '../hooks/usePersistedOpenSet';
import { NeetCodeTopic, NeetCodeTemplate, NeetCodeProblem } from '../data/neetcode250';
import { uniqueProblems } from '../data/problems';
import { solutionMap, ProblemSolution } from '../data/solutions';
import CodeBlock from './CodeBlock';

type Lang = 'python' | 'javascript';

function LanguageToggle({ language, setLanguage }: { language: Lang; setLanguage: (l: Lang) => void }) {
  return (
    <div className="inline-flex rounded-md bg-gray-800 p-0.5">
      <button
        onClick={() => setLanguage('javascript')}
        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
          language === 'javascript' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        JavaScript
      </button>
      <button
        onClick={() => setLanguage('python')}
        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
          language === 'python' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        Python
      </button>
    </div>
  );
}

function difficultyColor(d: NeetCodeProblem['difficulty']) {
  if (d === 'Easy') return 'text-emerald-400';
  if (d === 'Medium') return 'text-amber-400';
  return 'text-red-400';
}

function InlineSolution({ solution, language }: { solution: ProblemSolution; language: Lang }) {
  const showJs = language === 'javascript' && !!solution.jsCode;
  const code = showJs ? solution.jsCode! : solution.code;
  const codeLang: Lang = showJs ? 'javascript' : 'python';

  return (
    <div className="space-y-4">
      {solution.description && (
        <div>
          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Problem</h4>
          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{solution.description}</p>
        </div>
      )}

      {solution.examples && (
        <pre className="bg-gray-950 border border-gray-800 rounded-md p-3 text-[11px] text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono">
          {solution.examples}
        </pre>
      )}

      {solution.intuition && (
        <div>
          <h4 className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">Intuition</h4>
          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line bg-cyan-950/20 border border-cyan-900/30 rounded-md p-3">
            {solution.intuition}
          </p>
        </div>
      )}

      {solution.approach && (
        <div>
          <h4 className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1.5">Approach</h4>
          <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{solution.approach}</p>
        </div>
      )}

      <div>
        <h4 className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
          {codeLang === 'python' ? 'Python' : 'JavaScript'} Solution
        </h4>
        <CodeBlock code={code} language={codeLang} />
        {language === 'javascript' && !solution.jsCode && (
          <p className="text-[10px] text-gray-500 mt-1">JavaScript solution not available — showing Python.</p>
        )}
      </div>

      {solution.explanation && (
        <div>
          <h4 className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider mb-1.5">Explanation</h4>
          <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{solution.explanation}</p>
        </div>
      )}

      {(solution.timeComplexity || solution.spaceComplexity) && (
        <div className="flex gap-5 text-[11px] text-gray-500 pt-1">
          {solution.timeComplexity && (
            <span>
              Time: <strong className="text-gray-300">{solution.timeComplexity}</strong>
            </span>
          )}
          {solution.spaceComplexity && (
            <span>
              Space: <strong className="text-gray-300">{solution.spaceComplexity}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
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
  const externalSolution = solutionMap[problem.id];
  const inlineSolution = problem.solution;
  const hasSolution = !!externalSolution || !!inlineSolution;

  const titleContent = (
    <span className="text-sm text-gray-200 flex-1 truncate hover:text-blue-300 transition-colors">
      {problem.title}
    </span>
  );

  return (
    <div className="border border-gray-800 rounded-md overflow-hidden">
      <div className="w-full flex items-center gap-3 px-3 py-2">
        <span className="text-xs text-gray-500 font-mono w-10 shrink-0">#{problem.id}</span>
        {inApp ? (
          <Link to={`/problem/${problem.id}`} className="flex-1 min-w-0 truncate">
            {titleContent}
          </Link>
        ) : (
          titleContent
        )}
        <span className={`text-xs font-medium ${difficultyColor(problem.difficulty)}`}>{problem.difficulty}</span>
        <a
          href={problem.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 underline"
          title="Open on LeetCode"
        >
          LC
        </a>
        {hasSolution ? (
          <button
            onClick={onToggle}
            className="text-gray-500 text-xs w-4 hover:text-gray-300"
            aria-label={open ? 'Collapse solution' : 'Expand solution'}
          >
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span className="text-[10px] text-gray-600 italic w-4 text-right">—</span>
        )}
      </div>

      {open && hasSolution && (
        <div className="border-t border-gray-800 p-3 bg-gray-950/50">
          {externalSolution ? (
            <InlineSolution solution={externalSolution} language={language} />
          ) : (
            inlineSolution && (
              <div className="space-y-3">
                {inlineSolution.explanation && (
                  <p className="text-xs text-gray-400 leading-relaxed">{inlineSolution.explanation}</p>
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

function TemplateCard({
  template,
  problems,
  language,
  inAppIds,
  isProblemOpen,
  onToggleProblem,
}: {
  template: NeetCodeTemplate;
  problems: NeetCodeProblem[];
  language: Lang;
  inAppIds: Set<number>;
  isProblemOpen: (id: number) => boolean;
  onToggleProblem: (id: number) => void;
}) {
  const [tab, setTab] = useState<'pseudocode' | 'code'>('pseudocode');
  const templateProblems = template.problemIds
    .map((id) => problems.find((p) => p.id === id))
    .filter((p): p is NeetCodeProblem => !!p);

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/40">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-base font-semibold text-white">{template.name}</h3>
        <p className="text-xs text-sky-300 italic mt-1">&ldquo;{template.mnemonic}&rdquo;</p>
      </div>

      <div className="flex border-b border-gray-800">
        {(['pseudocode', 'code'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-2 text-xs font-medium capitalize transition-colors ${
              tab === t
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-950/20'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'pseudocode' ? 'Pseudocode (memorize)' : language === 'python' ? 'Python' : 'JavaScript'}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'pseudocode' ? (
          <pre className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-mono bg-gray-950 border border-gray-800 rounded-md p-4">
            {template.pseudocode}
          </pre>
        ) : (
          <CodeBlock
            code={language === 'python' ? template.python : template.javascript}
            language={language}
          />
        )}
      </div>

      <div className="border-t border-gray-800 p-4">
        <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
          Questions solved by this template ({templateProblems.length})
        </h4>
        <div className="space-y-1.5">
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
  inAppIds,
  expanded,
  onToggle,
  isProblemOpen,
  onToggleProblem,
}: {
  topic: NeetCodeTopic;
  language: Lang;
  inAppIds: Set<number>;
  expanded: boolean;
  onToggle: () => void;
  isProblemOpen: (id: number) => boolean;
  onToggleProblem: (id: number) => void;
}) {
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-900 hover:bg-gray-800/50 transition-colors text-left"
      >
        <div>
          <h2 className="text-lg font-bold text-white">{topic.name}</h2>
          <p className="text-xs text-gray-500 mt-1">
            {topic.templates.length} template{topic.templates.length === 1 ? '' : 's'} &middot;{' '}
            {topic.problems.length} problem{topic.problems.length === 1 ? '' : 's'}
          </p>
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
        <div className="p-4 space-y-6 border-t border-gray-800 bg-gray-950/40">
          {topic.templates.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              problems={topic.problems}
              language={language}
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
  const inAppIds = useMemo(() => new Set(uniqueProblems.map((p) => p.id)), []);
  const topicsOpen = usePersistedOpenSet<string>(`${storagePrefix}-open-topics`);
  const problemsOpen = usePersistedOpenSet<number>(`${storagePrefix}-open-problems`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-gray-400 mt-1 text-sm">{description}</p>
        </div>
        <LanguageToggle language={language} setLanguage={setLanguage} />
      </div>

      <div className="space-y-3">
        {topics.map((topic) => (
          <TopicSection
            key={topic.name}
            topic={topic}
            language={language}
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
