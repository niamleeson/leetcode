import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LogicProblem } from '../../data/logic/types';
import { createBuilder, restoreBuilder, assembleSourceWithMap, getActionGroups, selectAction, insertLine, updateLine, deleteLine, moveLine, indentLine, setCursor, selectUnit, tokenChoices, replaceToken } from './builder';
import type { BuilderProgram, EditableToken } from './builder';
import { createPythonRunner } from './runtime/pythonRunner';
import type { LogicRunResult, LogicTestResult } from './runtime/types';
import SolutionReveal from './SolutionReveal';

const STORAGE_VERSION = 1;

const display = (value: unknown) => JSON.stringify(value, null, 2) ?? 'No return value';

function initialProgram(problem: LogicProblem): BuilderProgram {
  const empty = createBuilder(problem.starter, problem.interfaces);
  try {
    const raw = localStorage.getItem(`lc-logic-draft-${problem.id}`);
    if (raw && raw.length < 500_000) {
      const saved = JSON.parse(raw);
      if (saved.version === STORAGE_VERSION && saved.starter === problem.starter) return restoreBuilder(saved.program, empty);
    }
  } catch { /* A damaged or old draft must not prevent opening a problem. */ }
  return empty;
}

export default function LogicEditor({ problem }: { problem: LogicProblem }) {
  const [program, setProgram] = useState(() => initialProgram(problem));
  const [history, setHistory] = useState<BuilderProgram[]>([]);
  const [future, setFuture] = useState<BuilderProgram[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingToken, setEditingToken] = useState<EditableToken | null>(null);
  const [group, setGroup] = useState('');
  const [custom, setCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  const [more, setMore] = useState(false);
  const [variantActionId, setVariantActionId] = useState<string | null>(null);
  const [saved, setSaved] = useState(true);
  const [runStatus, setRunStatus] = useState<'idle' | 'loading' | 'running'>('idle');
  const [result, setResult] = useState<LogicRunResult | null>(null);
  const [error, setError] = useState('');
  const [caseIndex, setCaseIndex] = useState(0);
  const [step, setStep] = useState(-1);
  const runner = useRef<ReturnType<typeof createPythonRunner> | null>(null);
  const mounted = useRef(true);
  const codeArea = useRef<HTMLDivElement>(null);
  const resultsArea = useRef<HTMLDivElement>(null);
  const unit = program.units.find(u => u.id === program.activeUnitId)!;
  const selected = unit.lines.find(l => l.id === selectedId);
  const groups = useMemo(() => getActionGroups(program), [program]);
  const activeGroup = groups.find(g => g.id === group) || groups[0];
  const actions = activeGroup?.actions ?? [];
  const visibleActions = more ? actions : actions.slice(0, 4);
  const variantAction = actions.find(action => action.id === variantActionId);
  const assembly = useMemo(() => assembleSourceWithMap(program), [program]);
  const code = assembly.code;
  const test = result?.tests[caseIndex];
  const traceStep = step >= 0 ? test?.trace[step] : undefined;
  const busy = runStatus !== 'idle';

  useEffect(() => {
    try {
      localStorage.setItem(`lc-logic-draft-${problem.id}`, JSON.stringify({ version: STORAGE_VERSION, starter: problem.starter, program }));
      setSaved(true);
    } catch { setSaved(false); }
  }, [program, problem.id, problem.starter]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; runner.current?.dispose(); }; }, []);
  useEffect(() => {
    if (!traceStep) return;
    const location = assembly.lines[traceStep.line - 1];
    if (location && location.unitId !== program.activeUnitId) setProgram(p => selectUnit(p, location.unitId));
    const row = codeArea.current?.querySelector<HTMLElement>('[data-executed="true"]');
    if (row && codeArea.current) {
      const top = row.offsetTop;
      if (top < codeArea.current.scrollTop || top + row.offsetHeight > codeArea.current.scrollTop + codeArea.current.clientHeight) codeArea.current.scrollTop = Math.max(0, top - 30);
    }
  }, [step, caseIndex, traceStep, assembly.lines, program.activeUnitId]);
  useEffect(() => {
    if (!selectedId && !traceStep) codeArea.current?.querySelector('.logic-insert-point')?.scrollIntoView({ block: 'nearest' });
  }, [program.cursor, selectedId]);

  function change(next: BuilderProgram, keepSelected = false) {
    if (busy) return;
    setHistory(h => [...h.slice(-49), program]); setFuture([]); setProgram(next);
    setResult(null); setError(''); setStep(-1);
    if (!keepSelected) { setSelectedId(null); setEditingToken(null); }
  }
  function chooseGroup(id: string) {
    setGroup(id); setMore(false); setVariantActionId(null);
  }
  function undo() {
    if (!history.length || busy) return;
    setFuture(f => [program, ...f]); setProgram(history[history.length - 1]); setHistory(h => h.slice(0, -1));
    setSelectedId(null); setResult(null); setStep(-1); setError('');
  }
  function redo() {
    if (!future.length || busy) return;
    setHistory(h => [...h, program]); setProgram(future[0]); setFuture(f => f.slice(1));
    setSelectedId(null); setResult(null); setStep(-1); setError('');
  }
  function add(text: string) {
    change(selected ? updateLine(program, selected.id, text) : insertLine(program, text));
    setCustom(false); setCustomText(''); setVariantActionId(null);
  }
  async function run() {
    setError(''); setResult(null); setStep(-1); setSelectedId(null);
    runner.current ??= createPythonRunner();
    try {
      setRunStatus('loading');
      const value = await runner.current.run({ problemId: problem.id, code, fixtures: problem.fixtures }, status => { if (mounted.current) setRunStatus(status); });
      if (!mounted.current) return;
      setResult(value);
      const firstFailure = value.tests.findIndex(t => !t.passed);
      setCaseIndex(firstFailure >= 0 ? firstFailure : 0);
      setTimeout(() => resultsArea.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 0);
    } catch (e) {
      if (mounted.current) setError(e instanceof Error && e.name === 'AbortError' ? 'Run stopped. Your code is saved; edit it and try again.' : e instanceof Error ? e.message : 'Python could not run. Please retry.');
    } finally { if (mounted.current) setRunStatus('idle'); }
  }
  function selectLine(id: string) {
    if (busy) return;
    const line = unit.lines.find(l => l.id === id)!;
    setSelectedId(selectedId === id ? null : id);
    setProgram(p => setCursor(p, { unitId: unit.id, index: unit.lines.indexOf(line) + 1, indent: line.indent }));
    setCustom(false); setCustomText(line.text);
    setEditingToken(null);
    chooseGroup(/^return\b/.test(line.text) ? 'return' : /^(if|elif|else)\b/.test(line.text) ? 'check' : /^(for|while)\b/.test(line.text) ? 'loop' : 'update');
  }
  // Each method body appears verbatim in the assembled source. Match its header
  // first, so equal statements in different methods retain their own line numbers.
  const sourceLines = code.split('\n');
  const headerIndex = sourceLines.findIndex(line => line.trim() === unit.signature.trim());
  const sourceLineFor = (index: number) => assembly.lines.findIndex(location => location?.unitId === unit.id && location.lineId === unit.lines[index].id) + 1;

  return <div className="logic-editor">
    <header className="logic-heading"><div><Link to="/practice">← Practice problems</Link><h1>{problem.title}</h1><div className="logic-heading-meta">#{problem.id} · {problem.difficulty} · Python</div></div><span className="logic-save" role="status">{saved ? 'Draft saved on this device' : 'Draft could not save'}</span></header>
    <details className="logic-question"><summary>Problem & examples</summary><div className="logic-question-content"><p>{problem.description}</p>{problem.examples.slice(0, 2).map((example, i) => <pre key={i}>{example.name}{'\n'}Input: {display(example.input)}{example.operations && `\nOperations: ${display(example.operations)}`}{'\n'}Expected: {display(example.expected)}</pre>)}</div></details>
    <div className="logic-workspace">
      <section className="logic-code-panel" aria-label="Your Python code">
        <div className="logic-code-top"><strong>Your code</strong><span>Tap a line to change it</span></div>
        {program.units.length > 1 && <label className="logic-unit-select"><select aria-label="Choose function to build" value={unit.id} disabled={busy} onChange={e => { setProgram(p => selectUnit(p, e.target.value)); setSelectedId(null); }}>{program.units.map(u => <option key={u.id} value={u.id}>{u.className ? `${u.className}.` : ''}{u.name}</option>)}</select></label>}
        <div className="logic-source" ref={codeArea}>
          {unit.className && <div className="logic-source-header"><span className="logic-line-number">{sourceLines.findIndex(line => line.trim() === `class ${unit.className}:`) + 1}</span><code>class {unit.className}:</code></div>}
          <div className="logic-source-header"><span className="logic-line-number">{headerIndex + 1}</span><code>{unit.className ? '    ' : ''}{unit.signature}</code></div>
          {!unit.lines.length && <div className="logic-empty">Your function starts empty. Decide what it needs to remember, repeat, check, or return.</div>}
          {unit.lines.map((line, index) => <div key={line.id}>
            {program.cursor.index === index && !selected && <div className="logic-insert-point" style={{ paddingLeft: 44 + (program.cursor.indent + (unit.className ? 2 : 1)) * 16 }}>Add here</div>}
            <button className="logic-source-line" data-selected={selectedId === line.id} data-executed={traceStep?.line === sourceLineFor(index)} aria-pressed={selectedId === line.id} disabled={busy} onClick={() => selectLine(line.id)} aria-label={`Line ${sourceLineFor(index)}: ${line.text}`}><span className="logic-line-number">{sourceLineFor(index)}</span><code>{'    '.repeat(line.indent + (unit.className ? 2 : 1))}{line.text}</code></button>
          </div>)}
          {program.cursor.index >= unit.lines.length && !selected && <div className="logic-insert-point" style={{ paddingLeft: 44 + (program.cursor.indent + (unit.className ? 2 : 1)) * 16 }}>Add here{program.cursor.indent > 0 ? ' · inside block' : ''}</div>}
        </div>
        <div className="logic-editor-toolbar">
          {selected ? <>
            <button disabled={busy} onClick={() => { setSelectedId(null); setProgram(p => setCursor(p, { unitId: unit.id, index: unit.lines.findIndex(l => l.id === selected.id) + 1, indent: selected.indent + (selected.text.endsWith(':') ? 1 : 0) })); }}>Insert after</button>
            <button aria-label="Move line up" title="Move up" disabled={busy || unit.lines[0]?.id === selected.id} onClick={() => change(moveLine(program, selected.id, -1), true)}>↑</button>
            <button aria-label="Move line down" title="Move down" disabled={busy || unit.lines[unit.lines.length - 1]?.id === selected.id} onClick={() => change(moveLine(program, selected.id, 1), true)}>↓</button>
            <button aria-label="Move line out one level" disabled={busy || selected.indent === 0} onClick={() => change(indentLine(program, selected.id, -1), true)}>← Level</button>
            <button aria-label="Move line in one level" disabled={busy} onClick={() => change(indentLine(program, selected.id, 1), true)}>Level →</button>
            <button className="logic-delete" disabled={busy} onClick={() => change(deleteLine(program, selected.id))}>Delete</button>
          </> : <>
            <button disabled={busy || !history.length} onClick={undo}>Undo</button><button disabled={busy || !future.length} onClick={redo}>Redo</button>
            <button disabled={busy || program.cursor.indent === 0} onClick={() => setProgram(p => setCursor(p, { indent: Math.max(0, p.cursor.indent - 1) }))}>Exit block</button>
            <button disabled={busy} onClick={() => setProgram(p => setCursor(p, { indent: p.cursor.indent + 1 }))}>Enter block</button>
          </>}
        </div>
      </section>
      <section className="logic-composer" aria-label="Choose a statement">
        <div className="logic-composer-heading"><strong>{selected ? 'Change this line' : 'What should happen next?'}</strong><small>{selected ? 'Tap a replacement' : 'One tap adds a statement'}</small></div>
        {selected && <div className="logic-edit-parts" aria-label="Change part of the statement">
          {tokenChoices(program, selected.id).map(token => <button key={token.start} disabled={busy} aria-label={`Change ${token.text} at position ${token.start + 1}`} aria-pressed={editingToken?.start === token.start} onClick={() => setEditingToken(editingToken?.start === token.start ? null : token)}>{token.text}</button>)}
        </div>}
        {selected && editingToken && <div className="logic-token-options"><span>Replace <code>{editingToken.text}</code> with:</span><div className="logic-edit-parts">{editingToken.choices.map(choice => <button key={choice} disabled={busy} onClick={() => { change(replaceToken(program, selected.id, editingToken.start, editingToken.end, choice), true); setEditingToken(null); }}>{choice}</button>)}</div></div>}
        <div className="logic-groups" aria-label="Statement categories">{groups.map(g => <button key={g.id} aria-pressed={g.id === activeGroup?.id} onClick={() => chooseGroup(g.id)}>{g.label}</button>)}</div>
        <div className="logic-action-list">{visibleActions.map(action => <div key={action.id} className="logic-action-card"><button className="logic-action" onClick={() => action.command ? setProgram(p => selectAction(p, action)) : add(action.text)} disabled={busy}><strong>{action.label}</strong><code>{action.text}</code></button>{action.variants.length > 1 && <button className="logic-variants-toggle" disabled={busy} aria-label={`Options for ${action.label}`} aria-expanded={variantActionId === action.id} onClick={() => setVariantActionId(variantActionId === action.id ? null : action.id)}>⋯</button>}</div>)}</div>
        {variantAction && <div className="logic-variant-panel"><div><strong>Choose a statement</strong><button aria-label="Close statement options" onClick={() => setVariantActionId(null)}>×</button></div><div>{variantAction.variants.map(text => <button key={text} disabled={busy} onClick={() => add(text)}><code>{text}</code></button>)}</div></div>}
        <div className="logic-composer-bottom">{actions.length > 4 && <button onClick={() => setMore(!more)}>{more ? 'Fewer statements' : 'More statements'}</button>}<button onClick={() => { setCustom(!custom); setCustomText(selected?.text ?? ''); }}>{selected ? 'Edit expression…' : 'Custom statement…'}</button>{selected && <button onClick={() => setSelectedId(null)}>Done</button>}</div>
        {custom && <form className="logic-custom" onSubmit={e => { e.preventDefault(); if (customText.trim() && !(selected && /[\r\n]/.test(customText.trim()))) add(customText.trim()); }}><label htmlFor="logic-custom-line">{selected ? 'Change this one line' : 'Add Python statements'}</label><textarea id="logic-custom-line" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Python statement" /><button className="logic-small-button" type="submit" disabled={!customText.trim() || busy || !!(selected && /[\r\n]/.test(customText.trim()))}>{selected ? 'Replace line' : 'Add statement'}</button>{selected && /[\r\n]/.test(customText.trim()) && <p className="logic-bottom-note">Replace one line at a time. Use Insert after to add more lines.</p>}</form>}
      </section>
    </div>
    <div className="logic-run-bar">
      <button className="logic-run-button" onClick={busy ? () => runner.current?.stop() : run}>{busy ? 'Stop' : 'Run tests'}</button>
      <div className="logic-run-meta" role="status">{runStatus === 'loading' ? <span className="logic-runtime-status">Starting Python… First run downloads the runner.</span> : runStatus === 'running' ? <span className="logic-runtime-status">Running your code…</span> : <>{problem.fixtures.length} practice tests · Runs on your device<br/>Python downloads only when you press Run.</>}</div>
      <button className="logic-small-button" disabled={busy || !program.units.some(u => u.lines.length)} onClick={() => change(createBuilder(problem.starter, problem.interfaces))}>Clear</button>
    </div>
    <SolutionReveal id={problem.id} />
    {error && <p className="logic-error" role="alert">{error}</p>}
    {result && <section className="logic-results" ref={resultsArea} aria-label="Test results">
      <div className="logic-results-heading"><strong className={result.passed === result.total ? 'logic-pass' : 'logic-fail'}>{result.passed} / {result.total} practice tests passed</strong><small>Your code, actually executed</small></div>
      <div className="logic-test-tabs">{result.tests.map((t, i) => <button key={i} aria-pressed={i === caseIndex} className={t.passed ? 'logic-pass' : 'logic-fail'} onClick={() => { setCaseIndex(i); setStep(-1); }}>{t.passed ? '✓' : '·'} {t.name}</button>)}</div>
      {test && <TestDetails test={test} step={step} setStep={setStep} code={code} operations={problem.fixtures[caseIndex]?.operations} />}
      <div className="logic-learning-note">{result.passed === result.total ? <>Explain to yourself why the order works. Try a fresh attempt later to check what you remember.</> : <>Follow a failing input. Which line first changes the state in a way you did not expect?</>} These are practice cases, not the complete LeetCode judge.</div>
    </section>}
    <p className="logic-bottom-note">Choices come from your inputs and your code. You decide which statements belong and in what order.</p>
  </div>;
}

