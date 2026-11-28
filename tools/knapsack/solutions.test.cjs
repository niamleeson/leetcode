const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const vm = require('node:vm');

const names = {
  'zero-one-knapsack': ['zeroOneKnapsack', 'zero_one_knapsack'],
  'unbounded-knapsack': ['unboundedKnapsack', 'unbounded_knapsack'],
  'mixed-knapsack': ['mixedKnapsack', 'mixed_knapsack'],
};
const dfsNames = {
  'zero-one-knapsack': ['zeroOneKnapsackDfs', 'zero_one_knapsack_dfs'],
  'unbounded-knapsack': ['unboundedKnapsackDfs', 'unbounded_knapsack_dfs'],
  'mixed-knapsack': ['mixedKnapsackDfs', 'mixed_knapsack_dfs'],
};
const entries = new Map(Object.keys(names).map(slug => {
  const entry = JSON.parse(readFileSync(path.resolve(__dirname, `../../src/data/knapsack/entries/${slug}.json`), 'utf8'));
  return [slug, entry];
}));
const solution = slug => entries.get(slug).solutions[1];
const dfsSolution = slug => entries.get(slug).solutions[0];
const load = (slug, context = {}, code = solution(slug).code) => vm.runInNewContext(`${code}\n;${names[slug][0]}`, context, { timeout: 1000 });
const solvers = new Map(Object.keys(names).map(slug => [slug, load(slug)]));
const dfsSolvers = new Map(Object.keys(names).map(slug => [slug,
  vm.runInNewContext(`${dfsSolution(slug).code}\n;${dfsNames[slug][0]}`, {}, { timeout: 1000 }),
]));

// Enumerate complete selections independently of the DP and its loop directions.
const brute = (slug, items, capacity) => {
  const visit = (index, remaining) => {
    if (index === items.length) return 0;
    const item = items[index];
    const kind = slug === 'zero-one-knapsack' ? 'once' : slug === 'unbounded-knapsack' ? 'unlimited' : item.kind;
    const available = kind === 'once' ? 1 : kind === 'bounded' ? item.limit : Math.floor(remaining / item.weight);
    const maximum = Math.min(available, Math.floor(remaining / item.weight));
    let best = 0;
    for (let copies = 0; copies <= maximum; copies++) {
      best = Math.max(best, copies * item.value + visit(index + 1, remaining - copies * item.weight));
    }
    return best;
  };
  return visit(0, capacity);
};

let seed = 20261127;
const random = max => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return Math.floor((seed >>> 0) / 4294967296 * max);
};
const cases = [];
const add = (slug, items, capacity, expected = brute(slug, items, capacity)) => cases.push({ slug, items, capacity, expected });
const itemChoices = [1, 2].flatMap(weight => [0, 1, 2].map(value => ({ weight, value })));
for (const slug of ['zero-one-knapsack', 'unbounded-knapsack']) {
  for (let length = 0; length <= 3; length++) {
    for (let encoding = 0; encoding < itemChoices.length ** length; encoding++) {
      let value = encoding;
      const items = Array.from({ length }, () => {
        const item = { ...itemChoices[value % itemChoices.length] };
        value = Math.floor(value / itemChoices.length);
        return item;
      });
      for (let capacity = 0; capacity <= 7; capacity++) add(slug, items, capacity);
    }
  }
}
for (let trial = 0; trial < 800; trial++) {
  const items = Array.from({ length: random(6) }, () => {
    const kind = ['once', 'unlimited', 'bounded'][random(3)];
    const item = { weight: 1 + random(5), value: random(10), kind };
    if (kind === 'bounded') item.limit = random(5);
    return item;
  });
  add('mixed-knapsack', items, random(13));
}
const mixedExample = [
  { weight: 3, value: 8, kind: 'once' },
  { weight: 2, value: 3, kind: 'unlimited' },
  { weight: 1, value: 2, kind: 'bounded', limit: 2 },
];
for (const [slug, items, capacity, expected] of [
  ['zero-one-knapsack', [{ weight: 2, value: 3 }, { weight: 3, value: 4 }], 4, 4],
  ['unbounded-knapsack', [{ weight: 2, value: 3 }, { weight: 3, value: 4 }], 4, 6],
  ['zero-one-knapsack', [{ weight: 2, value: 3 }], 4, 3],
  ['unbounded-knapsack', [{ weight: 2, value: 3 }], 4, 6],
  ['zero-one-knapsack', [{ weight: 2, value: 5 }, { weight: 2, value: 5 }], 4, 10],
  ['unbounded-knapsack', [{ weight: 3, value: 5 }], 2, 0],
  ['mixed-knapsack', mixedExample, 9, 18],
  ['mixed-knapsack', [{ weight: 2, value: 3, kind: 'bounded', limit: 2 }], 6, 6],
  ['mixed-knapsack', [{ weight: 1, value: 1000, kind: 'bounded', limit: 0 }], 9, 0],
  ['mixed-knapsack', [{ weight: 1000, value: 1000, kind: 'once' }], 999, 0],
  ['zero-one-knapsack', Array.from({ length: 100 }, () => ({ weight: 1, value: 1000 })), 1000, 100000],
  ['unbounded-knapsack', [{ weight: 1, value: 1000 }], 1000, 1000000],
  ['mixed-knapsack', [{ weight: 1, value: 1000, kind: 'unlimited' }], 1000, 1000000],
  ['mixed-knapsack', [{ weight: 1, value: 1000, kind: 'bounded', limit: 100 }], 1000, 100000],
]) add(slug, items, capacity, expected);

