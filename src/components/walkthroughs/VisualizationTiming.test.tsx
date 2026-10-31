import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ExecutionDiagram from './ExecutionDiagram';
import { ExecutionPlayer } from './ExecutionWalkthrough';
import { ExecutionTrace, TraceHeap, groupVariables, isReference, objectFor } from '../../data/walkthroughs/execution';
import { collectStructure, suspendedValuesFor } from '../../data/walkthroughs/structure';

const directory='src/data/walkthroughs/generated';
const trace=(key:string)=>JSON.parse(readFileSync(`${directory}/${key}.json`,'utf8')) as ExecutionTrace;
beforeEach(()=>localStorage.clear());
afterEach(cleanup);

it('backs every displayed binding, node, and structure link with data already recorded at that step across every solution and example',()=>{
  let examples=0,frames=0,pictures=0;
  for(const file of readdirSync(directory).filter(file=>file.endsWith('.json'))) {
    const data=JSON.parse(readFileSync(`${directory}/${file}`,'utf8')) as ExecutionTrace;
    for(const example of data.examples) {
      examples++;
      const heap:TraceHeap={},born=new Set<string>();
      const callers=suspendedValuesFor(example.steps);
      const order=[...new Set(example.steps.flatMap(step=>Object.keys(step.state)))];
      for(const [index,step] of example.steps.entries()) {
        frames++;
        const previousHeap={...heap};
        Object.assign(heap,step.heap);
        Object.keys(step.heap).forEach(id=>born.add(id));
        const context=`${file}/${example.name}/${index}: ${step.label}`;
        const groups=groupVariables(step,heap,order);
        for(const [name] of groups.variables)assert(Object.prototype.hasOwnProperty.call(step.state,name),context);
        for(const group of [...groups.inputs,...groups.collections]) {
          for(const name of group.names)assert(Object.prototype.hasOwnProperty.call(step.input,name)||Object.prototype.hasOwnProperty.call(step.state,name),context);
          if(isReference(group.value))assert(born.has(group.value.$ref),context);
        }

        const nodes=collectStructure([...Object.values(step.input),...Object.values(step.state),...callers[index],step.value],heap);
        if(!nodes.size)continue;
        pictures++;
        const markup=renderToStaticMarkup(<ExecutionDiagram roots={step.input} state={step.state} heap={heap} previousHeap={previousHeap} callers={callers[index]} result={step.value} isReturn={step.kind==='return'}/>);
        const rendered=new Set([...markup.matchAll(/data-node-id="([^"]+)"/g)].map(match=>match[1]));
        assert.deepEqual(rendered,new Set(nodes.keys()),context);
        for(const id of rendered)assert(born.has(id),context);
        for(const match of markup.matchAll(/data-from="([^"]+)" data-to="([^"]+)" data-side="([^"]*)"/g)) {
          const [,from,to,side]=match;
          assert(born.has(from),context);
          const object=heap[from];
          if(to==='null')assert.equal(object.fields?.[side],null,context);
          else {
            assert(born.has(to),context);
            const destinations=object.kind==='graph'?objectFor(object.fields?.neighbors,heap)?.items||[]:[object.fields?.[side]];
            assert(destinations.some(value=>isReference(value)&&value.$ref===to),context);
          }
        }
        const returnLabels=[...markup.matchAll(/class="execution-node-pointer"[^>]*>([^<]*)<\/text>/g)].filter(match=>/\breturn\b/.test(match[1]));
        if(step.kind!=='return')assert.equal(returnLabels.length,0,context);
        else if(isReference(step.value)&&nodes.has(step.value.$ref))assert(returnLabels.length>0,context);
      }
    }
  }
  expect(examples).toBeGreaterThanOrEqual(615);
  expect(frames).toBeGreaterThanOrEqual(47719);
  expect(pictures).toBeGreaterThan(1000);
},30000);

it.each(['105','133','133-iterative','1462-bfs','2392','323-bfs','752','416','417','84','46','2'])('%s ignores future states and final answers when rendering an earlier step',key=>{
  const data=trace(key),example=data.examples[0];
  const index=Math.floor(example.steps.length/2);
  const page=render(<ExecutionPlayer trace={data}/>);
  fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
  const before=document.querySelector('.execution-data')!.innerHTML;
  const changed=structuredClone(data);
  changed.examples[0].result='NOT_EXECUTED_YET';
  changed.examples[0].expected='NOT_EXECUTED_YET';
  changed.examples[0].steps.slice(index+1).forEach(step=>{
    step.state={futureValue:'NOT_EXECUTED_YET'};
    step.input={futureInput:{$ref:'futureObject'}};
    step.heap={futureObject:{kind:'array',items:['NOT_EXECUTED_YET']}};
    step.value={$ref:'futureObject'};
    step.stack=['futureCall'];
  });
  page.rerender(<ExecutionPlayer trace={changed}/>);
  expect(document.querySelector('.execution-data')!.innerHTML).toBe(before);
  expect(screen.queryByText('NOT_EXECUTED_YET')).toBeNull();
  expect(screen.queryByLabelText('Final result')).toBeNull();
});

