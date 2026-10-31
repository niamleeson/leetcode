import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { neetcodeTopics } from '../neetcode250';
import { solutionMap } from './index';
import { iterativeGraphSolutions } from './graph-iterative';

describe('Connected Components BFS primary', () => {
  const cases: { n: number; edges: number[][]; expected: number }[] = [];
  for (let n = 1; n <= 5; n++) {
    const possible: number[][] = [];
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) possible.push([a, b]);
    for (let mask = 0; mask < 2 ** possible.length; mask++) {
      const edges = possible.filter((_, bit) => mask & (1 << bit));
      const parents = Array(n).fill(null).map((_, i) => i);
      const root = (node: number): number => parents[node] === node ? node : root(parents[node]);
      for (const [a, b] of edges) parents[root(a)] = root(b);
      cases.push({ n, edges, expected: new Set(parents.map((_, i) => root(i))).size });
    }
  }
  cases.push({ n: 2000, edges: Array(1999).fill(null).map((_, i) => [0, i + 1]), expected: 1 });
  cases.push({ n: 2000, edges: [], expected: 2000 });

  it('counts every component in all simple graphs up to five nodes, a large star, and isolated nodes', () => {
    const result = runInNewContext(`${solutionMap[323].jsCode}
      cases.map(({ n, edges }) => {
        const before = JSON.stringify(edges);
        const actual = countComponents(n, edges);
        if (JSON.stringify(edges) !== before) throw new Error('Input changed');
        return actual;
      })`, { cases }, { timeout: 5000 });
    expect([...result]).toEqual(cases.map(({ expected }) => expected));
  });

  it('keeps Python consistent on the same independent component counts', () => {
    const result = spawnSync('python3', ['-c', `
import json, sys
data = json.load(sys.stdin)
namespace = {}
exec(data['code'], namespace)
solution = namespace['Solution']()
for case in data['cases']:
    before = [edge[:] for edge in case['edges']]
    assert solution.countComponents(case['n'], case['edges']) == case['expected'], case
    assert case['edges'] == before
`], { input: JSON.stringify({ code: solutionMap[323].code, cases }), encoding: 'utf8', timeout: 10000 });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });
});

describe('Course Schedule IV BFS primary', () => {
  // Every four-node DAG has a topological order. Enumerate all orders and
  // forward-edge subsets, then compute answers by independently enumerating paths.
  const orders: number[][] = [];
  function permute(prefix: number[], remaining: number[]) {
    if (!remaining.length) orders.push(prefix);
    remaining.forEach(node => permute([...prefix, node], remaining.filter(value => value !== node)));
  }
  permute([], [0, 1, 2, 3]);
  const distinct = new Map<string, number[][]>();
  for (const order of orders) {
    const possible: number[][] = [];
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) possible.push([order[i], order[j]]);
    for (let mask = 0; mask < 64; mask++) {
      const edges = possible.filter((_, bit) => mask & (1 << bit)).sort(([a, b], [c, d]) => a - c || b - d);
      distinct.set(JSON.stringify(edges), edges);
    }
  }
  const cases = [...distinct.values()].map(edges => {
    const reached = Array(4).fill(null).map(() => new Set<number>());
    function paths(start: number, node: number) {
      for (const [before, after] of edges) if (before === node) {
        reached[start].add(after);
        paths(start, after);
      }
    }
    const queries: number[][] = [];
    for (let start = 0; start < 4; start++) {
      paths(start, start);
      for (let end = 0; end < 4; end++) if (start !== end) queries.push([start, end]);
    }
    return { n: 4, edges, queries, expected: queries.map(([before, after]) => reached[before].has(after)) };
  });
  const chain = Array(99).fill(null).map((_, i) => [i + 1, i]);
  const queries: number[][] = [];
  for (let before = 0; before < 100; before++) for (let after = 0; after < 100; after++) if (before !== after) queries.push([before, after]);
  cases.push({ n: 100, edges: chain, queries, expected: queries.map(([before, after]) => before > after) });

  it('answers every query in all 543 four-node DAGs and a reverse-numbered chain without modifying inputs', () => {
    expect(distinct.size).toBe(543);
    const result = runInNewContext(`${solutionMap[1462].jsCode}
      cases.map(({ n, edges, queries }) => {
        const before = JSON.stringify([edges, queries]);
        const answer = checkIfPrerequisite(n, edges, queries);
        if (JSON.stringify([edges, queries]) !== before) throw new Error('Inputs changed');
        return answer;
      })`, { cases }, { timeout: 5000 });
    expect(JSON.parse(JSON.stringify(result))).toEqual(cases.map(({ expected }) => expected));
  });

  it('keeps the Python BFS consistent on the same independent cases', () => {
    const result = spawnSync('python3', ['-c', `
import json, sys
data = json.load(sys.stdin)
namespace = {}
exec(data['code'], namespace)
solution = namespace['Solution']()
for case in data['cases']:
    before = json.dumps([case['edges'], case['queries']])
    assert solution.checkIfPrerequisite(case['n'], case['edges'], case['queries']) == case['expected'], case
    assert json.dumps([case['edges'], case['queries']]) == before
`], { input: JSON.stringify({ code: solutionMap[1462].code, cases }), encoding: 'utf8', timeout: 10000 });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });
});

