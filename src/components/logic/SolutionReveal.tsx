import { lazy, Suspense, useState } from 'react';
const PracticeSolution = lazy(() => import('./PracticeSolution'));
interface Props { id: number; language?: 'python' | 'javascript'; approach?: string; explanation?: string }
export default function SolutionReveal(props: Props) {
  return <RevealContent key={`${props.id}:${props.language ?? 'python'}`} {...props} />;
}
function RevealContent({ id, language = 'python', approach, explanation }: Props) {
  const [revealed, setRevealed] = useState(true);
  const target = `practice-solution-${id}-${language}`;
  return <section className="logic-reference" aria-label="Reference solution">
    <button type="button" className="logic-reveal-button" aria-expanded={revealed} aria-controls={target} onClick={() => setRevealed(value => !value)}>
      <span>Solution</span><span aria-hidden="true">{revealed ? '−' : '+'}</span>
    </button>
    <div id={target} hidden={!revealed}>{revealed && <Suspense fallback={<p className="logic-solution-status" role="status">Loading solution…</p>}><PracticeSolution id={id} language={language} approach={approach} explanation={explanation}/></Suspense>}</div>
  </section>;
}
