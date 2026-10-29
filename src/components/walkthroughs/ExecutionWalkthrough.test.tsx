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
      expect([...document.querySelectorAll('[aria-current="step"]')].map(element=>Number(element.getAttribute('data-line')))).toEqual(steps[index].lines||[steps[index].line]);
      expect(screen.getByRole('status').textContent?.length).toBeGreaterThan(0);
      const displayed=new Set([...document.querySelectorAll('[data-variable-names]')].flatMap(element=>JSON.parse(element.getAttribute('data-variable-names')!)));
      for(const name of Object.keys(steps[index].state)) expect(displayed.has(name),`#${id} step ${index}: ${name} must stay visible`).toBe(true);
      expect(document.querySelector('.execution-data details:not([open])')).toBeNull();
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
    expect(screen.getByRole('status').textContent).toContain('CHECK');
    expect(screen.getByRole('status').textContent).not.toMatch(/NOOP|No data changed/);
  });
  it('shows new variables with equals and real changes with before/after values',()=>{
    const data=trace(84);render(<ExecutionPlayer trace={data}/>);
    const steps=data.examples[0].steps;
    const index=steps.findIndex(s=>s.kind==='statement'&&s.label.startsWith('const [topLeft, topHeight]'));
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    const row=()=>[...document.querySelectorAll('.execution-change')].find(e=>e.querySelector('.execution-variable-name')?.textContent==='topHeight');
    expect(row()?.textContent).toBe(`topHeight=${steps[index].state.topHeight}`);
    expect(row()?.textContent).not.toMatch(/—|→/);
    const update=steps.findIndex(s=>s.kind==='statement'&&s.label.startsWith('maxArea =')&&s.state.maxArea!==steps[index].state.maxArea);
    fireEvent.change(screen.getByRole('slider'),{target:{value:update}});
    const change=[...document.querySelectorAll('.execution-change')].find(e=>e.querySelector('.execution-variable-name')?.textContent==='maxArea');
    expect(change?.textContent).toBe(`maxArea${steps[update-1].state.maxArea}→${steps[update].state.maxArea}`);
  });
  it('keeps real undefined values explicit rather than treating them as absent variables',()=>{
    const data=trace(150);render(<ExecutionPlayer trace={data}/>);
    const index=data.examples[0].steps.findIndex(s=>s.label==='result = leftOperand + rightOperand;');
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    const row=[...document.querySelectorAll('.execution-change')].find(e=>e.querySelector('.execution-variable-name')?.textContent==='result');
    expect(row?.textContent).toBe('resultundefined→3');
  });
  it('keeps data and change markers steady through an unchanged check while code advances',()=>{
    const data=trace(150);render(<ExecutionPlayer trace={data}/>);
    const steps=data.examples[0].steps,index=steps.findIndex(s=>s.label==='const isOperator = operators.has(token);');
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    const before=document.querySelector('.execution-data')!.innerHTML;
    fireEvent.click(screen.getByRole('button',{name:'Next →'}));
    expect(screen.getByRole('status').textContent).toContain('isOperator → false');
    expect(document.querySelector('[aria-current="step"]')?.getAttribute('data-line')).toBe(String(steps[index+1].line));
    expect(document.querySelector('.execution-data')!.innerHTML).toBe(before);
    fireEvent.click(screen.getByRole('button',{name:'Next →'}));
    expect(document.querySelector('.execution-data')!.innerHTML).not.toBe(before);
    fireEvent.click(screen.getByRole('button',{name:'Back'}));
    expect(document.querySelector('.execution-data')!.innerHTML).toBe(before);
  });
  it('shows a push once without mistaking its returned length for the pushed value',()=>{
    const data=trace(150);render(<ExecutionPlayer trace={data}/>);
    const steps=data.examples[0].steps,index=steps.findIndex(s=>s.kind==='operation'&&s.label.startsWith('stack.push'));
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    expect(screen.getByRole('status').textContent).toBe('STEPstack.push(parseInt(token))');
    fireEvent.click(screen.getByRole('button',{name:'Next →'}));
    expect(steps[index+1].kind).toBe('iterate');
    expect(screen.getByRole('status').textContent).not.toMatch(/push|NOOP/);
  });
  it('keeps maxArea visible at every step after initialization, including unrelated changes and Back',()=>{
    const data=trace(84);render(<ExecutionPlayer trace={data}/>);
    for(const [index,step] of data.examples[0].steps.entries()) {
      fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
      if(!('maxArea' in step.state)) {
        expect(screen.queryByRole('group',{name:'maxArea'})).toBeNull();
      } else {
        const row=screen.getByRole('group',{name:'maxArea'});
        expect(row.querySelector('strong')?.textContent).toBe(String(step.state.maxArea));
        expect(row.closest('details')).toBeNull();
      }
    }
    fireEvent.click(screen.getByRole('button',{name:'Back'}));
    expect(screen.getByRole('group',{name:'maxArea'}).querySelector('strong')?.textContent).toBe('10');
    fireEvent.click(screen.getByRole('button',{name:'Reset'}));
    expect(screen.queryByRole('group',{name:'maxArea'})).toBeNull();
  });
  it.each([
    [11,'maxWater'],[121,'maxProfit'],[3,'maxLen'],[53,'maxSum'],
    [76,'formed'],[994,'freshCount'],[994,'minutesElapsed'],[207,'processedCount'],
  ] as const)('keeps #%i %s visible after another variable changes',(id,name)=>{
    const data=trace(id),steps=data.examples[0].steps;
    const index=steps.findIndex((step,i)=>i>0&&name in step.state&&name in steps[i-1].state&&step.state[name]===steps[i-1].state[name]&&Object.keys(step.state).some(other=>other!==name&&JSON.stringify(step.state[other])!==JSON.stringify(steps[i-1].state[other])));
    expect(index).toBeGreaterThan(0);
    render(<ExecutionPlayer trace={data}/>);
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    const row=screen.getByRole('group',{name});
    expect(row.querySelector('strong')?.textContent).toBe(String(steps[index].state[name]));
    expect(row.classList.contains('is-changed')).toBe(false);
    expect(row.closest('details')).toBeNull();
  });
  it.each([[1,'seen'],[3,'charSet'],[207,'inDegree'],[394,'countStack'],[682,'scoreStack']] as const)('shows #%i collection %s without depending on its name',(id,name)=>{
    const data=trace(id),steps=data.examples[0].steps;
    const index=steps.findIndex((step,i)=>i>0&&name in step.state&&name in steps[i-1].state&&JSON.stringify(step.state[name])===JSON.stringify(steps[i-1].state[name]));
    expect(index).toBeGreaterThan(0);
    render(<ExecutionPlayer trace={data}/>);
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    const panel=screen.getByRole('group',{name});
    expect(panel.closest('details')).toBeNull();
    expect(panel.textContent!.length).toBeGreaterThan(name.length);
  });
  it('keeps variable order stable and removes values when their scope ends',()=>{
    const data=trace(84),steps=data.examples[0].steps;render(<ExecutionPlayer trace={data}/>);
    const start=steps.findIndex(step=>'topHeight' in step.state);
    fireEvent.change(screen.getByRole('slider'),{target:{value:start}});
    const names=()=>[...screen.getByRole('region',{name:'Current variables'}).querySelectorAll('[role="group"]')].map(e=>e.getAttribute('aria-label'));
    const before=names();
    const end=steps.findIndex((step,i)=>i>start&&!('topHeight' in step.state));
    fireEvent.change(screen.getByRole('slider'),{target:{value:end}});
    expect(screen.queryByRole('group',{name:'topHeight'})).toBeNull();
    expect(names()).toEqual(before.filter(name=>name!==null&&name in steps[end].state));
    expect(screen.getByRole('group',{name:'maxArea'})).toBeTruthy();
  });
  it('shares one array panel between aliases and preserves the helper index marker',()=>{
    const data=trace(300),steps=data.examples[0].steps;
    const index=steps.findIndex(step=>'arr' in step.state&&'tails' in step.state&&'mid' in step.state);
    expect(index).toBeGreaterThan(0);
    render(<ExecutionPlayer trace={data}/>);
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    const panels=[...document.querySelectorAll('[data-variable-names]')].filter(e=>JSON.parse(e.getAttribute('data-variable-names')!).includes('tails'));
    expect(panels).toHaveLength(1);
    expect(panels[0].getAttribute('aria-label')).toBe('tails, arr');
    expect(panels[0].querySelector('.execution-pointer')?.textContent).toBe('mid');
    expect(screen.getByRole('group',{name:'mid'}).querySelector('strong')?.textContent).toBe('0');
  });
});
