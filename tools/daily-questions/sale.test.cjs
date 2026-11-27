const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

test('3946: daily JavaScript and Python match independent purchase enumeration', () => {
  const entry = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/data/daily-questions/entries/2026-11-27.json'), 'utf8'));
  assert.equal(entry.id, 3946);
  const solution = entry.solutions[0];
  const solve = vm.runInNewContext(`${solution.code}\nmaximumSaleItems`);
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
  ];
  let seed = 3946;
  const random = max => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % max; };
  for (let trial = 0; trial < 500; trial++) {
    const items = Array.from({ length: 1 + random(4) }, () => [1 + random(8), 1 + random(6)]);
    const budget = 1 + random(10);
    cases.push({ items, budget, expected: brute(items, budget) });
  }
  for (const item of cases) {
    assert.equal(brute(item.items, item.budget), item.expected);
    const before = JSON.stringify(item.items);
    assert.equal(solve(item.items, item.budget), item.expected, JSON.stringify(item));
    assert.equal(JSON.stringify(item.items), before, 'Input is unchanged');
  }
  cases.push({ items: Array.from({ length: 1000 }, () => [1, 1]), budget: 1500, expected: 1000500 });
  cases.push({ items: Array.from({ length: 1000 }, () => [1, 1500]), budget: 1500, expected: 1000 });
  for (const item of cases.slice(-2)) assert.equal(solve(item.items, item.budget), item.expected);
  const python = spawnSync('python3', ['-c', 'import json,sys\np=json.load(sys.stdin)\nns={}\nexec(p["code"],ns)\ns=ns["Solution"]()\nprint(json.dumps([s.maximumSaleItems(c["items"],c["budget"]) for c in p["cases"]]))'], {
    input: JSON.stringify({ code: solution.pythonCode, cases }), encoding: 'utf8', timeout: 30000,
  });
  assert.equal(python.status, 0, python.stderr);
  assert.deepEqual(JSON.parse(python.stdout), cases.map(item => item.expected));
  for (const walkthrough of [solution.walkthroughMarkdown, solution.pythonWalkthroughMarkdown]) {
    assert.equal((walkthrough.match(/\*\*Capacity \d+\./g) || []).length, 18);
    assert.equal((walkthrough.match(/\*\*reserved = \d+\./g) || []).length, 10);
  }
});