test('DFS and DP for all three knapsack problems match independent enumeration and preserve inputs', () => {
  for (const { slug, items, capacity, expected } of cases) {
    const before = JSON.stringify(items);
    assert.equal(solvers.get(slug)(items, capacity), expected, JSON.stringify({ slug, items, capacity }));
    assert.equal(dfsSolvers.get(slug)(items, capacity), expected, `DFS: ${JSON.stringify({ slug, items, capacity })}`);
    assert.equal(JSON.stringify(items), before, `${slug}: input remains unchanged`);
  }
});

test('mixed item kinds reduce to the corresponding knapsack rules and are independent of item order', () => {
  const once = solvers.get('zero-one-knapsack');
  const unlimited = solvers.get('unbounded-knapsack');
  const mixed = solvers.get('mixed-knapsack');
  for (let trial = 0; trial < 250; trial++) {
    const capacity = random(16);
    const items = Array.from({ length: random(6) }, () => ({ weight: 1 + random(6), value: random(15) }));
    assert.equal(mixed(items.map(item => ({ ...item, kind: 'once' })), capacity), once(items, capacity));
    assert.equal(mixed(items.map(item => ({ ...item, kind: 'bounded', limit: 1 })), capacity), once(items, capacity));
    assert.equal(mixed(items.map(item => ({ ...item, kind: 'unlimited' })), capacity), unlimited(items, capacity));
    assert.equal(mixed(items.map(item => ({ ...item, kind: 'bounded', limit: Math.floor(capacity / item.weight) })), capacity), unlimited(items, capacity));
  }
  for (const entry of cases.filter(({ slug, items, capacity }) => slug === 'mixed-knapsack' && items.length <= 5 && capacity <= 12)) {
    const { items, capacity, expected } = entry;
    assert.equal(mixed([...items].reverse(), capacity), expected);
    assert.ok(mixed(items, capacity + 1) >= expected, 'More capacity cannot reduce the best attainable value');
  }
});

