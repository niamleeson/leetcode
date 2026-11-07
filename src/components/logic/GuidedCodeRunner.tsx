import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { LogicProblem } from '../../data/logic/types';
import { createPythonRunner } from './runtime/pythonRunner';
import { createJavaScriptRunner } from './runtime/javascriptRunner';
import type { JavaScriptExecution } from './runtime/javascriptRunner';
import type { LogicRunResult, LogicRunStatus, LogicTestResult } from './runtime/types';
import './guidedRunner.css';

// This component is mounted only after the guided questions are complete.
const CodeBlock = lazy(() => import('../CodeBlock'));
const display = (value: unknown) => {
  const compact = JSON.stringify(value) ?? 'No result';
  return compact.length <= 100 ? compact : JSON.stringify(value, null, 2) ?? 'No result';
};

export interface GuidedCodeRunnerProps {
  problem: LogicProblem;
  code: string;
  language?: 'python' | 'javascript';
  execution?: JavaScriptExecution;
}

export default function GuidedCodeRunner({ problem, code, language = 'python', execution }: GuidedCodeRunnerProps) {
  const [status, setStatus] = useState<'idle' | LogicRunStatus>('idle');
  const [result, setResult] = useState<LogicRunResult | null>(null);
  const [error, setError] = useState('');
  const [caseIndex, setCaseIndex] = useState(0);
  const [step, setStep] = useState(-1);
  const runner = useRef<ReturnType<typeof createPythonRunner> | null>(null);
  const javascript = useRef<ReturnType<typeof createJavaScriptRunner> | null>(null);
  const generation = useRef(0);
  const busy = status !== 'idle';
  const test = result?.tests[caseIndex];
  const languageName = language === 'javascript' ? 'JavaScript' : 'Python';

  useEffect(() => {
    ++generation.current;
    setStatus('idle'); setResult(null); setError(''); setCaseIndex(0); setStep(-1);
    return () => {
      ++generation.current;
      runner.current?.dispose();
      runner.current = null;
      javascript.current?.dispose();
      javascript.current = null;
    };
  }, [problem.id, problem.fixtures, code, language, execution]);

  async function run() {
    if (busy) return;
    const current = ++generation.current;
    setStatus('loading'); setResult(null); setError(''); setStep(-1);
    try {
      const reportStatus = (next: LogicRunStatus) => {
        if (generation.current === current) setStatus(next);
      };
      const request = { problemId: problem.id, code, fixtures: problem.fixtures };
      let value: LogicRunResult;
      if (language === 'javascript') {
        if (!execution) throw new Error('JavaScript preparation is missing. Please reload this lesson.');
        javascript.current ??= createJavaScriptRunner();
        value = await javascript.current.run({ ...request, execution }, reportStatus);
      } else {
        runner.current ??= createPythonRunner();
        value = await runner.current.run(request, reportStatus);
      }
      if (generation.current !== current) return;
      setResult(value);
      const failure = value.tests.findIndex(item => !item.passed);
      setCaseIndex(failure < 0 ? 0 : failure);
    } catch (cause) {
      if (generation.current !== current) return;
      setError(cause instanceof Error && cause.name === 'AbortError'
        ? 'Run stopped. Press Run tests when you are ready to try again.'
        : cause instanceof Error ? cause.message : `${languageName} could not run. Please try again.`);
    } finally {
      if (generation.current === current) setStatus('idle');
    }
  }

  return <section className="guided-runner" aria-label={`Completed ${languageName} solution`}>
    <header className="guided-runner-heading"><h2>Your completed solution</h2><p>Read how your decisions fit together, then run the practice tests.</p></header>
    <div className="guided-runner-source" aria-label={`Completed ${languageName} code`}>
      <Suspense fallback={<pre>{code}</pre>}><CodeBlock code={code} language={language} /></Suspense>
    </div>
    <div className="guided-runner-actions">
      <button type="button" className="guided-runner-primary" onClick={busy ? () => { runner.current?.stop(); javascript.current?.stop(); } : run}>{busy ? 'Stop' : 'Run tests'}</button>
      <p role="status">{status === 'loading' ? language === 'python' ? 'Starting Python… The first run downloads the runner.' : 'Starting JavaScript…'
        : status === 'running' ? 'Running the completed code…'
        : `${problem.fixtures.length} practice tests · Runs on your device.${language === 'python' ? ' Python loads when you press Run.' : ''}`}</p>
    </div>
    {error && <p className="guided-runner-error" role="alert">{error}</p>}
    {result && <section className="guided-runner-results" aria-label="Test results">
      <h3 className={result.passed === result.total ? 'guided-runner-pass' : 'guided-runner-fail'} role="status">{result.passed} / {result.total} practice tests passed</h3>
      <div className="guided-runner-cases" aria-label="Choose a practice case">{result.tests.map((item, index) =>
        <button type="button" key={index} aria-label={`${item.name} — ${item.passed ? 'passed' : 'failed'}`} aria-pressed={caseIndex === index} className={item.passed ? 'guided-runner-pass' : 'guided-runner-fail'} onClick={() => { setCaseIndex(index); setStep(-1); }}>
          <span aria-hidden="true">{item.passed ? '✓' : '×'} </span>{item.name}<span className="guided-runner-sr-only">{item.passed ? ' — passed' : ' — failed'}</span>
        </button>)}</div>
      {test && <GuidedTestDetails test={test} code={code} languageName={languageName} fixture={problem.fixtures[caseIndex]} step={step} setStep={setStep} />}
      <p className="guided-runner-note">{result.passed === result.total ? 'Pick an input and predict the next change before stepping through.' : 'Follow a failing input and compare what the code does with what you expected.'} These practice cases do not include the complete LeetCode judge.</p>
    </section>}
  </section>;
}