it('does not label a dequeued or checked node as returned, and shows return only on an actual return',()=>{
  const tree=trace('102'),page=render(<ExecutionPlayer trace={tree}/>);
  const pointers=()=>[...document.querySelectorAll('.execution-node-pointer')].map(node=>node.textContent||'').join(' ');
  for(const label of ['queue.shift()','node.left','node.right']) {
    const index=tree.examples[0].steps.findIndex(step=>step.label===label&&isReference(step.value));
    expect(index).toBeGreaterThan(0);
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    expect(pointers()).not.toMatch(/\breturn\b/);
  }
  page.unmount();
  const list=trace('206');render(<ExecutionPlayer trace={list}/>);
  fireEvent.change(screen.getByRole('slider'),{target:{value:list.examples[0].steps.length-1}});
  expect(pointers()).toMatch(/\breturn\b/);
  fireEvent.click(screen.getByRole('button',{name:'Back'}));
  expect(pointers()).not.toMatch(/\breturn\b/);
  fireEvent.click(screen.getByRole('button',{name:'Reset'}));
  expect(pointers()).not.toMatch(/\breturn\b/);
});

it('shows the new-node region only after a graph clone is allocated and removes it on rewind',()=>{
  const data=trace('133-iterative'),steps=data.examples[0].steps;
  render(<ExecutionPlayer trace={data}/>);
  expect(screen.getByText('Input nodes')).toBeTruthy();
  expect(screen.queryByText('New nodes')).toBeNull();
  const index=steps.findIndex(step=>step.kind==='operation'&&step.label.startsWith('cloned.set(node'));
  fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
  expect(screen.getByText('New nodes')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Back'}));
  expect(screen.queryByText('New nodes')).toBeNull();
  fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
  fireEvent.click(screen.getByRole('button',{name:'Reset'}));
  expect(screen.queryByText('New nodes')).toBeNull();
});

it('reveals each lock state only when created, keeps its position, and hides it again with Back, Reset, or another example',()=>{
  const data=trace('752'),steps=data.examples[0].steps;
  const queue=steps.findIndex(step=>step.label.startsWith('const queue ='));
  const generated=steps.flatMap((step,index)=>step.kind==='statement'&&step.label.startsWith('const newState =')?[index]:[]);
  render(<ExecutionPlayer trace={data}/>);
  expect(document.querySelectorAll('[data-node-key]')).toHaveLength(0);
  fireEvent.change(screen.getByRole('slider'),{target:{value:queue}});
  expect(document.querySelectorAll('[data-node-key]')).toHaveLength(1);
  const initial=document.querySelector('[data-node-key]')!.getAttribute('transform');
  fireEvent.change(screen.getByRole('slider'),{target:{value:generated[0]}});
  expect(document.querySelectorAll('[data-node-key]')).toHaveLength(2);
  const key=JSON.stringify(steps[generated[0]].state.newState);
  const neighbor=()=>[...document.querySelectorAll('[data-node-key]')].find(node=>node.getAttribute('data-node-key')===key);
  const position=neighbor()!.getAttribute('transform');
  fireEvent.change(screen.getByRole('slider'),{target:{value:generated[1]}});
  expect(document.querySelectorAll('[data-node-key]')).toHaveLength(3);
  expect(neighbor()!.getAttribute('transform')).toBe(position);
  expect([...document.querySelectorAll('[data-node-key]')].find(node=>node.getAttribute('data-node-key')==='"0000"')!.getAttribute('transform')).toBe(initial);
  fireEvent.change(screen.getByRole('slider'),{target:{value:generated[0]}});
  fireEvent.click(screen.getByRole('button',{name:'Back'}));
  expect(document.querySelectorAll('[data-node-key]')).toHaveLength(1);
  fireEvent.change(screen.getByRole('slider'),{target:{value:generated[1]}});
  fireEvent.click(screen.getByRole('button',{name:'Reset'}));
  expect(document.querySelectorAll('[data-node-key]')).toHaveLength(0);
  fireEvent.change(screen.getByRole('combobox'),{target:{value:1}});
  fireEvent.change(screen.getByRole('slider'),{target:{value:data.examples[1].steps.length-1}});
  expect(document.querySelectorAll('[data-node-key]')).toHaveLength(0);
});
