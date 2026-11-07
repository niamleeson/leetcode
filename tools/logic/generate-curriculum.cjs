const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { problems, solutionMap } = require('../walkthroughs/load.cjs');
const base = __dirname;
const read = name => fs.readFileSync(path.join(base, name), 'utf8');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const patterns = JSON.parse(read('guided-patterns.json'));
const patternById = new Map(patterns.map(pattern => [pattern.id, pattern]));
const audit = JSON.parse(read('guided-source-audit.json'));
function rows(name, width) {
  const entries = read(name).trim().split('\n').map((line, index) => {
    const columns = line.split('\t');
    assert.equal(columns.length, width, `${name}:${index + 1}`);
    return [Number(columns[0]), columns.slice(1)];
  });
  assert.equal(new Set(entries.map(([id]) => id)).size, entries.length, `Duplicate IDs in ${name}`);
  return new Map(entries);
}
const plans = rows('guided-plans.tsv', 3);
const mistakes = rows('guided-distractors.tsv', 4);
const javascriptPlans = rows('guided-javascript-plans.tsv', 3);
const ids = new Set(problems.map(problem => problem.id));
assert.equal(ids.size, 250);
for (const [name, map] of [['plans', plans], ['mistakes', mistakes]]) {
  assert.deepEqual([...map.keys()].sort((a,b)=>a-b), [...ids].sort((a,b)=>a-b), `Exact 250 coverage: ${name}`);
}
for (const id of javascriptPlans.keys()) assert(ids.has(id), `Unexpected JavaScript override ${id}`);
const neighborhoods = [
  ['scan','hash','two-pointers','window','prefix','binary-search','greedy','dp','stack','index-placement','voting','math','bits','monotonic','heap','priority-sort','quickselect'],
  ['stack','monotonic','queue','heap','hash','two-pointers','window','greedy','dp','scan','priority-sort'],
  ['linked-list','fast-slow','two-pointers','hash','stack','heap','divide-conquer','cache','queue','scan'],
  ['dfs','bfs','bst','divide-conquer','dp','stack','backtracking','hash'],
  ['bfs','dfs','topological','shortest-path','mst','union-find','euler','dp','greedy','heap','hash'],
  ['backtracking','dp','trie','dfs','hash','greedy','two-pointers','window','center','divide-conquer'],
  ['math','bits','dp','greedy','scan','prefix','binary-search','voting','hash','fast-slow'],
  ['intervals','heap','priority-sort','greedy','scan','two-pointers','binary-search','prefix','window','dp'],
];
const family = {
  scan:0,hash:0,'two-pointers':0,window:0,'binary-search':0,prefix:0,voting:0,'index-placement':0,quickselect:0,
  stack:1,monotonic:1,queue:1,heap:1,'priority-sort':1,
  'linked-list':2,'fast-slow':2,cache:2,
  dfs:3,bst:3,'divide-conquer':3,
  bfs:4,topological:4,'shortest-path':4,mst:4,euler:4,
  backtracking:5,trie:5,dp:5,center:5,greedy:0,math:6,bits:6,intervals:7,
};
function shuffled(items, seed) {
  return items.map(item => ({item, key:hash(`${seed}:${item.id}`)})).sort((a,b)=>a.key.localeCompare(b.key)).map(x=>x.item);
}
function meta(problem, language, selectedPlan, override = false) {
  const [patternId, plan] = selectedPlan;
  assert(patternById.has(patternId), `Unknown pattern ${patternId}`);
  assert(plan.length > 35 && plan.length <= 400, `Plan length ${problem.id}: ${plan.length}`);
  const correctPattern = patternById.get(patternId);
  // Explicitly authored algorithm families; never infer correctness from topic tags.
  const pool = neighborhoods[family[patternId]].filter(id => id !== patternId);
  const peers = shuffled(pool.map(id=>patternById.get(id)), `${problem.id}:peers:${patternId}`).slice(0,7);
  const options = shuffled([correctPattern,...peers].map(pattern => ({
    id:pattern.id,label:pattern.label,
    feedback: pattern.id === patternId
      ? `Correct. ${correctPattern.summary}`
      : `Not the approach practiced here. The selected pattern works this way: ${correctPattern.summary}`,
  })), `${problem.id}:patterns:${patternId}`);
  const correctPlanId = `plan-${hash(plan).slice(0,12)}`;
  const structureOptions = [{id:correctPlanId,label:plan,feedback:`That matches the selected approach. ${plan}`}];
  for (const mistake of mistakes.get(problem.id)) {
    const [label, feedback, ...extra] = mistake.split('~');
    assert(!extra.length && label?.length > 15 && feedback?.length > 20, `Invalid misconception ${problem.id}`);
    assert(label.length <= 300 && feedback.length <= 350, `Overlong misconception ${problem.id}`);
    structureOptions.push({id:`plan-${hash(label).slice(0,12)}`,label,feedback});
  }
  assert.equal(new Set(structureOptions.map(option=>option.label)).size,4);
  return {
    patternId,
    patternRationale:correctPattern.summary,
    patternQuestion:{
      prompt:'Which main pattern should guide this worked solution?',
      options,correctId:patternId,
    },
    structureQuestion:{
      prompt:`Which overall plan matches the ${correctPattern.label.toLowerCase()} approach for ${problem.title}?`,
      options:shuffled(structureOptions,`${problem.id}:structure:${language}`),correctId:correctPlanId,
    },
  };
}
const lessons = {};
for (const problem of problems) {
  const solution = solutionMap[problem.id];
  const reviewed = audit.sources[problem.id];
  assert(reviewed && reviewed.title === problem.title, `Title/source audit missing for ${problem.id}`);
  const sourceHashes = {python:hash(solution.code),javascript:hash(solution.jsCode)};
  for (const language of ['python','javascript']) {
    assert.equal(sourceHashes[language],reviewed[language], `Source changed for ${problem.id} ${language}; review its plan and distractors before updating the audit hash`);
  }
  const lesson = {id:problem.id,title:problem.title,sourceHashes,...meta(problem,'python',plans.get(problem.id))};
  if(javascriptPlans.has(problem.id)) lesson.languages={javascript:meta(problem,'javascript',javascriptPlans.get(problem.id),true)};
  lessons[problem.id] = lesson;
}
const output={version:1,scope:'NeetCode 250',approachNotice:'Follow one worked approach; other approaches can also be valid.',patterns,lessons};
const serialized=JSON.stringify(output,null,2)+'\n';
const target=path.join(base,'guided-curriculum.json');
if(process.argv.includes('--check')) assert.equal(fs.readFileSync(target,'utf8'),serialized,'Guided curriculum is stale; regenerate after reviewing source changes.');
else fs.writeFileSync(target,serialized);
console.log(JSON.stringify({lessons:Object.keys(lessons).length,languages:2,patterns:patterns.length,patternChoices:8,structureChoices:4,javascriptOverrides:[...javascriptPlans.keys()],bytes:Buffer.byteLength(serialized),checked:process.argv.includes('--check')}));
