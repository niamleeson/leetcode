const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const test = require('node:test');
const vm = require('node:vm');
const slugs = ['zero-one-knapsack', 'unbounded-knapsack', 'mixed-knapsack'];
const entries = Object.fromEntries(slugs.map(slug => [slug,
  JSON.parse(readFileSync(path.resolve(__dirname, `../../src/data/knapsack/entries/${slug}.json`), 'utf8')),
]));
const solvers = Object.fromEntries(slugs.map(slug => [slug, entries[slug].solutions.map(solution =>
  vm.runInNewContext(`${solution.code}\n;knapsack`, {}, {timeout: 1000}))]));

// Enumerate complete copy-count selections independently of skip/take recursion
// and in-place DP. Score total value only when total weight fits the capacity.
function enumerate(slug, items, capacity) {
  let best = 0;
  function visit(index, weightSoFar, valueSoFar) {
    if (index === items.length) { best = Math.max(best, valueSoFar); return; }
    const [weight, value, unlimited] = items[index];
    const reusable = slug === 'unbounded-knapsack' || slug === 'mixed-knapsack' && unlimited;
    const maximum = reusable ? Math.floor(capacity / weight) : 1;
    for (let copies = 0; copies <= maximum; copies++) {
      const weightAfter = weightSoFar + copies * weight;
      if (weightAfter <= capacity) visit(index + 1, weightAfter, valueSoFar + copies * value);
    }
  }
  visit(0, 0, 0);
  return best;
}
let seed = 20261127;
function random(max) {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return Math.floor((seed >>> 0) / 4294967296 * max);
}
const cases = [];
function add(slug, items, capacity, expected = enumerate(slug, items, capacity)) {
  cases.push({slug, items, capacity, expected});
}
for (const slug of slugs) {
  const choices = slug === 'mixed-knapsack'
    ? [1,2].flatMap(w => [0,3].flatMap(v => [false,true].map(unlimited => [w,v,unlimited])))
    : [1,2].flatMap(w => [0,1,2].map(v => [w,v]));
  for (let length = 0; length <= 3; length++) {
    for (let encoding = 0; encoding < choices.length ** length; encoding++) {
      let encoded = encoding;
      const items = Array.from({length}, () => {
        const item = [...choices[encoded % choices.length]];
        encoded = Math.floor(encoded / choices.length);
        return item;
      });
      for (let capacity = 0; capacity <= 7; capacity++) add(slug, items, capacity);
    }
  }
}
for (let trial = 0; trial < 450; trial++) {
  const slug = slugs[trial % 3];
  const items = Array.from({length: random(5)}, () => {
    const item = [1+random(6), random(15)];
    if (slug === 'mixed-knapsack') item.push(Boolean(random(2)));
    return item;
  });
  add(slug, items, random(11));
}
[
  ['zero-one-knapsack', [[2,3],[3,4]], 8, 7],
  ['unbounded-knapsack', [[2,3],[3,4]], 8, 12],
  ['mixed-knapsack', [[2,3,false],[3,4,true]], 8, 11],
  ['zero-one-knapsack', [[2,3]], 8, 3],
  ['unbounded-knapsack', [[2,3]], 8, 12],
  ['mixed-knapsack', [[2,3,false]], 8, 3],
  ['mixed-knapsack', [[2,3,true]], 8, 12],
  ['zero-one-knapsack', [[2,5],[2,5]], 4, 10],
  ['mixed-knapsack', [[2,5,false],[2,5,false]], 4, 10],
  ['mixed-knapsack', [[1,10,false],[2,3,true]], 5, 16],
  ['mixed-knapsack', [[2,3,true],[1,10,false]], 5, 16],
  ['mixed-knapsack', [[1,10,true],[2,100,false]], 5, 130],
  ['mixed-knapsack', [[2,100,false],[1,10,true]], 5, 130],
  ['zero-one-knapsack', [[4,20]], 3, 0],
  ['unbounded-knapsack', [[4,20]], 3, 0],
  ['mixed-knapsack', [[4,20,true],[5,30,false]], 3, 0],
  ['zero-one-knapsack', [[1,100],[2,200]], 0, 0],
  ['unbounded-knapsack', [[1,100],[2,200]], 0, 0],
  ['mixed-knapsack', [[1,100,false],[2,200,true]], 0, 0],
].forEach(args => add(...args));

