import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { solutionMap } from './index';

function run(problemId: number, invocation: string, context: Record<string, unknown> = {}) {
  return runInNewContext(`${solutionMap[problemId].jsCode}\n${invocation}`, context, { timeout: 5000 });
}

describe('NeetCode 250 requirement regressions', () => {
  it('sorts in place without a built-in sorting function', () => {
    const result = run(912, `
      Array.prototype.sort = () => { throw new Error('Built-in sorting is forbidden'); };
      const input = [5, -2, 3, 3, 0, -2];
      const output = sortArray(input);
      ({ sameArray: output === input, values: output });
    `);
    expect(result.sameArray).toBe(true);
    expect([...result.values]).toEqual([-2, -2, 0, 3, 3, 5]);
  });

  it('selects ranks on maximum-size duplicate inputs without recursion or sorting', () => {
    expect(run(215, `
      Array.prototype.sort = () => { throw new Error('Sorting is forbidden'); };
      findKthLargest(new Array(100000).fill(7), 50000);
    `)).toBe(7);
    expect(run(215, 'findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)')).toBe(4);
  });

  it('handles a large decreasing window without linear-time front shifts', () => {
    const result = run(239, `
      Array.prototype.shift = () => { throw new Error('Linear-time dequeue'); };
      maxSlidingWindow(Array.from({ length: 100000 }, (_, index) => 100000 - index), 50000);
    `);
    expect(result.length).toBe(50001);
    expect(result[0]).toBe(100000);
    expect(result[result.length - 1]).toBe(50000);
    expect([...run(239, 'maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3)')]).toEqual([3, 3, 5, 5, 6, 7]);
  });

  it('reverses signed integers without taking an out-of-range absolute value', () => {
    const cases = [[-2147483648, 0], [1534236469, 0], [1463847412, 2147483641], [-1463847412, -2147483641], [-120, -21], [0, 0]];
    for (const [input, expected] of cases) {
      expect(run(7, `Math.abs = () => { throw new Error('Do not negate INT_MIN'); }; reverse(input);`, { input })).toBe(expected);
    }
  });

  it('checks grid bounds and handles full-size flat ocean grids', () => {
    expect(JSON.parse(JSON.stringify(run(417, 'pacificAtlantic([[1]])')))).toEqual([[0, 0]]);
    expect(run(417, 'pacificAtlantic(Array.from({ length: 200 }, () => new Array(200).fill(1))).length')).toBe(40000);
  });

  it('maintains a real heap for the kth-largest stream', () => {
    const result = run(703, `
      Array.prototype.sort = () => { throw new Error('Do not sort the heap on each add'); };
      const stream = new KthLargest(3, [4, 5, 8, 2]);
      [3, 5, 10, 9, 4].map(value => stream.add(value));
    `);
    expect([...result]).toEqual([4, 5, 5, 8, 8]);
  });

  it('smashes stones using a max-heap', () => {
    expect(run(1046, `Array.prototype.sort = () => { throw new Error('No repeated sorting'); }; lastStoneWeight([2, 7, 4, 1, 8, 1]);`)).toBe(1);
    expect(run(1046, 'lastStoneWeight([2, 2])')).toBe(0);
  });

  it('merges linked lists with its included heap implementation', () => {
    const result = run(23, `
      function ListNode(val = 0, next = null) { this.val = val; this.next = next; }
      const lists = [[1, 4, 5], [1, 3, 4], [2, 6]].map(values => values.reduceRight((next, value) => new ListNode(value, next), null));
      let node = mergeKLists(lists);
      const values = [];
      while (node) { values.push(node.val); node = node.next; }
      values;
    `);
    expect([...result]).toEqual([1, 1, 2, 3, 4, 4, 5, 6]);
  });

  it('orders CPU work by duration then original index', () => {
    expect([...run(1834, 'getOrder([[1, 2], [2, 4], [3, 2], [4, 1]])')]).toEqual([0, 2, 3, 1]);
    expect([...run(1834, 'getOrder([[7, 10], [7, 12], [7, 5], [7, 4], [7, 2]])')]).toEqual([4, 3, 2, 0, 1]);
  });

  it('selects the minimum covering interval using the same heap API', () => {
    expect([...run(1851, 'minInterval([[1, 4], [2, 4], [3, 6], [4, 4]], [2, 3, 4, 5])')]).toEqual([3, 3, 1, 4]);
  });

  it('assigns meeting rooms with consistent heap returns and tie-breaking', () => {
    expect(run(2402, 'mostBooked(2, [[0, 10], [1, 5], [2, 7], [3, 4]])')).toBe(0);
    expect(run(2402, 'mostBooked(3, [[1, 20], [2, 10], [3, 5], [4, 9], [6, 8]])')).toBe(1);
  });

  it('uses a heap for meeting-room allocation after sorting the schedule once', () => {
    const result = run(253, `
      const originalSort = Array.prototype.sort;
      let sortCalls = 0;
      Array.prototype.sort = function(compare) {
        if (++sortCalls > 1) throw new Error('Do not repeatedly sort the room heap');
        return originalSort.call(this, compare);
      };
      minMeetingRooms([[0, 30], [5, 10], [15, 20]]);
    `);
    expect(result).toBe(2);
    expect(run(253, 'minMeetingRooms([[0, 10], [10, 20]])')).toBe(1);
    expect(run(253, 'minMeetingRooms([])')).toBe(0);
  });
});

