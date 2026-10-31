import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import ExecutionWalkthrough from './ExecutionWalkthrough';
import { ExecutionPlayer } from './ExecutionWalkthrough';
import { ExecutionTrace, materialize, objectFor } from '../../data/walkthroughs/execution';
import { solutionMap } from '../../data/solutions';

const trace=(key:string)=>JSON.parse(readFileSync(`src/data/walkthroughs/generated/${key}.json`,'utf8')) as ExecutionTrace;
beforeEach(()=>localStorage.clear());
afterEach(cleanup);

it.each(['684','721','1489','1584','2709'])('%s BFS reveals each direction only at insertion and rewinds graph and highlights together',key=>{
  const data=trace(key),steps=data.examples[0].steps;
  const insertions=steps.flatMap((step,index)=>step.kind==='operation'&&/^graph(?:\[|\.get\().*\.(push|add)\(/.test(step.label)?[index]:[]);
  expect(insertions.length).toBeGreaterThanOrEqual(2);
  render(<ExecutionPlayer trace={data}/>);
  const positions=()=>[...document.querySelectorAll('[data-node-key]')].map(node=>node.getAttribute('transform'));
  const initial=positions();
  expect(document.querySelectorAll('.execution-link')).toHaveLength(0);
  for(const [offset,index] of insertions.slice(0,2).entries()) {
    fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
    expect([...document.querySelectorAll('[aria-current="step"]')].map(line=>Number(line.getAttribute('data-line')))).toEqual(steps[index].lines);
    expect(document.querySelectorAll('.execution-link')).toHaveLength(1);
    expect(!!document.querySelector('.execution-link path')?.getAttribute('marker-end')).toBe(offset===0);
    expect(positions()).toEqual(initial);
  }
  fireEvent.change(screen.getByRole('slider'),{target:{value:insertions[0]}});
  fireEvent.click(screen.getByRole('button',{name:'Back'}));
  expect(document.querySelectorAll('.execution-link')).toHaveLength(0);
  fireEvent.change(screen.getByRole('slider'),{target:{value:insertions[1]}});
  fireEvent.click(screen.getByRole('button',{name:'Reset'}));
  expect(document.querySelectorAll('.execution-link')).toHaveLength(0);
  expect(positions()).toEqual(initial);
  const traversal=steps.findIndex(step=>step.kind==='operation'&&step.label==='nextFrontier.push(neighbor)');
  expect(traversal).toBeGreaterThan(0);
  fireEvent.change(screen.getByRole('slider'),{target:{value:traversal}});
  const step=steps[traversal],{heap}=materialize(steps,traversal);
  expect(objectFor(step.state.visited,heap)!.items).toContain(step.state.neighbor);
  expect(screen.getByRole('group',{name:'frontier'})).toBeTruthy();
  expect(screen.getByRole('group',{name:'nextFrontier'})).toBeTruthy();
  expect(screen.queryByText('Dashed: queued')).toBeNull();
});

it('adds each adjacency entry at its mutation, keeps nodes fixed, and reverses correctly with Back and Reset',()=>{
  const data=trace('261'),steps=data.examples[0].steps;
  const first=steps.findIndex(step=>step.kind==='operation'&&step.label==='graph[a].push(b)');
  const second=steps.findIndex(step=>step.kind==='operation'&&step.label==='graph[b].push(a)');
  render(<ExecutionPlayer trace={data}/>);
  const positions=[...document.querySelectorAll('[data-node-key]')].map(node=>node.getAttribute('transform'));
  expect(document.querySelectorAll('.execution-link')).toHaveLength(0);
  fireEvent.change(screen.getByRole('slider'),{target:{value:first}});
  expect(document.querySelectorAll('.execution-link')).toHaveLength(1);
  expect(document.querySelector('.execution-link path')?.getAttribute('marker-end')).toBeTruthy();
  fireEvent.change(screen.getByRole('slider'),{target:{value:second}});
  expect(document.querySelectorAll('.execution-link')).toHaveLength(1);
  expect(document.querySelector('.execution-link path')?.getAttribute('marker-end')).toBeNull();
  fireEvent.change(screen.getByRole('slider'),{target:{value:first}});
  fireEvent.click(screen.getByRole('button',{name:'Back'}));
  expect(document.querySelectorAll('.execution-link')).toHaveLength(0);
  fireEvent.change(screen.getByRole('slider'),{target:{value:steps.length-1}});
  expect([...document.querySelectorAll('[data-node-key]')].map(node=>node.getAttribute('transform'))).toEqual(positions);
  fireEvent.click(screen.getByRole('button',{name:'Reset'}));
  expect(document.querySelectorAll('.execution-link')).toHaveLength(0);
});

it('shows Connected Components BFS with exact highlights, component count, and queue/visited states in all examples',async()=>{
  const data=trace('323'),solution=solutionMap[323];
  expect(data.code).toBe(solution.jsCode);
  expect(data.examples).toHaveLength(6);
  render(<ExecutionWalkthrough id={323} code={solution.jsCode!}/>);
  await screen.findByRole('slider');
  for(const [exampleIndex,example] of data.examples.entries()) {
    fireEvent.change(screen.getByRole('combobox'),{target:{value:exampleIndex}});
    let increments=0;
    const processed=new Set<number>();
    for(const [index,step] of example.steps.entries()) {
      fireEvent.change(screen.getByRole('slider'),{target:{value:index}});
      expect([...document.querySelectorAll('[aria-current="step"]')].map(line=>Number(line.getAttribute('data-line')))).toEqual(step.lines||[step.line]);
      const {heap}=materialize(example.steps,index);
      const queue=objectFor(step.state.queue,heap)?.items||[],visited=objectFor(step.state.visited,heap)?.items||[];
      expect(document.querySelectorAll('[data-node-key]')).toHaveLength(example.input[0] as number);
      for(const node of document.querySelectorAll('[data-node-key]')) {
        const value=Number(node.getAttribute('data-node-key'));
        expect(node.classList.contains('is-queued')).toBe(queue.includes(value));
        expect(node.classList.contains('is-visited')).toBe(visited.includes(value));
      }
      if('componentCount' in step.state)expect(screen.getByRole('group',{name:'componentCount'}).querySelector('strong')?.textContent).toBe(String(step.state.componentCount));
      if(step.kind==='operation'&&step.label==='queue.shift()') {
        const node=step.value as number;
        expect(processed.has(node)).toBe(false);
        expect(visited).toContain(node);
        expect(queue).not.toContain(node);
        processed.add(node);
      }
      if(step.kind==='operation'&&step.label==='queue.push(neighbor)')expect(visited).toContain(step.state.neighbor);
      if(step.kind==='statement'&&step.label==='componentCount++;')increments++;
      if(index===0)expect(document.querySelectorAll('.execution-link')).toHaveLength(0);
    }
    expect(processed.size).toBe(example.input[0]);
    expect(increments).toBe(example.expected);
    expect(screen.getByLabelText('Final result').textContent).toContain(String(example.expected));
  }
},15000);