describe('Graph Valid Tree iterative DFS', () => {
  // Independently detect cycles with union-find for every simple graph up to five nodes.
  const cases: { n: number; edges: number[][]; expected: boolean }[] = [];
  for (let n = 1; n <= 5; n++) {
    const pairs: number[][] = [];
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) pairs.push([a, b]);
    for (let mask = 0; mask < 2 ** pairs.length; mask++) {
      const edges = pairs.filter((_, bit) => mask & (1 << bit));
      const roots = Array(n).fill(null).map((_, i) => i);
      const find = (node: number): number => roots[node] === node ? node : find(roots[node]);
      let cycle = false;
      for (const [a, b] of edges) {
        const rootA = find(a), rootB = find(b);
        if (rootA === rootB) cycle = true;
        roots[rootA] = rootB;
      }
      cases.push({ n, edges, expected: !cycle && edges.length === n - 1 });
    }
  }
  cases.push({ n: 2000, edges: Array(1999).fill(null).map((_, i) => [i, i + 1]), expected: true });

  it('matches the independent oracle, preserves inputs, and handles a long chain', () => {
    const result = runInNewContext(`${solutionMap[261].jsCode}
      cases.map(({ n, edges }) => {
        const before = JSON.stringify(edges);
        const actual = validTree(n, edges);
        if (JSON.stringify(edges) !== before) throw new Error('Input edges changed');
        const reversed = validTree(n, edges.map(([a, b]) => [b, a]).reverse());
        return [actual, reversed];
      })`, { cases }, { timeout: 5000 });
    expect(JSON.parse(JSON.stringify(result))).toEqual(cases.map(({ expected }) => [expected, expected]));
  });

  it('keeps Python consistent on the same exhaustive cases and long chain', () => {
    const result = spawnSync('python3', ['-c', `
import json, sys
data = json.load(sys.stdin)
namespace = {}
exec(data['code'], namespace)
solution = namespace['Solution']()
for case in data['cases']:
    before = [edge[:] for edge in case['edges']]
    assert solution.validTree(case['n'], case['edges']) == case['expected'], case
    assert case['edges'] == before
    reversed_edges = [[b, a] for a, b in reversed(case['edges'])]
    assert solution.validTree(case['n'], reversed_edges) == case['expected'], case
`], { input: JSON.stringify({ code: solutionMap[261].code, cases }), encoding: 'utf8', timeout: 10000 });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });
});

// A separate union-find oracle checks every 3x3 land pattern and border connection.
const grids=Array.from({length:512},(_,mask)=>{
  const grid=Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>(mask>>(r*3+c))&1));
  const parent=Array.from({length:9},(_,i)=>i);
  const root=(i:number):number=>parent[i]===i?i:root(parent[i]);
  for(let r=0;r<3;r++)for(let c=0;c<3;c++)if(grid[r][c]) {
    for(const [nr,nc] of [[r-1,c],[r,c-1]])if(nr>=0&&nc>=0&&grid[nr][nc])parent[root(r*3+c)]=root(nr*3+nc);
  }
  const sizes=new Map<number,number>(),border=new Set<number>();
  for(let r=0;r<3;r++)for(let c=0;c<3;c++)if(grid[r][c]) {
    const group=root(r*3+c);sizes.set(group,(sizes.get(group)||0)+1);
    if(r===0||r===2||c===0||c===2)border.add(group);
  }
  return {grid,area:Math.max(0,...sizes.values()),board:grid.map(row=>row.map(cell=>cell?'O':'X')),
    captured:grid.map((row,r)=>row.map((cell,c)=>cell&&border.has(root(r*3+c))?'O':'X'))};
});

