const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execute, dependenciesFor } = require('./runtime.cjs');
const { decoder } = require('./audit-recordings.cjs');
const {indexingFor}=require('./source-analysis.cjs');

function frames(source,args) {
  const trace=execute(source,{entry:'solve',args},0);
  let heap={};
  return trace.steps.map(step=>{heap={...heap,...step.heap};return {...step,fullHeap:heap};});
}
test('shared heap operations capture contents and size atomically on the calling line',()=>{
  const source=`function solve() {
    const heap = new MinHeap();
    heap.push([5, 'a']);
    heap.push([1, 'b']);
    heap.push([1, 'c']);
    heap.push([0, 'd']);
    const result = [];
    while (heap.size > 0) {
      const value = heap.pop();
      result.push(value);
    }
    return result;
  }`;
  const trace=execute(source,{entry:'solve',args:[]},743);
  assert.deepEqual(trace.result.map(entry=>entry[0]),[0,1,1,5]);
  assert.deepEqual(dependenciesFor(1),{});
  let objects={},previous=[];
  const content=items=>items.map(item=>JSON.stringify(item)).sort();
  for(const step of trace.steps) {
    objects={...objects,...step.heap};
    const decode=decoder(objects);
    if(!step.state.heap)continue;
    const heap=decode(step.state.heap);
    assert.equal(heap.size,heap.heap.length);
    assert.deepEqual(step.stack,['solve']);
    for(let i=1;i<heap.heap.length;i++)assert(heap.heap[Math.floor((i-1)/2)][0]<=heap.heap[i][0]);
    if(step.kind==='operation'&&step.label==='heap.pop()') {
      const removed=decode(step.value);
      assert.equal(removed[0],Math.min(...previous.map(item=>item[0])));
      assert.deepEqual(content([...heap.heap,removed]),content(previous));
      assert(!('value' in step.state),'pop must precede assignment');
      assert.equal(source.split('\n')[step.line-1].trim(),'const value = heap.pop();');
    }
    previous=heap.heap;
  }
  for(const line of [3,4,5,6]) {
    const steps=trace.steps.filter(step=>step.line===line);
    assert.equal(steps.length,1);
    assert.equal(steps[0].kind,'operation');
  }
});
test('pop is recorded after removal and before the destination variable is assigned',()=>{
  const source=`function solve() {
    const stack = [2, 1];
    const right = stack.pop();
    const left = stack.pop();
    stack.push(left + right);
    return stack[0];
  }`;
  const steps=frames(source,[]), pops=steps.filter(s=>s.kind==='operation'&&s.label==='stack.pop()');
  assert.equal(pops.length,2);
  assert.equal(pops[0].line,3);assert.equal(pops[0].value,1);
  assert.deepEqual(pops[0].fullHeap[pops[0].state.stack.$ref].items,[2]);
  assert(!('right' in pops[0].state));
  const assigned=steps.find(s=>s.kind==='statement'&&s.line===3);
  assert.equal(assigned.state.right,1);
  assert.deepEqual(pops[1].fullHeap[pops[1].state.stack.$ref].items,[]);
  assert.equal(steps.at(-1).value,3);
});
test('compound guards are single decisions; false checks, loop exits and continue are retained',()=>{
  const steps=frames(`function solve(values) {
    let total = 0;
    for (const value of values) {
      if (value === 0) continue;
      if (value > 0 && value < 3) total += value;
    }
    return total;
  }`,[[0,-1,2,4]]);
  assert.equal(steps.filter(s=>s.kind==='iterate').length,4);
  assert.equal(steps.filter(s=>s.kind==='continue').length,1);
  assert.equal(steps.filter(s=>s.kind==='loop-end').length,1);
  assert.deepEqual(steps.filter(s=>s.kind==='check'&&s.label==='value > 0 && value < 3').map(s=>s.value),[false,true,false]);
  assert(!steps.some(s=>s.kind==='check'&&s.label==='value > 0'));
  assert.equal(steps.at(-1).value,2);
});
test('standalone mutations are recorded once, with the next frame advancing to actual code',()=>{
  const steps=frames(`function solve() {
    const stack = [];
    stack.push(1);
    stack.push(2);
    stack.pop();
    const seen = new Set();
    seen.add(1);
    seen.add(1);
    const counts = new Map();
    counts.set(1, 2);
    counts.delete(1);
    return stack;
  }`,[]);
  for(const line of [3,4,5,7,8,10,11]) {
    const records=steps.filter(s=>s.line===line);
    assert.equal(records.length,1,`Extra step on line ${line}`);
    assert.equal(records[0].kind,'operation');
  }
  assert.deepEqual(steps.filter(s=>s.kind==='operation').slice(0,3).map(s=>s.fullHeap[s.state.stack.$ref].items),[[1],[1,2],[1]]);
});
test('real statements remain even when they assign the same value',()=>{
  const steps=frames(`function solve() {
    let value = 1;
    value = 1;
    value = 1;
    return value;
  }`,[]);
  assert.deepEqual(steps.filter(s=>s.kind==='statement').map(s=>s.line),[2,3,4]);
});
test('boolean initializers are one statement and preserve short-circuit side effects',()=>{
  const source=`function solve(value) {
    const stack = [];
    const inside = value >= 0 && value < 3;
    if (inside && stack.push(value)) stack.push(10);
    return stack;
  }`;
  for(const value of [-1,2]) {
    const steps=frames(source,[value]);
    assert.equal(steps.filter(s=>s.line===3).length,1);
    assert.deepEqual(execute(source,{entry:'solve',args:[value]},0).result,execute(source,{entry:'solve',args:[value]},0,false).result);
    assert.equal(steps.filter(s=>s.kind==='check').length,1);
    assert.equal(steps.filter(s=>s.kind==='operation').length,value===2?2:0);
  }
});
test('recursive returns restore the calling frame and preserve closure data',()=>{
  const steps=frames(`function solve(n) {
    const values = [];
    function visit(x) {
      if (x === 0) return 0;
      values.push(x);
      const child = visit(x - 1);
      return x + child;
    }
    const answer = visit(n);
    return answer;
  }`,[3]);
  const returns=steps.filter(s=>s.kind==='return');
  assert.deepEqual(returns.map(s=>s.value),[0,1,3,6,6]);
  assert.deepEqual(returns.map(s=>s.stack.length),[5,4,3,2,1]);
  assert.deepEqual(returns[0].fullHeap[returns[0].state.values.$ref].items,[3,2,1]);
  assert.equal(steps.at(-1).state.answer,6);
});
test('node identity, cyclic links, Maps, Sets, and immutable prior snapshots are preserved',()=>{
  const steps=frames(`function solve() {
    const node = {val:1,next:null};
    const alias = node;
    const seen = new Map();
    const visited = new Set();
    seen.set(node, 1);
    visited.add(node);
    node.next = node;
    node.val = 2;
    return node.val;
  }`,[]);
  const first=steps.find(s=>s.kind==='statement'&&s.line===2),last=steps.at(-1);
  assert.equal(first.fullHeap[first.state.node.$ref].fields.val,1);
  assert.equal(last.state.alias.$ref,last.state.node.$ref);
  assert.deepEqual(last.fullHeap[last.state.node.$ref].fields.next,last.state.node);
  assert.equal(last.fullHeap[last.state.node.$ref].fields.val,2);
  assert.deepEqual(last.fullHeap[last.state.seen.$ref].entries,[[last.state.node,1]]);
  assert.deepEqual(last.fullHeap[last.state.visited.$ref].items,[last.state.node]);
});
test('instrumented execution preserves in-place mutations, constructor state and native operations',()=>{
  const source=`function solve(values) {
    values.sort((a,b)=>a-b);
    for (let i=0;i<values.length;i++) values[i] *= 2;
    return values;
  }`;
  const fixture={entry:'solve',args:[[3,1,2]]};
  assert.deepEqual(execute(source,fixture,0).result,[2,4,6]);
  assert.deepEqual(execute(source,fixture,0).result,execute(source,fixture,0,false).result);
});
test('randomized solutions use reproducible choices in ordinary and recorded execution',()=>{
  const source=`function solve() { const choices = []; for(let i=0;i<5;i++) choices.push(Math.random()); return choices; }`;
  const fixture={entry:'solve',args:[]};
  const first=execute(source,fixture,0),second=execute(source,fixture,0);
  assert.deepEqual(first,second);
  assert.deepEqual(first.result,execute(source,fixture,0,false).result);
});
test('preserves negative zero and BigInt zero in intermediate states',()=>{
  const steps=frames(`function solve(number) { const digit = number % 10; const zero = 0n; if (digit) return 1; if (zero) return 2; return 0; }`,[-120]);
  const digit=steps.find(s=>s.kind==='statement'&&s.label.startsWith('const digit'));
  assert.deepEqual(digit.state.digit,{$scalar:'-0'});
  assert(steps.some(s=>s.kind==='check'&&s.label==='digit'&&s.value.$scalar==='-0'));
  assert(steps.some(s=>s.kind==='check'&&s.label==='zero'&&s.value.$scalar==='0n'));
});
test('highlights a whole multiline expression without highlighting a function body on entry',()=>{
  const source=`function solve(a, b) {
    const inside = a >= 0 &&
                   b >= 0;
    return inside;
  }`;
  const trace=execute(source,{entry:'solve',args:[1,-1]},0);
  assert.deepEqual(trace.steps.find(s=>s.kind==='call').lines,[1]);
  assert.deepEqual(trace.steps.find(s=>s.kind==='statement').lines,[2,3]);
});
test('derives pointers from indexing operations rather than variable names',()=>{
  assert.deepEqual(indexingFor(`function solve(nums,k,grid) { const value=nums[left]+nums[right]; return grid[r][c]+k+this.buckets[index][0]; }`),{
    nums:{indices:['left','right'],cells:[]},grid:{indices:['r'],cells:[['r','c']]},'this.buckets':{indices:['index'],cells:[]},
  });
});

