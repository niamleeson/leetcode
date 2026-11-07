const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
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

test('eight implementation differences have explicit JavaScript structure overrides', () => {
  const overrides=Object.values(curriculum.lessons).filter(l=>l.languages?.javascript).map(l=>l.id).sort((a,b)=>a-b);
  assert.deepEqual(overrides,[84,190,242,355,371,767,1929,3133]);
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
