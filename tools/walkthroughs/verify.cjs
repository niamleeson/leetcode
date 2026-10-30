const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { root, problems, walkthroughs } = require('./load.cjs');
const { execute } = require('./runtime.cjs');
const fixtures = require('./fixtures.json');
const {indexingFor}=require('./source-analysis.cjs');
const generatorHash=crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'instrument.cjs'))).update(fs.readFileSync(path.join(__dirname,'runtime.cjs'))).digest('hex');

const ordered = value => [...value].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
function validate(actual, fixture) {
  const expected = fixture.expected;
  switch (fixture.compare) {
    case 'unordered': assert.deepEqual(ordered(actual), ordered(expected)); break;
    case 'groups': assert.deepEqual(ordered(actual.map(ordered)), ordered(expected.map(ordered))); break;
    case 'accounts': {
      const normalize = groups => ordered(groups.map(([name,...emails])=>[name,...emails.sort()]));
      assert.deepEqual(normalize(actual), normalize(expected)); break;
    }
    case 'topological': {
      const [count,edges] = fixture.args;
      if (!expected.length) { assert.deepEqual(actual, []); break; }
      assert.equal(actual.length,count); assert.equal(new Set(actual).size,count);
      assert(actual.every(v=>Number.isInteger(v)&&v>=0&&v<count));
      for(const [after,before] of edges) assert(actual.indexOf(before)<actual.indexOf(after));
      break;
    }
    case 'matrixConditions': {
      if (!expected.length) { assert.deepEqual(actual,[]); break; }
      const [k,rows,cols]=fixture.args;
      assert.equal(actual.length,k); const positions=new Map();
      actual.forEach((row,r)=>{assert.equal(row.length,k);row.forEach((v,c)=>{if(v!==0){assert(!positions.has(v));positions.set(v,[r,c]);}});});
      assert.equal(positions.size,k);for(let v=1;v<=k;v++) assert(positions.has(v));
      for(const [a,b] of rows) assert(positions.get(a)[0]<positions.get(b)[0]);
      for(const [a,b] of cols) assert(positions.get(a)[1]<positions.get(b)[1]);break;
    }
    case 'longestPalindrome': assert.equal(actual.length,expected.length);assert(fixture.args[0].includes(actual));assert.equal(actual,[...actual].reverse().join(''));break;
    case 'reorganized': {
      if(!expected) {assert.equal(actual,'');break;}
      assert.equal([...actual].sort().join(''),[...fixture.args[0]].sort().join(''));
      for(let i=1;i<actual.length;i++)assert.notEqual(actual[i],actual[i-1]);break;
    }
    case 'happyString': {
      const counts=fixture.args;const max=Math.max(...counts),rest=counts.reduce((a,b)=>a+b,0)-max;
      assert.equal(actual.length,rest+Math.min(max,2*(rest+1)));
      for(let i=0;i<3;i++)assert([...actual].filter(c=>c==='abc'[i]).length<=counts[i]);
      assert(!/aaa|bbb|ccc/.test(actual));assert(/^[abc]*$/.test(actual));break;
    }
    default: assert.deepEqual(actual,expected);
  }
}

function verify({ write = false, ids } = {}) {
  const errors = [], stats = []; let cases = 0;
  const selected = ids ? walkthroughs.filter(p=>ids.includes(p.id)) : walkthroughs;
  assert.equal(problems.length,250);assert.equal(new Set(problems.map(p=>p.id)).size,250);
  for(const problem of selected) {
    const source=problem.solution?.jsCode;
    if(!source || !fixtures[problem.id]?.length){errors.push(`${problem.key}: missing source or fixture`);continue;}
    const examples=[];
    for(const [index,fixture] of fixtures[problem.id].entries()) {
      try {
        const plain=execute(source,fixture,problem.id,false);
        validate(plain.result,fixture);
        const traced=execute(source,fixture,problem.id,true);
        assert.deepEqual(traced.result,plain.result,'Instrumentation changed the result');
        assert(traced.steps.length>1,'No execution recorded');
        const lines=source.split('\n');
        for(const step of traced.steps) {
          const site=traced.sites[step.site];
          assert.equal(step.line,site.line);
          assert.equal(step.line,source.slice(0,site.start).split('\n').length,'Source location drift');
          assert(step.line>=1&&step.line<=lines.length);
          assert(lines[step.line-1].trim()&&!lines[step.line-1].trim().startsWith('//'),'Highlighted a blank/comment line');
        }
        cases++;
        examples.push({name:fixture.name, input:fixture.args, expected:fixture.expected, result:traced.result, steps:traced.steps});
      } catch(error) {errors.push(`${problem.key} ${problem.title} [${index}]: ${error.message}`);}
    }
    const artifact={id:problem.id,...(problem.variant?{variant:problem.variant}:{}),title:problem.title,topic:problem.topic,code:source,sourceHash:crypto.createHash('sha256').update(source).digest('hex'),generatorHash,fixtureHash:crypto.createHash('sha256').update(JSON.stringify(fixtures[problem.id])).digest('hex'),indexing:indexingFor(source),examples};
    const json=JSON.stringify(artifact);
    if(!write && !errors.some(error=>error.startsWith(`${problem.key} `))) {
      const file=path.join(root,'src/data/walkthroughs/generated',`${problem.key}.json`);
      if(!fs.existsSync(file)||fs.readFileSync(file,'utf8').trim()!==json) errors.push(`${problem.key}: committed recording differs from freshly verified execution; regenerate it`);
    }
    stats.push({id:problem.key,cases:examples.length,steps:examples.reduce((n,e)=>n+e.steps.length,0),bytes:json.length});
    if(write && examples.length===fixtures[problem.id].length) {
      const directory=path.join(root,'src/data/walkthroughs/generated');fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,`${problem.key}.json`),json+'\n');
    }
  }
  return {problems:new Set(selected.map(problem=>problem.id)).size,solutions:stats.length,cases,steps:stats.reduce((n,s)=>n+s.steps,0),bytes:stats.reduce((n,s)=>n+s.bytes,0),errors,stats};
}
if(require.main===module) {
  const ids=process.argv.find(arg=>arg.startsWith('--ids='))?.slice(6).split(',').map(Number);
  const report=verify({write:process.argv.includes('--write'),ids});
  fs.writeFileSync('/tmp/leetcode-walkthrough-report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({...report,stats:report.stats.sort((a,b)=>b.bytes-a.bytes).slice(0,8)},null,2));
  if(report.errors.length) process.exitCode=1;
}
module.exports={verify,validate};
