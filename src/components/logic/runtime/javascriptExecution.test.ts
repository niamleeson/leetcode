import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runJavaScript } from './javascriptExecution';
import { validateJavaScriptResult } from './javascriptValidation';
import type { LogicFixture } from './types';
const require = createRequire(resolve('package.json'));
const { instrument } = require('./tools/walkthroughs/instrument.cjs');
const fixture: LogicFixture = { name: 'Distinct indices', entry: 'twoSum', args: [[3, 2, 4], 6], expected: [1, 2] };
const run = (code: string, fixtures = [fixture], problemId = 1) => runJavaScript({ problemId, code, execution: instrument(code), fixtures });

describe('live JavaScript guided execution', () => {
  it('executes different valid code and rejects reusing the same Two Sum index', () => {
    const valid = run('function twoSum(nums, target) { for (let i=0;i<nums.length;i++) for(let j=i+1;j<nums.length;j++) if(nums[i]+nums[j]===target) return [j,i]; }');
    expect(valid.passed).toBe(1); expect(valid.tests[0].actual).toEqual([2, 1]);
    const invalid = run('function twoSum(nums, target) { const seen=new Map(); for (let i=0;i<nums.length;i++) { seen.set(nums[i],i); if(seen.has(target-nums[i])) return [seen.get(target-nums[i]),i]; } }');
    expect(invalid.passed).toBe(0); expect(invalid.tests[0].actual).toEqual([0, 0]);
  });

  it('records changed locals after actual source statements and displays condition results', () => {
    const code = 'function sum(nums) {\n let total=0;\n for (const value of nums) {\n  total += value;\n }\n if(total>0) return total;\n return 0;\n}';
    const result = run(code, [{ name: 'Add', entry: 'sum', args: [[2, 5]], expected: 7 }], 999);
    expect(result.passed).toBe(1);
    expect(result.tests[0].trace.filter(frame => frame.statement === 'total += value;').map(frame => frame.locals.total)).toEqual(['2', '7']);
    expect(result.tests[0].trace.find(frame => frame.statement === 'total>0')).toMatchObject({ line: 6, detail: 'condition evaluated', valueLabel: 'condition', value: 'true' });
  });

  it('runs class operations and preserves JavaScript collection representations', () => {
    const result = run('class Counter { constructor(n) { this.n=n; this.seen=new Set(); this.map=new Map(); } add(x) { this.n+=x; this.seen.add(x); this.map.set(x,this.n); return this.n; } }', [{ name: 'Calls', entry: 'Counter', args: [2], operations: [['add', [3]], ['add', [-1]]], expected: [null, 5, 4] }], 999);
    expect(result.passed).toBe(1);
    expect(result.tests[0].trace.some(frame => frame.locals.this?.includes('seen: Set {3, -1}'))).toBe(true);
    expect(result.tests[0].trace.some(frame => frame.locals.this?.includes('map: Map {3 => 5, -1 => 4}'))).toBe(true);
  });

  it('keeps counting execution after the visible trace is full', () => {
    const code = 'function twoSum() { let i=0; while(true) { i++; } }';
    const result = runJavaScript({ problemId: 1, code, execution: instrument(code), fixtures: [fixture] }, { frames: 3, events: 80, milliseconds: 2000 });
    expect(result.tests[0].error?.message).toContain('loops finish');
    expect(result.tests[0].executionEvents).toBeGreaterThan(80);
    expect(result.tests[0].trace).toHaveLength(3); expect(result.tests[0].traceTruncated).toBe(true);
  });

  it('reports actual errors without pretending an instrumented line is an original source line', () => {
    const result = run('function twoSum() { const values=[]; return values.missing(); }');
    expect(result.tests[0].error?.type).toBe('TypeError');
    expect(result.tests[0].error?.line).toBeUndefined();
    expect(result.tests[0].trace.some(frame => frame.locals.values === '[]')).toBe(true);
  });

  it('rejects cyclic output lists and accepts unordered remaining prefixes where the problem permits them', () => {
    const cycle = run('function reverseList(head) { head.next=head; return head; }', [{ name: 'Cycle', entry: 'reverseList', args: [{ $list: [1] }], expected: [1], output: 'list' }], 206);
    expect(cycle.tests[0].error?.message).toContain('cycle');
    const prefix = run('function removeElement(nums,val) { const kept=nums.filter(x=>x!==val).reverse(); kept.forEach((x,i)=>nums[i]=x); return kept.length; }', [{ name: 'Any remaining order', entry: 'removeElement', args: [[1, 2, 3], 2], expected: 2, prefix: [1, 3] }], 27);
    expect(prefix.passed).toBe(1);
  });

  it('accepts valid ties and different ordering while rejecting malformed outputs', () => {
    expect(validateJavaScriptResult([[-1, 0]], { ...fixture, args: [[[1, 0], [-1, 0]], 1], expected: [[1, 0]] }, 973)).toBe(true);
    expect(validateJavaScriptResult([[true, 0]], { ...fixture, args: [[[1, 0], [-1, 0]], 1], expected: [[1, 0]] }, 973)).toBe(false);
    expect(validateJavaScriptResult([2], { ...fixture, args: [[1, 2], 1], expected: [1] }, 347)).toBe(true);
    const topo = { ...fixture, args: [3, [[2, 0], [2, 1]]], expected: [0, 1, 2], compare: 'topological' };
    expect(validateJavaScriptResult([1, 0, 2], topo, 210)).toBe(true);
    expect(validateJavaScriptResult([2, 1, 0], topo, 210)).toBe(false);
  });
});
