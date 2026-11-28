const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const entry = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/data/daily-questions/entries/2026-11-27.json'), 'utf8'));
assert.equal(entry.id, 3946);
const dp = entry.solutions.find(solution => solution.title === '0/1 first purchases + cheapest extra copies');
assert.ok(dp, 'The existing DP solution remains available');
const dfs = {
  code: fs.readFileSync(path.join(__dirname, 'imports/2026-11-27-3946-dfs.js'), 'utf8'),
  pythonCode: fs.readFileSync(path.join(__dirname, 'imports/2026-11-27-3946-dfs.py'), 'utf8'),
};
const variants = [{ name: 'DFS', ...dfs }, { name: 'DP', ...dp }];

// Enumerate actual paid-copy counts, then award each purchased type's gifts once.
// This does not use the solutions' first-purchase/cheapest-extra decomposition.
function brute(items, budget) {
  let best = 0;
  const counts = Array(items.length).fill(0);
  function visit(index, remaining) {
    if (index === items.length) {
      let total = counts.reduce((sum, count) => sum + count, 0);
      for (let i = 0; i < items.length; i++) if (counts[i] > 0) {
        for (let j = 0; j < items.length; j++) {
          if (i !== j && items[j][0] % items[i][0] === 0) total++;
        }
      }
      best = Math.max(best, total);
      return;
    }
    for (let count = 0; count * items[index][1] <= remaining; count++) {
      counts[index] = count;
      visit(index + 1, remaining - count * items[index][1]);
    }
  }
  visit(0, budget);
  return best;
}

const cases = [
  { items: [[6, 2], [2, 6], [3, 4]], budget: 9, expected: 4 },
  { items: [[2, 4], [3, 2], [4, 1], [6, 4], [12, 4]], budget: 8, expected: 10 },
  { items: [[2, 5]], budget: 4, expected: 0 },
  { items: [[2, 2]], budget: 9, expected: 4 },
  // Free copies cannot activate a second round of gifts.
  { items: [[2, 1], [4, 9], [8, 9]], budget: 1, expected: 3 },
  // Different types with identical factors each grant gifts once.
  { items: [[1, 1], [1, 1]], budget: 2, expected: 4 },
  // Skipping the cheapest type's activation undercounts its gifts at a leaf;
  // the branch activating that type must still find the true optimum.
  { items: [[1, 1], [2, 2]], budget: 1, expected: 2 },
  { items: [[2, 1], [3, 1], [5, 2]], budget: 1, expected: 1 },
];
let seed = 3946;
const random = max => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % max; };
for (let trial = 0; trial < 500; trial++) {
  const items = Array.from({ length: 1 + random(4) }, () => [1 + random(8), 1 + random(6)]);
  const budget = 1 + random(10);
  cases.push({ items, budget, expected: brute(items, budget) });
}
// Exhaust the combinations of divisibility relationships, duplicate types,
// and equal/unequal prices in short arrays, rather than relying on random inputs.
const itemChoices = [1, 2, 3].flatMap(factor => [1, 2].map(price => [factor, price]));
for (let length = 1; length <= 3; length++) {
  for (let encoding = 0; encoding < itemChoices.length ** length; encoding++) {
    let value = encoding;
    const items = Array.from({ length }, () => {
      const item = [...itemChoices[value % itemChoices.length]];
      value = Math.floor(value / itemChoices.length);
      return item;
    });
    for (let budget = 1; budget <= 6; budget++) cases.push({ items, budget, expected: brute(items, budget) });
  }
}
const boundaries = [
  { items: Array.from({ length: 1000 }, () => [1, 1]), budget: 1500, expected: 1000500 },
  { items: Array.from({ length: 1000 }, () => [1, 1500]), budget: 1500, expected: 1000 },
  { items: Array.from({ length: 1000 }, () => [1, 1500]), budget: 1499, expected: 0 },
];
const allCases = [...cases, ...boundaries];

test('3946: DFS and DP match independent purchase enumeration and the maximum bounds in both languages', () => {
  assert.equal(cases.length, 2056);
  for (const item of cases) assert.equal(brute(item.items, item.budget), item.expected);
  const originalInputs = JSON.stringify(allCases);
  for (const variant of variants) {
    const context = vm.createContext({ cases: allCases, answers: [] });
    vm.runInContext(`${variant.code}\nfor (const item of cases) answers.push(maximumSaleItems(item.items, item.budget));`, context, { timeout: 15000 });
    assert.deepEqual(Array.from(context.answers), allCases.map(item => item.expected), `${variant.name}: all JavaScript answers`);
    assert.equal(JSON.stringify(allCases), originalInputs, `${variant.name}: JavaScript inputs are unchanged`);
  }
  const pythonCode = [
    'import copy,json,sys',
    'payload=json.load(sys.stdin)',
    'answers=[]',
    'for source in payload["sources"]:',
    '    namespace={}',
    '    exec(source["code"],namespace)',
    '    solver=namespace["Solution"]()',
    '    variant_answers=[]',
    '    for case in payload["cases"]:',
    '        sys.setrecursionlimit(1000)',
    '        before=copy.deepcopy(case["items"])',
    '        variant_answers.append(solver.maximumSaleItems(case["items"],case["budget"]))',
    '        assert case["items"] == before, source["name"] + " modified input"',
    '    answers.append(variant_answers)',
    'print(json.dumps(answers))',
  ].join('\n');
  const python = spawnSync('python3', ['-c', pythonCode], {
    input: JSON.stringify({ sources: variants.map(variant => ({ name: variant.name, code: variant.pythonCode })), cases: allCases }),
    encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024,
  });
  assert.ifError(python.error);
  assert.equal(python.status, 0, python.stderr);
  assert.deepEqual(JSON.parse(python.stdout), variants.map(() => allCases.map(item => item.expected)));
});

test('3946: DFS caches each repeated state once, including a valid zero answer', () => {
  const cacheRead = 'if (memo[index][remaining] !== -1) return memo[index][remaining];';
  const cacheWrite = 'memo[index][remaining] = best;';
  assert.ok(dfs.code.includes(cacheRead) && dfs.code.includes(cacheWrite));
  const checks = [];
  const writes = [];
  const code = dfs.code
    .replace(cacheRead, `recordCheck(index, remaining, memo[index][remaining]);\n    ${cacheRead}`)
    .replace(cacheWrite, `recordWrite(index, remaining, best);\n    ${cacheWrite}`);
  const items = [[2, 1], [3, 1], [5, 2]];
  const budget = 1;
  const result = vm.runInNewContext(`${code}\nmaximumSaleItems(items, budget)`, {
    items, budget,
    recordCheck: (index, remaining, value) => checks.push({ index, remaining, value }),
    recordWrite: (index, remaining, value) => writes.push({ index, remaining, value }),
  }, { timeout: 1000 });
  assert.equal(result, 1);
  assert.ok(checks.some(check => check.value === 0), 'A cached zero answer is reused');
  assert.equal(new Set(writes.map(({ index, remaining }) => `${index},${remaining}`)).size, writes.length);
  assert.equal(checks.filter(check => check.value === -1).length, writes.length);
  assert.ok(writes.length <= items.length * (budget + 1));
});

test('3946: the existing DP walkthrough still covers all capacity updates and final allowances', () => {
  for (const trace of [dp.walkthrough, dp.pythonWalkthrough]) {
    assert.equal((trace.match(/^Capacity \d+\./gm) || []).length, 18);
    assert.equal((trace.match(/^reserved = \d+\./gm) || []).length, 10);
  }
});
