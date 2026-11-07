import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LogicProblem } from '../../data/logic/types';
import { loadGuidedLesson } from '../../data/logic/guided';
import type { GuidedChoice, GuidedLesson, GuidedQuestion } from '../../data/logic/guided-types';
import SolutionReveal from './SolutionReveal';
import ProgrammingLanguageToggle from '../ProgrammingLanguageToggle';
import './guidedPractice.css';

const GuidedCodeRunner = lazy(() => import('./GuidedCodeRunner'));
type Language = 'python' | 'javascript';
interface Props { problem: LogicProblem; language: Language; onLanguageChange: (language: Language) => void }
interface Progress { revision: string; answered: string[]; attempts: number; }
interface Feedback { correct: boolean; text: string; question: string; stage: GuidedQuestion['stage']; witness?: GuidedChoice['witness'] }
const display = (value: unknown) => {
  const compact = JSON.stringify(value) ?? 'No result';
  if (compact.length <= 100) return compact;
  const text = JSON.stringify(value, null, 2) ?? 'No result';
  return text.length > 1800 ? text.slice(0,1800) + '\n…' : text;
};
const stageNames = { pattern: 'Approach', structure: 'Structure', implementation: 'Implementation' };
const storageKey = (id: number, language: Language) => `lc-guided-progress-${id}-${language}`;
function readProgress(lesson: GuidedLesson, language: Language): Progress {
  const empty = { revision: lesson.revision, answered: [], attempts: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(lesson.id, language)) || 'null');
    if (!saved || saved.revision !== lesson.revision || !Array.isArray(saved.answered) || saved.answered.length > lesson.questions.length || !Number.isSafeInteger(saved.attempts) || saved.attempts < 0) return empty;
    if (saved.answered.some((id: unknown, index: number) => id !== lesson.questions[index].id)) return empty;
    return { revision: lesson.revision, answered: [...saved.answered], attempts: saved.attempts };
  } catch { return empty; }
}
function hasSavedDraft(id: number) {
  try { return !!JSON.parse(localStorage.getItem(`lc-logic-draft-${id}`) || 'null')?.program?.units?.some((unit: { lines?: unknown[] }) => unit.lines?.length); } catch { return false; }
}
export default function GuidedPractice(props: Props) {
  const { problem, language } = props;
  const [lesson, setLesson] = useState<GuidedLesson | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const currentLesson = lesson?.id === problem.id && lesson.language === language ? lesson : null;
  useEffect(() => {
    let current = true; setLesson(null); setError('');
    loadGuidedLesson(problem.id, language).then(value => { if (current) setLesson(value); }, () => { if (current) setError('The guided questions could not load. Try again.'); });
    return () => { current = false; };
  }, [problem.id, language, retry]);
  return <div className="logic-editor guided-practice">
    <header className="logic-heading"><div><Link to="/practice">← Practice problems</Link><h1>{problem.title}</h1><div className="logic-heading-meta">#{problem.id} · {problem.difficulty}</div></div><LanguageToggle language={language} onChange={props.onLanguageChange}/></header>
    <p className="guided-problem-summary">{problem.description.split('\n').find(line => line.trim())}</p>
    <details className="logic-question"><summary>Full problem & examples</summary><div className="logic-question-content"><p>{problem.description}</p>{problem.examples.slice(0, 2).map((example, i) => <pre key={i}>{example.name}{'\n'}Input: {display(example.input)}{example.operations && `\nCalls: ${display(example.operations)}`}{'\n'}Expected: {display(example.expected)}</pre>)}{hasSavedDraft(problem.id) && <Link className="guided-saved-draft" to={`/practice/${problem.id}?draft=1`}>Open your saved Python draft</Link>}</div></details>
    {!currentLesson ? <section className="guided-question-card"><p role={error ? 'alert' : 'status'}>{error || 'Loading guided questions…'}</p>{error && <button type="button" className="logic-small-button" onClick={() => setRetry(value => value + 1)}>Retry questions</button>}</section> : <GuidedSession key={`${problem.id}:${language}:${currentLesson.revision}`} problem={problem} language={language} lesson={currentLesson}/>}
  </div>;
}
export function LanguageToggle({ language, onChange }: { language: Language; onChange: (value: Language) => void }) {
  return <ProgrammingLanguageToggle language={language} setLanguage={onChange}/>;
}
function GuidedSession({ problem, language, lesson }: { problem: LogicProblem; language: Language; lesson: GuidedLesson }) {
  const [progress, setProgress] = useState(() => readProgress(lesson, language));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [wrongChoices, setWrongChoices] = useState<string[]>([]);
  const [saved, setSaved] = useState(true);
  const [revealKey, setRevealKey] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const feedbackElement = useRef<HTMLElement>(null);
  const focusAfterRestart = useRef(false);
  const answeredNow = useRef<string | null>(null);
  const question = lesson.questions[progress.answered.length];
  const complete = !question;
  const correctStructure = lesson.questions.find(item => item.stage === 'structure')?.choices.find(choice => choice.correct);
  useEffect(() => {
    try { localStorage.setItem(storageKey(problem.id, language), JSON.stringify(progress)); setSaved(true); } catch { setSaved(false); }
  }, [problem.id, language, progress]);
  useEffect(() => {
    answeredNow.current = null;
    if (focusAfterRestart.current) {
      heading.current?.focus();
      focusAfterRestart.current = false;
    } else if (feedback?.correct) heading.current?.focus({ preventScroll: true });
  }, [question?.id]);
  useEffect(() => {
    if (feedback) feedbackElement.current?.scrollIntoView({ block: 'nearest' });
  }, [feedback]);
  function answer(choice: GuidedChoice) {
    if (!question || answeredNow.current === question.id) return;
    setFeedback({ correct: choice.correct, text: choice.feedback, question: question.prompt, stage: question.stage, witness: choice.witness });
    if (choice.correct) {
      answeredNow.current = question.id;
      setProgress(value => ({ ...value, attempts: value.attempts + 1, answered: [...value.answered, question.id] }));
      setWrongChoices([]);
    } else {
      setProgress(value => ({ ...value, attempts: value.attempts + 1 }));
      setWrongChoices(value => [...new Set([...value, choice.id])]);
    }
  }
  function restart() {
    focusAfterRestart.current = true;
    setProgress({ revision: lesson.revision, answered: [], attempts: 0 }); setFeedback(null); setWrongChoices([]); setRevealKey(value => value + 1); answeredNow.current = null;
  }
  return <>
    <div className="guided-progress"><ol>{(['pattern','structure','implementation'] as const).map(stage => <li key={stage} data-active={question?.stage === stage} data-done={complete || lesson.questions.filter(q => q.stage === stage).every(q => progress.answered.includes(q.id))}><span aria-hidden="true">{complete || lesson.questions.filter(q => q.stage === stage).every(q => progress.answered.includes(q.id)) ? '✓' : '•'}</span>{stageNames[stage]}</li>)}</ol><span>{complete ? `${lesson.questions.length} decisions complete` : `Question ${progress.answered.length + 1} of ${lesson.questions.length}`}</span></div>
    {feedback && <section ref={feedbackElement} className={`guided-feedback ${feedback.correct ? 'guided-feedback-correct' : 'guided-feedback-incorrect'}`} role={feedback.correct ? 'status' : 'alert'} aria-label="Answer feedback">
      <strong>{feedback.correct ? 'Correct' : feedback.stage === 'pattern' || feedback.stage === 'structure' ? 'Try another approach' : 'Not quite'}</strong>
      {feedback.correct && !complete && <small>Previous decision</small>}<p>{feedback.text}</p>
      {feedback.witness && <details><summary>See the counterexample</summary><dl><div><dt>Input</dt><dd>{display(feedback.witness.input)}</dd></div>{feedback.witness.operations && <div><dt>Calls</dt><dd>{display(feedback.witness.operations)}</dd></div>}<div><dt>Expected</dt><dd>{display(feedback.witness.expected)}</dd></div><div><dt>This choice produces</dt><dd>{feedback.witness.error ? `${feedback.witness.error.type}: ${feedback.witness.error.message}` : display(feedback.witness.actual)}</dd></div></dl></details>}
    </section>}
    {question ? <section className="guided-question-card" aria-label={`${stageNames[question.stage]} question`}>
      <div className="logic-eyebrow">{stageNames[question.stage]}{question.stage === 'implementation' ? ` · ${language === 'python' ? 'Python' : 'JavaScript'}` : ''}</div>
      <h2 ref={heading} tabIndex={-1}>{question.prompt}</h2>
      {question.stage === 'pattern' && <p className="guided-question-note">Choose one of eight patterns. This lesson follows one worked approach; other approaches can also be valid.</p>}
      {question.context && <pre className="guided-context" aria-label="Implementation context"><code>{question.context}</code></pre>}
      <div className={`guided-choices ${question.stage === 'implementation' ? 'guided-code-choices' : ''}`}>{question.choices.map((choice, index) => <button key={`${question.id}:${choice.id}`} type="button" className="guided-choice" data-attempted={wrongChoices.includes(choice.id)} onClick={() => answer(choice)}>
        <span className="guided-choice-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
        <span>{choice.code ? <code>{choice.code.trim()}</code> : <strong>{choice.label}</strong>}{wrongChoices.includes(choice.id) && <small>Try a different choice</small>}</span>
      </button>)}</div>
      <p className="guided-question-note">Tap an answer for feedback. A correct answer moves to the next decision.</p>
    </section> : <>
      <section className="guided-complete"><div className="logic-eyebrow">DECISIONS COMPLETE</div><h2 ref={heading} tabIndex={-1}>Now see the implementation run.</h2><p>You chose the approach, structure, and key implementation details. Step through an example and connect each decision to its effect.</p></section>
      <Suspense fallback={<p role="status" className="logic-solution-status">Loading the completed implementation…</p>}><GuidedCodeRunner problem={problem} code={lesson.source} language={language} execution={lesson.execution}/></Suspense>
      <details className="guided-review"><summary>Review your decisions</summary><ol>{lesson.questions.map(item => { const correct=item.choices.find(choice => choice.correct)!; return <li key={item.id}><strong>{item.prompt}</strong>{correct.code ? <pre><code>{correct.code.trim()}</code></pre> : <p>{correct.label}</p>}<p>{correct.feedback}</p></li>; })}</ol></details>
    </>}
    <SolutionReveal key={revealKey} id={problem.id} language={language} approach={correctStructure?.label} explanation={correctStructure?.feedback}/>
    <div className="guided-footer"><span role="status">{saved ? 'Progress saved on this device' : 'Progress could not be saved'}</span>{progress.answered.length > 0 && <button type="button" onClick={restart}>Start again</button>}</div>
  </>;
}
