import { useState } from 'react';
import { ExecutionStep, TraceHeap, TraceLanguage, TraceObject, TraceValue, formatTraceValue, isReference, objectFor, valueChanged } from '../../data/walkthroughs/execution';
import './executionInspector.css';

interface InspectorProps {
  step: ExecutionStep;
  previous?: ExecutionStep;
  heap: TraceHeap;
  previousHeap: TraceHeap;
  variableOrder: string[];
  complete: boolean;
  argumentsSnapshot?: Record<string, TraceValue>;
  previousArgumentsSnapshot?: Record<string, TraceValue>;
  language?: TraceLanguage;
}

interface ChildValue {
  key: string;
  name: string;
  value: TraceValue;
  before?: TraceValue;
}

const owns = (record: Record<string, TraceValue>, name: string) => Object.prototype.hasOwnProperty.call(record, name);
const equal = (first: TraceValue, second: TraceValue) => JSON.stringify(first) === JSON.stringify(second);

// Input records retain the original call values. Carry the latest root-frame
// bindings through helper calls without confusing a helper's shadowing parameter
// with a root argument. Each snapshot is independent so rewinding is deterministic.
export function argumentSnapshotsFor(steps: ExecutionStep[]): Record<string, TraceValue>[] {
  let current: Record<string, TraceValue> = {};
  let inputSignature: string | undefined;
  let rootFrame: string | undefined;
  return steps.map(step => {
    const signature = JSON.stringify(step.input);
    const topLevel = step.stack.length === 1;
    if (signature !== inputSignature || step.stack[0] !== rootFrame || (topLevel && step.kind === 'call')) {
      current = { ...step.input };
    }
    if (topLevel) {
      for (const name of Object.keys(step.input)) {
        if (owns(step.state, name)) current[name] = step.state[name];
      }
    }
    inputSignature = signature;
    rootFrame = step.stack[0];
    return { ...current };
  });
}

