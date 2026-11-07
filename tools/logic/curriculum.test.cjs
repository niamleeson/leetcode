const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const { problems, solutionMap } = require('../walkthroughs/load.cjs');
const curriculum = require('./guided-curriculum.json');
const audit = require('./guided-source-audit.json');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const merged = (id, language) => ({...curriculum.lessons[id], ...curriculum.lessons[id].languages?.[language]});

test('every one of the 250 problems has complete, distinct choices in both languages', () => {
  const ids = problems.map(p=>p.id).sort((a,b)=>a-b);
  assert.deepEqual(Object.keys(curriculum.lessons).map(Number).sort((a,b)=>a-b), ids);
  const catalog = new Map(curriculum.patterns.map(p=>[p.id,p]));
  for (const problem of problems) for (const language of ['python','javascript']) {
    const lesson = merged(problem.id,language);
    assert.equal(lesson.id,problem.id);
    assert.equal(lesson.title,problem.title);
    assert(catalog.has(lesson.patternId));
    for (const [name,count] of [['patternQuestion',8],['structureQuestion',4]]) {
      const question = lesson[name];
      assert(question.prompt.length > 20);
      assert.equal(question.options.length,count,`${problem.id} ${language} ${name}`);
      assert.equal(new Set(question.options.map(o=>o.id)).size,count);
      assert.equal(new Set(question.options.map(o=>o.label)).size,count);
      assert.equal(question.options.filter(o=>o.id===question.correctId).length,1);
      for(const option of question.options) {
        assert(option.label.length>=5 && option.label.length<=400);
        assert(option.feedback.length>20);
      }
    }
    assert.equal(lesson.patternQuestion.correctId,lesson.patternId);
  }
});

test('audited Python and JavaScript hashes match all 500 current source bodies', () => {
  for (const problem of problems) {
    for (const [language,key] of [['python','code'],['javascript','jsCode']]) {
      const actual = digest(solutionMap[problem.id][key]);
      assert.equal(audit.sources[problem.id][language],actual);
      assert.equal(curriculum.lessons[problem.id].sourceHashes[language],actual);
    }
  }
});

test('pattern feedback never reveals the next structure answer', () => {
  for(const id of Object.keys(curriculum.lessons)) for(const language of ['python','javascript']) {
    const lesson=merged(id,language);
    const plan=lesson.structureQuestion.options.find(o=>o.id===lesson.structureQuestion.correctId).label;
    for(const option of lesson.patternQuestion.options) {
      assert(!option.feedback.includes(plan),`${id} ${language}: complete plan leaked`);
      assert(!option.feedback.includes('Here, the plan is:'),`${id} ${language}: leaked plan marker`);
    }
    assert.notEqual(lesson.patternRationale,plan);
  }
});

test('source-specific patterns override misleading topic categories', () => {
  const expected={658:'binary-search',300:'binary-search',912:'heap',215:'quickselect',621:'math',1094:'prefix',2707:'dp',5:'center',647:'center',684:'bfs',721:'bfs',2709:'bfs',1584:'mst',1489:'mst',1871:'window'};
  for(const [id,pattern] of Object.entries(expected)) {
    assert.equal(merged(id,'python').patternId,pattern);
    assert.equal(merged(id,'javascript').patternId,pattern);
  }
  assert.equal(merged(355,'python').patternId,'heap');
  assert.equal(merged(355,'javascript').patternId,'priority-sort');
  assert.equal(merged(767,'python').patternId,'heap');
  assert.equal(merged(767,'javascript').patternId,'priority-sort');
});

test('all languages have their own organization outline while eight algorithm plans differ', () => {
  assert.equal(Object.values(curriculum.lessons).filter(l=>l.languages?.javascript).length,250);
  assert.deepEqual(curriculum.algorithmPlanOverrides,[84,190,242,355,371,767,1929,3133]);
  const correct=(id,language)=>{const q=merged(id,language).structureQuestion;return q.options.find(o=>o.id===q.correctId).label;};
  assert.match(correct(1929,'python'),/Concatenate/);
  assert.match(correct(1929,'javascript'),/Copy each original value/);
  assert.match(correct(705,'python'),/bucket/);
  assert.match(correct(705,'javascript'),/bucket/);
  assert.match(correct(242,'python'),/both strings/);
  assert.match(correct(242,'javascript'),/consume those counts/);
  assert.match(correct(84,'javascript'),/earliest possible left edge/);
  assert.match(correct(371,'javascript'),/coercion/);
  assert.match(correct(3133,'javascript'),/BigInt/);
});

test('structure questions conceal completed outlines until the correct answer', () => {
  for (const id of Object.keys(curriculum.lessons)) for (const language of ['python','javascript']) {
    const question=merged(id,language).structureQuestion;
    const correct=question.options.find(option=>option.id===question.correctId);
    assert(correct.feedbackCode?.length>10,`${id} ${language}: missing completed outline`);
    assert(correct.feedbackCode.split('\n').length<=14,`${id} ${language}: organization outline is too long for the question flow`);
    assert(!/[<>=+*%]|\b(?:true|false|True|False|null|None)\b/.test(correct.feedbackCode),`${id} ${language}: an exact expression leaked into the organization outline`);
    for(const option of question.options.filter(option=>option.id!==question.correctId)) assert(!option.feedbackCode,`${id}: wrong choice reveals the correct outline`);
    if(Number(id)===739) {
      assert(!question.context);
      assert(question.options.every(option=>option.code?.split('\n').length===7));
    } else {
      assert.match(question.context,/\[Choose the body organization below\.\]/);
      assert.equal(question.context.split('\n').length,2);
      assert(question.context.split('\n')[0].endsWith(':'));
      assert(!/\b(?:if|while|for|return)\b/.test(question.context),`${id}: completed control flow leaked before choosing a plan`);
      assert(question.options.every(option=>!option.code),`${id}: mixed prose/code choices give away the answer`);
    }
  }
});

