import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import ExecutionInspector, { argumentSnapshotsFor } from './ExecutionInspector';
import { ExecutionStep, ExecutionTrace, TraceHeap, materialize } from '../../data/walkthroughs/execution';

afterEach(cleanup);
const step = (overrides: Partial<ExecutionStep> = {}): ExecutionStep => ({ site: 0, line: 1, kind: 'statement', label: 'step', state: {}, input: {}, heap: {}, value: { $scalar: 'undefined' }, stack: ['solve'], ...overrides });
const props = (current: ExecutionStep, heap: TraceHeap = {}, previous?: ExecutionStep, previousHeap: TraceHeap = heap) => ({step: current, previous, heap, previousHeap, variableOrder: Object.keys(current.state), complete: false});
const row = (path: string) => document.querySelector(`[data-debug-path="${path}"]`)!;
function expand(path: string) {
  const details = row(path).querySelector('details')!;
  act(() => { details.open = true; fireEvent(details, new Event('toggle')); });
}

it('groups arguments separately, follows reassignment, and never reveals future locals', () => {
  const current = step({ input: { nums: { $ref: 'old' }, target: 9 }, state: { nums: { $ref: 'new' }, target: 9, i: 1 } });
  render(<ExecutionInspector {...props(current, { old: {kind:'array',items:[2]}, new:{kind:'array',items:[7]} })} variableOrder={['i','future']}/>);
  expect(within(screen.getByRole('region',{name:'Input arguments'})).getByText('[7]')).toBeTruthy();
  expect(row('locals/nums')).toBeNull();
  expect(row('locals/i').textContent).toContain('1');
  expect(screen.queryByText('future')).toBeNull();
});

it('does not replace original arguments with a helper parameter of the same name', () => {
  const current = step({ input: { n: 10 }, state: { n: 2, total: 4 }, stack: ['solve','helper'] });
  render(<ExecutionInspector {...props(current)}/>);
  expect(row('arguments/n').querySelector('.debugger-value')?.textContent).toBe('10');
  expect(row('locals/n').querySelector('.debugger-value')?.textContent).toBe('2');
  expect(screen.getByText('Locals · helper')).toBeTruthy();
});

it('keeps Rotate Array normalized k visible when entering and leaving reverse', () => {
  const trace = JSON.parse(readFileSync('src/data/walkthroughs/generated/189.json', 'utf8')) as ExecutionTrace;
  const steps = trace.examples[1].steps;
  const snapshots = argumentSnapshotsFor(steps);
  const normalized = steps.findIndex(frame => frame.label === 'k = k % n;');
  expect(snapshots[normalized - 1].k).toBe(4);
  const page = render(<ExecutionInspector {...props(steps[0])}/>);
  for (let index = normalized; index < steps.length; index++) {
    const { heap, previousHeap } = materialize(steps, index);
    page.rerender(<ExecutionInspector {...props(steps[index], heap, steps[index - 1], previousHeap)} argumentsSnapshot={snapshots[index]} previousArgumentsSnapshot={snapshots[index - 1]}/>);
    expect(row('arguments/k').querySelector('.debugger-value')?.textContent).toBe('1');
    if (steps[index].kind === 'call' && steps[index].stack.length > 1) {
      expect(row('arguments/k').querySelector('.is-changed')).toBeNull();
    }
  }
  expect(snapshots[0].k).toBe(4);
});

it('preserves root arguments through shadowing helpers and resets each root call', () => {
  const frames = [
    step({kind:'call',input:{n:10},state:{n:10}}),
    step({input:{n:10},state:{n:5}}),
    step({kind:'call',stack:['solve','helper'],input:{n:10},state:{n:2}}),
    step({kind:'call',input:{n:10},state:{n:10}}),
    step({kind:'call',input:{arguments:{$ref:'args'}},state:{value:2},stack:['Stack.push']}),
  ];
  const snapshots = argumentSnapshotsFor(frames);
  expect(snapshots.map(snapshot => snapshot.n)).toEqual([10,5,5,10,undefined]);
  expect(snapshots[4]).toEqual({arguments:{$ref:'args'}});
  render(<ExecutionInspector {...props(frames[2],{},frames[1])} argumentsSnapshot={snapshots[2]} previousArgumentsSnapshot={snapshots[1]}/>);
  expect(row('arguments/n').querySelector('.debugger-value')?.textContent).toBe('5');
  expect(row('locals/n').querySelector('.debugger-value')?.textContent).toBe('2');
});

