const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {auditDocument,javascriptInventory}=require('./check-guided-coverage.cjs');
const source=`function solve(values) {
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total;
}`;
function lesson(text=source,line=2,endLine=6) {
  const code=text.split('\n').slice(line-1,endLine).join('\n');
  const result={id:999999,entry:'solve',language:'javascript',source:text,sourceHash:crypto.createHash('sha256').update(text).digest('hex'),questions:[
    {id:'pattern',stage:'pattern',choices:[]},{id:'structure',stage:'structure',choices:[]},
    {id:'body',stage:'implementation',line,endLine,choices:[
      {id:'correct',correct:true,code},{id:'subtract',correct:false,code:code.replace('total += value','total -= value')},{id:'empty',correct:false,code:code.replace('return total','return 0')},
    ]},
  ]};
  const inventory=javascriptInventory(result);
  result.coverage={requiredLines:inventory.requiredLines,coveredLines:inventory.requiredLines.filter(value=>line<=value&&value<=endLine),terminalLines:inventory.terminalLines};
  return result;
}
function check(document) {return auditDocument(document,javascriptInventory(document),document.source);}

test('independent replay accepts complete grouped decisions and ignores signature/punctuation lines',()=>{
  const document=lesson(),inventory=javascriptInventory(document),report=check(document);
  assert.deepEqual(inventory.requiredLines,[2,3,4,6]);
  assert.deepEqual(report.issues,[]);
  assert.equal(report.physicallyIncludedLines,4);
  assert.equal(report.activelyContrastedLines,2);
});

test('multiple structure decisions must form one block before the full implementation',()=>{
  const document=lesson();
  document.questions.splice(2,0,{id:'structure-loop',stage:'structure',choices:[]},{id:'structure-finish',stage:'structure',choices:[]});
  assert.deepEqual(check(document).issues,[]);
  const misplaced=structuredClone(document);
  misplaced.questions.push(misplaced.questions.splice(2,1)[0]);
  assert(check(misplaced).issues.some(issue=>issue.kind==='stage-order'));
  const missing=structuredClone(document);
  missing.questions=missing.questions.filter(question=>question.stage!=='structure');
  assert(check(missing).issues.some(issue=>issue.kind==='stage-order'));
});

test('the audit rejects a covered but never contrasted final return',()=>{
  const document=lesson();
  document.questions[2].choices[2].code=document.questions[2].choices[0].code.replace('total = 0','total = 1');
  const report=check(document);
  assert(report.issues.some(issue=>issue.kind==='unasked-terminal-operations'));
});

test('the audit rejects identical code choices even when whitespace differs',()=>{
  const document=lesson();
  document.questions[2].choices[1].code=document.questions[2].choices[0].code.replace('total += value','total+=value');
  assert(check(document).issues.some(issue=>issue.kind==='duplicate-choice-ast'));
});

test('replay catches false source ranges and invented coverage claims',()=>{
  const document=lesson();
  document.questions[2].choices[0].code=document.questions[2].choices[0].code.replace('total = 0','total = 9');
  document.questions[2].coveredLines=[99];
  document.questions[2].decisionLines=[1];
  document.coverage.coveredLines.push(99);
  const kinds=new Set(check(document).issues.map(issue=>issue.kind));
  for(const kind of ['correct-code-replay','false-covered-line','false-decision-line','false-global-covered-line','invalid-coverage-line']) assert(kinds.has(kind),kind);
});

test('punctuation and an unchanged declared operation cannot stand in for terminal decisions',()=>{
  const document=lesson();
  document.coverage.terminalLines.push(5,3);
  const kinds=new Set(check(document).issues.map(issue=>issue.kind));
  assert(kinds.has('nonexecutable-terminal-line'));
  assert(kinds.has('uncontrasted-declared-terminal'));
});

test('supplied helper operations are explicit exemptions, never silently counted as quiz coverage',()=>{
  const document=lesson('function suppliedHelper() {\n  return 7;\n}\n'+source,5,9);
  assert(check(document).issues.some(issue=>issue.kind==='uncovered-executable-lines'));
  document.coverage.contextOnly=[{line:1,endLine:3,reason:'This named helper is supplied infrastructure rather than an algorithm decision.'}];
  const report=check(document);
  assert.deepEqual(report.issues,[]);
  assert.equal(report.sourceExecutableLines,5);
  assert.equal(report.physicallyIncludedLines,4);
  assert.equal(report.suppliedOrDefensiveLines,1);
  assert.equal(report.exemptions[0].physicallyIncluded,false);
});

test('a defensive claim cannot conceal an undisplayed public return',()=>{
  const document=lesson(source,2,4);
  document.questions[2].choices[2].code=document.questions[2].choices[0].code.replace('total = 0','total = 1');
  document.coverage.contextOnly=[{line:6,endLine:6,reason:'Defensive fallback asserted by the author.'}];
  assert(check(document).issues.some(issue=>issue.kind==='undisplayed-primary-exemption'));
});

