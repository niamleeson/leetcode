const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const { problems, solutionMap } = require('../walkthroughs/load.cjs');
const curriculum = require('./guided-curriculum.json');
const audit = require('./guided-source-audit.json');
const { loadStructureSteps, validateStep } = require('./guided-structure.cjs');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const merged = (id, language) => ({...curriculum.lessons[id], ...curriculum.lessons[id].languages?.[language]});
const answer = question => question.options.find(option=>option.id===question.correctId).label;

// Scope and shape checks are deliberately exhaustive: a clear Daily Temperatures
// override must not conceal full-plan cards or missing lessons elsewhere.
test('all250 problems have eight approaches followed by authored small structure decisions in both languages', () => {
  const ids = problems.map(p=>p.id).sort((a,b)=>a-b);
  assert.deepEqual(Object.keys(curriculum.lessons).map(Number).sort((a,b)=>a-b), ids);
  const bank = loadStructureSteps(ids);
  const patternIds = new Set(curriculum.patterns.map(p=>p.id));
  for (const problem of problems) for (const language of ['python','javascript']) {
    const lesson = merged(problem.id,language);
    assert.equal(lesson.id,problem.id);
    assert(patternIds.has(lesson.patternId));
    assert.equal(lesson.patternQuestion.options.length,8);
    assert.equal(lesson.patternQuestion.correctId,lesson.patternId);
    const expected = language==='javascript' ? bank.javascript[problem.id] || bank.base[problem.id] : bank.base[problem.id];
    assert.equal(lesson.structureQuestions.length,expected.length);
    assert(lesson.structureQuestions.length>=1 && lesson.structureQuestions.length<=4);
    assert(!lesson.structureQuestion, `${problem.id}: old full-plan question remains`);
    for (let index=0;index<expected.length;index++) {
      const question=lesson.structureQuestions[index],step=expected[index];
      assert.equal(question.id,step.id);
      assert.equal(question.prompt,step.prompt);
      assert.equal(answer(question),step.correct);
      assert.equal(question.options.length,1+step.wrong.length);
    }
  }
});

test('no structure card or feedback contains a complete outline or code dump', () => {
  for(const problem of problems) for(const language of ['python','javascript']) {
    const lesson=merged(problem.id,language);
    const all=[lesson.patternQuestion,...lesson.structureQuestions];
    for(const question of all) {
      assert.equal(new Set(question.options.map(o=>o.id)).size,question.options.length);
      assert.equal(new Set(question.options.map(o=>o.label)).size,question.options.length);
      assert.equal(question.options.filter(o=>o.id===question.correctId).length,1);
      if(question===lesson.patternQuestion) continue;
      assert(!question.context && !question.code && !question.feedbackCode);
      assert(question.prompt.length<=160);
      for(const option of question.options) {
        assert(!option.code && !option.feedbackCode);
        assert(!/[\n\r]/.test(option.label+option.feedback));
        assert(option.label.length<=180 && option.feedback.length<=260);
        assert(!/resolves the last pending|continuation test holds|prepare or update working state|apply operations or helper calls|globally useful invariant/.test(option.label+option.feedback));
      }
    }
  }
});

test('future structure answers are not dumped into earlier feedback', () => {
  for(const problem of problems) for(const language of ['python','javascript']) {
    const lesson=merged(problem.id,language);
    for(const option of lesson.patternQuestion.options) for(const later of lesson.structureQuestions) {
      assert(!option.feedback.includes(answer(later)), `${problem.id} ${language}: structure answer leaked in approach feedback`);
    }
    lesson.structureQuestions.forEach((question,index)=>{
      for(const option of question.options) for(const later of lesson.structureQuestions.slice(index+1)) {
        assert(!option.feedback.includes(answer(later)), `${problem.id} ${language}: future decision leaked in ${question.id}`);
      }
    });
  }
});

test('authored structure validator rejects outlines, single-option endings, and repeated choices', () => {
  const valid={id:'timing',prompt:'When should this number be stored?',correct:'After looking for its partner.',wrong:['Before looking for its partner.','Only at the end of the input.'],explanation:'Checking first prevents using the same position twice.'};
  assert.doesNotThrow(()=>validateStep(valid,1));
  assert.throws(()=>validateStep({...valid,correct:'Prepare a map.\nScan values.\nReturn indices.'},1),/outline/);
  assert.throws(()=>validateStep({...valid,wrong:[]},1),/alternatives/);
  assert.throws(()=>validateStep({...valid,wrong:[valid.correct,valid.wrong[1]]},1),/repeated choices/);
  assert.throws(()=>validateStep({...valid,feedbackCode:'full plan'},1),/whole structure/);
});

test('audited hashes still match all500 canonical source bodies', () => {
  for(const problem of problems) for(const [language,key] of [['python','code'],['javascript','jsCode']]) {
    const actual=digest(solutionMap[problem.id][key]);
    assert.equal(audit.sources[problem.id][language],actual);
    assert.equal(curriculum.lessons[problem.id].sourceHashes[language],actual);
  }
});

