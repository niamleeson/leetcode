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
interface Progress { revision: string; answered: string[]; skipped: string[]; attempts: number; }
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
  const empty = { revision: lesson.revision, answered: [], skipped: [], attempts: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(lesson.id, language)) || 'null');
    if (!saved || saved.revision !== lesson.revision || !Array.isArray(saved.answered) || !Number.isSafeInteger(saved.attempts) || saved.attempts < 0) return empty;
    const skipped = saved.skipped === undefined ? [] : saved.skipped;
    if (!Array.isArray(skipped)) return empty;
    const visited = [...saved.answered, ...skipped];
    const visitedIds = new Set(visited);
    if (visited.length >= lesson.questions.length || visitedIds.size !== visited.length ||
      !lesson.questions.slice(0, visited.length).every(question => visitedIds.has(question.id))) return empty;
    return {
      revision: lesson.revision,
      answered: lesson.questions.filter(question => saved.answered.includes(question.id)).map(question => question.id),
      skipped: lesson.questions.filter(question => skipped.includes(question.id)).map(question => question.id),
      attempts: saved.attempts,
    };
  } catch { return empty; }
}
function hasSavedDraft(id: number) {
  try { return !!JSON.parse(localStorage.getItem(`lc-logic-draft-${id}`) || 'null')?.program?.units?.some((unit: { lines?: unknown[] }) => unit.lines?.length); } catch { return false; }
}
export default function GuidedPractice(props: Props) {
  const { problem, language } = props;
  const problemHeading = useRef<HTMLHeadingElement>(null);
  const [lesson, setLesson] = useState<GuidedLesson | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const currentLesson = lesson?.id === problem.id && lesson.language === language ? lesson : null;
  useEffect(() => { problemHeading.current?.focus(); }, [problem.id]);
  useEffect(() => {
    let current = true; setLesson(null); setError('');
    loadGuidedLesson(problem.id, language).then(value => { if (current) setLesson(value); }, () => { if (current) setError('The guided questions could not load. Try again.'); });
    return () => { current = false; };
  }, [problem.id, language, retry]);
  return <div className="logic-editor guided-practice">
    <header className="logic-heading"><div><Link to="/practice">← Practice problems</Link><h1 ref={problemHeading} tabIndex={-1}>{problem.title}</h1><div className="logic-heading-meta">#{problem.id} · {problem.difficulty}</div></div><LanguageToggle language={language} onChange={props.onLanguageChange}/></header>
    <section className="guided-problem" aria-labelledby="guided-problem-title">
      <h2 id="guided-problem-title">Full problem & examples</h2>
      <p className="guided-problem-description">{problem.description}</p>
      {problem.examples.slice(0, 2).map((example, i) => <pre className="guided-problem-example" key={i}>{example.name}{'\n'}Input: {display(example.input)}{example.operations && `\nCalls: ${display(example.operations)}`}{'\n'}Expected: {display(example.expected)}</pre>)}
      {hasSavedDraft(problem.id) && <Link className="guided-saved-draft" to={`/practice/${problem.id}?draft=1`}>Open your saved Python draft</Link>}
    </section>
    {!currentLesson ? <section className="guided-question-card"><p role={error ? 'alert' : 'status'}>{error || 'Loading guided questions…'}</p>{error && <button type="button" className="logic-small-button" onClick={() => setRetry(value => value + 1)}>Retry questions</button>}</section> : <GuidedSession key={`${problem.id}:${language}:${currentLesson.revision}`} problem={problem} language={language} lesson={currentLesson}/>}
  </div>;
}
export function LanguageToggle({ language, onChange }: { language: Language; onChange: (value: Language) => void }) {
  return <ProgrammingLanguageToggle language={language} setLanguage={onChange}/>;
}
function GuidedSession({ problem, language, lesson }: { problem: LogicProblem; language: Language; lesson: GuidedLesson }) {
  const implementationStart = lesson.questions.findIndex(item => item.stage === 'implementation');
  const structureCount = implementationStart - 1;
  const [progress, setProgress] = useState(() => readProgress(lesson, language));
  // Revisit the plan before resuming saved implementation work. A finished
  // lesson starts a fresh attempt rather than opening directly into its code.
  const [resumeAt] = useState(() => progress.answered.length + progress.skipped.length);
  const [reviewingOpening, setReviewingOpening] = useState(resumeAt > implementationStart);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [wrongChoices, setWrongChoices] = useState<string[]>([]);
  const [saved, setSaved] = useState(true);
  const [revealKey, setRevealKey] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const feedbackElement = useRef<HTMLElement>(null);
  const focusAfterNavigation = useRef(false);
  const answeredNow = useRef<string | null>(null);
  const question = lesson.questions[questionIndex];
  const complete = !question;
  const correctPattern = lesson.questions[0].choices.find(choice => choice.correct);
  const revealedPlan = lesson.questions.filter(item => item.stage === 'structure')
    .map(item => item.choices.find(choice => choice.correct)!.feedback).join('\n\n');
  useEffect(() => {
    try { localStorage.setItem(storageKey(problem.id, language), JSON.stringify(progress)); setSaved(true); } catch { setSaved(false); }
  }, [problem.id, language, progress]);
  useEffect(() => {
    answeredNow.current = null;
    if (focusAfterNavigation.current) {
      heading.current?.focus();
      focusAfterNavigation.current = false;
    } else if (feedback?.correct) heading.current?.focus({ preventScroll: true });
  }, [question?.id, revealKey]);
  useEffect(() => {
    if (feedback) feedbackElement.current?.scrollIntoView({ block: 'nearest' });
  }, [feedback]);
  function advance() {
    const next = questionIndex + 1;
    if (reviewingOpening && next === implementationStart) {
      setReviewingOpening(false);
      setQuestionIndex(resumeAt);
    } else setQuestionIndex(Math.min(next, lesson.questions.length));
  }
  function answer(choice: GuidedChoice) {
    if (!question || answeredNow.current === question.id) return;
    setFeedback({ correct: choice.correct, text: choice.feedback, question: question.prompt, stage: question.stage, witness: choice.witness });
    if (choice.correct) {
      answeredNow.current = question.id;
      setProgress(value => ({
        ...value, attempts: value.attempts + 1,
        answered: lesson.questions.filter(item => item.id === question.id || value.answered.includes(item.id)).map(item => item.id),
        skipped: value.skipped.filter(id => id !== question.id),
      }));
      advance();
      setWrongChoices([]);
    } else {
      setProgress(value => ({ ...value, attempts: value.attempts + 1 }));
      setWrongChoices(value => [...new Set([...value, choice.id])]);
    }
  }
  function skipOrNext() {
    if (!question || answeredNow.current === question.id) return;
    answeredNow.current = question.id;
    setProgress(value => value.answered.includes(question.id) || value.skipped.includes(question.id) ? value : {
      ...value, skipped: lesson.questions.filter(item => item.id === question.id || value.skipped.includes(item.id)).map(item => item.id),
    });
    focusAfterNavigation.current = true;
    setFeedback(null); setWrongChoices([]);
    advance();
  }
  function previous() {
    if (questionIndex === 0) return;
    focusAfterNavigation.current = true;
    answeredNow.current = null;
    setFeedback(null); setWrongChoices([]);
    setQuestionIndex(value => value - 1);
  }
  function restart() {
    focusAfterNavigation.current = true;
    setReviewingOpening(false); setQuestionIndex(0);
    setProgress({ revision: lesson.revision, answered: [], skipped: [], attempts: 0 }); setFeedback(null); setWrongChoices([]); setRevealKey(value => value + 1); answeredNow.current = null;
  }
  const stageDone = (stage: GuidedQuestion['stage']) => lesson.questions.filter(item => item.stage === stage).every(item => progress.answered.includes(item.id));
  const navigation = <nav className="guided-navigation" aria-label="Question navigation">
    <button type="button" disabled={questionIndex === 0} onClick={previous}><span aria-hidden="true">← </span>Previous step</button>
    {question && <button type="button" onClick={skipOrNext}>{progress.answered.includes(question.id) ? 'Next step' : 'Skip step'}<span aria-hidden="true"> →</span></button>}
  </nav>;
  return <>
    <div className="guided-progress"><ol>{(['pattern','structure','implementation'] as const).map(stage => <li key={stage} data-active={question?.stage === stage} data-done={stageDone(stage)}><span aria-hidden="true">{stageDone(stage) ? '✓' : '•'}</span>{stageNames[stage]}</li>)}</ol><span>{complete ? progress.skipped.length ? `${progress.answered.length} answered · ${progress.skipped.length} skipped` : `${lesson.questions.length} decisions complete` : `Question ${questionIndex + 1} of ${lesson.questions.length}`}</span></div>
    {reviewingOpening && <p className="guided-question-note">Review the approach and each structure step, then continue your saved implementation.</p>}
    {feedback && <section ref={feedbackElement} className={`guided-feedback ${feedback.correct ? 'guided-feedback-correct' : 'guided-feedback-incorrect'}`} role={feedback.correct ? 'status' : 'alert'} aria-label="Answer feedback">
      <strong>{feedback.correct ? 'Correct' : feedback.stage === 'pattern' ? 'Try another approach' : 'Not quite'}</strong>
      {feedback.correct && !complete && <small>Previous decision</small>}<p>{feedback.text}</p>
      {feedback.witness && <details><summary>See the counterexample</summary><dl><div><dt>Input</dt><dd>{display(feedback.witness.input)}</dd></div>{feedback.witness.operations && <div><dt>Calls</dt><dd>{display(feedback.witness.operations)}</dd></div>}<div><dt>Expected</dt><dd>{display(feedback.witness.expected)}</dd></div><div><dt>This choice produces</dt><dd>{feedback.witness.error ? `${feedback.witness.error.type}: ${feedback.witness.error.message}` : display(feedback.witness.actual)}</dd></div></dl></details>}
    </section>}
    {question ? <><section className="guided-question-card" data-question-id={question.id} aria-label={`${stageNames[question.stage]} question`}>
      <div className="logic-eyebrow">{stageNames[question.stage]}{question.stage === 'structure' ? ` · Step ${questionIndex} of ${structureCount}` : question.stage === 'implementation' ? ` · ${language === 'python' ? 'Python' : 'JavaScript'}` : ''}</div>
      <h2 ref={heading} tabIndex={-1}>{question.prompt}</h2>
      {question.stage === 'pattern' && <p className="guided-question-note">Choose one of eight patterns. This lesson follows one worked approach; other approaches can also be valid.</p>}
      {question.stage === 'implementation' && question.context && <pre className="guided-context" aria-label="Implementation context"><code>{question.context}</code></pre>}
      <div className={`guided-choices ${question.stage === 'implementation' ? 'guided-code-choices' : question.stage === 'structure' ? 'guided-structure-choices' : ''}`}>{question.choices.map((choice, index) => <button key={`${question.id}:${choice.id}`} type="button" className="guided-choice" data-attempted={wrongChoices.includes(choice.id)} onClick={() => answer(choice)}>
        <span className="guided-choice-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
        <span>{question.stage === 'implementation' && choice.code ? <code>{choice.code.trim()}</code> : <strong>{choice.label}</strong>}{wrongChoices.includes(choice.id) && <small>Try a different choice</small>}</span>
      </button>)}</div>
      <p className="guided-question-note">Tap an answer for feedback. A correct answer moves to the next decision.</p>
    </section>{navigation}</> : <>
      <section className="guided-complete"><div className="logic-eyebrow">{progress.skipped.length ? 'END OF WALKTHROUGH' : 'DECISIONS COMPLETE'}</div><h2 ref={heading} tabIndex={-1}>Now see the implementation run.</h2><p>{progress.skipped.length ? `${progress.answered.length} of ${lesson.questions.length} decisions answered correctly. ${progress.skipped.length} skipped. Use Previous step to revisit a decision, or run the reference implementation.` : 'You worked through the approach, code structure, and implementation to the end. Step through an example and connect each decision to its effect.'}</p></section>
      {navigation}
      <Suspense fallback={<p role="status" className="logic-solution-status">Loading the completed implementation…</p>}><GuidedCodeRunner problem={problem} code={lesson.source} language={language} execution={lesson.execution}/></Suspense>
      <details className="guided-review"><summary>Review your decisions</summary><ol>{lesson.questions.map(item => { const correct=item.choices.find(choice => choice.correct)!; return <li key={item.id}><strong>{item.prompt}</strong><small className="guided-review-status">{progress.answered.includes(item.id) ? 'Answered correctly' : 'Skipped'}</small>{correct.code ? <pre><code>{correct.code.trim()}</code></pre> : <p>{correct.label}</p>}<p>{correct.feedback}</p></li>; })}</ol></details>
    </>}
    <SolutionReveal key={revealKey} id={problem.id} language={language} approach={correctPattern?.label} explanation={revealedPlan}/>
    {(!saved || progress.answered.length + progress.skipped.length > 0) && <div className="guided-footer">{!saved && <span role="status">Progress could not be saved</span>}{progress.answered.length + progress.skipped.length > 0 && <button type="button" onClick={restart}>Start again</button>}</div>}
  </>;
}