// Build valid ticket multisets from short walks, then independently enumerate
// every ticket ordering to find the lexicographically first complete route.
const itineraryCases=Array.from({length:243},(_,seed)=>{
  let value=seed;const route=['JFK'];
  for(let i=0;i<5;i++){route.push(['JFK','ATL','SFO'][value%3]);value=Math.floor(value/3);}
  const tickets=route.slice(1).map((to,i)=>[route[i],to]);
  const candidates:string[][]=[];
  function visit(path:string[],used:Set<number>) {
    if(used.size===tickets.length){candidates.push(path);return;}
    tickets.forEach(([from,to],i)=>{if(!used.has(i)&&from===path[path.length-1])visit([...path,to],new Set(used).add(i));});
  }
  visit(['JFK'],new Set());
  candidates.sort((a,b)=>a.join(',')<b.join(',')?-1:a.join(',')>b.join(',')?1:0);
  return {tickets:tickets.reverse(),expected:candidates[0]};
});

const graphs:number[][][]=[[],[[]]];
for(let mask=0;mask<64;mask++) {
  const graph:number[][]=Array.from({length:4},()=>[]);let bit=0;
  for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)if(mask&(1<<bit++)){graph[a].push(b+1);graph[b].push(a+1);}
  const reached=new Set([1]);
  for(let pass=0;pass<4;pass++)for(const value of [...reached])graph[value-1].forEach(v=>reached.add(v));
  if(reached.size===4)graphs.push(graph);
}

describe.each(['recursive','iterative'] as const)('%s graph solutions',(variant)=>{
  const source=(id:number)=>variant==='recursive'?solutionMap[id].jsCode!:iterativeGraphSolutions[id].jsCode!;
  it('finds maximum area for all 512 grids',()=>{
    const actual=runInNewContext(`${source(695)}\ncases.map(({grid})=>maxAreaOfIsland(grid.map(row=>row.slice())))`,{cases:grids},{timeout:5000});
    expect([...actual]).toEqual(grids.map(item=>item.area));
  });
  it('captures exactly the components separated from the border',()=>{
    const actual=runInNewContext(`${source(130)}\ncases.map(({board})=>{const copy=board.map(row=>row.slice());solve(copy);return copy;})`,{cases:grids},{timeout:5000});
    expect(JSON.parse(JSON.stringify(actual))).toEqual(grids.map(item=>item.captured));
  });
  it('uses every ticket and returns the smallest complete itinerary',()=>{
    const actual=runInNewContext(`${source(332)}\ncases.map(({tickets})=>findItinerary(tickets.map(row=>row.slice())))`,{cases:itineraryCases},{timeout:5000});
    expect(JSON.parse(JSON.stringify(actual))).toEqual(itineraryCases.map(item=>item.expected));
  });
  it('copies cycles and shared neighbors with distinct identities and preserved order',()=>{
    class Node { neighbors:Node[]=[];constructor(public val:number){} }
    const clone=runInNewContext(`${source(133)}\ncloneGraph`,{_Node:Node}) as (node:Node|null)=>Node|null;
    for(const adjacency of graphs) {
      const originals=adjacency.map((_,i)=>new Node(i+1));
      originals.forEach((node,i)=>{node.neighbors=adjacency[i].map(value=>originals[value-1]);});
      const result=clone(originals[0]||null);
      if(!originals.length){expect(result).toBeNull();continue;}
      const copies=new Map<number,Node>(),pending=[result!];
      while(pending.length) {
        const node=pending.pop()!;
        if(copies.has(node.val)){expect(copies.get(node.val)).toBe(node);continue;}
        copies.set(node.val,node);expect(originals.includes(node)).toBe(false);
        expect(node.neighbors.map(n=>n.val)).toEqual(adjacency[node.val-1]);
        pending.push(...node.neighbors);
      }
      expect(copies.size).toBe(originals.length);
      originals.forEach((node,i)=>expect(node.neighbors).toEqual(adjacency[i].map(value=>originals[value-1])));
    }
  });
});

it('handles large connected grids without recursive calls',()=>{
  expect(runInNewContext(`${iterativeGraphSolutions[695].jsCode}\nmaxAreaOfIsland(Array.from({length:50},()=>Array(50).fill(1)))`,{},{timeout:5000})).toBe(2500);
  const count=runInNewContext(`${iterativeGraphSolutions[130].jsCode}\nconst board=Array.from({length:200},()=>Array(200).fill('O'));solve(board);board.flat().filter(cell=>cell==='O').length`,{},{timeout:5000});
  expect(count).toBe(40000);
});