function valueType(value: TraceValue | undefined, object: TraceObject | undefined, language: TraceLanguage): string {
  if (object) {
    const types = { array: 'Array', object: 'Object', map: 'Map', set: 'Set', tree: 'TreeNode', list: 'ListNode', graph: 'GraphNode', quad: 'QuadNode' };
    const count = object.items?.length ?? object.entries?.length;
    const pythonTypes = { array: 'list', object: 'object', map: 'dict', set: 'set', tree: 'TreeNode', list: 'ListNode', graph: 'Node', quad: 'Node' };
    const type = language === 'python' ? object.typeName ?? pythonTypes[object.kind] : types[object.kind];
    return `${type}${count === undefined ? '' : `(${count})`}`;
  }
  if (value === null) return language === 'python' ? 'NoneType' : 'null';
  if (language === 'python' && typeof value === 'boolean') return 'bool';
  if (language === 'python' && typeof value === 'string') return 'str';
  if (language === 'python' && typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float';
  if (value && typeof value === 'object' && '$scalar' in value) {
    if (value.$scalar === 'undefined') return 'undefined';
    if (value.$scalar === 'function') return 'function';
    if (/^-?\d+n$/.test(value.$scalar)) return 'bigint';
    return language === 'python' ? 'float' : 'number';
  }
  return typeof value;
}

function childrenFor(object: TraceObject, old: TraceObject | undefined, heap: TraceHeap, language: TraceLanguage): ChildValue[] {
  if (object.items) return object.items.map((value, index) => ({
    key: object.kind === 'set' ? JSON.stringify(value) : String(index),
    name: `[${index}]`, value,
    before: object.kind === 'set' ? old?.items?.find(item => equal(item, value)) : old?.items?.[index],
  }));
  if (object.entries) return object.entries.flatMap(([key, value]) => {
    const id = JSON.stringify(key);
    const before = old?.entries?.find(([oldKey]) => equal(oldKey, key));
    const entry = { key: `${id}:value`, name: `[${formatTraceValue(key, heap, language)}]`, value, before: before?.[1] };
    return isReference(key) ? [{ key: `${id}:key`, name: `key ${key.$ref}`, value: key, before: before?.[0] }, entry] : [entry];
  });
  return Object.entries(object.fields || {}).map(([name, value]) => ({ key: name, name, value, before: old?.fields?.[name] }));
}

interface ValueNodeProps {
  name: string;
  path: string;
  value: TraceValue | undefined;
  before?: TraceValue;
  heap: TraceHeap;
  previousHeap: TraceHeap;
  ancestors?: string[];
  compare: boolean;
  language: TraceLanguage;
}

function ValueNode({ name, path, value, before, heap, previousHeap, ancestors = [], compare, language }: ValueNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [limit, setLimit] = useState(25);
  const object = objectFor(value, heap);
  const old = objectFor(before, previousHeap);
  const reference = isReference(value) ? value.$ref : undefined;
  const circular = reference !== undefined && ancestors.includes(reference);
  const children = object && !circular ? childrenFor(object, old, heap, language) : [];
  const changed = compare && valueChanged(before, value, previousHeap, heap);
  const preview = value === undefined ? 'not assigned' : formatTraceValue(value, heap, language);
  const previousPreview = before === undefined ? 'not assigned' : formatTraceValue(before, previousHeap, language);
  const content = <>
    <span className="debugger-name">{name}</span><span className="debugger-colon">:</span>
    <span className={`debugger-value ${typeof value === 'string' ? 'is-string' : ''}`}>{preview}</span>
    <span className="debugger-type">{value === undefined ? '' : valueType(value, object, language)}</span>
    {reference && <span className="debugger-reference">{reference}</span>}
    {circular && <span className="debugger-cycle">↩ circular reference</span>}
    {changed && <span className="debugger-changed" aria-label={before === undefined ? 'New variable' : 'Changed value'}>{before === undefined ? 'new' : 'changed'}</span>}
  </>;
  const rowClass = `debugger-row ${changed ? 'is-changed' : ''}`;
  const description = changed ? `${name}: ${preview}. Previously ${previousPreview}.` : `${name}: ${preview}`;

  return <div className="debugger-node" data-debug-variable={name} data-debug-path={path}>
    {object && !circular ? <details open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary className={rowClass} aria-label={description}>{content}</summary>
      {expanded && <div className="debugger-children">
        {children.length === 0 ? <div className="debugger-empty">No entries</div> : children.slice(0, limit).map(child => <ValueNode
          key={child.key} name={child.name} path={`${path}/${child.key}`} value={child.value} before={child.before}
          heap={heap} previousHeap={previousHeap} ancestors={reference ? [...ancestors, reference] : ancestors} compare={compare} language={language}
        />)}
        {children.length > limit && <button type="button" className="debugger-more" onClick={() => setLimit(count => count + 25)}>Show {Math.min(25, children.length - limit)} more ({children.length - limit} remaining)</button>}
      </div>}
    </details> : <div className={`${rowClass} debugger-leaf`} aria-label={description}>{content}</div>}
  </div>;
}

function currentArgument(step: ExecutionStep | undefined, name: string, snapshot?: Record<string, TraceValue>) {
  if (snapshot) return snapshot[name];
  if (!step) return undefined;
  return step.stack.length === 1 && owns(step.state, name) ? step.state[name] : step.input[name];
}

export default function ExecutionInspector({ step, previous, heap, previousHeap, variableOrder, complete, argumentsSnapshot, previousArgumentsSnapshot, language = 'javascript' }: InspectorProps) {
  const argumentNames = Object.keys(step.input);
  const locals = [...new Set([...variableOrder, ...Object.keys(step.state)])].filter(name => owns(step.state, name) && (step.stack.length > 1 || !owns(step.input, name)));
  const frame = step.stack[step.stack.length - 1] || 'Current scope';
  const sameFrame = previous && JSON.stringify(previous.stack) === JSON.stringify(step.stack);
  const shared = { heap, previousHeap, compare: previous !== undefined, language };
  return <section className="execution-inspector" aria-label="Debugger variables">
    <div className="debugger-heading"><h5>Variables</h5><span>{complete ? 'Final snapshot' : frame}</span></div>
    <p className="debugger-timing">Values after selected step</p>
    <section className="debugger-section" aria-label="Input arguments">
      <h6>Input arguments</h6>
      {argumentNames.length ? argumentNames.map(name => <ValueNode key={name} name={name} path={`arguments/${name}`} value={currentArgument(step, name, argumentsSnapshot)} before={currentArgument(previous, name, previousArgumentsSnapshot)} {...shared}/>) : <p className="debugger-empty">No arguments in this frame</p>}
    </section>
    <section className="debugger-section" aria-label="Local variables">
      <h6>Locals · {frame}</h6>
      {locals.length ? locals.map(name => <ValueNode key={name} name={name} path={`locals/${name}`} value={step.state[name]} before={sameFrame ? previous?.state[name] : undefined} {...shared}/>) : <p className="debugger-empty">No local variables in scope</p>}
    </section>
    {step.kind === 'return' && <section className="debugger-section" aria-label="Return value"><h6>Return value</h6><ValueNode name="return" path="return" value={step.value} heap={heap} previousHeap={previousHeap} compare={false} language={language}/></section>}
  </section>;
}