function GuidedTestDetails({ test, code, languageName, fixture, step, setStep }: {
  test: LogicTestResult;
  code: string;
  languageName: string;
  fixture: LogicProblem['fixtures'][number] | undefined;
  step: number;
  setStep: (value: number) => void;
}) {
  const current = step < 0 ? undefined : test.trace[step];
  const operations = fixture?.operations;
  const calls: [string, unknown[]][] = operations ? [[fixture.entry, test.input], ...operations] : [];
  const expectedOperations = Array.isArray(test.expected) ? test.expected : [];
  const actualOperations = Array.isArray(test.actual) ? test.actual : [];
  const actualStatement = current ? current.statement ?? code.split('\n')[current.line - 1] : undefined;
  return <div className="guided-runner-detail">
    {operations ? <div className="guided-runner-operation-scroll" tabIndex={0}>
      <table className="guided-runner-operation-table"><caption>Constructor and calls in order</caption><thead><tr><th scope="col">Call</th><th scope="col">Expected</th><th scope="col">Actual</th></tr></thead><tbody>{calls.map(([name, args], index) => <tr key={index}>
        <th scope="row"><code>{name}({args.map(arg => JSON.stringify(arg)).join(', ')})</code></th>
        <td><pre>{display(expectedOperations[index])}</pre></td><td><pre>{index < actualOperations.length ? display(actualOperations[index]) : 'No result'}</pre></td>
      </tr>)}</tbody></table>
    </div> : <dl className="guided-runner-values">
      <div><dt>Input</dt><dd><pre>{display(test.input)}</pre></dd></div>
      <div><dt>Expected</dt><dd><pre>{display(test.expected)}</pre></dd></div>
      <div><dt>Actual</dt><dd><pre>{display(test.actual)}</pre></dd></div>
    </dl>}
    {test.error && <p className="guided-runner-error" role="alert">{test.error.type}{test.error.line ? ` at line ${test.error.line}` : ''}: {test.error.message}</p>}
    {!!test.trace.length && <section className="guided-runner-debugger" aria-label={`${languageName} execution debugger`}>
      <div className="guided-runner-step-controls">
        <button type="button" disabled={step < 0} onClick={() => setStep(step - 1)}>Back</button>
        <input type="range" aria-label="Execution step" min={-1} max={test.trace.length - 1} value={step} onChange={event => setStep(Number(event.target.value))} />
        <button type="button" disabled={step >= test.trace.length - 1} onClick={() => setStep(step + 1)}>{step < 0 ? 'Step through' : 'Next'}</button>
      </div>
      <p className="guided-runner-step-caption" role="status">{current
        ? `Step ${step + 1} / ${test.trace.length} · line ${current.line} · ${current.functionName} · ${current.detail ?? (current.kind === 'call' ? 'entering function' : current.kind === 'return' ? 'returning' : current.kind === 'error' ? 'error' : 'after execution')}`
        : 'Predict what changes, then step through the code.'}</p>
      {test.traceTruncated && <p className="guided-runner-note">The trace is shortened. The final frame jumps to the latest recorded step.</p>}
      {current && <div className="guided-runner-debug-state">
        <div className="guided-runner-statement"><h4>{current.kind === 'call' ? 'Entering this function' : current.kind === 'error' ? 'Statement that raised an error' : 'Executed statement'}</h4>
          <pre aria-label="Current executed statement"><code>{actualStatement?.trim() ?? 'Source line unavailable'}</code></pre>
          {current.stack.length > 1 && <p className="guided-runner-stack">Calls: {current.stack.join(' → ')}</p>}
        </div>
        <div className="guided-runner-variables"><h4>{current.kind === 'call' ? 'Variables on entry' : current.kind === 'error' ? 'Variables when execution stopped' : 'Variables after this step'}</h4>
          {Object.keys(current.locals).length || current.value !== undefined ? <dl aria-label={`${languageName} variables`}>{Object.entries(current.locals).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}{current.value !== undefined && <div><dt>{current.valueLabel ?? 'return'}</dt><dd>{current.value}</dd></div>}</dl> : <p>No local variables yet.</p>}
        </div>
      </div>}
    </section>}
    {!!test.stdout && <details className="guided-runner-stdout"><summary>Printed output</summary><pre>{test.stdout}</pre></details>}
  </div>;
}