function recursiveFunctions(code:string) {
  const source=ts.createSourceFile('solution.js',code,ts.ScriptTarget.ES2020,true,ts.ScriptKind.JS);
  const calls=new Map<string,Set<string>>();
  function visit(node:ts.Node) {
    if(ts.isFunctionDeclaration(node)||ts.isFunctionExpression(node)||ts.isArrowFunction(node)) {
      const name=('name' in node?node.name?.getText(source):undefined)||(ts.isVariableDeclaration(node.parent)?node.parent.name.getText(source):undefined);
      if(name) {
        const targets=new Set<string>();
        function scan(child:ts.Node) {
          if(child!==node&&(ts.isFunctionDeclaration(child)||ts.isFunctionExpression(child)||ts.isArrowFunction(child)))return;
          if(ts.isCallExpression(child)&&ts.isIdentifier(child.expression))targets.add(child.expression.text);
          ts.forEachChild(child,scan);
        }
        scan(node);calls.set(name,targets);
      }
    }
    ts.forEachChild(node,visit);
  }
  visit(source);
  return [...calls.keys()].filter(start=>{
    const pending=[...(calls.get(start)||[])],seen=new Set<string>();
    while(pending.length){const name=pending.pop()!;if(name===start)return true;if(seen.has(name))continue;seen.add(name);pending.push(...(calls.get(name)||[]));}
    return false;
  });
}

it('provides an iterative JavaScript choice for every graph problem with recursive code',()=>{
  const problems=neetcodeTopics.filter(topic=>topic.name.includes('Graphs')).flatMap(topic=>topic.problems);
  expect(problems).toHaveLength(31);
  const recursive=problems.filter(problem=>recursiveFunctions(solutionMap[problem.id].jsCode!).length);
  expect(recursive.map(problem=>problem.id).sort((a,b)=>a-b)).toEqual([130,133,200,332,695]);
  for(const problem of recursive) {
    const alternative=solutionMap[problem.id].followUp!;
    expect(alternative.walkthroughVariant).toBe('iterative');
    expect(recursiveFunctions(alternative.jsCode!)).toEqual([]);
  }
});

it('checks Python coverage and both versions against independent graph and grid cases',()=>{
  const graphSources=Object.fromEntries(neetcodeTopics.filter(topic=>topic.name.includes('Graphs')).flatMap(topic=>topic.problems).map(({id})=>[id,{recursive:solutionMap[id].code,iterative:solutionMap[id].followUp?.code}]));
  const result=spawnSync('python3',['-c',`
import ast, json, sys
data = json.load(sys.stdin)
class Node:
    def __init__(self, val=0):
        self.val, self.neighbors = val, []
for problem_id, sources in data['sources'].items():
    def recursive(source):
        tree = ast.parse(source)
        return any(isinstance(fn, ast.FunctionDef) and any(isinstance(call, ast.Call) and isinstance(call.func, ast.Name) and call.func.id == fn.name for call in ast.walk(fn)) for fn in ast.walk(tree))
    if recursive(sources['recursive']):
        assert sources.get('iterative') and not recursive(sources['iterative']), problem_id
    if int(problem_id) not in [695, 130, 133, 332]:
        continue
    for variant, source in sources.items():
        namespace = {'Node': Node}
        exec(source, namespace)
        solution = namespace['Solution']()
        if problem_id == '695':
            for case in data['grids']:
                assert solution.maxAreaOfIsland([row[:] for row in case['grid']]) == case['area']
            if variant == 'iterative':
                assert solution.maxAreaOfIsland([[1] * 50 for _ in range(50)]) == 2500
        elif problem_id == '130':
            for case in data['grids']:
                board = [row[:] for row in case['board']]
                assert solution.solve(board) is None
                assert board == case['captured']
            if variant == 'iterative':
                board = [['O'] * 200 for _ in range(200)]
                solution.solve(board)
                assert all(cell == 'O' for row in board for cell in row)
        elif problem_id == '332':
            for case in data['itineraries']:
                assert solution.findItinerary([row[:] for row in case['tickets']]) == case['expected']
        else:
            for graph in data['graphs']:
                originals = [Node(i + 1) for i in range(len(graph))]
                for i, node in enumerate(originals):
                    node.neighbors = [originals[value - 1] for value in graph[i]]
                copy = solution.cloneGraph(originals[0] if originals else None)
                if not originals:
                    assert copy is None
                    continue
                copies, pending = {}, [copy]
                while pending:
                    node = pending.pop()
                    if node.val in copies:
                        assert copies[node.val] is node
                        continue
                    copies[node.val] = node
                    assert node not in originals
                    assert [n.val for n in node.neighbors] == graph[node.val - 1]
                    pending.extend(node.neighbors)
                assert len(copies) == len(originals)
                for i, node in enumerate(originals):
                    assert node.neighbors == [originals[value - 1] for value in graph[i]]
print('Python graph alternatives passed')
`],{input:JSON.stringify({sources:graphSources,grids,itineraries:itineraryCases,graphs}),encoding:'utf8',timeout:15000});
  expect(result.stderr).toBe('');expect(result.status).toBe(0);
  expect(result.stdout).toContain('Python graph alternatives passed');
});