// Plain DFS has no memo table. Only DP gets the larger input checks.
const dpCases = [
  {slug:'zero-one-knapsack',items:Array.from({length:100},()=>[1,1000]),capacity:1000,expected:100000},
  {slug:'zero-one-knapsack',items:Array.from({length:100},(_,i)=>[2,i+1]),capacity:100,expected:3775},
  {slug:'unbounded-knapsack',items:[[1,1000]],capacity:10000,expected:10000000},
  {slug:'unbounded-knapsack',items:[[3,5],[7,10]],capacity:1000,expected:1665},
  {slug:'mixed-knapsack',items:[[1,1000,true]],capacity:10000,expected:10000000},
  {slug:'mixed-knapsack',items:[[1,1000,false],[2,3,true]],capacity:1000,expected:2497},
  {slug:'mixed-knapsack',items:[[2,3,true],[1,1000,false]],capacity:1000,expected:2497},
  {slug:'mixed-knapsack',items:Array.from({length:100},()=>[1,1000,false]),capacity:1000,expected:100000},
];
test(`DFS and DP match independent enumeration on ${cases.length} small cases`, () => {
  for (const {slug,items,capacity,expected} of cases) {
    for (const [variant,solve] of solvers[slug].entries()) {
      const before = JSON.stringify(items);
      assert.equal(solve(items,capacity), expected, JSON.stringify({slug,variant,items,capacity}));
      assert.equal(JSON.stringify(items),before,`${slug}: input remains unchanged`);
    }
  }
});
test('mixed flags reduce to once/unlimited rules and order cannot change the answer', () => {
  for (let trial=0; trial<120; trial++) {
    const items=Array.from({length:random(5)},()=>[1+random(6),random(15)]);
    const capacity=random(11);
    for (const variant of [0,1]) {
      const mixed=solvers['mixed-knapsack'][variant];
      assert.equal(mixed(items.map(item=>[...item,false]),capacity),solvers['zero-one-knapsack'][variant](items,capacity));
      assert.equal(mixed(items.map(item=>[...item,true]),capacity),solvers['unbounded-knapsack'][variant](items,capacity));
    }
  }
  for (const {items,capacity,expected} of cases.filter(c=>c.slug==='mixed-knapsack')) {
    for (const solve of solvers['mixed-knapsack']) {
      assert.equal(solve([...items].reverse(),capacity),expected);
      assert.ok(solve(items,capacity+1)>=expected,'Extra capacity cannot reduce value');
    }
  }
});
test('bottom-up DP handles larger capacities and item counts without recursion', () => {
  for (const {slug,items,capacity,expected} of dpCases) {
    const before=JSON.stringify(items);
    assert.equal(solvers[slug][1](items,capacity),expected,JSON.stringify({slug,capacity}));
    assert.equal(JSON.stringify(items),before);
  }
});
test('Python matches independent answers on every small case and the DP-only larger cases', () => {
  const sources=slugs.flatMap(slug=>entries[slug].solutions.map((solution,index)=>({id:`${slug}:${index}`,code:solution.pythonCode})));
  const python=[
    'import copy, json, sys',
    'payload = json.load(sys.stdin)',
    'functions = {}',
    'for source in payload["sources"]:',
    '    namespace = {}',
    '    exec(source["code"], namespace)',
    '    functions[source["id"]] = namespace["knapsack"]',
    'answers = []',
    'for case in payload["cases"]:',
    '    variants = [1] if case.get("dpOnly") else [0, 1]',
    '    for variant in variants:',
    '        before = copy.deepcopy(case["items"])',
    '        answers.append(functions[case["slug"] + ":" + str(variant)](case["items"], case["capacity"]))',
    '        assert case["items"] == before, "Python modified input"',
    'print(json.dumps(answers))',
  ].join('\n');
  const allCases=[...cases,...dpCases.map(c=>({...c,dpOnly:true}))];
  const result=spawnSync('python3',['-c',python],{
    input:JSON.stringify({sources,cases:allCases}),encoding:'utf8',timeout:20000,maxBuffer:4*1024*1024,
  });
  assert.ifError(result.error); assert.equal(result.status,0,result.stderr);
  assert.deepEqual(JSON.parse(result.stdout),allCases.flatMap(c=>c.dpOnly?[c.expected]:[c.expected,c.expected]));
});

test('every DP walkthrough records the actual capacity order, numeric operands, and resulting arrays', () => {
  for (const slug of slugs) {
    const saved=entries[slug].solutions[1];
    const events=[];
    const update='dp[c] = Math.max(dp[c], dp[c - w] + v);';
    assert.ok(saved.code.includes(update));
    const code=saved.code.replaceAll(update,
      'recordBefore({c,w,v,skip:dp[c],take:dp[c-w]+v}); '+update+' recordAfter(Array.from(dp));');
    const items=slug==='mixed-knapsack'?[[2,3,false],[3,4,true]]:[[2,3],[3,4]];
    const result=vm.runInNewContext(`${code}\nknapsack(items,8);`,{
      items,recordBefore:event=>events.push(event),recordAfter:dp=>{events.at(-1).dp=dp;},
    },{timeout:1000});
    const expected=slug==='zero-one-knapsack'?7:slug==='unbounded-knapsack'?12:11;
    assert.equal(result,expected); assert.equal(events.length,13);
    const capacities=events.map(e=>e.c);
    assert.deepEqual(capacities,slug==='zero-one-knapsack'?[8,7,6,5,4,3,2,8,7,6,5,4,3]
      :slug==='unbounded-knapsack'?[2,3,4,5,6,7,8,3,4,5,6,7,8]
      :[8,7,6,5,4,3,2,3,4,5,6,7,8]);
    for(const field of ['walkthrough','pythonWalkthrough']) {
      const text=saved[field];
      assert.deepEqual([...text.matchAll(/^c = (\d+)$/gm)].map(m=>Number(m[1])),capacities);
      const updates=text.split(/^c = \d+$/m).slice(1);
      updates.forEach((block,i)=>{
        const {c,w,v,skip,take,dp}=events[i];
        assert.ok(block.includes(`skip = dp[${c}] = ${skip}`),`${slug} ${field} update${i}: skip`);
        assert.ok(block.includes(`take = dp[${c} - ${w}] + ${v} = dp[${c-w}] + ${v} = ${take-v} + ${v} = ${take}`),`${slug} ${field} update${i}: take`);
        assert.ok(block.includes(`dp = [${dp.join(', ')}]`),`${slug} ${field} update${i}: resulting state`);
      });
      assert.ok(text.includes(`return dp[capacity] -> dp[8] = ${expected}`));
    }
  }
});