test('organization outlines use the public entry rather than an unrelated helper class', () => {
  const fixtures=require('../walkthroughs/fixtures.json');
  for(const problem of problems) for(const language of ['python','javascript']) {
    const fixture=fixtures[problem.id][0],question=merged(problem.id,language).structureQuestion;
    const correct=question.options.find(option=>option.id===question.correctId);
    if(problem.id!==739) assert(question.context.startsWith('operation '+fixture.entry+':') || question.context.startsWith('class '+fixture.entry+':'),`${problem.id} ${language}: wrong public interface`);
    for(const operation of fixture.operations || []) {
      assert(correct.feedbackCode.includes(operation[0]+':'),`${problem.id} ${language}: missing public operation ${operation[0]}`);
    }
  }
});

test('Daily Temperatures outlines cover resolving, recording, remembering, and final return', () => {
  for(const language of ['python','javascript']) {
    const question=merged(739,language).structureQuestion;
    const correct=question.options.find(option=>option.id===question.correctId).code;
    assert.match(correct,/\n  while today resolves/);
    assert.match(correct,/remove that pending day\n    record its waiting distance\n  add today's index/);
    assert.match(correct,/\nreturn all waits after the scan$/);
    const wrong=new Map(question.options.filter(option=>option.id!==question.correctId).map(option=>[option.id,option]));
    assert.match(wrong.get('outline-resolve-once').code,/\n  if today resolves/);
    assert.match(wrong.get('outline-push-first').code,/add today's index.*\n  while/);
    assert.match(wrong.get('outline-return-early').code,/\n  return all waits now$/);
  }
});

test('Daily Temperatures structure feedback describes actual failures in both source languages', () => {
  const source=solutionMap[739];
  const oracle=temperatures=>temperatures.map((temperature,index)=>{
    for(let future=index+1;future<temperatures.length;future++) if(temperatures[future]>temperature) return future-index;
    return 0;
  });
  const cases={once:[73,72,74],'push-first':[73,74],'return-early':[73,74]};
  const actualByVariant={once:[0,1,0],'push-first':[0,0],'return-early':[0,0]};
  const javascript={
    once:source.jsCode.replace('while (stack.length','if (stack.length'),
    'push-first':source.jsCode.replace('        stack.push(i);','').replace('    for (let i = 0; i < n; i++) {','    for (let i = 0; i < n; i++) {\n        stack.push(i);'),
    'return-early':source.jsCode.replace('        stack.push(i);','        stack.push(i);\n        return result;'),
  };
  for(const [variant,code] of Object.entries(javascript)) {
    assert.notEqual(code,source.jsCode);
    const actual=JSON.parse(JSON.stringify(vm.runInNewContext(code+'; dailyTemperatures('+JSON.stringify(cases[variant])+')',{}, {timeout:1000})));
    assert.deepEqual(actual,actualByVariant[variant]);
    assert.notDeepEqual(actual,oracle(cases[variant]));
  }
  const python=spawnSync('python3',['-c',String.raw`
import json,sys
source=json.load(sys.stdin)
variants={
    'once':source.replace('while stack and','if stack and'),
    'push-first':source.replace('        stack.append(i)\n','').replace('    for i in range(n):\n','    for i in range(n):\n        stack.append(i)\n'),
    'return-early':source.replace('        stack.append(i)','        stack.append(i)\n        return result'),
}
output={}
for variant,code in variants.items():
    assert code!=source
    namespace={}
    exec(code,namespace)
    output[variant]=namespace['dailyTemperatures']([73,72,74] if variant=='once' else [73,74])
print(json.dumps(output))
`],{input:JSON.stringify(source.code),encoding:'utf8',timeout:2000});
  assert.equal(python.status,0,python.stderr);
  const actual=JSON.parse(python.stdout);
  assert.deepEqual(actual,actualByVariant);
  for(const [variant,result] of Object.entries(actual)) assert.notDeepEqual(result,oracle(cases[variant]));
});

test('known equivalent alternatives are not falsely labeled as broken plans', () => {
  const labels=id=>curriculum.lessons[id].structureQuestion.options.map(o=>o.label).join('\n');
  assert(!labels(268).includes('Use expected values from one through n only'));
  assert.match(labels(268),/zero through n minus one/);
  assert(!labels(13).includes('Read symbols from right to left but keep the same next-character test'));
  assert(!labels(230).includes('kth distinct numeric value'));
});

test('generator output is deterministic and all current authored metadata is published', () => {
  const result=spawnSync(process.execPath,[path.join(__dirname,'generate-curriculum.cjs'),'--check'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);
});