test('all eight language-specific algorithms retain their own concrete planning decisions', () => {
  assert.deepEqual(curriculum.algorithmPlanOverrides,[84,190,242,355,371,767,1929,3133]);
  const labels=(id,language)=>merged(id,language).structureQuestions.map(answer).join('\n');
  for(const id of curriculum.algorithmPlanOverrides) assert.notEqual(labels(id,'python'),labels(id,'javascript'));
  assert.match(labels(1929,'javascript'),/output positions i and i plus n/);
  assert.match(labels(242,'javascript'),/characters in the first string/);
  assert.match(labels(84,'javascript'),/earliest possible left index/);
  assert.match(labels(355,'javascript'),/Sort the current candidates by time/);
  assert.match(labels(767,'javascript'),/Sort by remaining count/);
  assert.match(labels(371,'javascript'),/signed 32-bit conversion/);
  assert.match(labels(190,'javascript'),/unsigned right shifts/);
  assert.match(labels(3133,'javascript'),/BigInt/);
});

test('source-specific pattern choices remain distinct from broad topic categories', () => {
  const expected={658:'binary-search',300:'binary-search',912:'heap',215:'quickselect',621:'math',1094:'prefix',2707:'dp',5:'center',647:'center',684:'bfs',721:'bfs',2709:'bfs',1584:'mst',1489:'mst',1871:'window'};
  for(const [id,pattern] of Object.entries(expected)) for(const language of ['python','javascript']) assert.equal(merged(id,language).patternId,pattern);
  assert.equal(merged(355,'python').patternId,'heap');
  assert.equal(merged(355,'javascript').patternId,'priority-sort');
  assert.equal(merged(767,'javascript').patternId,'priority-sort');
});

test('Daily Temperatures asks four separate concrete decisions without exposing a whole plan', () => {
  for(const language of ['python','javascript']) {
    const questions=merged(739,language).structureQuestions;
    assert.deepEqual(questions.map(q=>q.id),['remember','repeat','push','finish']);
    assert.match(answer(questions[0]),/day indices/);
    assert.match(answer(questions[1]),/nonempty.*higher than the temperature of the day at its top/);
    assert.match(answer(questions[2]),/^After comparing today/);
    assert.match(answer(questions[3]),/After visiting every day/);
    for(const question of questions) {
      assert.equal(question.options.length,3);
      assert(question.options.every(option=>!option.code && !option.feedbackCode));
      assert(!question.context);
    }
    assert(questions[1].options.some(option=>/equal to/.test(option.label)));
    assert(questions[1].options.some(option=>/At most once/.test(option.label)));
    assert(questions[2].options.some(option=>/^Before comparing/.test(option.label)));
    assert(questions[3].options.some(option=>/After visiting the first day/.test(option.label)));
  }
});

test('Daily structure alternatives correspond to actual control-flow failures in both languages', () => {
  const source=solutionMap[739];
  const cases={once:[73,72,74],'push-first':[73,74],'return-early':[73,74],equal:[70,70,71]};
  const wrong={once:[0,1,0],'push-first':[0,0],'return-early':[0,0],equal:[1,1,0]};
  const oracle=temperatures=>temperatures.map((temperature,index)=>{
    for(let next=index+1;next<temperatures.length;next++) if(temperatures[next]>temperature) return next-index;
    return 0;
  });
  const variants={
    once:source.jsCode.replace('while (stack.length','if (stack.length'),
    'push-first':source.jsCode.replace('        stack.push(i);','').replace('    for (let i = 0; i < n; i++) {','    for (let i = 0; i < n; i++) {\n        stack.push(i);'),
    'return-early':source.jsCode.replace('        stack.push(i);','        stack.push(i);\n        return result;'),
    equal:source.jsCode.replace('currentTemp > temperatures[','currentTemp >= temperatures['),
  };
  for(const [name,code] of Object.entries(variants)) {
    assert.notEqual(code,source.jsCode);
    const actual=JSON.parse(JSON.stringify(vm.runInNewContext(code+'; dailyTemperatures('+JSON.stringify(cases[name])+')',{}, {timeout:1000})));
    assert.deepEqual(actual,wrong[name]);
    assert.notDeepEqual(actual,oracle(cases[name]));
  }
  const python=spawnSync('python3',['-c',String.raw`
import json,sys
source=json.load(sys.stdin)
variants={
    'once':source.replace('while stack and','if stack and'),
    'push-first':source.replace('        stack.append(i)\n','').replace('    for i in range(n):\n','    for i in range(n):\n        stack.append(i)\n'),
    'return-early':source.replace('        stack.append(i)','        stack.append(i)\n        return result'),
    'equal':source.replace('temperatures[i] > temperatures[','temperatures[i] >= temperatures['),
}
cases={'once':[73,72,74],'push-first':[73,74],'return-early':[73,74],'equal':[70,70,71]}
result={}
for name,code in variants.items():
    assert code!=source
    namespace={}
    exec(code,namespace)
    result[name]=namespace['dailyTemperatures'](cases[name])
print(json.dumps(result))
`],{input:JSON.stringify(source.code),encoding:'utf8',timeout:3000});
  assert.equal(python.status,0,python.stderr);
  assert.deepEqual(JSON.parse(python.stdout),wrong);
});

test('generation is deterministic and every reviewed card is published', () => {
  const result=spawnSync(process.execPath,[path.join(__dirname,'generate-curriculum.cjs'),'--check'],{encoding:'utf8',timeout:10000});
  assert.equal(result.status,0,result.stdout+result.stderr);
});
