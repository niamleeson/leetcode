import type { DailySavedSolution } from '../data/daily-questions/types';
import { useProgrammingLanguage } from '../hooks/useProgrammingLanguage';
import ProblemSolutionTemplate from './ProblemSolutionTemplate';
import SolutionComplexity from './SolutionComplexity';
import GlossaryHighlighter from './GlossaryHighlighter';

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
  const walkthroughText = language === 'python' ? solution.pythonWalkthrough : solution.walkthrough;

  return <section aria-label={`Saved solution: ${solution.title}`} className="study-solution min-w-0 space-y-6">
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 light:text-emerald-700">
        {label ?? `${index === 0 ? 'Saved' : 'Alternative'} ${languageName} solution`}
      </p>
      <h2 className="text-lg font-semibold text-white light:text-gray-900">{solution.title}</h2>
    </div>
    <ProblemSolutionTemplate
      intuition={solution.intuition}
      approach={<GlossaryHighlighter text={solution.approach.replace(/`([^`]+)`/g, '$1')} className="text-sm text-gray-400 light:text-gray-600 leading-relaxed" />}
      hints={solution.hints}
      code={code}
      language={language}
      setLanguage={hasPython ? setLanguage : undefined}
      walkthroughText={walkthroughText}
      walkthroughLabel={`${solution.title} walkthrough`}
      pseudocode={solution.pseudocode}
      explanation={<>
        <GlossaryHighlighter text={solution.explanation} className="text-sm text-gray-400 light:text-gray-600 leading-relaxed whitespace-pre-line" />
        {solution.notes?.map(note => <p key={note} className="mt-2 text-sm text-gray-400 light:text-gray-600 leading-relaxed">{note}</p>)}
      </>}
      complexity={<SolutionComplexity solution={{ ...solution, complexityVariables: solution.variables }} language={language} />}
    />
  </section>;
}