test('forEach records each callback argument and incremental Map mutation',()=>{
  const source=`function solve(values) {
    const positions = new Map();
    values.forEach((value, index) => positions.set(value, index));
    return [...positions];
  }`;
  const steps=frames(source,[[9,3,7]]);
  const calls=steps.filter(step=>step.kind==='call'&&step.label==='forEach callback');
  assert.deepEqual(calls.map(step=>[step.state.value,step.state.index]),[[9,0],[3,1],[7,2]]);
  assert.deepEqual(calls.map(step=>step.fullHeap[step.state.positions.$ref].entries.length),[0,1,2]);
  const mutations=steps.filter(step=>step.kind==='operation'&&step.label==='positions.set(value, index)');
  assert.deepEqual(mutations.map(step=>step.fullHeap[step.state.positions.$ref].entries),[
    [[9,0]],[[9,0],[3,1]],[[9,0],[3,1],[7,2]],
  ]);
  assert.deepEqual(calls.map(step=>step.stack),Array(3).fill(['solve','forEach callback']));
  assert.deepEqual(steps.at(-1).stack,['solve']);
  assert.deepEqual(execute(source,{entry:'solve',args:[[9,3,7]]},0).result,execute(source,{entry:'solve',args:[[9,3,7]]},0,false).result);
});

