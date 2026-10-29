import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { neetcodeTopics } from '../neetcode250';
import { ExecutionTrace, TraceHeap, groupVariables, isReference } from './execution';

const trace=(id:number)=>JSON.parse(readFileSync(`src/data/walkthroughs/generated/${id}.json`,'utf8')) as ExecutionTrace;

describe('persistent walkthrough data',()=>{
  it('accounts for every live variable with its actual value across all 250 problems and every example',()=>{
    let examples=0,frames=0;
    for(const problem of neetcodeTopics.flatMap(topic=>topic.problems)) {
      for(const example of trace(problem.id).examples) {
        examples++;
        const order=[...new Set(example.steps.flatMap(step=>Object.keys(step.state)))];
        const heap:TraceHeap={};
        for(const step of example.steps) {
          frames++;Object.assign(heap,step.heap);
          const {variables,inputs,collections}=groupVariables(step,heap,order);
          const displayed=[...variables.map(([name,value])=>({names:[name],value})),...inputs,...collections];
          for(const [name,value] of Object.entries(step.state)) {
            const matches=displayed.filter(group=>group.names.includes(name));
            expect(matches.length,`#${problem.id}: ${name} is missing at ${step.label}`).toBeGreaterThan(0);
            for(const match of matches) expect(match.value,`#${problem.id}: ${name} shows stale data at ${step.label}`).toEqual(value);
          }
          // Aliases identify the same live structure instead of rendering copies.
          const refs=[...inputs,...collections].flatMap(group=>isReference(group.value)?[group.value.$ref]:[]);
          expect(new Set(refs).size).toBe(refs.length);
          // Local scalar rows never retain values that have left scope.
          for(const [name] of variables) expect(name in step.state).toBe(true);
        }
      }
    }
    expect(examples).toBeGreaterThanOrEqual(500);
    expect(frames).toBeGreaterThan(examples);
  },20000);
  it('follows a reassigned input array rather than showing its original contents twice',()=>{
    const data=trace(312),example=data.examples[0];
    const index=example.steps.findIndex(step=>step.label==='nums = [1, ...nums, 1];');
    expect(index).toBeGreaterThan(0);
    const heap:TraceHeap={};for(const step of example.steps.slice(0,index+1))Object.assign(heap,step.heap);
    const step=example.steps[index];
    expect(step.state.nums).not.toEqual(step.input.nums);
    const {inputs,collections}=groupVariables(step,heap,Object.keys(step.state));
    const panels=[...inputs,...collections].filter(group=>group.names.includes('nums'));
    expect(panels).toHaveLength(1);
    expect(panels[0].value).toEqual(step.state.nums);
  });
});
