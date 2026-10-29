import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { ExecutionPlayer, hasExecutionWalkthrough } from './ExecutionWalkthrough';
import { ExecutionTrace, materialize, objectFor } from '../../data/walkthroughs/execution';
import { neetcodeTopics } from '../../data/neetcode250';

const trace=(id:number)=>JSON.parse(readFileSync(`src/data/walkthroughs/generated/${id}.json`,'utf8')) as ExecutionTrace;
beforeEach(()=>localStorage.clear());
afterEach(cleanup);
describe('execution walkthroughs',()=>{
  it.each(neetcodeTopics.flatMap(t=>t.problems).map(p=>[p.id,p.title] as const))('renders #%i %s at the beginning, middle, and result', (id)=>{
    const data=trace(id);render(<ExecutionPlayer trace={data}/>);
    const steps=data.examples[0].steps;
    for(const index of [0,Math.floor(steps.length/2),steps.length-1]) {
      fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
      expect(document.querySelector('[aria-current="step"]')?.getAttribute('data-line')).toBe(String(steps[index].line));
      expect(screen.getByRole('status').textContent?.length).toBeGreaterThan(0);
    }
    expect(screen.getByLabelText('Final result').textContent).toContain(JSON.stringify(data.examples[0].result));
  });
  it('covers every problem on the NeetCode 250 page',()=>{
    const problems=neetcodeTopics.flatMap(t=>t.problems);
    expect(problems).toHaveLength(250);
    expect(problems.every(p=>hasExecutionWalkthrough(p.id))).toBe(true);
  });
  it('shows a pop separately, with the exact executing line and the remaining stack',()=>{
    const data=trace(150);render(<ExecutionPlayer trace={data}/>);
    const index=data.examples[0].steps.findIndex(s=>s.kind==='operation'&&s.label==='stack.pop()');
    const step=data.examples[0].steps[index];
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    expect(screen.getByRole('status').textContent).toContain('stack.pop() → 1');
    expect(document.querySelector('[aria-current="step"]')?.getAttribute('data-line')).toBe(String(step.line));
    const {heap}=materialize(data.examples[0].steps,index);
    expect(objectFor(step.state.stack,heap)?.items).toEqual([2]);
    fireEvent.click(screen.getByRole('button',{name:'Back'}));
    fireEvent.click(screen.getByRole('button',{name:'Next →'}));
    expect(screen.getByRole('status').textContent).toContain('stack.pop() → 1');
  });
  it('shares and persists highlighting across different problem players',()=>{
    const page=render(<><ExecutionPlayer trace={trace(102)}/><ExecutionPlayer trace={trace(994)}/></>);
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(screen.getAllByRole('checkbox').every(c=>!(c as HTMLInputElement).checked)).toBe(true);
    expect(document.querySelectorAll('[aria-current="step"]')).toHaveLength(0);
    page.unmount();render(<ExecutionPlayer trace={trace(1)}/>);
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
    act(()=>{localStorage.setItem('neetcode-walkthrough-highlight-code','true');window.dispatchEvent(new StorageEvent('storage',{key:'neetcode-walkthrough-highlight-code'}));});
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  });
  it('keeps all source lines, renders the tree, resets and changes examples independently',()=>{
    const data=trace(102);render(<ExecutionPlayer trace={data}/>);
    expect(document.querySelectorAll('.traversal-source-line')).toHaveLength(data.code.split('\n').length);
    expect(screen.getByRole('img',{name:/Tree with current/})).toBeTruthy();
    fireEvent.change(screen.getByRole('slider'),{target:{value:20}});
    fireEvent.click(screen.getByRole('button',{name:'Reset'}));
    expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('0');
    fireEvent.change(screen.getByRole('combobox'),{target:{value:1}});
    fireEvent.change(screen.getByRole('slider'),{target:{value:data.examples[1].steps.length-1}});
    expect(screen.getByLabelText('Final result').textContent).toContain('[]');
  });
  it('renders graph connections and keeps failed checks available',()=>{
    const data=trace(207);render(<ExecutionPlayer trace={data}/>);
    expect(screen.getByRole('img',{name:/Directed graph from prerequisites/})).toBeTruthy();
    const index=data.examples[0].steps.findIndex(s=>s.kind==='check'&&s.value===false);
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    expect(within(screen.getByRole('status')).getByText(/false/)).toBeTruthy();
  });
});