const hasPython = spawnSync('python3', ['--version']).status === 0;

// An independent component-merging oracle for every possible 3x3 binary grid.
const islandCases = Array.from({length:512},(_,mask)=>{
  const grid=Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>mask&(1<<(r*3+c))?'1':'0'));
  const parent=Array.from({length:9},(_,i)=>i);
  const root=(i:number):number=>parent[i]===i?i:root(parent[i]);
  let expected=grid.flat().filter(cell=>cell==='1').length;
  for(let r=0;r<3;r++)for(let c=0;c<3;c++)if(grid[r][c]==='1') {
    for(const [nr,nc] of [[r-1,c],[r,c-1]])if(nr>=0&&nc>=0&&grid[nr][nc]==='1') {
      const a=root(r*3+c),b=root(nr*3+nc);
      if(a!==b){parent[a]=b;expected--;}
    }
  }
  return {grid,expected};
});

it.each([['recursive',solutionMap[200]],['iterative',solutionMap[200].followUp!]] as const)('counts all 512 small grids using %s DFS',(_name,solution)=>{
  const results=runInNewContext(`${solution.jsCode}\ncases.map(({grid})=>numIslands(grid.map(row=>row.slice())))`,{cases:islandCases},{timeout:5000});
  expect([...results]).toEqual(islandCases.map(example=>example.expected));
});

it('handles a large connected island with the explicit stack',()=>{
  expect(runInNewContext(`${solutionMap[200].followUp!.jsCode}\nnumIslands(Array.from({length:300},()=>Array(300).fill('1')))`,{},{timeout:5000})).toBe(1);
});

it.skipIf(!hasPython)('checks both Python island variants and the large iterative case',()=>{
  const result=spawnSync('python3',['-c',`
import json, sys
data = json.load(sys.stdin)
for name, source in data['sources'].items():
    namespace = {}
    exec(source, namespace)
    solution = namespace['Solution']()
    for case in data['cases']:
        grid = [row[:] for row in case['grid']]
        assert solution.numIslands(grid) == case['expected'], (name, case)
    if name == 'iterative':
        assert solution.numIslands([['1'] * 300 for _ in range(300)]) == 1
`],{input:JSON.stringify({sources:{recursive:solutionMap[200].code,iterative:solutionMap[200].followUp!.code},cases:islandCases}),encoding:'utf8',timeout:15000});
  expect(result.stderr).toBe('');
  expect(result.status).toBe(0);
});

it.skipIf(!hasPython)('validates the corrected Python answers against edge cases and independent oracles', () => {
  const sources = Object.fromEntries([7, 215, 371, 417, 912].map(id => [id, solutionMap[id].code]));
  const result = spawnSync('python3', ['-c', `
import json, random, sys
sources = json.load(sys.stdin)
solutions = {}
for problem_id, source in sources.items():
    namespace = {}
    exec(source, namespace)
    solutions[int(problem_id)] = namespace['Solution']()
generator = random.Random(250)
for first in [-1000, -99, -1, 0, 1, 99, 1000]:
    for second in [-1000, -99, -1, 0, 1, 99, 1000]:
        assert solutions[371].getSum(first, second) == first + second
for _ in range(1000):
    first, second = generator.randint(-1000, 1000), generator.randint(-1000, 1000)
    assert solutions[371].getSum(first, second) == first + second
for value, expected in [(-2147483648, 0), (1534236469, 0), (1463847412, 2147483641), (-1463847412, -2147483641), (-120, -21), (0, 0)]:
    assert solutions[7].reverse(value) == expected
for _ in range(100):
    values = [generator.randint(-20, 20) for _ in range(100)]
    expected = sorted(values)
    rank = generator.randint(1, len(values))
    assert solutions[215].findKthLargest(values[:], rank) == expected[-rank]
    assert solutions[912].sortArray(values) is values
    assert values == expected
assert solutions[215].findKthLargest([7] * 100000, 50000) == 7
assert solutions[417].pacificAtlantic([[1]]) == [[0, 0]]
assert len(solutions[417].pacificAtlantic([[1] * 200 for _ in range(200)])) == 40000
print('Python regressions passed')
  `], { input: JSON.stringify(sources), encoding: 'utf8', timeout: 15000 });
  expect(result.stderr).toBe('');
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('Python regressions passed');
});
