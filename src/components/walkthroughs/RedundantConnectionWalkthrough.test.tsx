import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { solutionMap } from '../../data/solutions';
import { ExecutionTrace, materialize, objectFor } from '../../data/walkthroughs/execution';
import { ExecutionPlayer } from './ExecutionWalkthrough';

const trace=JSON.parse(readFileSync('src/data/walkthroughs/generated/684.json','utf8')) as ExecutionTrace;
beforeEach(()=>localStorage.clear());
afterEach(cleanup);

it('builds the entire graph, tries candidates backwards, and shows exact highlights and queue states for every recorded step',()=>{
  expect(trace.code).toBe(solutionMap[684].jsCode);
  render(<ExecutionPlayer trace={trace}/>);
  let failedSearches=0,skips=0,pops=0;
  for(const [exampleIndex,example] of trace.examples.entries()) {
    fireEvent.change(screen.getByRole('combobox'),{target:{value:exampleIndex}});
    const edges=example.input[0] as number[][],candidates:number[]=[];
    const positions=new Map<string,string>();
    let searchStarted=false;
    for(const [index,step] of example.steps.entries()) {
      fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
      expect([...document.querySelectorAll('[aria-current="step"]')].map(line=>Number(line.getAttribute('data-line')))).toEqual(step.lines);
      const {heap}=materialize(example.steps,index);
      const queue=objectFor(step.state.queue,heap)?.items||[],visited=objectFor(step.state.visited,heap)?.items||[];
      for(const node of document.querySelectorAll('[data-node-key]')) {
        const key=node.getAttribute('data-node-key')!,position=node.getAttribute('transform')!,value=Number(key);
        if(positions.has(key))expect(position).toBe(positions.get(key));
        positions.set(key,position);
        expect(node.classList.contains('is-queued')).toBe(queue.includes(value));
        expect(node.classList.contains('is-visited')).toBe(visited.includes(value));
      }
      if(step.kind==='statement'&&step.label==='const [a, b] = edges[i];') {
        searchStarted=true;
        candidates.push(step.state.i as number);
        expect([step.state.a,step.state.b]).toEqual(edges[step.state.i as number]);
      }
      if(searchStarted) {
        expect(document.querySelectorAll('.execution-link')).toHaveLength(edges.length);
        expect(step.kind==='operation'&&/^graph\[.*\.push/.test(step.label)).toBe(false);
      }
      const ignored=[...document.querySelectorAll('.execution-link.is-ignored')];
      if(typeof step.state.i==='number'&&typeof step.state.a==='number'&&typeof step.state.b==='number') {
        expect(ignored).toHaveLength(1);
        expect([Number(ignored[0].getAttribute('data-from')),Number(ignored[0].getAttribute('data-to'))].sort()).toEqual([step.state.a,step.state.b].sort());
        expect(ignored[0].querySelector('title')?.textContent).toBe('Candidate edge: ignored during this BFS');
      } else expect(ignored).toHaveLength(0);
      if(step.kind==='operation'&&step.label==='queue.shift()') {
        const previous=example.steps[index-1],previousHeap=materialize(example.steps,index-1).heap;
        const before=objectFor(previous.state.queue,previousHeap)!.items!;
        expect(step.value).toBe(before[0]);
        expect(queue).toEqual(before.slice(1));
        pops++;
      }
      if(step.kind==='operation'&&step.label==='queue.push(neighbor)')expect(visited).toContain(step.state.neighbor);
      if(step.kind==='check'&&step.label==='queue.length'&&step.value===0)failedSearches++;
      if(step.kind==='continue'&&example.steps[index-1].label.includes('node === a'))skips++;
    }
    const expected=example.expected as number[];
    const resultIndex=edges.findIndex(([a,b])=>a===expected[0]&&b===expected[1]);
    expect(candidates).toEqual(Array(edges.length-resultIndex).fill(null).map((_,i)=>edges.length-1-i));
    expect(screen.getByLabelText('Final result').textContent).toContain(JSON.stringify(expected));
  }
  expect(failedSearches).toBeGreaterThan(0);
  expect(skips).toBeGreaterThan(0);
  expect(pops).toBeGreaterThan(0);
},15000);

it('shows the ignored edge only once selected and removes its marker on Back, Reset, and example changes',()=>{
  const steps=trace.examples[0].steps;
  const selected=steps.findIndex(step=>step.kind==='statement'&&step.label==='const [a, b] = edges[i];');
  render(<ExecutionPlayer trace={trace}/>);
  expect(document.querySelectorAll('.is-ignored')).toHaveLength(0);
  fireEvent.change(screen.getByRole('slider'),{target:{value:selected}});
  expect(document.querySelectorAll('.is-ignored')).toHaveLength(1);
  expect(document.querySelectorAll('.execution-link')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button',{name:'Back'}));
  expect(document.querySelectorAll('.is-ignored')).toHaveLength(0);
  expect(document.querySelectorAll('.execution-link')).toHaveLength(3);
  fireEvent.change(screen.getByRole('slider'),{target:{value:selected}});
  fireEvent.click(screen.getByRole('button',{name:'Reset'}));
  expect(document.querySelectorAll('.is-ignored')).toHaveLength(0);
  expect(document.querySelectorAll('.execution-link')).toHaveLength(0);
  fireEvent.change(screen.getByRole('slider'),{target:{value:selected}});
  fireEvent.change(screen.getByRole('combobox'),{target:{value:1}});
  expect(document.querySelectorAll('.is-ignored')).toHaveLength(0);
  expect(document.querySelectorAll('.execution-link')).toHaveLength(0);
});
