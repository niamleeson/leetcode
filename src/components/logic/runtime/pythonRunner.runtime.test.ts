import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { LogicRunRequest, LogicRunResult } from './types';
import adapter from '../../../../tools/walkthroughs/python-runtime.py?raw';
import implementation from './pythonRunner.py?raw';

function execute(request: LogicRunRequest & { _testLimits?: { maxFrames?: number; maxEvents?: number; timeLimit?: number } }): LogicRunResult {
  const program = `import json,sys\ndata=json.load(sys.stdin)\nns={'__name__':'logic_runtime'}\nexec(data['adapter'],ns)\nexec(data['implementation'],ns)\nprint(ns['run_logic_json'](json.dumps(data['request'])))`;
  const child = spawnSync('python3', ['-B', '-c', program], {
    input: JSON.stringify({ adapter, implementation, request }), encoding: 'utf8', timeout: 10000, maxBuffer: 8 * 1024 * 1024,
  });
  if (child.status !== 0) throw new Error(child.error?.message || child.stderr);
  return JSON.parse(child.stdout);
}
const twoSum = (code: string): LogicRunRequest => ({ problemId: 1, code, fixtures: [
  { name: 'Distinct entries with equal values', entry: 'twoSum', args: [[3, 3], 6], expected: [0, 1] },
  { name: 'Do not reuse the first index', entry: 'twoSum', args: [[3, 2, 4], 6], expected: [1, 2] },
] });