function TestDetails({ test, step, setStep, operations, code }: { test: LogicTestResult; step: number; setStep: (value: number) => void; operations?: [string, unknown[]][]; code: string }) {
  const current = step >= 0 ? test.trace[step] : undefined;
  return <div className="logic-test-detail">
    <dl className="logic-case-values"><div><dt>{operations ? 'Constructor input' : 'Input'}</dt><dd>{display(test.input)}</dd></div>{operations && <div className="logic-operation-list"><dt>Calls in order</dt><dd>{operations.map(([name, args], i) => `${i + 1}. ${name}(${args.map(arg => JSON.stringify(arg)).join(', ')})`).join('\n')}</dd></div>}<div><dt>Expected</dt><dd>{display(test.expected)}</dd></div><div><dt>Your result</dt><dd>{test.error ? `${test.error.type}: ${test.error.message}` : display(test.actual)}</dd></div></dl>
    {test.error?.line && <p className="logic-error">Python stopped at line {test.error.line}. {test.error.message}</p>}
    {!!test.trace.length && <div className="logic-debug">
      <div className="logic-debug-controls"><button className="logic-small-button" disabled={step < 0} onClick={() => setStep(Math.max(-1, step - 1))}>Back</button><input type="range" aria-label="Execution step" min={-1} max={test.trace.length - 1} value={step} onChange={e => setStep(Number(e.target.value))} /><button className="logic-small-button" disabled={step >= test.trace.length - 1} onClick={() => setStep(step + 1)}>{step < 0 ? 'Step through' : 'Next'}</button></div>
      <p className="logic-debug-caption">{current ? `Step ${step + 1} / ${test.trace.length} · line ${current.line} · ${current.functionName} · ${current.kind === 'call' ? 'entering function' : current.kind === 'return' ? 'returning' : current.kind === 'error' ? 'error' : 'after execution'}` : 'Predict what changes, then step through your code.'}{test.traceTruncated && ' · Trace shortened: the final frame jumps to the latest step.'}</p>
      {current && <pre className="logic-current-statement" aria-label="Current executed statement"><code>{code.split('\n')[current.line - 1]?.trim() ?? 'Execution finished'}</code></pre>}
      {current && <dl className="logic-locals">{Object.entries(current.locals).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}{current.value !== undefined && <div><dt>return</dt><dd>{current.value}</dd></div>}</dl>}
    </div>}
    {test.stdout && <details><summary>Printed output</summary><pre>{test.stdout}</pre></details>}
  </div>;
}
