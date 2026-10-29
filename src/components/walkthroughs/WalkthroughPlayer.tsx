import { ReactNode, useId, useState } from 'react';
import { TraversalStep } from '../../data/walkthroughs/traversals';
import './traversalWalkthrough.css';

interface PlayerProps<Step extends TraversalStep> {
  name: string;
  examples: Array<{ name: string; steps: Step[] }>;
  children: (step: Step, exampleIndex: number) => ReactNode;
}

export default function WalkthroughPlayer<Step extends TraversalStep>({ name, examples, children }: PlayerProps<Step>) {
  const headingId = useId();
  const [exampleIndex, setExampleIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const steps = examples[exampleIndex].steps;
  const step = steps[stepIndex];

  return (
    <section className="traversal-walkthrough" aria-label={`${name} walkthrough`}>
      <div className="traversal-header">
        <h4 id={headingId}>Step-by-Step Walkthrough</h4>
        <select aria-label={`${name} example`} value={exampleIndex} onChange={event => {
          setExampleIndex(Number(event.target.value));
          setStepIndex(0);
        }}>
          {examples.map((example, index) => <option key={example.name} value={index}>{example.name}</option>)}
        </select>
      </div>

      <div className={`traversal-status ${step.noop ? 'is-noop' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        <div className="traversal-action"><span className="traversal-badge">{step.noop ? 'NOOP' : 'STEP'}</span><strong>{step.title}</strong></div>
        <p>{step.detail}</p>
      </div>

      {children(step, exampleIndex)}

      <div className="traversal-controls">
        <input
          type="range" min={0} max={steps.length - 1} value={stepIndex}
          aria-label={`${name} step`} aria-valuetext={`Step ${stepIndex} of ${steps.length - 1}: ${step.title}`}
          onChange={event => setStepIndex(Number(event.target.value))}
        />
        <div className="traversal-control-row">
          <div className="traversal-control-group">
            <button type="button" className="traversal-reset" disabled={stepIndex === 0} onClick={() => setStepIndex(0)}>Reset</button>
            <span className="traversal-step-count">{stepIndex === 0 ? 'Ready' : `Step ${stepIndex} of ${steps.length - 1}`}</span>
          </div>
          <div className="traversal-control-group">
            <button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex(index => Math.max(0, index - 1))}>Back</button>
            <button type="button" className="traversal-next" disabled={stepIndex === steps.length - 1} onClick={() => setStepIndex(index => Math.min(steps.length - 1, index + 1))}>Next →</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TraceQueue({ entries, changed, remaining }: { entries: Array<{ id: string; label: string }>; changed?: string; remaining?: number }) {
  return (
    <div className="traversal-panel">
      <div className="traversal-panel-heading"><h5>Queue</h5><span>front → back</span></div>
      <ol className="traversal-chips" aria-label="Queue, front to back">
        {entries.length ? entries.map((entry, index) => (
          <li key={entry.id} className={`traversal-chip ${entry.id === changed ? 'is-changed' : ''}`} aria-label={`${entry.label}${index === 0 ? ', front' : ''}`}>
            {entry.label}
          </li>
        )) : <li className="traversal-empty">Empty</li>}
      </ol>
      <p className="traversal-remaining">{remaining === undefined ? 'Round not started.' : <>Left to dequeue this round: <strong>{remaining}</strong></>}</p>
    </div>
  );
}