describe('real Python learning runner', () => {
  it('accepts a correct independently written solution and either pair order', () => {
    const result = execute(twoSum('class Solution:\n    def twoSum(self, nums, target):\n        for i in range(len(nums)):\n            for j in range(i+1, len(nums)):\n                if nums[i]+nums[j] == target:\n                    return [j, i]'));
    expect(result.passed).toBe(2);
    expect(result.tests[0].actual).toEqual([1, 0]);
  });

  it('rejects the plausible self-reuse Two Sum bug', () => {
    const result = execute(twoSum('class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for i, x in enumerate(nums):\n            seen[x] = i\n            if target-x in seen:\n                return [seen[target-x], i]'));
    expect(result.passed).toBe(0);
    expect(result.tests[0].actual).toEqual([0, 0]);
    expect(result.tests[0].error).toBeUndefined();
  });

  it('records actual values after the selected line executes', () => {
    const result = execute({ problemId: 999, code: 'class Solution:\n    def add(self, nums):\n        total = 0\n        for x in nums:\n            total += x\n        return total', fixtures: [{name: 'Sum', entry: 'add', args: [[2,5]], expected: 7}] });
    expect(result.passed).toBe(1);
    const additions = result.tests[0].trace.filter(frame => frame.line === 5 && frame.kind === 'statement');
    expect(additions.map(frame => frame.locals.total)).toEqual(['2', '7']);
    expect(result.tests[0].trace[result.tests[0].trace.length - 1]?.value).toBe('7');
  });

  it('shows only functions defined in the submitted source, including annotated methods', () => {
    const result = execute(twoSum('class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        return [0, 1]'));
    expect(result.tests[0].trace.map(frame => frame.functionName)).toEqual(['twoSum', 'twoSum']);
    expect(result.tests[0].trace.every(frame => !Object.prototype.hasOwnProperty.call(frame.locals, 'format'))).toBe(true);
  });

  it('preserves Python collection types and singleton tuple syntax in displayed locals', () => {
    const result = execute({ problemId: 999, code: `from collections import deque
class Solution:
    def collections(self):
        empty_dict = {}
        empty_set = set()
        nonempty_set = {7}
        empty_frozen = frozenset()
        nonempty_frozen = frozenset({7})
        empty_tuple = ()
        singleton = (7,)
        pair = (7, 8)
        empty_queue = deque()
        queue = deque([7, 8])
        bounded_queue = deque([7], maxlen=3)
        nested = [set(), (7,), frozenset({8}), deque([9])]
        return True`, fixtures: [{ name: 'Collection representations', entry: 'collections', args: [], expected: true }] });
    expect(result.passed).toBe(1);
    const finalFrame = result.tests[0].trace[result.tests[0].trace.length - 1];
    expect(finalFrame.locals).toMatchObject({
      empty_dict: '{}', empty_set: 'set()', nonempty_set: '{7}',
      empty_frozen: 'frozenset()', nonempty_frozen: 'frozenset({7})',
      empty_tuple: '()', singleton: '(7,)', pair: '(7, 8)',
      empty_queue: 'deque([])', queue: 'deque([7, 8])', bounded_queue: 'deque([7], maxlen=3)',
      nested: '[set(), (7,), frozenset({8}), deque([9])]',
    });
  });

  it('filters Python 3.14 annotation machinery in real WebAssembly and keeps JavaScript globals isolated', () => {
    const program = `import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync(0,'utf8'));
const {loadPyodide}=await import(data.moduleUrl);
const py=await loadPyodide({indexURL:data.assetPath,jsglobals:{},stdout:()=>{},stderr:()=>{}});
const ns=py.runPython('dict(__name__="logic_runtime")');
py.runPython(data.adapter+'\\n'+data.implementation,{globals:ns});
const run=ns.get('run_logic_json');
const results=data.requests.map(request=>JSON.parse(run(JSON.stringify(request))));
console.log(JSON.stringify(results));run.destroy();ns.destroy();`;
    const assetPath = resolve('public/vendor/pyodide/314.0.7') + '/';
    const child = spawnSync(process.execPath, ['--input-type=module', '-e', program], {
      input: JSON.stringify({ moduleUrl: pathToFileURL(assetPath + 'pyodide.mjs').href, assetPath, adapter, implementation,
        requests: [twoSum('class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        return [0, 1]'),
          { problemId: 999, code: 'import js\nclass Solution:\n    def check(self):\n        return hasattr(js, "fetch")', fixtures: [{name: 'No browser globals', entry: 'check', args: [], expected: false}] }],
      }), encoding: 'utf8', timeout: 20000, maxBuffer: 8 * 1024 * 1024,
    });
    if (child.status !== 0) throw new Error(child.error?.message || child.stderr);
    const results = JSON.parse(child.stdout) as LogicRunResult[];
    expect(results[0].tests[0].trace.map(frame => frame.functionName)).toEqual(['twoSum', 'twoSum']);
    expect(results[0].tests[0].trace.every(frame => !('format' in frame.locals))).toBe(true);
    expect(results[1].passed).toBe(1);
  }, 25000);

  it('reports syntax and runtime errors against the submitted source', () => {
    const syntax = execute(twoSum('class Solution:\n    def twoSum(self, nums, target)\n        return [0,1]'));
    expect(syntax.tests[0].error).toMatchObject({ type: 'SyntaxError', line: 2 });
    const crash = execute(twoSum('class Solution:\n    def twoSum(self, nums, target):\n        def broken(value):\n            denominator = 0\n            return value / denominator\n        return broken(7)'));
    expect(crash.tests[0].error).toMatchObject({ type: 'ZeroDivisionError', line: 5 });
    expect(crash.tests[0].trace[crash.tests[0].trace.length - 1]).toMatchObject({ kind: 'error', line: 5, functionName: 'broken', locals: { denominator: '0', value: '7' } });
  });

  it('keeps the execution limit active after displayed frames have been capped', () => {
    const result = execute({ ...twoSum('class Solution:\n    def twoSum(self, nums, target):\n        i = 0\n        while True:\n            i += 1'), _testLimits: { maxFrames: 3, maxEvents: 80 } });
    expect(result.tests[0].error?.type).toBe('LogicExecutionLimit');
    expect(result.tests[0].trace).toHaveLength(3);
    expect(result.tests[0].traceTruncated).toBe(true);
    expect(result.tests[0].executionEvents).toBeGreaterThan(80);
  });

  it('also limits a loop at module scope before any entry function is called', () => {
    const result = execute({ ...twoSum('while True:\n    pass'), _testLimits: { maxEvents: 80 } });
    expect(result.tests[0].error?.type).toBe('LogicExecutionLimit');
    expect(result.tests[0].executionEvents).toBeGreaterThan(80);
  });

  it('creates fresh submission globals for every case and bounds printed output', () => {
    const code = 'counter = 0\nclass Solution:\n    def value(self):\n        global counter\n        counter += 1\n        print("x" * 10000)\n        return counter';
    const fixture = { name: 'Fresh counter', entry: 'value', args: [], expected: 1 };
    const result = execute({ problemId: 999, code, fixtures: [fixture, fixture] });
    expect(result.passed).toBe(2);
    expect(result.tests.every(test => test.stdout.length === 4000)).toBe(true);
  });

  it('runs design-class operations on one instance within a case', () => {
    const result = execute({ problemId: 999, code: 'class Counter:\n    def __init__(self, n):\n        self.n = n\n    def add(self, x):\n        self.n += x\n        return self.n', fixtures: [{name: 'Persistent instance', entry: 'Counter', args: [2], operations: [['add',[3]],['add',[-1]]], expected: [null,5,4]}] });
    expect(result.passed).toBe(1);
    expect(result.tests[0].actual).toEqual([null,5,4]);
  });

  it('accepts different valid topological orders and tied closest points', () => {
    const topo = execute({ problemId: 210, code: 'class Solution:\n    def findOrder(self, n, edges):\n        return [1,0,2]', fixtures: [{name:'Independent prerequisites',entry:'findOrder',args:[3,[[2,0],[2,1]]],expected:[0,1,2],compare:'topological'}] });
    expect(topo.passed).toBe(1);
    const closest = execute({problemId:973, code:'class Solution:\n    def kClosest(self, points, k):\n        return [[-1,0]]', fixtures:[{name:'Tied distances',entry:'kClosest',args:[[[1,0],[-1,0]],1],expected:[[1,0]],compare:'groups'}]});
    expect(closest.passed).toBe(1);
  });

  it('rejects returning a cyclic list even when its unique values match the expected result', () => {
    const result = execute({problemId:206,code:'class Solution:\n    def reverseList(self, head):\n        head.next = head\n        return head',fixtures:[{name:'Do not create a cycle',entry:'reverseList',args:[{$list:[1]}],expected:[1],output:'list'}]});
    expect(result.passed).toBe(0);
    expect(result.tests[0].error?.message).toContain('cycle');
  });

  it('accepts arbitrary remaining-element order for the in-place Remove Element problem', () => {
    const result = execute({problemId:27,code:'class Solution:\n    def removeElement(self, nums, val):\n        kept = [x for x in nums if x != val][::-1]\n        nums[:len(kept)] = kept\n        return len(kept)',fixtures:[{name:'Order may vary',entry:'removeElement',args:[[1,2,3],2],expected:2,prefix:[1,3]}]});
    expect(result.passed).toBe(1);
  });
});
