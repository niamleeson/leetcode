import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { ExecutionPlayer } from './ExecutionWalkthrough';
import { ExecutionTrace, TraceHeap, isReference, materialize, objectFor } from '../../data/walkthroughs/execution';
import { solutionMap } from '../../data/solutions';

const trace=JSON.parse(readFileSync('src/data/walkthroughs/generated/417.json','utf8')) as ExecutionTrace;
beforeEach(()=>localStorage.clear());
afterEach(cleanup);

it('pops coordinate pairs once per ocean, after marking the matching boolean grid',()=>{
  expect(trace.code).toBe(solutionMap[417].jsCode);
  expect(trace.code).not.toMatch(/Math\.floor|%|new Set/);
  for(const example of trace.examples) {
    const heap:TraceHeap={},seen=new Set<string>();
    for(const step of example.steps) {
      Object.assign(heap,step.heap);
      if(step.kind!=='operation'||step.label!=='stack.pop()')continue;
      const coordinates=objectFor(step.value,heap)!.items! as number[];
      expect(coordinates).toHaveLength(2);
      const [r,c]=coordinates;
      expect(r).toBeGreaterThanOrEqual(0);expect(c).toBeGreaterThanOrEqual(0);
      const visited=step.state.visited;
      expect(isReference(visited)).toBe(true);
      if(!isReference(visited))throw new Error('Missing visited grid');
      expect([step.state.pacific,step.state.atlantic]).toContainEqual(visited);
      expect(step.state.pacific).not.toEqual(step.state.atlantic);
      const rows=objectFor(visited,heap)!.items!;
      expect(objectFor(rows[r],heap)!.items![c]).toBe(true);
      const key=`${visited.$ref}/${r}/${c}`;
      expect(seen.has(key)).toBe(false);seen.add(key);
    }
  }
});

it('shows visited as the current ocean grid with matching coordinates and code highlights',()=>{
  const steps=trace.examples[0].steps;
  render(<ExecutionPlayer trace={trace}/>);
  for(const ocean of ['pacific','atlantic']) {
    const index=steps.findIndex(step=>step.label==='visited[nr][nc] = true;'&&JSON.stringify(step.state.visited)===JSON.stringify(step.state[ocean]));
    expect(index).toBeGreaterThan(0);
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    const panel=screen.getByRole('group',{name:`${ocean}, visited`});
    const {nr,nc}=steps[index].state;
    expect(within(panel).getAllByRole('row')).toHaveLength(2);
    expect(panel.querySelector(`[title^="[${nr}][${nc}]"]`)?.textContent).toContain('true');
    expect([...document.querySelectorAll('[aria-current="step"]')].map(line=>Number(line.getAttribute('data-line')))).toEqual(steps[index].lines);
    const {heap}=materialize(steps,index);
    const heights=objectFor(steps[index].input.heights,heap)!.items!.map(row=>objectFor(row,heap)!.items);
    expect(heights).toEqual(trace.examples[0].input[0]);
  }
});

it('renders the six examples with both ocean grids retaining their row and column layout',()=>{
  render(<ExecutionPlayer trace={trace}/>);
  for(const [exampleIndex,example] of trace.examples.entries()) {
    fireEvent.change(screen.getByRole('combobox'),{target:{value:exampleIndex}});
    fireEvent.change(screen.getByRole('slider'),{target:{value:example.steps.length-1}});
    for(const name of ['heights','pacific','atlantic']) {
      const rows=within(screen.getByRole('group',{name})).getAllByRole('row');
      const expected=example.input[0] as number[][];
      expect(rows).toHaveLength(expected.length);
      rows.forEach((row,r)=>expect(within(row).getAllByRole('cell')).toHaveLength(expected[r].length));
    }
    expect(screen.getByLabelText('Final result').textContent).toContain(JSON.stringify(example.expected));
  }
});
