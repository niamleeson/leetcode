export type TraceValue = null | boolean | number | string | { $ref: string } | { $scalar: string };
export interface TraceObject {
  kind: 'array' | 'object' | 'map' | 'set' | 'tree' | 'graph' | 'list' | 'quad';
  items?: TraceValue[];
  entries?: [TraceValue, TraceValue][];
  fields?: Record<string, TraceValue>;
}
export type TraceHeap = Record<string, TraceObject>;
export interface ExecutionStep {
  site: number;
  line: number;
  lines?: number[];
  start?: number;
  end?: number;
  kind: 'call' | 'return' | 'statement' | 'operation' | 'check' | 'update' | 'iterate' | 'loop-end' | 'break' | 'continue';
  label: string;
  state: Record<string, TraceValue>;
  input: Record<string, TraceValue>;
  heap: TraceHeap;
  value: TraceValue;
  stack: string[];
}
export interface ExecutionExample {
  name: string;
  input: unknown[];
  expected: unknown;
  result: unknown;
  steps: ExecutionStep[];
}
export interface ExecutionTrace {
  id: number;
  variant?: string;
  title: string;
  topic: string;
  code: string;
  sourceHash: string;
  indexing?: Record<string,{indices:string[];cells:[string,string][]}>;
  examples: ExecutionExample[];
}
export const isReference = (value: TraceValue | undefined): value is { $ref: string } => !!value && typeof value === 'object' && '$ref' in value;
export function objectFor(value: TraceValue | undefined, heap: TraceHeap) {
  return isReference(value) ? heap[value.$ref] : undefined;
}
export interface VariableGroup {
  names: string[];
  value: TraceValue;
}
// Show every live binding. Classification depends on its value, never on a
// whitelist of variable names or whether it changed during the current step.
export function groupVariables(step: ExecutionStep, heap: TraceHeap, order: string[]) {
  const nodes = new Set(['tree', 'graph', 'list', 'quad']);
  const inputs: VariableGroup[] = [];
  const collections: VariableGroup[] = [];
  const variables: [string, TraceValue][] = [];
  const groups = new Map<string, VariableGroup>();
  for (const [name, input] of Object.entries(step.input)) {
    // A parameter may be reassigned (for example nums = [1, ...nums, 1]).
    // Its visible panel must follow the current binding, not the original input.
    const value = Object.prototype.hasOwnProperty.call(step.state, name) ? step.state[name] : input;
    if (name === 'instance' || nodes.has(objectFor(value, heap)?.kind || '')) continue;
    // Scalar parameters already have a compact variable row. Input strings
    // retain their character cells so source index markers remain visible.
    if (!isReference(value) && !(typeof value === 'string' && value.length > 1) &&
        JSON.stringify(step.state[name]) === JSON.stringify(value)) continue;
    const existing = isReference(value) ? groups.get(value.$ref) : undefined;
    if (existing) { existing.names.push(name); continue; }
    const group = { names: [name], value };
    inputs.push(group);
    if (isReference(value)) groups.set(value.$ref, group);
  }
  for (const name of order) {
    if (!Object.prototype.hasOwnProperty.call(step.state, name)) continue;
    const value = step.state[name], object = objectFor(value, heap);
    if (!isReference(value) || !object || nodes.has(object.kind)) {
      variables.push([name, value]);
      continue;
    }
    const existing = groups.get(value.$ref);
    if (existing) {
      if (!existing.names.includes(name)) existing.names.push(name);
    } else {
      const group = { names: [name], value };
      groups.set(value.$ref, group);
      collections.push(group);
    }
  }
  return { variables, inputs, collections };
}
export function formatValue(value: TraceValue | undefined, heap: TraceHeap, depth = 0, seen = new Set<string>()): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value !== 'object') return String(value);
  if ('$scalar' in value) return value.$scalar;
  const object = heap[value.$ref];
  if (!object) return 'unavailable';
  if (['tree','graph','list','quad'].includes(object.kind)) return `${formatValue(object.fields?.val, heap)} · ${value.$ref}`;
  if (seen.has(value.$ref) || depth > 2) return object.kind === 'array' ? `[${object.items?.length ?? 0} items]` : object.kind;
  const nextSeen = new Set(seen).add(value.$ref);
  const format = (item: TraceValue) => formatValue(item, heap, depth + 1, nextSeen);
  if (object.items) return `${object.kind === 'set' ? '{' : '['}${object.items.slice(0,8).map(format).join(', ')}${object.items.length > 8 ? ', …' : ''}${object.kind === 'set' ? '}' : ']'}`;
  if (object.entries) return `{${object.entries.slice(0,6).map(([k,v])=>`${format(k)}: ${format(v)}`).join(', ')}${object.entries.length>6?', …':''}}`;
  const entries = Object.entries(object.fields || {});
  return `{${entries.slice(0,5).map(([k,v])=>`${k}: ${format(v)}`).join(', ')}${entries.length>5?', …':''}}`;
}
export function valueChanged(before: TraceValue | undefined, after: TraceValue | undefined, oldHeap: TraceHeap, heap: TraceHeap, seen = new Set<string>()): boolean {
  if (JSON.stringify(before) !== JSON.stringify(after)) return true;
  if (!isReference(after) || seen.has(after.$ref)) return false;
  seen.add(after.$ref);
  const old = oldHeap[after.$ref], next = heap[after.$ref];
  if (JSON.stringify(old) !== JSON.stringify(next)) return true;
  if (!next) return false;
  const values = next.items || next.entries?.flat() || Object.values(next.fields || {});
  return values.some(value => valueChanged(value, value, oldHeap, heap, seen));
}
export function materialize(steps: ExecutionStep[], index: number): { heap: TraceHeap; previousHeap: TraceHeap } {
  const heap: TraceHeap = {};
  for (let i = 0; i < index; i++) Object.assign(heap, steps[i].heap);
  const previousHeap = { ...heap };
  Object.assign(heap, steps[index].heap);
  return { heap, previousHeap };
}
// Keep the data view and its change markers steady while code advances through
// checks with the same state. Back, Reset and seeking derive the same frame.
export function dataStepIndex(steps: ExecutionStep[], index: number): number {
  const sameBindings = (before: Record<string, TraceValue>, after: Record<string, TraceValue>) =>
    Object.keys(before).length === Object.keys(after).length &&
    Object.keys(after).every(name => JSON.stringify(before[name]) === JSON.stringify(after[name]));
  while (index > 0) {
    const current = steps[index], previous = steps[index - 1];
    if (Object.keys(current.heap).length || !sameBindings(previous.state, current.state) || !sameBindings(previous.input, current.input)) break;
    index--;
  }
  return index;
}
export function truthy(value: TraceValue) {
  if (value && typeof value === 'object' && '$scalar' in value) return !['undefined', 'NaN', '0n', '-0'].includes(value.$scalar);
  return !!value;
}
export function hasNodes(values: TraceValue[], heap: TraceHeap): boolean {
  const queue=[...values], seen=new Set<string>();
  for(let i=0;i<queue.length;i++) {
    const value=queue[i];
    if(!isReference(value)||seen.has(value.$ref))continue;
    seen.add(value.$ref);
    const object=heap[value.$ref];if(!object)continue;
    if(['tree','graph','list','quad'].includes(object.kind))return true;
    queue.push(...(object.items||object.entries?.flat()||Object.values(object.fields||{})));
  }
  return false;
}
