const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const entries = path.resolve(__dirname, '../../src/data/daily-questions/entries');
const entryById = new Map(readdirSync(entries).filter(name => name.endsWith('.json')).map(name => {
  const entry = JSON.parse(readFileSync(path.join(entries, name), 'utf8'));
  return [entry.id, entry];
}));
const readEntry = id => { assert.ok(entryById.has(id), `Missing daily problem ${id}`); return entryById.get(id); };
const load = (id, name, index = 0) => vm.runInNewContext(`${readEntry(id).solutions[index].code}\n;${name}`, {}, { timeout: 1000 });
const equal = (actual, expected, input) => assert.deepEqual(JSON.parse(JSON.stringify(actual)), expected, JSON.stringify(input));
let seed = 20261126;
const random = max => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return Math.floor((seed >>> 0) / 4294967296 * max);
};
function* arrays(length, values) {
  for (let number = 0; number < values ** length; number++) {
    let digits = number;
    yield Array.from({ length }, () => { const value = digits % values + 1; digits = Math.floor(digits / values); return value; });
  }
}

test('2914: pair changes agree with exhaustive valid binary strings', () => {
  const solve = load(2914, 'minChanges');
  assert.equal(solve('1001'), 2);
  for (let length = 2; length <= 8; length += 2) {
    const strings = Array.from({ length: 2 ** length }, (_, value) => value.toString(2).padStart(length, '0'));
    const valid = strings.filter(value => value.match(/0+|1+/g).every(run => run.length % 2 === 0));
    for (const value of strings) {
      const expected = Math.min(...valid.map(candidate => [...value].filter((bit, i) => bit !== candidate[i]).length));
      equal(solve(value), expected, value);
    }
  }
});

test('2567: three extremes match brute-force changes and leave input unchanged', () => {
  const solve = load(2567, 'minimizeSum');
  assert.equal(solve([1, 4, 7, 8, 5]), 3);
  const score = values => {
    const sorted = [...values].sort((a, b) => a - b);
    let low = Infinity;
    for (let i = 1; i < sorted.length; i++) low = Math.min(low, sorted[i] - sorted[i - 1]);
    return sorted.at(-1) - sorted[0] + low;
  };
  for (let length = 3; length <= 4; length++) for (const values of arrays(length, 3)) {
    let expected = Infinity;
    for (let i = 0; i < length; i++) for (let j = i + 1; j < length; j++) {
      for (let first = 1; first <= 3; first++) for (let second = 1; second <= 3; second++) {
        const changed = [...values];
        changed[i] = first;
        changed[j] = second;
        expected = Math.min(expected, score(changed));
      }
    }
    const before = [...values];
    equal(solve(values), expected, values);
    equal(values, before, 'input');
  }
  assert.equal(solve([1, 1, 1, 1000000000, 1000000000]), 0);
});

test('3041: every real copy is used at most once across duplicates and separated groups', () => {
  const solve = load(3041, 'maxSelectedElements');
  assert.equal(solve([2, 1, 5, 1, 1]), 3);
  assert.equal(solve([1, 4, 7, 10]), 1);
  assert.equal(solve([1, 1, 1]), 2);
  for (let trial = 0; trial < 250; trial++) {
    const values = Array.from({ length: 1 + random(9) }, () => 1 + random(12));
    let expected = 0;
    for (let mask = 0; mask < 2 ** values.length; mask++) {
      const changed = new Set(values.map((value, i) => value + ((mask >> i) & 1)));
      for (const start of changed) {
        let length = 0;
        while (changed.has(start + length)) length++;
        expected = Math.max(expected, length);
      }
    }
    equal(solve(values), expected, values);
  }
});

