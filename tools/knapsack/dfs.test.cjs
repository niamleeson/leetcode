const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const test = require('node:test');
const vm = require('node:vm');
const slugs=['zero-one-knapsack','unbounded-knapsack','mixed-knapsack'];
const entries=Object.fromEntries(slugs.map(slug=>[slug,
  JSON.parse(readFileSync(path.resolve(__dirname,`../../src/data/knapsack/entries/${slug}.json`),'utf8')),
]));
function trace(slug,items,capacity) {
  const calls=[],events=[],stack=[];
  let maximumDepth=0;
  const original=entries[slug].solutions[0].code;
  const replacements=[
    ['function dfs(i, c) {','function dfs(i, c) { const callId = enter(i, c);'],
    ['if (i === items.length) return 0;','if (i === items.length) return leave(callId, 0);'],
    ['if (c < w) return skip;','if (c < w) return leave(callId, skip);'],
    ['return Math.max(skip, take);','return leave(callId, Math.max(skip, take));'],
  ];
  let code=original;
  for(const [find,replacement] of replacements) {
    assert.equal(code.split(find).length,2,`One instrumentation site: ${find}`);
    code=code.replace(find,replacement);
  }
  const answer=vm.runInNewContext(`${code}\nknapsack(items, capacity);`,{
    items,capacity,
    enter(i,c) {
      const call={id:calls.length+1,i,c,parent:stack.at(-1)?.id??null,children:[]};
      if(stack.length) stack.at(-1).children.push(call.id);
      calls.push(call);events.push({kind:'call',id:call.id,i,c});stack.push(call);
      maximumDepth=Math.max(maximumDepth,stack.length);
      return call.id;
    },
    leave(id,answer) {
      const call=stack.pop();assert.equal(call.id,id);call.answer=answer;
      events.push({kind:'return',id,answer});return answer;
    },
  },{timeout:2000});
  assert.equal(stack.length,0);assert.ok(calls.length>0);
  return {answer,calls,events,maximumDepth};
}
const cases=[];
for(const slug of slugs) {
  const items=slug==='mixed-knapsack'?[[2,3,false],[3,4,true]]:[[2,3],[3,4]];
  cases.push({slug,items,capacity:8,expected:slug==='zero-one-knapsack'?7:slug==='unbounded-knapsack'?12:11});
  cases.push({slug,items,capacity:0,expected:0});
  cases.push({slug,items:[],capacity:8,expected:0});
  cases.push({slug,items:slug==='mixed-knapsack'?[[9,100,true],[10,200,false]]:[[9,100],[10,200]],capacity:8,expected:0});
}
cases.push(
  {slug:'zero-one-knapsack',items:[[1,7]],capacity:5,expected:7},
  {slug:'unbounded-knapsack',items:[[1,7]],capacity:5,expected:35},
  {slug:'mixed-knapsack',items:[[1,7,true]],capacity:5,expected:35},
  {slug:'mixed-knapsack',items:[[1,7,false]],capacity:5,expected:7},
  {slug:'zero-one-knapsack',items:[[1,0],[1,0],[1,0]],capacity:3,expected:0},
  {slug:'unbounded-knapsack',items:[[1,0],[1,0]],capacity:3,expected:0},
  {slug:'mixed-knapsack',items:[[1,0,false],[1,0,true]],capacity:3,expected:0},
);
test('actual DFS calls skip first, control reuse by index, and return every branch value',()=>{
  for(const {slug,items,capacity,expected} of cases) {
    const result=trace(slug,items,capacity);assert.equal(result.answer,expected);
    for(const call of result.calls) {
      assert.ok(call.c>=0&&call.c<=capacity);
      if(call.i===items.length) {
        assert.deepEqual(call.children,[]);assert.equal(call.answer,0);continue;
      }
      const [w,v,unlimited]=items[call.i];
      const skip=result.calls[call.children[0]-1];
      assert.deepEqual([skip.i,skip.c],[call.i+1,call.c],'The first branch skips');
      if(call.c<w) {
        assert.equal(call.children.length,1);assert.equal(call.answer,skip.answer);continue;
      }
      assert.equal(call.children.length,2);
      const take=result.calls[call.children[1]-1];
      const reusable=slug==='unbounded-knapsack'||slug==='mixed-knapsack'&&unlimited;
      assert.deepEqual([take.i,take.c],[reusable?call.i:call.i+1,call.c-w]);
      assert.equal(call.answer,Math.max(skip.answer,v+take.answer));
    }
    const minimumWeight=items.length?Math.min(...items.map(item=>item[0])):1;
    const bound=slug==='zero-one-knapsack'?items.length+1:items.length+Math.floor(capacity/minimumWeight)+1;
    assert.ok(result.maximumDepth<=bound);
  }
});
test('plain DFS recomputes overlapping states and unlimited takes increase call depth',()=>{
  for(const slug of slugs) {
    const items=slug==='mixed-knapsack'?[[1,0,false],[1,0,true],[1,0,false]]:[[1,0],[1,0],[1,0]];
    const result=trace(slug,items,3);
    const states=result.calls.filter(c=>c.i<items.length).map(c=>`${c.i},${c.c}`);
    assert.ok(new Set(states).size<states.length,`${slug}: overlapping states are not memoized`);
  }
  assert.equal(trace('zero-one-knapsack',[[1,7]],5).maximumDepth,2);
  assert.equal(trace('unbounded-knapsack',[[1,7]],5).maximumDepth,7);
  assert.equal(trace('mixed-knapsack',[[1,7,true]],5).maximumDepth,7);
});
test('Python and JavaScript execute the same complete DFS call/return sequence',()=>{
  const python=[
    'import json, sys',
    'payload = json.load(sys.stdin)',
    'functions = {}',
    'for source in payload["sources"]:',
    '    namespace = {}',
    '    exec(source["code"], namespace)',
    '    functions[source["slug"]] = namespace["knapsack"]',
    'results = []',
    'for case in payload["cases"]:',
    '    stack, events = [], []',
    '    stats = {"count": 0}',
    '    def profile(frame, event, arg):',
    '        if frame.f_code.co_name != "dfs": return',
    '        if event == "call":',
    '            stats["count"] += 1',
    '            identifier = stats["count"]',
    '            stack.append(identifier)',
    '            events.append({"kind":"call", "id":identifier, "i":frame.f_locals["i"], "c":frame.f_locals["c"]})',
    '        elif event == "return":',
    '            events.append({"kind":"return", "id":stack.pop(), "answer":arg})',
    '    sys.setprofile(profile)',
    '    try:',
    '        answer = functions[case["slug"]](case["items"], case["capacity"])',
    '    finally:',
    '        sys.setprofile(None)',
    '    assert not stack',
    '    results.append({"answer":answer, "events":events})',
    'print(json.dumps(results))',
  ].join('\n');
  const result=spawnSync('python3',['-c',python],{
    input:JSON.stringify({sources:slugs.map(slug=>({slug,code:entries[slug].solutions[0].pythonCode})),cases}),
    encoding:'utf8',timeout:15000,maxBuffer:4*1024*1024,
  });
  assert.ifError(result.error);assert.equal(result.status,0,result.stderr);
  const actual=JSON.parse(result.stdout);assert.equal(actual.length,cases.length);
  actual.forEach((item,index)=>{
    const c=cases[index],expected=trace(c.slug,c.items,c.capacity);
    assert.equal(item.answer,c.expected);assert.deepEqual(item.events,expected.events);
  });
});
test('both language walkthroughs show every actual recursive call and return in execution order',()=>{
  for(const slug of slugs) {
    const items=slug==='mixed-knapsack'?[[2,3,false],[3,4,true]]:[[2,3],[3,4]];
    const result=trace(slug,items,8);
    for(const field of ['walkthrough','pythonWalkthrough']) {
      const actual=[];
      for(const text of entries[slug].solutions[0][field].split('\n')) {
        const call=text.match(/^\s*Call (\d+): dfs\((\d+), (\d+)\)/);
        const returned=text.match(/^\s*Return call (\d+): (\d+)/);
        if(call) actual.push({kind:'call',id:Number(call[1]),i:Number(call[2]),c:Number(call[3])});
        if(returned) actual.push({kind:'return',id:Number(returned[1]),answer:Number(returned[2])});
      }
      assert.deepEqual(actual,result.events,`${slug} ${field}: complete trace`);
      assert.ok(entries[slug].solutions[0][field].includes(`Return from knapsack: ${result.answer}`));
    }
  }
});