test('Python DFS and DP match JavaScript and independent answers on the same 4,958 cases', () => {
  assert.equal(cases.length, 4958);
  const sources = Object.keys(names).flatMap(slug => [
    { slug: `${slug}:dp`, name: names[slug][1], code: solution(slug).pythonCode },
    { slug: `${slug}:dfs`, name: dfsNames[slug][1], code: dfsSolution(slug).pythonCode },
  ]);
  const python = [
    'import copy, json, sys',
    'payload = json.load(sys.stdin)',
    'functions = {}',
    'for source in payload["sources"]:',
    '    namespace = {}',
    '    exec(source["code"], namespace)',
    '    functions[source["slug"]] = namespace[source["name"]]',
    'answers = []',
    'for case in payload["cases"]:',
    '    for variant in ["dp", "dfs"]:',
    '        before = copy.deepcopy(case["items"])',
    '        answers.append(functions[case["slug"] + ":" + variant](case["items"], case["capacity"]))',
    '        assert case["items"] == before, "Python modified the input"',
    'print(json.dumps(answers))',
  ].join('\n');
  const result = spawnSync('python3', ['-c', python], {
    input: JSON.stringify({ sources, cases }), encoding: 'utf8', timeout: 20000, maxBuffer: 4 * 1024 * 1024,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  const answers = JSON.parse(result.stdout);
  assert.equal(answers.length, cases.length * 2);
  answers.forEach((answer, index) => {
    const caseIndex = Math.floor(index / 2);
    assert.equal(answer, cases[caseIndex].expected, `Python ${index % 2 ? 'DFS' : 'DP'} case ${caseIndex}: ${JSON.stringify(cases[caseIndex])}`);
  });
});

test('the once/unlimited walkthroughs show every executed update and the actual resulting arrays', () => {
  for (const slug of ['zero-one-knapsack', 'unbounded-knapsack']) {
    const saved = solution(slug);
    const events = [];
    const update = 'dp[current] = Math.max(skip, take);';
    assert.ok(saved.code.includes(update));
    const code = saved.code.replace(update, `${update}\n      record({ current, weight, value, skip, take, dp: Array.from(dp) });`);
    const solve = load(slug, { record: event => events.push(event) }, code);
    const expected = slug === 'zero-one-knapsack' ? 4 : 6;
    assert.equal(solve([{ weight: 2, value: 3 }, { weight: 3, value: 4 }], 4), expected);
    assert.equal(events.length, 5);
    assert.deepEqual(events.map(({ current }) => current), slug === 'zero-one-knapsack' ? [4, 3, 2, 4, 3] : [2, 3, 4, 3, 4]);
    for (const field of ['walkthroughMarkdown', 'pythonWalkthroughMarkdown']) {
      for (const { current, weight, value, skip, take, dp } of events) {
        assert.ok(saved[field].includes(`skip = dp[${current}] = ${skip}`));
        assert.ok(saved[field].includes(`take = dp[${current} - ${weight}] + ${value} = dp[${current - weight}] + ${value} = ${take - value} + ${value} = ${take}`));
        assert.ok(saved[field].includes(`dp = [${dp.join(', ')}]`));
      }
    }
  }
});

test('the mixed walkthrough includes every bounded candidate and always reads the unchanged snapshot', () => {
  const saved = solution('mixed-knapsack');
  const simple = [];
  const bounded = [];
  let code = saved.code.replaceAll('dp[current] = Math.max(skip, take);', 'dp[current] = Math.max(skip, take);\n        recordSimple({ kind, current, weight, value, skip, take, dp: Array.from(dp) });');
  code = code.replace('dp[current] = Math.max(dp[current], candidate);', 'const before = dp[current];\n          dp[current] = Math.max(dp[current], candidate);\n          recordBounded({ current, count, remaining, candidate, before, previous: Array.from(previous), dp: Array.from(dp) });');
  const solve = load('mixed-knapsack', { recordSimple: event => simple.push(event), recordBounded: event => bounded.push(event) }, code);
  assert.equal(solve(mixedExample, 9), 18);
  assert.equal(simple.length, 15);
  assert.equal(bounded.length, 17);
  const snapshot = [0, 0, 3, 8, 8, 11, 11, 14, 14, 17];
  for (const field of ['walkthroughMarkdown', 'pythonWalkthroughMarkdown']) {
    for (const { current, weight, value, skip, take, dp } of simple) {
      assert.ok(saved[field].includes(`skip = dp[${current}] = ${skip}`));
      assert.ok(saved[field].includes(`take = dp[${current} - ${weight}] + ${value} = dp[${current - weight}] + ${value} = ${take - value} + ${value} = ${take}`));
      assert.ok(saved[field].includes(`dp = [${dp.join(', ')}]`));
    }
    for (const { current, count, remaining, candidate, before, previous, dp } of bounded) {
      assert.deepEqual(Array.from(previous), snapshot);
      const actual = brute('mixed-knapsack', mixedExample.slice(0, 2), remaining) + count * 2;
      assert.equal(candidate, actual);
      assert.ok(saved[field].includes(`remaining = current - count * weight = ${current} - ${count} * 1 = ${remaining}`));
      assert.ok(saved[field].includes(`candidate = previous[${remaining}] + ${count} * 2 = ${previous[remaining]} + ${count * 2} = ${candidate}`));
      const max = field === 'walkthroughMarkdown' ? 'Math.max' : 'max';
      assert.ok(saved[field].includes(`dp[${current}] = ${max}(${before}, ${candidate}) = ${dp[current]}`));
    }
  }
});
