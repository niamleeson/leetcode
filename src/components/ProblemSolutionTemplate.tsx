import { useState, type ReactNode } from 'react';
import type { ProgrammingLanguage } from '../hooks/useProgrammingLanguage';
import CodeBlock from './CodeBlock';
import GlossaryHighlighter from './GlossaryHighlighter';
import ProgrammingLanguageToggle from './ProgrammingLanguageToggle';

interface ProblemSolutionTemplateProps {
  intuition?: string;
  approach: ReactNode;
  hints: string[];
  code: string;
  language: ProgrammingLanguage;
  preferredLanguage?: ProgrammingLanguage;
  setLanguage?: (language: ProgrammingLanguage) => void;
  solutionTitle?: string;
  walkthrough?: ReactNode;
  walkthroughLabel?: string;
  pseudocode: { concept: string; steps: string[] };
  explanation: ReactNode;
  complexity: ReactNode;
  codeNotice?: ReactNode;
  approachNote?: ReactNode;
}

export default function ProblemSolutionTemplate({
  intuition, approach, hints, code, language, preferredLanguage = language,
  setLanguage, solutionTitle, walkthrough, walkthroughLabel,
  pseudocode, explanation, complexity, codeNotice, approachNote,
}: ProblemSolutionTemplateProps) {
  const [revealedHints, setRevealedHints] = useState(0);

  return <div className="space-y-6 min-w-0">
    {intuition && <section data-solution-section="intuition">
      <h2 className="text-xs font-semibold text-cyan-400 light:text-cyan-700 uppercase tracking-wider mb-2">Intuition</h2>
      <div className="text-sm text-gray-300 light:text-gray-700 leading-relaxed whitespace-pre-line bg-cyan-950/20 light:bg-cyan-50 border border-cyan-900/30 light:border-cyan-200 rounded-md p-4">
        <GlossaryHighlighter text={intuition} />
      </div>
    </section>}

    <section data-solution-section="approach">
      <h2 className="text-xs font-semibold text-blue-400 light:text-blue-700 uppercase tracking-wider mb-2">Approach</h2>
      {approach}
      {approachNote}
    </section>

    {hints.length > 0 && <section data-solution-section="hints" className="space-y-2">
      <h2 className="text-xs font-semibold text-gray-500 light:text-gray-500 uppercase tracking-wider">Hints</h2>
      {hints.map((hint, index) => <div key={index}>
        {index < revealedHints ? <div className="bg-gray-800 light:bg-gray-100 border border-gray-700 light:border-gray-300 rounded-md p-3 text-sm text-gray-300 light:text-gray-700">
          <span className="text-blue-400 light:text-blue-700 font-semibold mr-2">Hint {index + 1}:</span>
          {hint}
        </div> : index === revealedHints ? <button
          type="button"
          onClick={() => setRevealedHints(previous => previous + 1)}
          className="bg-gray-800 light:bg-gray-100 hover:bg-gray-700 light:hover:bg-gray-200 border border-gray-700 light:border-gray-300 rounded-md px-3 py-2 text-sm text-blue-400 light:text-blue-700 transition-colors w-full text-left"
        >Reveal Hint {index + 1}</button> : null}
      </div>)}
    </section>}

    <section data-solution-section="solution">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 className="text-xs font-semibold text-emerald-400 light:text-emerald-700 uppercase tracking-wider">
          {solutionTitle && `${solutionTitle} · `}
          {language === 'javascript' ? 'JavaScript' : 'Python'} Solution
        </h2>
        {setLanguage && <ProgrammingLanguageToggle language={preferredLanguage} setLanguage={setLanguage} />}
      </div>
      <CodeBlock code={code} language={language} />
      {codeNotice}
      {walkthrough && <section
        aria-label={walkthroughLabel ?? 'Step-by-step walkthrough'}
        className="mt-3 bg-gray-950 light:bg-sky-50 border border-sky-900/30 light:border-sky-200 rounded-md p-4 text-sm leading-relaxed"
      >
        <h3 className="text-xs font-semibold text-sky-400 light:text-sky-700 uppercase tracking-wider mb-3">Step-by-Step Walkthrough</h3>
        {walkthrough}
      </section>}
    </section>

    <section data-solution-section="pseudocode">
      <h2 className="text-xs font-semibold text-purple-400 light:text-purple-700 uppercase tracking-wider mb-2">Pseudocode (for memorization)</h2>
      <div className="bg-gray-950 light:bg-purple-50 border border-purple-900/30 light:border-purple-200 rounded-md p-4 text-sm leading-relaxed">
        <p className="text-purple-300 light:text-purple-700 font-semibold mb-3">{pseudocode.concept}</p>
        <ol className="space-y-1 text-purple-200/90 light:text-purple-700 list-decimal list-inside">
          {pseudocode.steps.map((step, index) => <li key={index}>{step}</li>)}
        </ol>
      </div>
    </section>

    <section data-solution-section="explanation">
      <h2 className="text-xs font-semibold text-yellow-400 light:text-yellow-700 uppercase tracking-wider mb-2">Explanation</h2>
      {explanation}
    </section>

    <section data-solution-section="complexity">{complexity}</section>
  </div>;
}
