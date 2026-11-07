import type { LogicFixture } from './types';

function equal(actual: unknown, expected: unknown): boolean {
  if (typeof actual !== typeof expected) return false;
  if (Array.isArray(expected)) return Array.isArray(actual) && actual.length === expected.length && expected.every((value, index) => equal(actual[index], value));
  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object') return false;
    const a = actual as Record<string, unknown>, b = expected as Record<string, unknown>;
    return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every(key => Object.prototype.hasOwnProperty.call(a, key) && equal(a[key], b[key]));
  }
  return actual === expected;
}
const ordered = (values: unknown[]) => [...values].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
const counts = (values: unknown[]) => {
  const result = new Map<unknown, number>();
  for (const value of values) result.set(value, (result.get(value) ?? 0) + 1);
  return result;
};

/** Judge output by the problem's semantics, including valid nonunique answers. */
export function validateJavaScriptResult(actual: any, fixture: LogicFixture, problemId: number): boolean {
  const expected: any = fixture.expected, args: any[] = fixture.args;
  if (problemId === 1 || problemId === 167) {
    if (!Array.isArray(actual) || actual.length !== 2 || !actual.every(Number.isInteger)) return false;
    const [first, second] = actual.map(value => value - (problemId === 167 ? 1 : 0));
    return first !== second && first >= 0 && second >= 0 && first < args[0].length && second < args[0].length && args[0][first] + args[0][second] === args[1];
  }
  if (problemId === 347) {
    if (!Array.isArray(actual) || actual.length !== args[1] || !actual.every(Number.isInteger) || new Set(actual).size !== actual.length) return false;
    const frequencies = counts(args[0]);
    const threshold = [...frequencies.values()].sort((a, b) => b - a)[args[1] - 1];
    return actual.every(value => (frequencies.get(value) ?? 0) >= threshold) && [...frequencies].every(([value, count]) => count <= threshold || actual.includes(value));
  }
  if (problemId === 973) {
    if (!Array.isArray(actual) || actual.length !== args[1] || !actual.every(point => Array.isArray(point) && point.length === 2 && point.every(Number.isInteger))) return false;
    const available = counts(args[0].map((point: number[]) => JSON.stringify(point)));
    for (const point of actual) {
      const key = JSON.stringify(point), remaining = available.get(key) ?? 0;
      if (!remaining) return false;
      available.set(key, remaining - 1);
    }
    const distance = ([x, y]: number[]) => x * x + y * y;
    return equal(actual.map(distance).sort((a, b) => a - b), args[0].map(distance).sort((a: number, b: number) => a - b).slice(0, args[1]));
  }
  if (problemId === 269) {
    if (typeof actual !== 'string') return false;
    if (!expected) return actual === '';
    const letters = new Set<string>(args[0].join(''));
    if (actual.length !== letters.size || new Set(actual).size !== letters.size || [...actual].some(letter => !letters.has(letter))) return false;
    for (let i = 1; i < args[0].length; i++) {
      const before = args[0][i - 1], after = args[0][i];
      if (before.length > after.length && before.startsWith(after)) return false;
      for (let j = 0; j < Math.min(before.length, after.length); j++) if (before[j] !== after[j]) {
        if (actual.indexOf(before[j]) >= actual.indexOf(after[j])) return false;
        break;
      }
    }
    return true;
  }
  if (problemId === 1489) return Array.isArray(actual) && actual.length === 2 && actual.every((group, i) => Array.isArray(group) && equal(ordered(group), ordered(expected[i])));
  switch (fixture.compare) {
    case 'unordered': return Array.isArray(actual) && equal(ordered(actual), ordered(expected));
    case 'groups': return Array.isArray(actual) && actual.every(Array.isArray) && equal(ordered(actual.map(ordered)), ordered(expected.map(ordered)));
    case 'accounts': {
      const normalize = (groups: any[][]) => ordered(groups.map(([name, ...emails]) => [name, ...emails.sort()]));
      return Array.isArray(actual) && actual.every(row => Array.isArray(row) && row.length) && equal(normalize(actual), normalize(expected));
    }
    case 'topological': {
      if (!expected.length) return equal(actual, []);
      const [count, edges] = args;
      if (!Array.isArray(actual) || actual.length !== count || new Set(actual).size !== count || !actual.every(value => Number.isInteger(value) && value >= 0 && value < count)) return false;
      return edges.every(([after, before]: number[]) => actual.indexOf(before) < actual.indexOf(after));
    }
    case 'matrixConditions': {
      if (!expected.length) return equal(actual, []);
      const [count, rows, columns] = args;
      if (!Array.isArray(actual) || actual.length !== count || !actual.every(row => Array.isArray(row) && row.length === count)) return false;
      const positions = new Map<number, [number, number]>();
      for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) {
        const value = actual[r][c];
        if (!Number.isInteger(value) || value < 0 || value > count || value !== 0 && positions.has(value)) return false;
        if (value) positions.set(value, [r, c]);
      }
      return positions.size === count && rows.every(([a, b]: number[]) => positions.get(a)![0] < positions.get(b)![0]) && columns.every(([a, b]: number[]) => positions.get(a)![1] < positions.get(b)![1]);
    }
    case 'longestPalindrome': return typeof actual === 'string' && actual.length === expected.length && args[0].includes(actual) && actual === [...actual].reverse().join('');
    case 'reorganized': return typeof actual === 'string' && (!expected ? actual === '' : [...actual].sort().join('') === [...args[0]].sort().join('') && [...actual].every((letter, i) => !i || letter !== actual[i - 1]));
    case 'happyString': {
      if (typeof actual !== 'string') return false;
      const maximum = Math.max(...args), rest = args.reduce((total, value) => total + value, 0) - maximum;
      return actual.length === rest + Math.min(maximum, 2 * (rest + 1)) && /^[abc]*$/.test(actual) && !/aaa|bbb|ccc/.test(actual) && [...'abc'].every((letter, i) => [...actual].filter(value => value === letter).length <= args[i]);
    }
    default: return equal(actual, expected);
  }
}
