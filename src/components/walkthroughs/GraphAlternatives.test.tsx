import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import FollowUpSolution from '../FollowUpSolution';
import { ExecutionPlayer } from './ExecutionWalkthrough';
import { ExecutionTrace, TraceHeap, materialize, objectFor, isReference } from '../../data/walkthroughs/execution';
import { iterativeGraphSolutions } from '../../data/solutions/graph-iterative';

const trace=(id:number)=>JSON.parse(readFileSync(`src/data/walkthroughs/generated/${id}-iterative.json`,'utf8')) as ExecutionTrace;
beforeEach(()=>localStorage.clear());
afterEach(cleanup);

it.each([695,133,130,332])('loads #%i alternative with exact code and highlights for every example',async id=>{
  const data=trace(id),solution=iterativeGraphSolutions[id];
  expect(data.code).toBe(solution.jsCode);
  render(<FollowUpSolution solution={solution} problemId={id} language="javascript"/>);
  await screen.findByRole('slider');
  for(const [exampleIndex,example] of data.examples.entries()) {
    fireEvent.change(screen.getByRole('combobox'),{target:{value:exampleIndex}});
    for(const index of [0,Math.floor(example.steps.length/2),example.steps.length-1]) {
      fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
      const step=example.steps[index];
      expect([...document.querySelectorAll('[aria-current="step"]')].map(line=>Number(line.getAttribute('data-line')))).toEqual(step.lines||[step.line]);
      const shown=new Set([...document.querySelectorAll('[data-variable-names]')].flatMap(element=>JSON.parse(element.getAttribute('data-variable-names')!)));
      for(const name of Object.keys(step.state))expect(shown.has(name),`${id}/${exampleIndex}/${index}: ${name}`).toBe(true);
    }
    expect(screen.getByLabelText('Final result').textContent).toContain(JSON.stringify(example.expected));
  }
});

it.each([[695,'grid',0],[130,'board','S']] as const)('marks #%i discovered cells before every push and never schedules duplicates',(id,name,mark)=>{
  for(const example of trace(id).examples) {
    const heap:TraceHeap={},pushed=new Set<string>(),popped=new Set<string>();
    for(const step of example.steps) {
      Object.assign(heap,step.heap);
      if(step.kind!=='operation'||!/^stack\.(push|pop)\(/.test(step.label))continue;
      const stack=objectFor(step.state.stack,heap)!.items!;
      const cell=step.label.startsWith('stack.push')?stack[stack.length-1]:step.value;
      const [r,c]=objectFor(cell,heap)!.items! as number[];
      const key=`${r},${c}`;
      if(step.label.startsWith('stack.push')) {
        const rows=objectFor(step.input[name],heap)!.items!;
        expect(objectFor(rows[r],heap)!.items![c]).toBe(mark);
        expect(pushed.has(key)).toBe(false);pushed.add(key);
      } else {expect(popped.has(key)).toBe(false);popped.add(key);}
    }
    expect(popped).toEqual(pushed);
    if(id===695)expect(popped.size).toBe((example.input[0] as number[][]).flat().filter(value=>value===1).length);
  }
});

it('keeps area and maxArea visible while processing the island, with cells in their original positions',()=>{
  const data=trace(695),steps=data.examples[0].steps;
  const index=steps.findIndex(step=>step.label==='area++;'&&step.state.area===2);
  expect(index).toBeGreaterThan(0);
  render(<ExecutionPlayer trace={data}/>);
  fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
  expect(screen.getByRole('group',{name:'area'}).querySelector('strong')?.textContent).toBe('2');
  expect(screen.getByRole('group',{name:'maxArea'}).querySelector('strong')?.textContent).toBe(String(steps[index].state.maxArea));
  const panel=screen.getByRole('group',{name:'grid'});
  expect(within(panel).getAllByRole('row')).toHaveLength(5);
  const {r,c}=steps[index].state;
  expect(panel.querySelector(`[title^="[${r}][${c}]"]`)?.classList.contains('is-pointed')).toBe(true);
  expect(within(screen.getByRole('group',{name:'stack'})).getByRole('list')).toBeTruthy();
});

it('keeps each clone aligned with its original while the stack advances',()=>{
  const data=trace(133),steps=data.examples[0].steps;
  render(<ExecutionPlayer trace={data}/>);
  const positions=new Map<string,string>();
  for(const [index,step] of steps.entries()) {
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    const {heap}=materialize(steps,index);
    for(const [original,copy] of objectFor(step.state.cloned,heap)?.entries||[]) {
      if(!isReference(original)||!isReference(copy))continue;
      const from=document.querySelector(`[data-node-id="${original.$ref}"]`)!.getAttribute('transform')!;
      const to=document.querySelector(`[data-node-id="${copy.$ref}"]`)!.getAttribute('transform')!;
      const coords=(value:string)=>value.match(/translate\(([^,]+),([^\)]+)\)/)!.slice(1).map(Number);
      expect(coords(to)[0]-coords(from)[0]).toBeCloseTo(320);
      expect(coords(to)[1]).toBeCloseTo(coords(from)[1]);
      if(positions.has(copy.$ref))expect(to).toBe(positions.get(copy.$ref));
      positions.set(copy.$ref,to);
    }
  }
});

it('consumes duplicate tickets separately and backtracks before reversing the itinerary',()=>{
  const example=trace(332).examples.find(example=>example.name==='Duplicate tickets')!;
  const heap:TraceHeap={};let consumed=0,finished=0;
  for(const step of example.steps) {
    Object.assign(heap,step.heap);
    if(step.kind==='operation'&&step.label==='destinations.pop()')consumed++;
    if(step.kind==='operation'&&step.label==='stack.pop()') {
      expect(objectFor(step.state.destinations,heap)!.items).toHaveLength(0);
      finished++;
    }
    if(step.kind==='operation'&&step.label==='route.reverse()') {
      expect(objectFor(step.state.route,heap)!.items).toEqual(example.expected);
      expect(objectFor(step.state.stack,heap)!.items).toHaveLength(0);
    }
  }
  expect(consumed).toBe((example.input[0] as unknown[]).length);
  expect(finished).toBe(consumed+1);
});
