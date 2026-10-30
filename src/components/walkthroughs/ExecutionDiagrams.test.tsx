import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import ExecutionGraph from './ExecutionGraph';
import { ExecutionPlayer } from './ExecutionWalkthrough';
import { ExecutionTrace, materialize } from '../../data/walkthroughs/execution';

const trace=(id:number)=>JSON.parse(readFileSync(`src/data/walkthroughs/generated/${id}.json`,'utf8')) as ExecutionTrace;
afterEach(cleanup);
it('draws a visible self-loop instead of a zero-length line',()=>{
  render(<ExecutionGraph id={207} input={{numCourses:1,prerequisites:{$ref:'edges'}}} state={{}} heap={{edges:{kind:'array',items:[{$ref:'row'}]},row:{kind:'array',items:[0,0]}}}/>);
  const loop=[...document.querySelectorAll('.execution-link')].find(edge=>edge.getAttribute('data-from')===edge.getAttribute('data-to'));
  expect(loop?.querySelector('path')?.getAttribute('d')).toContain(' C ');
});
it.each([105,226,297,427,450,701,1325])('includes the actual returned tree for #%i',(id)=>{
  const data=trace(id);render(<ExecutionPlayer trace={data}/>);
  const steps=data.examples[0].steps;
  fireEvent.change(screen.getByRole('slider'),{target:{value:steps.length-1}});
  const result=steps[steps.length-1].value as {$ref:string};
  expect(document.querySelector(`[data-node-id="${result.$ref}"]`)).toBeTruthy();
});
it('shows an empty returned tree after deleting the last node',()=>{
  const data=trace(1325);render(<ExecutionPlayer trace={data}/>);
  fireEvent.change(screen.getByRole('combobox'),{target:{value:1}});
  fireEvent.change(screen.getByRole('slider'),{target:{value:data.examples[1].steps.length-1}});
  expect(screen.getByRole('img',{name:'Empty returned tree'})).toBeTruthy();
  expect(document.querySelectorAll('[data-node-id]')).toHaveLength(0);
});
it('keeps allocated parent nodes visible while a recursive child is being built',()=>{
  const data=trace(105),steps=data.examples[0].steps;
  const index=steps.findIndex(step=>step.kind==='call'&&step.stack.length===3);
  expect(index).toBeGreaterThan(0);
  const parent=steps[index-1].state.rootNode as {$ref:string};
  render(<ExecutionPlayer trace={data}/>);
  fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
  expect(document.querySelector(`[data-node-id="${parent.$ref}"]`)).toBeTruthy();
});
it('highlights the graph node that holds the dependentCourse variable',()=>{
  const data=trace(207),steps=data.examples[0].steps,index=steps.findIndex(step=>'dependentCourse' in step.state);
  const step=steps[index],{heap}=materialize(steps,index);
  render(<ExecutionGraph id={207} input={step.input} state={step.state} heap={heap}/>);
  const node=document.querySelector(`[data-node-key="${step.state.dependentCourse}"]`);
  expect(node?.classList.contains('is-current')).toBe(true);
  expect(node?.textContent).toContain('dependentCourse');
});
it.each([[463,'grid'],[200,'grid'],[695,'grid'],[286,'rooms'],[994,'grid'],[417,'heights'],[130,'board'],[1631,'heights'],[778,'grid']] as const)('keeps graph #%i in its original %s row/column layout',(id,name)=>{
  const data=trace(id);render(<ExecutionPlayer trace={data}/>);
  const steps=data.examples[0].steps;
  for(const index of [0,Math.floor(steps.length/2),steps.length-1]) {
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    const {heap}=materialize(steps,index),input=steps[index].input[name] as {$ref:string};
    const expected=heap[input.$ref].items!;
    const panel=screen.getByRole('group',{name});
    const rows=within(panel).getAllByRole('row');
    expect(rows).toHaveLength(expected.length);
    rows.forEach((row,r)=>expect(within(row).getAllByRole('cell')).toHaveLength(heap[(expected[r] as {$ref:string}).$ref].items!.length));
  }
});
