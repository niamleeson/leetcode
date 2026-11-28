const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const vm = require('node:vm');

const names = {
  'zero-one-knapsack': ['zeroOneKnapsackDfs', 'zero_one_knapsack_dfs'],
  'unbounded-knapsack': ['unboundedKnapsackDfs', 'unbounded_knapsack_dfs'],
  'mixed-knapsack': ['mixedKnapsackDfs', 'mixed_knapsack_dfs'],
};
const sources = Object.fromEntries(Object.keys(names).map(slug => [slug, {
  javascript: readFileSync(path.join(__dirname, `imports/${slug}-dfs.js`), 'utf8'),
  python: readFileSync(path.join(__dirname, `imports/${slug}-dfs.py`), 'utf8'),
}]));

function runJavaScript(slug, items, capacity, extras = {}, code = sources[slug].javascript) {
  // Run the invocation inside the VM too, so its timeout covers recursion.
  return vm.runInNewContext(`${code}\n${names[slug][0]}(items, capacity);`, { items, capacity, ...extras }, { timeout: 2000 });
}

function observeMemo() {
  const observations = [];
  class Memo extends Map {
    constructor() {
      super();
      this.stats = { hits: 0, misses: 0, reads: 0, zeroHits: 0, writes: [] };
      observations.push(this);
    }
    has(key) {
      const found = super.has(key);
      this.stats[found ? 'hits' : 'misses']++;
      return found;
    }
    get(key) {
      assert.ok(super.has(key), 'Only completed states can be reused');
      this.stats.reads++;
      const answer = super.get(key);
      if (answer === 0) this.stats.zeroHits++;
      return answer;
    }
    set(key, value) {
      assert.equal(super.has(key), false, `A cached state must not be recomputed: ${key}`);
      this.stats.writes.push(key);
      return super.set(key, value);
    }
  }
  return { Memo, observations };
}

test('DFS reuses overlapping states, including cached zero answers, and computes each state once', () => {
  for (const slug of Object.keys(names)) {
    for (const value of [0, 3]) {
      const items = Array.from({ length: 12 }, (_, index) => ({
        weight: 1,
        value,
        ...(slug === 'mixed-knapsack' ? { kind: index % 2 === 0 ? 'unlimited' : 'bounded', limit: 2 } : {}),
      }));
      const capacity = 12;
      const { Memo, observations } = observeMemo();
      assert.equal(runJavaScript(slug, items, capacity, { Map: Memo }), value * capacity);
      assert.equal(observations.length, 1, 'Each invocation owns one memo table');
      const memo = observations[0];
      const { hits, misses, reads, zeroHits, writes } = memo.stats;
      assert.ok(hits > 0, `${slug}: overlapping recursive branches must use cached states`);
      assert.equal(reads, hits);
      assert.equal(writes.length, misses);
      assert.equal(new Set(writes).size, writes.length);
      assert.ok(memo.size <= items.length * (capacity + 1), `${slug}: at most N × (C + 1) non-base states`);
      for (const key of writes) {
        const [index, remaining] = key.split(',').map(Number);
        assert.ok(Number.isInteger(index) && index >= 0 && index < items.length);
        assert.ok(Number.isInteger(remaining) && remaining >= 0 && remaining <= capacity);
      }
      if (value === 0) assert.ok(zeroHits > 0, `${slug}: zero is a valid cached result`);
    }
  }
});

const depthCases = [];
for (const slug of Object.keys(names)) {
  const items = Array.from({ length: 100 }, (_, index) => ({
    weight: 1,
    value: 2,
    ...(slug === 'mixed-knapsack' ? { kind: ['once', 'unlimited', 'bounded'][index % 3], limit: 2 } : {}),
  }));
  depthCases.push({ slug, items, capacity: 0, expected: 0, depth: 101 });
  depthCases.push({ slug, items, capacity: 30, expected: 60, depth: 101 });
  depthCases.push({ slug, items: [], capacity: 30, expected: 0, depth: 1 });
}
depthCases.push(
  { slug: 'unbounded-knapsack', items: [{ weight: 1, value: 7 }], capacity: 1000, expected: 7000, depth: 2 },
  { slug: 'mixed-knapsack', items: [{ weight: 1, value: 7, kind: 'unlimited' }], capacity: 1000, expected: 7000, depth: 2 },
  { slug: 'mixed-knapsack', items: [{ weight: 1, value: 1000, kind: 'bounded', limit: 0 }, { weight: 3, value: 8, kind: 'once' }, { weight: 2, value: 3, kind: 'unlimited' }], capacity: 7, expected: 14, depth: 4 },
  { slug: 'zero-one-knapsack', items: [{ weight: 100, value: 1000 }, { weight: 1, value: 4 }], capacity: 3, expected: 4, depth: 3 },
  { slug: 'unbounded-knapsack', items: [{ weight: 100, value: 1000 }, { weight: 1, value: 4 }], capacity: 3, expected: 12, depth: 3 },
);

