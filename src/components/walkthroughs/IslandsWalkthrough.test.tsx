import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { ExecutionPlayer, hasExecutionWalkthrough } from './ExecutionWalkthrough';
import { ExecutionTrace, materialize, objectFor } from '../../data/walkthroughs/execution';
import { solutionMap } from '../../data/solutions';

const trace=(variant='')=>JSON.parse(readFileSync(`src/data/walkthroughs/generated/200${variant?`-${variant}`:''}.json`,'utf8')) as ExecutionTrace;
afterEach(cleanup);

it('keeps both island recordings tied to their own code and shared examples',()=>{
  const recursive=trace(),iterative=trace('iterative');
  expect(recursive.code).toBe(solutionMap[200].jsCode);
  expect(iterative.code).toBe(solutionMap[200].followUp!.jsCode);
  expect(iterative.examples.map(({input,expected})=>({input,expected}))).toEqual(recursive.examples.map(({input,expected})=>({input,expected})));
  expect(hasExecutionWalkthrough(200)).toBe(true);
  expect(hasExecutionWalkthrough(200,'iterative')).toBe(true);
  expect(hasExecutionWalkthrough(200,'missing')).toBe(false);
});

it('records every stack push and pop once, with cells marked before enqueueing',()=>{
  for(const example of trace('iterative').examples) {
    const pushed=new Set<string>(),popped=new Set<string>();
    for(const [index,step] of example.steps.entries()) {
      if(step.kind!=='operation'||!/^stack\.(push|pop)\(/.test(step.label))continue;
      const {heap,previousHeap}=materialize(example.steps,index);
      const before=objectFor(step.state.stack,previousHeap)!.items!;
      const after=objectFor(step.state.stack,heap)!.items!;
      if(step.label.startsWith('stack.push')) {
        expect(after).toEqual([...before,after[after.length-1]]);
        const coordinates=objectFor(after[after.length-1],heap)!.items!;
        const [r,c]=coordinates as number[];
        const rows=objectFor(step.input.grid,heap)!.items!;
        expect(objectFor(rows[r],heap)!.items![c]).toBe('0');
        expect(pushed.has(`${r},${c}`)).toBe(false);
        pushed.add(`${r},${c}`);
        expect(example.steps[index+1]?.kind).not.toBe('statement');
      } else {
        expect(after).toEqual(before.slice(0,-1));
        expect(step.value).toEqual(before[before.length-1]);
        const cell=objectFor(step.value,heap)!.items!.join(',');
        expect(popped.has(cell)).toBe(false);
        popped.add(cell);
      }
    }
    expect(popped).toEqual(pushed);
    expect(pushed.size).toBe((example.input[0] as string[][]).flat().filter(cell=>cell==='1').length);
  }
});

it('shows the popped coordinates, remaining stack, grid position and executing code',()=>{
  localStorage.clear();
  const data=trace('iterative'),steps=data.examples[0].steps;
  const index=steps.findIndex(step=>step.kind==='operation'&&step.label==='stack.pop()');
  expect(index).toBeGreaterThan(0);
  render(<ExecutionPlayer trace={data}/>);
  fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
  expect(screen.getByRole('status').textContent).toContain('stack.pop() → [0, 0]');
  expect(within(screen.getByRole('group',{name:'stack'})).queryAllByRole('listitem')).toHaveLength(0);
  expect(document.querySelector('[aria-current="step"]')?.getAttribute('data-line')).toBe(String(steps[index].line));
  fireEvent.click(screen.getByRole('button',{name:'Next →'}));
  const grid=screen.getByRole('group',{name:'grid'});
  expect(grid.textContent).toContain('r, c = (0, 0)');
  expect(grid.querySelector('[title^="[0][0]"]')?.classList.contains('is-pointed')).toBe(true);
  expect(within(grid).getAllByRole('row')).toHaveLength(4);
});
