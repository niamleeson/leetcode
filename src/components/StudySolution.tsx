import type { DailySavedSolution } from '../data/daily-questions/types';
import { useProgrammingLanguage } from '../hooks/useProgrammingLanguage';
import { RichText } from './CatalogProblemContent';
import ProblemSolutionTemplate from './ProblemSolutionTemplate';
import SolutionComplexity from './SolutionComplexity';

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

  return <section aria-label={`Saved solution: ${solution.title}`} className="space-y-6">
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 light:text-emerald-700">
        {label ?? `${index === 0 ? 'Saved' : 'Alternative'} ${languageName} solution`}
      </p>
      <h2 className="text-lg font-semibold text-white light:text-gray-900">{solution.title}</h2>
    </div>
    <ProblemSolutionTemplate
      intuition={solution.intuition}
      approach={<RichText text={solution.approach} />}
      approachNote={<div className="mt-3 space-y-2">
        <pre className="bg-gray-950 light:bg-white border border-gray-800 light:border-gray-200 rounded-md p-3 text-xs text-gray-300 light:text-gray-700 overflow-x-auto whitespace-pre-wrap font-mono">{solution.example}</pre>
        {solution.notes?.map(note => <p key={note} className="text-sm leading-relaxed text-amber-300 light:text-amber-800">{note}</p>)}
      </div>}
      hints={solution.hints}
      code={code}
      language={language}
      setLanguage={hasPython ? setLanguage : undefined}
      walkthrough={walkthrough ? <RichText text={walkthrough} /> : undefined}
      walkthroughLabel={`${solution.title} walkthrough`}
      pseudocode={solution.pseudocode}
      explanation={<span className="text-sm text-gray-400 light:text-gray-600 leading-relaxed whitespace-pre-line">{solution.explanation}</span>}
      complexity={<SolutionComplexity solution={{ ...solution, complexityVariables: solution.variables }} language={language} />}
    />
  </section>;
}