it('retains expansion and marks nested object mutations in the current snapshot', () => {
  const current = step({ state: { result: { $ref: 'object' } } });
  const old: TraceHeap = { object: {kind:'object',fields:{items:{$ref:'array'}}}, array:{kind:'array',items:[1,2]} };
  const next: TraceHeap = { ...old, array:{kind:'array',items:[1,7]} };
  const page = render(<ExecutionInspector {...props(current,old,current,old)}/>);
  expand('locals/result'); expand('locals/result/items');
  page.rerender(<ExecutionInspector {...props(current,next,current,old)}/>);
  const leaf = row('locals/result/items/1');
  expect(leaf.querySelector('.debugger-value')?.textContent).toBe('7');
  expect(leaf.querySelector('.debugger-row')?.classList.contains('is-changed')).toBe(true);
  expect(row('locals/result/items/0').querySelector('.debugger-row')?.classList.contains('is-changed')).toBe(false);
  expect(row('locals/result').querySelector('details')?.open).toBe(true);
  page.rerender(<ExecutionInspector {...props(current,old,current,old)}/>);
  expect(row('locals/result/items/1').querySelector('.debugger-value')?.textContent).toBe('2');
});

it('inspects Map values, Set members and circular node fields without recursion', () => {
  const heap: TraceHeap = {
    map:{kind:'map',entries:[[2,{$ref:'node'}]]}, set:{kind:'set',items:['a','b']},
    node:{kind:'list',fields:{val:3,next:{$ref:'node'}}},
  };
  render(<ExecutionInspector {...props(step({state:{seen:{$ref:'map'},letters:{$ref:'set'}}}),heap)}/>);
  expand('locals/seen'); expand('locals/seen/2:value');
  expect(row('locals/seen/2:value/next').textContent).toContain('circular reference');
  expect(row('locals/seen/2:value/next').querySelector('details')).toBeNull();
  expand('locals/letters');
  expect(row('locals/letters').textContent).toContain('"a"');
  expect(row('locals/letters').textContent).toContain('"b"');
});

it('distinguishes null and explicit undefined and paginates a large collection', () => {
  render(<ExecutionInspector {...props(step({state:{empty:null,unset:{$scalar:'undefined'},list:{$ref:'array'}}}), {array:{kind:'array',items:Array.from({length:30},(_,i)=>i)}})}/>);
  expect(row('locals/empty').querySelector('.debugger-value')?.textContent).toBe('null');
  expect(row('locals/unset').querySelector('.debugger-value')?.textContent).toBe('undefined');
  expand('locals/list');
  expect(row('locals/list/24')).toBeTruthy();
  expect(row('locals/list/25')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Show 5 more (5 remaining)'}));
  expect(row('locals/list/29').querySelector('.debugger-value')?.textContent).toBe('29');
});

it('shows return values only on return steps and labels the completed snapshot', () => {
  const current = step({value:99});
  const page = render(<ExecutionInspector {...props(current)}/>);
  expect(screen.queryByRole('region',{name:'Return value'})).toBeNull();
  page.rerender(<ExecutionInspector {...props({...current,kind:'return'})} complete/>);
  expect(screen.getByText('Final snapshot')).toBeTruthy();
  expect(row('return').querySelector('.debugger-value')?.textContent).toBe('99');
});

it('uses Python values and preserves collection types in nested debugger entries', () => {
  const heap:TraceHeap={queue:{kind:'array',typeName:'deque',items:[{$ref:'pair'}]},pair:{kind:'array',typeName:'tuple',items:[true,null]},seen:{kind:'set',typeName:'set',items:[]},lookup:{kind:'map',typeName:'dict',entries:[['ready',true]]}};
  render(<ExecutionInspector {...props(step({state:{queue:{$ref:'queue'},seen:{$ref:'seen'},lookup:{$ref:'lookup'},ready:false,head:null}}),heap)} language="python"/>);
  expect(row('locals/queue').querySelector('.debugger-type')?.textContent).toBe('deque(1)');
  expect(row('locals/queue').querySelector('.debugger-value')?.textContent).toBe('[(True, None)]');
  expect(row('locals/ready').querySelector('.debugger-value')?.textContent).toBe('False');
  expect(row('locals/ready').querySelector('.debugger-type')?.textContent).toBe('bool');
  expect(row('locals/head').querySelector('.debugger-value')?.textContent).toBe('None');
  expect(row('locals/head').querySelector('.debugger-type')?.textContent).toBe('NoneType');
  expect(row('locals/seen').querySelector('.debugger-value')?.textContent).toBe('set()');
  expect(row('locals/lookup').querySelector('.debugger-type')?.textContent).toBe('dict(1)');
  expand('locals/queue');
  expect(row('locals/queue/0').querySelector('.debugger-type')?.textContent).toBe('tuple(2)');
});
