import type { DailySavedSolution } from '../data/daily-questions/types';
import { useProgrammingLanguage } from '../hooks/useProgrammingLanguage';
import { RichText } from './CatalogProblemContent';
import CodeBlock from './CodeBlock';
import ProgrammingLanguageToggle from './ProgrammingLanguageToggle';

const headingClass = 'font-semibold text-white light:text-gray-900';

export default function StudySolution({ solution, index = 0, label }: {
  solution: DailySavedSolution;
  index?: number;
  label?: string;
}) {
  const [preferredLanguage, setLanguage] = useProgrammingLanguage();
  const hasPython = Boolean(solution.pythonCode);
  const language = hasPython ? preferredLanguage : 'javascript';
  const languageName = language === 'python' ? 'Python' : 'JavaScript';
  const code = language === 'python' ? solution.pythonCode! : solution.code;
  const walkthrough = language === 'python' ? solution.pythonWalkthroughMarkdown : solution.walkthroughMarkdown;

  return <section aria-label={`Saved solution: ${solution.title}`} className="space-y-3">
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 light:text-emerald-700">
        {label ?? `${index === 0 ? 'Saved' : 'Alternative'} ${languageName} solution`}
      </p>
      <h2 className="text-lg font-semibold text-white light:text-gray-900">{solution.title}</h2>
    </div>

    <h3 className={headingClass}>Approach</h3>
    <RichText text={solution.approach} />

    <h3 className={headingClass}>Example</h3>
    <p className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-gray-300 light:text-gray-700">{solution.example}</p>
    {solution.notes?.map(note => <p key={note} className="text-sm leading-relaxed text-amber-300 light:text-amber-800">{note}</p>)}

    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className={headingClass}>Solution</h3>
      {hasPython
        ? <ProgrammingLanguageToggle language={language} setLanguage={setLanguage} />
        : <span className="text-xs text-gray-400 light:text-gray-600">JavaScript</span>}
    </div>
    <CodeBlock code={code} language={language} />

    <h3 className={headingClass}>Complexity</h3>
    <dl className="space-y-1 text-sm text-gray-400 light:text-gray-600">
      <div><dt className="inline font-medium">Time: </dt><dd className="inline">{solution.timeComplexity}</dd></div>
      <div><dt className="inline font-medium">Extra space: </dt><dd className="inline">{solution.spaceComplexity}</dd></div>
      {Object.entries(solution.variables).map(([variable, meaning]) => <div key={variable}><dt className="inline font-mono">{variable}</dt><dd className="inline"> — {meaning}</dd></div>)}
    </dl>

    {walkthrough && <section aria-label={`${solution.title} walkthrough`} className="space-y-3">
      <h3 className={headingClass}>Step-by-step walkthrough</h3>
      <RichText text={walkthrough} />
    </section>}
  </section>;
}
