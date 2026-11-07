import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { problems, solutionMap } = require('../walkthroughs/load.cjs');
const { logicRevision } = require('../../src/data/logic/manifest.ts');
const dataRoot = path.join(root, 'public/logic/problems', logicRevision);
const vendorRoot = path.join(root, 'public/vendor/pyodide/314.0.7');
const { loadPyodide } = await import(pathToFileURL(path.join(vendorRoot, 'pyodide.mjs')).href);
const python = await loadPyodide({ indexURL: `${vendorRoot}/`, jsglobals: Object.create(null), stdout() {}, stderr() {} });
const namespace = python.runPython('dict(__name__="logic_runtime")');
python.runPython(fs.readFileSync(path.join(root, 'tools/walkthroughs/python-runtime.py'), 'utf8'), { globals: namespace });
python.runPython(fs.readFileSync(path.join(root, 'src/components/logic/runtime/pythonRunner.py'), 'utf8'), { globals: namespace });
const execute = namespace.get('run_logic_json');
const fixturesFor = id => JSON.parse(fs.readFileSync(path.join(dataRoot, `${id}.json`), 'utf8')).fixtures;
const run = (problemId, code, fixtures = fixturesFor(problemId)) => JSON.parse(execute(JSON.stringify({ problemId, code, fixtures })));
const report = { engine: 'Pyodide 314.0.7 (WebAssembly CPython)', revision: logicRevision,
  problems: 0, cases: 0, passed: 0, failures: [], rejectedBugPatterns: [], alternateImplementations: [] };

for (const problem of problems) {
  const result = run(problem.id, solutionMap[problem.id].code);
  report.problems++;
  report.cases += result.total;
  report.passed += result.passed;
  for (const test of result.tests) if (!test.passed) {
    report.failures.push({ id: problem.id, name: test.name, expected: test.expected, actual: test.actual, error: test.error });
  }
  if (report.problems % 50 === 0) console.log(`WebAssembly practice check: ${report.problems}/250 problems, ${report.passed}/${report.cases} cases passed`);
}

const mutants = [
  [1, 'reuse the current Two Sum index', `def twoSum(nums, target):
    seen = {}
    for i, value in enumerate(nums):
        seen[value] = i
        if target - value in seen:
            return [seen[target - value], i]
`],
  [217, 'check only adjacent duplicates', `def containsDuplicate(nums):
    return any(a == b for a, b in zip(nums, nums[1:]))
`],
  [242, 'ignore anagram multiplicities', `def isAnagram(s, t):
    return set(s) == set(t)
`],
  [704, 'omit the final binary-search candidate', `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
`],
  [121, 'sell before buying', `def maxProfit(prices):
    return max(prices) - min(prices)
`],
  [121, 'take multiple stock transactions', `def maxProfit(prices):
    return sum(max(0, b - a) for a, b in zip(prices, prices[1:]))
`],
  [53, 'allow an empty maximum subarray', `def maxSubArray(nums):
    return max([0] + [sum(nums[a:b]) for a in range(len(nums)) for b in range(a + 1, len(nums) + 1)])
`],
  [238, 'divide by zero in product-except-self', `def productExceptSelf(nums):
    total = 1
    for number in nums:
        total *= number
    return [total // number for number in nums]
`],
];
for (const [id, label, code] of mutants) {
  const result = run(id, code);
  assert(result.passed < result.total, `${id}: suite accepted incorrect logic (${label})`);
  assert(!result.tests.some(test => test.error?.type === 'SyntaxError'), `${id}: malformed mutant would not test logic`);
  report.rejectedBugPatterns.push({ id, label, failedCases: result.total - result.passed });
}

for (const [id, label, code] of [
  [1, 'brute-force Two Sum returning reversed valid indices', `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [j, i]
`],
  [704, 'linear search instead of the reference binary search', `def search(nums, target):
    for index, value in enumerate(nums):
        if value == target:
            return index
    return -1
`],
]) {
  const result = run(id, code);
  assert.equal(result.passed, result.total, `${id}: rejected a valid alternative (${label})`);
  report.alternateImplementations.push({ id, label, cases: result.total });
}
execute.destroy();
namespace.destroy();
fs.writeFileSync('/tmp/logic-reference-wasm-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
assert.equal(report.problems, 250);
assert.equal(report.failures.length, 0, 'Some original solutions do not pass the practice cases in WebAssembly');
