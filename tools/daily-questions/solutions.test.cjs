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
const load = (id, name) => {
  const solution = readEntry(id).solutions.find(({ code }) => new RegExp(`^(?:var|class|function) ${name}\\b`).test(code));
  assert.ok(solution, `Missing implementation ${name} for daily problem ${id}`);
  return vm.runInNewContext(`${solution.code}\n;${name}`, {}, { timeout: 1000 });
};
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

const loadUniqueSubarrayVariants = () => {
  const solutions = readEntry(3934).solutions;
  assert.deepEqual(solutions.map(solution => solution.title), ['Binary search + exact sequence IDs', 'Binary search + rolling hash', 'Simple suffix sorting + LCP', 'Optimized suffix array + LCP', 'Suffix automaton']);
  return solutions.map(({ title, code }) => {
    const declaration = code.match(/^(?:var (\w+) = function|function (\w+))\(/);
    const name = declaration?.[1] ?? declaration?.[2];
    assert.ok(name, 'Each saved implementation declares its entry function');
    return { title, solve: vm.runInNewContext(`${code}\n;${name}`, {}, { timeout: 1000 }) };
  });
};
const bruteSmallestUniqueSubarray = values => {
  for (let length = 1; length <= values.length; length++) {
    const frequencies = new Map();
    for (let start = 0; start + length <= values.length; start++) {
      const key = JSON.stringify(values.slice(start, start + length));
      frequencies.set(key, (frequencies.get(key) ?? 0) + 1);
    }
    if ([...frequencies.values()].includes(1)) return length;
  }
};
const rollingHashCode = () => readEntry(3934).solutions.find(solution => solution.title === 'Binary search + rolling hash').code;
const exactSequenceCode = () => readEntry(3934).solutions.find(solution => solution.title === 'Binary search + exact sequence IDs').code;

test('3934: all five implementations match exhaustive and randomized subarray counts', () => {
  const variants = loadUniqueSubarrayVariants();
  const cases = [[[1, 2, 1, 2, 1], 3], [[3, 3, 3], 3], [[2, 1, 2, 3, 3], 1], [[1, 1, 2, 2, 1], 2], [[1, 20, 2, 1, 20, 2], 2], [[100000], 1], [[100000, 99999, 100000, 99999], 2], [[1, 11, 11, 1, 11, 11], 2]];
  for (const [input, expected] of cases) for (const { solve } of variants) equal(solve(input), expected, input);
  for (let length = 1; length <= 6; length++) for (const input of arrays(length, 3)) {
    const expected = bruteSmallestUniqueSubarray(input);
    for (const { solve } of variants) equal(solve(input), expected, input);
  }
  const alphabet = [1, 2, 9994, 10001, 99999, 100000];
  for (let trial = 0; trial < 300; trial++) {
    const length = 1 + random(30);
    const period = 1 + random(8);
    const pattern = Array.from({ length: period }, () => alphabet[random(alphabet.length)]);
    const input = Array.from({ length }, (_, i) => trial % 2 === 0 ? pattern[i % period] : alphabet[random(alphabet.length)]);
    const before = [...input];
    const expected = bruteSmallestUniqueSubarray(input);
    for (const { solve } of variants) {
      equal(solve(input), expected, input);
      equal(input, before, 'Input must remain unchanged');
    }
  }
  // Direct window comparisons and copied suffixes are learning versions; stress the optimized variants.
  const optimized = new Set(['Optimized suffix array + LCP', 'Suffix automaton']);
  for (const { title, solve } of variants) {
    if (optimized.has(title)) assert.equal(solve(Array(10000).fill(7)), 10000);
  }
});

test('3934: exact sequence IDs check every length across power-of-two boundaries and overlapping blocks', () => {
  const code = exactSequenceCode();
  const result = 'return lo;';
  assert.ok(code.includes(result));
  let hasUnique;
  const inspect = check => { hasUnique = check; };
  const solve = vm.runInNewContext(`${code.replace(result, `inspect(hasUnique);\n    ${result}`)}\n;smallestUniqueSubarray`, { inspect }, { timeout: 1000 });
  const lengths = [1, 2, 3, 4, 5, 7, 8, 9, 15, 16, 17, 31, 32, 33, 63, 64, 65];
  const inputs = [
    [1, 2, 1, 2, 1],
    // The delimiter distinguishes [1,11] (twice) from [11,1] (once).
    [1, 11, 11, 1, 11, 11],
    [100000, 9994, 9994, 100000, 100000, 9994, 9994, 100000],
    [1, 9994, 100000, 10001, 1, 9994, 100000, 10001],
  ];
  for (const length of lengths) {
    inputs.push(Array(length).fill(100000));
    inputs.push(Array.from({ length }, (_, i) => [9994, 100000][i % 2]));
    inputs.push(Array.from({ length }, (_, i) => [9994, 100000, 1, 10001, 9994][i % 5]));
  }
  let checkedLengths = 0;
  for (const input of inputs) {
    equal(solve(input), bruteSmallestUniqueSubarray(input), input);
    for (let length = 1; length <= input.length; length++) {
      const windows = new Map();
      for (let start = 0; start + length <= input.length; start++) {
        const sequence = JSON.stringify(input.slice(start, start + length));
        windows.set(sequence, (windows.get(sequence) ?? 0) + 1);
      }
      const expected = [...windows.values()].includes(1);
      assert.equal(hasUnique(length), expected, JSON.stringify({ input, length }));
      checkedLengths++;
    }
  }
  assert.ok(checkedLengths > 1000, 'Check complete windows at every length, including overlapping first/last blocks');
});

test('3934: exact sequence IDs handle 100,000 repeated and high-cardinality values', () => {
  const solve = vm.runInNewContext(`${exactSequenceCode()}\n;smallestUniqueSubarray`, {}, { timeout: 1000 });
  const length = 100000;
  const cases = [
    // Every block at a level shares ID 0; the entire array is the only unique window.
    [Array(length).fill(100000), length],
    [Array.from({ length }, (_, i) => i + 1), 1],
    // Two equal blocks repeat every value, but their joining pair occurs once.
    [Array.from({ length }, (_, i) => i % (length / 2) + 1), 2],
    // Three remaining windows have counts 2 and 1; four have counts 2 and 2.
    [Array.from({ length }, (_, i) => i % 2 + 1), length - 2],
  ];
  for (const [input, expected] of cases) {
    const before = [...input];
    assert.equal(solve(input), expected, `Expected ${expected} for a 100,000-element input`);
    equal(input, before, 'Exact sequence IDs must not modify the input');
  }
});

test('3934: exact comparisons separate a real production-modulus hash collision', () => {
  const input = [1, 9994, 100000, 10001, 1, 9994, 100000, 10001];
  const base = 100001n;
  const modulus = 1000000007n;
  const first = 1n * base + 9994n;
  const second = 10001n * base + 1n;
  assert.equal(second - first, modulus);
  assert.equal(first % modulus, 109995n);
  assert.equal(second % modulus, 109995n);
  assert.equal(bruteSmallestUniqueSubarray(input), 2);
  for (const { solve } of loadUniqueSubarrayVariants()) equal(solve(input), 2, input);

  // Without comparing actual elements, [1,9994] (twice) hides [10001,1] (once).
  const code = rollingHashCode();
  const comparison = 'if (sameWindow(group.start, start)) {';
  assert.ok(code.includes(comparison));
  const hashOnly = vm.runInNewContext(`${code.replace(comparison, 'if (true) {')}\n;smallestUniqueSubarray`, {}, { timeout: 1000 });
  equal(hashOnly(input), 3, input);
});

test('3934: exact grouping remains correct with deliberately frequent modulo-7 collisions', () => {
  const code = rollingHashCode();
  const declaration = 'const MOD = 1000000007;';
  assert.ok(code.includes(declaration));
  const solve = vm.runInNewContext(`${code.replace(declaration, 'const MOD = 7;')}\n;smallestUniqueSubarray`, {}, { timeout: 1000 });
  for (let length = 1; length <= 6; length++) for (const input of arrays(length, 3)) {
    equal(solve(input), bruteSmallestUniqueSubarray(input), input);
  }
  for (const input of [[1, 6, 1, 6], [100000, 99999, 100000, 99999], [1, 9994, 100000, 10001, 1, 9994, 100000, 10001]]) {
    equal(solve(input), bruteSmallestUniqueSubarray(input), input);
  }
});

test('3934: every rolling hash matches independent BigInt arithmetic through modulo wraparound', () => {
  const code = rollingHashCode();
  const record = 'function recordWindow(start) {';
  assert.ok(code.includes(record));
  const previous = new Map();
  let largeOutgoing = 0;
  let negativeDifference = 0;
  let checkedWindows = 0;
  const inspectWindow = (start, length, hash, highestPower, base, modulus, nums) => {
    const exactBase = BigInt(base);
    const exactModulus = BigInt(modulus);
    let expected = 0n;
    for (let offset = 0; offset < length; offset++) expected = expected * exactBase + BigInt(nums[start + offset]);
    assert.equal(hash, Number(expected % exactModulus));
    assert.equal(highestPower, Number(exactBase ** BigInt(length - 1) % exactModulus));
    assert.ok(Number.isSafeInteger(hash) && hash >= 0 && hash < modulus);
    if (start > 0) {
      const rawOutgoing = nums[start - 1] * highestPower;
      assert.ok(Number.isSafeInteger(rawOutgoing));
      if (rawOutgoing >= modulus) largeOutgoing++;
      if (previous.get(length) - rawOutgoing % modulus < 0) negativeDifference++;
    }
    previous.set(length, hash);
    checkedWindows++;
  };
  const instrumented = code.replace(record, `${record}\n            inspectWindow(start, k, hash, power, BASE, MOD, nums);`);
  const solve = vm.runInNewContext(`${instrumented}\n;smallestUniqueSubarray`, { inspectWindow }, { timeout: 1000 });
  const inputs = [
    [1, 9994, 100000, 10001, 1, 9994, 100000, 10001],
    Array.from({ length: 40 }, (_, i) => [100000, 99999, 1, 9994, 10001][i % 5]),
    Array(40).fill(100000),
  ];
  for (const input of inputs) {
    previous.clear();
    equal(solve(input), bruteSmallestUniqueSubarray(input), input);
  }
  assert.ok(checkedWindows > 100, 'Validate each window in multiple binary-search iterations');
  assert.ok(largeOutgoing > 0, 'Exercise outgoing products that need modulo reduction');
  assert.ok(negativeDifference > 0, 'Exercise negative subtraction before modular normalization');
});