test('3331: simultaneous reparenting agrees with an independently rebuilt tree', () => {
  const solve = load(3331, 'findSubtreeSizes');
  equal(solve([-1, 0, 0, 1, 1, 1], 'abaabc'), [6, 3, 1, 1, 1, 1]);
  equal(solve([-1, 0, 4, 0, 1], 'abbba'), [5, 2, 1, 1, 1]);
  for (let trial = 0; trial < 250; trial++) {
    const length = 1 + random(60);
    const parent = [-1, ...Array.from({ length: length - 1 }, (_, i) => random(i + 1))];
    const labels = Array.from({ length }, () => String.fromCharCode(97 + random(5))).join('');
    const changed = [...parent];
    for (let node = 1; node < length; node++) {
      let ancestor = parent[node];
      while (ancestor !== -1 && labels[ancestor] !== labels[node]) ancestor = parent[ancestor];
      if (ancestor !== -1) changed[node] = ancestor;
    }
    const expected = Array(length).fill(0);
    for (let node = 0; node < length; node++) for (let ancestor = node; ancestor !== -1; ancestor = changed[ancestor]) expected[ancestor]++;
    equal(solve(parent, labels), expected, { parent, labels });
  }
  const warning = readEntry(3331).solutions[0].notes.join(' ');
  assert.match(warning, /100,000/);
  assert.match(warning, /recursion/i);
  assert.match(warning, /iterative/i);
});

test('2124: accepted strings contain all a characters before all b characters', () => {
  const solve = load(2124, 'checkString');
  assert.equal(solve('abab'), false);
  for (let length = 1; length <= 9; length++) for (let value = 0; value < 2 ** length; value++) {
    const text = value.toString(2).padStart(length, '0').replaceAll('0', 'a').replaceAll('1', 'b');
    equal(solve(text), /^a*b*$/.test(text), text);
  }
});

test('1352: queries cross resets and match direct products within the numeric constraints', () => {
  const ProductOfNumbers = load(1352, 'ProductOfNumbers');
  const example = new ProductOfNumbers();
  [3, 0, 2, 5, 4].forEach(value => example.add(value));
  assert.equal(example.getProduct(2), 20);
  assert.equal(example.getProduct(4), 0);
  for (let trial = 0; trial < 30; trial++) {
    const stream = [], instance = new ProductOfNumbers();
    let sinceZero = 1;
    for (let step = 0; step < 100; step++) {
      let value = random(11);
      if (sinceZero * value > 2147483647) value = 0;
      sinceZero = value === 0 ? 1 : sinceZero * value;
      stream.push(value);
      instance.add(value);
      const count = 1 + random(stream.length);
      const expected = Number(stream.slice(-count).reduce((product, number) => product * BigInt(number), 1n));
      equal(instance.getProduct(count), expected, { stream, count });
    }
  }
});

test('3411: early stopping agrees with all subarrays using exact BigInt arithmetic', () => {
  const solve = load(3411, 'maxLength');
  const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
  assert.equal(solve([2, 3, 4, 5, 6]), 3);
  assert.equal(solve(Array(100).fill(1)), 100);
  assert.equal(solve(Array(100).fill(10)), 2);
  for (let trial = 0; trial < 250; trial++) {
    const values = Array.from({ length: 2 + random(30) }, () => 1 + random(10));
    let expected = 0;
    for (let left = 0; left < values.length; left++) {
      let product = 1n, common = 0n, multiple = 1n;
      for (let right = left; right < values.length; right++) {
        const number = BigInt(values[right]);
        product *= number;
        common = gcd(common, number);
        multiple = multiple / gcd(multiple, number) * number;
        if (product === common * multiple) expected = Math.max(expected, right - left + 1);
      }
    }
    equal(solve(values), expected, values);
  }
});

test('3934: both implementations handle repeated, overlapping, and hash-collision inputs', () => {
  const variants = [load(3934, 'smallestUniqueSubarray'), load(3934, 'smallestUniqueSubarraySuffixArray', 1)];
  const cases = [[[1, 2, 1, 2, 1], 3], [[3, 3, 3], 3], [[2, 1, 2, 3, 3], 1], [[1, 1, 2, 2, 1], 2], [[1, 20, 2, 1, 20, 2], 2], [[100000], 1]];
  for (const [input, expected] of cases) for (const solve of variants) equal(solve(input), expected, input);
  const brute = values => {
    for (let length = 1; length <= values.length; length++) {
      const frequencies = new Map();
      for (let start = 0; start + length <= values.length; start++) {
        const key = JSON.stringify(values.slice(start, start + length));
        frequencies.set(key, (frequencies.get(key) ?? 0) + 1);
      }
      if ([...frequencies.values()].includes(1)) return length;
    }
  };
  for (let length = 1; length <= 6; length++) for (const input of arrays(length, 3)) {
    const expected = brute(input);
    for (const solve of variants) equal(solve(input), expected, input);
  }
  for (const solve of variants) assert.equal(solve(Array(10000).fill(7)), 10000);
});