test('map traces multiline concise callback returns at their original source spans',()=>{
  const source=`function solve(values) {
    const result = values.map((value, index) =>
      ({value, index}));
    return result;
  }`;
  const steps=frames(source,[[4,8]]);
  const calls=steps.filter(step=>step.kind==='call'&&step.label==='map callback');
  assert.deepEqual(calls.map(step=>step.lines),[[2,3],[2,3]]);
  assert.deepEqual(calls.map(step=>[step.state.value,step.state.index]),[[4,0],[8,1]]);
  const returns=steps.filter(step=>step.kind==='return'&&step.stack.at(-1)==='map callback');
  assert.deepEqual(returns.map(step=>step.lines),[[3],[3]]);
  assert.deepEqual(returns.map(step=>decoder(step.fullHeap)(step.value)),[{value:4,index:0},{value:8,index:1}]);
  for(const step of returns) assert.equal(step.label,source.slice(step.start,step.end));
  assert(!returns.some(step=>'result' in step.state),'Map result must not exist before the call finishes');
  assert.deepEqual(steps.at(-1).stack,['solve']);
});

test('reduce exposes every accumulator value before and after its callback',()=>{
  const source=`function solve(values) {
    return values.reduce((total, value, index) => total + value, 10);
  }`;
  const steps=frames(source,[[1,2,3]]);
  const calls=steps.filter(step=>step.kind==='call'&&step.label==='reduce callback');
  const returns=steps.filter(step=>step.kind==='return'&&step.stack.at(-1)==='reduce callback');
  assert.deepEqual(calls.map(step=>[step.state.total,step.state.value,step.state.index]),[[10,1,0],[11,2,1],[13,3,2]]);
  assert.deepEqual(returns.map(step=>step.value),[11,13,16]);
  assert.equal(steps.at(-1).value,16);
  assert.deepEqual(steps.at(-1).stack,['solve']);
  assert.equal(execute(source,{entry:'solve',args:[[1,2,3]]},0,false).result,16);
});

test('nested callbacks preserve lexical this, outer parameters, and restored call stacks',()=>{
  const source=`function solve(rows) {
    const context = {
      offset: 5,
      run(values) {
        return values.map((row, rowIndex) => row.map((value, columnIndex) =>
          this.offset + value + rowIndex + columnIndex));
      }
    };
    return context.run(rows);
  }`;
  const fixture={entry:'solve',args:[[[1,2],[3]]]};
  const steps=frames(source,fixture.args);
  const inner=steps.filter(step=>step.kind==='call'&&step.stack.length===4);
  assert.deepEqual(inner.map(step=>[step.state.value,step.state.rowIndex,step.state.columnIndex]),[[1,0,0],[2,0,1],[3,1,0]]);
  assert(inner.every(step=>step.fullHeap[step.state.this.$ref].fields.offset===5));
  assert(inner.every(step=>JSON.stringify(step.stack)===JSON.stringify(['solve','run','map callback','map callback'])));
  assert.deepEqual(steps.at(-1).stack,['solve']);
  assert.deepEqual(execute(source,fixture,0).result,[[6,8],[9]]);
  assert.deepEqual(execute(source,fixture,0).result,execute(source,fixture,0,false).result);
});

test('sorting comparators and parameterless allocation callbacks remain visible',()=>{
  const source=`function solve(values) {
    values.sort((a, b) => a - b);
    return values.map(() => []);
  }`;
  const steps=frames(source,[[3,1,2]]);
  const comparisons=steps.filter(step=>step.kind==='return'&&step.stack.at(-1)==='sort callback');
  assert(comparisons.length>0);
  for(const step of comparisons) assert.equal(step.value,step.state.a-step.state.b);
  const allocations=steps.filter(step=>step.kind==='return'&&step.stack.at(-1)==='map callback');
  assert.equal(allocations.length,3);
  assert.equal(new Set(allocations.map(step=>step.value.$ref)).size,3);
  assert.deepEqual(execute(source,{entry:'solve',args:[[3,1,2]]},0).result,[[],[],[]]);
});