test('JavaScript DFS advances one item per stack frame even with 100 types or capacity 1000', () => {
  for (const { slug, items, capacity, expected, depth } of depthCases) {
    const source = sources[slug].javascript;
    const opening = 'function dfs(index, remaining) {';
    const closing = '  }\n\n  return dfs(0, capacity);';
    assert.ok(source.includes(opening) && source.includes(closing));
    const code = source.replace(opening, `${opening}\n    enter(index, remaining);\n    try {`)
      .replace(closing, '    } finally { leave(); }\n  }\n\n  return dfs(0, capacity);');
    const stack = [];
    let maximumDepth = 0;
    const enter = (index, remaining) => {
      assert.equal(index, stack.length, `${slug}: each call advances to the next item`);
      assert.ok(remaining >= 0 && remaining <= capacity);
      if (stack.length) assert.ok(remaining <= stack[stack.length - 1]);
      stack.push(remaining);
      maximumDepth = Math.max(maximumDepth, stack.length);
    };
    const leave = () => { stack.pop(); };
    assert.equal(runJavaScript(slug, items, capacity, { enter, leave }, code), expected);
    assert.equal(maximumDepth, depth);
    assert.ok(maximumDepth <= items.length + 1);
    assert.equal(stack.length, 0);
  }
});

test('Python DFS handles the same depth and zero-copy cases without changing the recursion limit', () => {
  const python = [
    'import json, sys',
    'payload = json.load(sys.stdin)',
    'functions = {}',
    'for source in payload["sources"]:',
    '    namespace = {}',
    '    exec(source["code"], namespace)',
    '    functions[source["slug"]] = namespace[source["name"]]',
    'original_limit = sys.getrecursionlimit()',
    'results = []',
    'for case in payload["cases"]:',
    '    stack = []',
    '    stats = {"max_depth": 0}',
    '    def profile(frame, event, arg):',
    '        if frame.f_code.co_name != "dfs":',
    '            return',
    '        if event == "call":',
    '            index = frame.f_locals["index"]',
    '            remaining = frame.f_locals["remaining"]',
    '            assert index == len(stack), "Each frame must advance one item"',
    '            assert 0 <= remaining <= case["capacity"]',
    '            if stack:',
    '                assert remaining <= stack[-1]',
    '            stack.append(remaining)',
    '            stats["max_depth"] = max(stats["max_depth"], len(stack))',
    '        elif event == "return":',
    '            stack.pop()',
    '    sys.setprofile(profile)',
    '    try:',
    '        answer = functions[case["slug"]](case["items"], case["capacity"])',
    '    finally:',
    '        sys.setprofile(None)',
    '    assert not stack',
    '    assert sys.getrecursionlimit() == original_limit',
    '    results.append({"answer": answer, "depth": stats["max_depth"]})',
    'print(json.dumps(results))',
  ].join('\n');
  const result = spawnSync('python3', ['-c', python], {
    input: JSON.stringify({ sources: Object.keys(names).map(slug => ({ slug, name: names[slug][1], code: sources[slug].python })), cases: depthCases }),
    encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  const answers = JSON.parse(result.stdout);
  assert.equal(answers.length, depthCases.length);
  answers.forEach(({ answer, depth }, index) => {
    assert.equal(answer, depthCases[index].expected, `Python case ${index}: result`);
    assert.equal(depth, depthCases[index].depth, `Python case ${index}: maximum recursive depth`);
  });
});
