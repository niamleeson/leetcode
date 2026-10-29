const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execute } = require('./runtime.cjs');

function frames(source,args) {
  const trace=execute(source,{entry:'solve',args},0);
  let heap={};
  return trace.steps.map(step=>{heap={...heap,...step.heap};return {...step,fullHeap:heap};});
}
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
test('false guards, short-circuit checks, loop exits and continue steps are retained',()=>{
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
  assert(steps.some(s=>s.kind==='check'&&s.label==='value > 0'&&s.value===false));
  assert.equal(steps.at(-1).value,2);
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
