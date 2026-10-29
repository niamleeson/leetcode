import { useId, useMemo, useState } from 'react';
import { buildRpnSteps, rpnExamples, StackValue } from '../data/walkthroughs/reverse-polish-notation';
import './rpnWalkthrough.css';

const operatorLabels = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function Operand({ label, entry, changed }: { label: string; entry?: StackValue; changed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-gray-400 light:text-gray-500">{label}</span>
      <span
        key={entry?.id ?? 'empty'}
        className={`rpn-value ${changed ? 'rpn-value-changed rpn-value-arriving' : ''} ${!entry ? 'rpn-value-empty' : ''}`}
        aria-label={`${label} operand: ${entry?.value ?? 'empty'}`}
      >
        {entry?.value ?? '—'}
      </span>
    </div>
  );
}

export default function RpnWalkthrough() {
  const headingId = useId();
  const [exampleIndex, setExampleIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const example = rpnExamples[exampleIndex];
  const steps = useMemo(() => buildRpnSteps(example.tokens), [example]);
  const step = steps[stepIndex];
  const maxDepth = Math.max(...steps.map(frame => frame.stack.length));
  const complete = step.action === 'return';
  const movingOut = step.action === 'pop-left' || step.action === 'pop-right';
  const currentToken = step.tokenIndex === null ? null : example.tokens[step.tokenIndex];

  return (
    <section aria-labelledby={headingId} className="rpn-walkthrough mt-4 rounded-lg border border-gray-800 light:border-gray-200 bg-gray-900 light:bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 id={headingId} className="text-sm font-semibold text-gray-100 light:text-gray-900">Step-by-Step Walkthrough</h4>
        <select
          aria-label="Walkthrough example"
          value={exampleIndex}
          onChange={event => {
            setExampleIndex(Number(event.target.value));
            setStepIndex(0);
          }}
          className="max-w-full rounded-md border border-gray-700 light:border-gray-300 bg-gray-950 light:bg-white px-2 py-1.5 text-xs text-gray-300 light:text-gray-700"
        >
          {rpnExamples.map((item, index) => <option key={item.name} value={index}>{item.name}</option>)}
        </select>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-xs text-gray-400 light:text-gray-500">Tokens</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Input tokens">
          {example.tokens.map((token, tokenIndex) => {
            const active = tokenIndex === step.tokenIndex;
            const processed = complete || (step.tokenIndex !== null && tokenIndex < step.tokenIndex);
            return (
              <button
                type="button"
                key={tokenIndex}
                aria-label={`Jump to token ${tokenIndex + 1}: ${token}`}
                aria-current={active ? 'step' : undefined}
                onClick={() => setStepIndex(steps.findIndex(frame => frame.tokenIndex === tokenIndex))}
                className={`rpn-token ${active ? 'rpn-token-active' : ''} ${processed ? 'rpn-token-processed' : ''}`}
              >
                {token}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 min-h-[3.5rem]" role="status" aria-live="polite" aria-atomic="true">
        <p className="text-base font-semibold text-gray-100 light:text-gray-900">{step.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-400 light:text-gray-500">{step.detail}</p>
        <span className="sr-only">Stack, bottom to top: {step.stack.map(entry => entry.value).join(', ') || 'empty'}.</span>
      </div>

      <div className="rpn-stage mt-3">
        <div className="min-w-0">
          <p className="mb-3 text-center text-xs font-medium text-gray-400 light:text-gray-500">Stack</p>
          <div
            role="list"
            aria-label="Stack, bottom to top"
            className="rpn-stack"
            style={{ minHeight: `${maxDepth * 52 + 16}px` }}
          >
            {step.stack.length === 0 ? (
              <span className="text-xs text-gray-500">Empty</span>
            ) : step.stack.map((entry, index) => (
              <div key={entry.id} role="listitem" aria-label={`${entry.value}${index === step.stack.length - 1 ? ', top' : ''}`} className="rpn-stack-entry">
                <span className={`rpn-value ${entry.id === step.changedId ? 'rpn-value-changed' : ''} ${entry.id === step.changedId && !complete ? 'rpn-value-pushed' : ''}`}>
                  {entry.value}
                </span>
                {index === step.stack.length - 1 && <span className="rpn-top">Top</span>}
              </div>
            ))}
          </div>
        </div>

        <span aria-hidden="true" className={`rpn-direction ${step.action === 'start' || complete ? 'invisible' : ''}`}>
          {movingOut ? '→' : '←'}
        </span>

        <div className="flex min-w-0 flex-col items-center justify-center gap-4">
          {step.operator ? (
            <>
              <div className="flex items-end justify-center gap-2 sm:gap-4">
                <Operand label="Left" entry={step.left} changed={step.action === 'pop-left'} />
                <span className="pb-3 text-xl text-gray-400 light:text-gray-500" aria-label={`Operator ${step.operator}`}>{operatorLabels[step.operator]}</span>
                <Operand label="Right" entry={step.right} changed={step.action === 'pop-right'} />
              </div>
              <p className="h-6 text-center text-sm font-medium text-sky-300 light:text-sky-700">
                {step.result ? `= ${step.result.value} · back onto the stack` : '\u00a0'}
              </p>
            </>
          ) : complete ? (
            <div className="text-center">
              <p className="text-xs text-gray-400 light:text-gray-500">Answer</p>
              <p className="mt-2 font-mono text-4xl font-semibold text-sky-300 light:text-sky-700">{step.result?.value}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs text-gray-400 light:text-gray-500">{currentToken === null ? 'Next token' : 'Number'}</span>
              <span className="rpn-value">{currentToken ?? example.tokens[0]}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 light:border-gray-100 pt-4">
        <div className="flex items-center gap-3">
          <button type="button" className="rpn-reset" disabled={stepIndex === 0} onClick={() => setStepIndex(0)}>Reset</button>
          <span className="text-xs tabular-nums text-gray-400 light:text-gray-500">{stepIndex === 0 ? 'Ready' : `Step ${stepIndex} of ${steps.length - 1}`}</span>
        </div>
        <div className="flex gap-2">
          <button type="button" className="rpn-control" disabled={stepIndex === 0} onClick={() => setStepIndex(index => Math.max(0, index - 1))}>Back</button>
          <button type="button" className="rpn-control rpn-next" disabled={complete} onClick={() => setStepIndex(index => Math.min(steps.length - 1, index + 1))}>Next →</button>
        </div>
      </div>
    </section>
  );
}
