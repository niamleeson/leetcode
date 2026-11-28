const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const entry = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/data/daily-questions/entries/2026-11-27.json'), 'utf8'));
assert.equal(entry.id, 3946);
const variants = [
  ['DFS without memoization', 'maximumSaleItemsDFS'],
  ['DFS with memoization', 'maximumSaleItemsMemo'],
  ['Bottom-up DP (Mixed Knapsack)', 'maximumSaleItemsDP'],
].map(([title, name]) => {
  const solution = entry.solutions.find(solution => solution.title === title);
  assert.ok(solution, `${title} is available`);
  return { ...solution, name };
});
const [dfs, memo, dp] = variants;

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
  // The first paid copy must include that type's free rewards.
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
function checkVariants(solutions, inputs) {
  const originalInputs = JSON.stringify(inputs);
  for (const solution of solutions) {
    const context = vm.createContext({ cases: inputs, answers: [] });
    vm.runInContext(`${solution.code}\nfor (const item of cases) answers.push(${solution.name}(item.items, item.budget));`, context, { timeout: 30000 });
    assert.deepEqual(Array.from(context.answers), inputs.map(item => item.expected), `${solution.name}: all JavaScript answers`);
    assert.equal(JSON.stringify(inputs), originalInputs, `${solution.name}: JavaScript inputs are unchanged`);
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
    input: JSON.stringify({ sources: solutions.map(solution => ({ name: solution.name, code: solution.pythonCode })), cases: inputs }),
    encoding: 'utf8', timeout: 60000, maxBuffer: 4 * 1024 * 1024,
  });
  assert.ifError(python.error);
  assert.equal(python.status, 0, python.stderr);
  assert.deepEqual(JSON.parse(python.stdout), solutions.map(() => inputs.map(item => item.expected)));
}

test('3946: all three solutions match independent purchase enumeration in both languages', () => {
  assert.equal(cases.length, 2056);
  for (const item of cases) assert.equal(brute(item.items, item.budget), item.expected);
  checkVariants(variants, cases);
});

test('3946: memoization and DP handle the maximum item and budget bounds in both languages', () => {
  // Plain DFS deliberately explores the full tree and is only suitable for small inputs.
  checkVariants([memo, dp], boundaries);
});

test('3946: isFirstTimeBuy is part of the memo key and cached zero answers are reused', () => {
  const hits = [];
  const writes = [];
  class TrackedMap extends Map {
    has(key) {
      const found = super.has(key);
      if (found) hits.push({ key, value: super.get(key) });
      return found;
    }
    set(key, value) {
      writes.push({ key, value });
      return super.set(key, value);
    }
  }
  const items = [[2, 1], [3, 1], [5, 5]];
  const budget = 3;
  const result = vm.runInNewContext(`${memo.code}\n${memo.name}(items, budget)`, {
    items, budget, Map: TrackedMap,
  }, { timeout: 1000 });
  assert.equal(result, brute(items, budget));
  assert.ok(hits.some(hit => hit.value === 0), 'A cached zero answer is reused');
  assert.equal(new Set(writes.map(({ key }) => key)).size, writes.length, 'Every state is computed once');
  const keys = new Set(writes.map(({ key }) => key));
  assert.ok([...keys].some(key => key.endsWith(',false') && keys.has(key.replace(/false$/, 'true'))),
    'States with the same item and budget distinguish whether the next purchase earns first-purchase rewards');
  assert.ok(writes.length <= 2 * items.length * (budget + 1));
});

test('3946: walkthroughs include every recursive call, cache reuse, and DP update in execution order', () => {
  const items = [[2, 2], [4, 2]];
  const budget = 6;
  for (const solution of [dfs, memo]) {
    const calls = [];
    const hits = [];
    const writes = [];
    class TraceMap extends Map {
      has(key) {
        const found = super.has(key);
        if (found) hits.push(key);
        return found;
      }
      set(key, value) {
        writes.push({ key, value });
        return super.set(key, value);
      }
    }
    const code = solution.code.replace('function dfs(i, remaining, isFirstTimeBuy) {',
      'function dfs(i, remaining, isFirstTimeBuy) { recordCall(i, remaining, isFirstTimeBuy);');
    assert.notEqual(code, solution.code, 'Instrument the saved recursive function');
    const result = vm.runInNewContext(`${code}\n${solution.name}(items, budget)`, {
      items, budget, Map: TraceMap,
      recordCall: (...args) => calls.push(args),
    }, { timeout: 1000 });
    assert.equal(result, 4);
    for (const trace of [solution.walkthrough, solution.pythonWalkthrough]) {
      const recorded = [...trace.matchAll(/^\s*Call (\d+): dfs\((\d+), (\d+), (true|false)\)/gim)];
      assert.deepEqual(recorded.map(match => Number(match[1])), calls.map((_, i) => i + 1));
      assert.deepEqual(recorded.map(match => [Number(match[2]), Number(match[3]), match[4].toLowerCase() === 'true']), calls,
        `${solution.title}: every call and state in the walkthrough matches execution`);
      assert.equal((trace.match(/The key is cached:/g) || []).length, hits.length, 'Every cache hit is shown');
      assert.equal((trace.match(/Save memo(?:\[|\.set\()/g) || []).length, writes.length, 'Every cache write is shown');
    }
  }

  const updates = [];
  const code = dp.code.replace('Array(budget + 1).fill(0)', 'observe(Array(budget + 1).fill(0))');
  const result = vm.runInNewContext(`${code}\n${dp.name}(items, budget)`, {
    items, budget,
    observe: values => new Proxy(values, {
      set(target, key, value) {
        target[key] = value;
        updates.push({ c: Number(key), values: [...target] });
        return true;
      },
    }),
  }, { timeout: 1000 });
  assert.equal(result, 4);
  assert.equal(updates.length, 20);
  for (const trace of [dp.walkthrough, dp.pythonWalkthrough]) {
    const capacities = [...trace.matchAll(/^Capacity (\d+) \((?:first|additional) purchase\)\./gm)].map(match => Number(match[1]));
    const snapshots = [...trace.matchAll(/^  dp = (\[[^\n]+\])/gm)].map(match => JSON.parse(match[1]));
    assert.deepEqual(capacities, updates.map(update => update.c), 'Every capacity is shown in execution order');
    assert.deepEqual(snapshots, updates.map(update => update.values), 'The entire DP array matches after every update');
  }
});