test('an expression callback is checked as part of its enclosing allocation operation',()=>{
  const code=`function solve() {
  const items = new Array(2)
    .fill(0)
    .map(() => new Set());
  return items;
}`;
  const document=lesson(code,2,5);
  document.questions[2].choices[1].code=document.questions[2].choices[0].code.replace('new Array(2)','new Array(1)');
  document.questions[2].choices[2].code=document.questions[2].choices[0].code.replace('return items','return []');
  document.questions[2].choices.push({id:'initial-set',correct:false,code:document.questions[2].choices[0].code.replace('new Set()','new Set([0])')});
  assert.deepEqual(check(document).issues,[]);
});

for(const language of ['python','javascript']) test(`${language}: a bare return requires its own direct guard mutation, never an unrelated condition`,()=>{
  const text=language==='python'?`def solve(values):
    if len(values) == 0:
        return
    if values[0] > 0:
        values.append(7)
`:`function solve(values) {
  if (values.length === 0) {
    return;
  }
  if (values[0] > 0) {
    values.push(7);
  }
}`;
  const endLine=language==='python'?5:7;
  const code=text.split('\n').slice(1,endLine).join('\n');
  const witness={fixtureIndex:0,name:'A positive value requires an update',input:[[1]],expected:[1,7],actual:[1]};
  const document={id:999999,entry:'solve',language,source:text,sourceHash:crypto.createHash('sha256').update(text).digest('hex'),questions:[
    {id:'pattern',stage:'pattern',choices:[]},{id:'structure',stage:'structure',choices:[]},
    {id:'body',stage:'implementation',line:2,endLine,guardedReturns:[{line:3,guardLine:2,choiceId:'guard'}],choices:[
      {id:'correct',correct:true,code},
      {id:'guard',correct:false,code:code.replace(language==='python'?'len(values) == 0':'values.length === 0',language==='python'?'len(values) >= 0':'values.length >= 0'),witness},
      {id:'unrelated',correct:false,code:code.replace('values[0] > 0','values[0] < 0'),witness},
      {id:'update',correct:false,code:code.replace(language==='python'?'values.append(7)':'values.push(7)',language==='python'?'values.append(8)':'values.push(8)'),witness:{...witness,actual:[1,8]}},
    ]},
  ]};
  let inventory;
  if(language==='javascript') inventory=javascriptInventory(document);
  else {
    const result=spawnSync('python3',[path.join(__dirname,'guided-coverage-python.py')],{input:JSON.stringify([document]),encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    inventory=JSON.parse(result.stdout)[document.id];
  }
  document.coverage={requiredLines:inventory.requiredLines,coveredLines:inventory.requiredLines,terminalLines:inventory.terminalLines};
  const valid=auditDocument(document,inventory,text);
  assert.deepEqual(valid.issues,[]);
  assert.deepEqual(valid.guardedReturnLines,[3]);
  document.questions[2].guardedReturns[0].choiceId='unrelated';
  const invalid=auditDocument(document,inventory,text);
  assert(invalid.issues.some(issue=>issue.kind==='invalid-guarded-return-decision'));
  assert(invalid.issues.some(issue=>issue.kind==='unasked-terminal-operations'));
});

test('standard memoization setup can be supplied, while the cached helper body must stay covered',()=>{
  const text=`from functools import lru_cache
def solve(n):
    @lru_cache(maxsize=None)
    def cached(x):
        return x
    return cached(n)
`;
  const code=text.split('\n').slice(4,6).join('\n');
  const document={id:999999,entry:'solve',language:'python',source:text,sourceHash:crypto.createHash('sha256').update(text).digest('hex'),questions:[
    {id:'pattern',stage:'pattern',choices:[]},{id:'structure',stage:'structure',choices:[]},
    {id:'body',stage:'implementation',line:5,endLine:6,choices:[
      {id:'correct',correct:true,code},
      {id:'helper',correct:false,code:code.replace('return x','return x + 1')},
      {id:'result',correct:false,code:code.replace('return cached(n)','return cached(n) + 1')},
    ]},
  ]};
  const result=spawnSync('python3',[path.join(__dirname,'guided-coverage-python.py')],{input:JSON.stringify([document]),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const inventory=JSON.parse(result.stdout)[document.id];
  document.coverage={requiredLines:inventory.requiredLines,coveredLines:[5,6],terminalLines:inventory.terminalLines,contextOnly:[{line:3,endLine:3,reason:'Supplied memoization setup changes time and space complexity; the recurrence remains quizzed.'}]};
  const valid=auditDocument(document,inventory,text);
  assert.deepEqual(valid.issues,[]);
  assert.equal(valid.exemptions[0].suppliedDefinitions[0].name,'functools.lru_cache');
  document.questions[2].line=6;
  document.coverage.contextOnly[0].endLine=5;
  const invalid=auditDocument(document,inventory,text);
  assert(invalid.issues.some(issue=>issue.kind==='undisplayed-primary-exemption'));
});
