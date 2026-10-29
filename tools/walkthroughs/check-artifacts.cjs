const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { root, problems, solutionMap } = require('./load.cjs');
const fixtures = require('./fixtures.json');
const {indexingFor}=require('./source-analysis.cjs');
const generatorHash=crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'instrument.cjs'))).update(fs.readFileSync(path.join(__dirname,'runtime.cjs'))).digest('hex');
let examples=0,steps=0;
for (const problem of problems) {
  const file=path.join(root,'src/data/walkthroughs/generated',`${problem.id}.json`);
  assert(fs.existsSync(file),`Missing walkthrough for ${problem.id}`);
  const artifact=JSON.parse(fs.readFileSync(file,'utf8'));
  const code=solutionMap[problem.id].jsCode;
  assert.equal(artifact.code,code,`${problem.id}: solution changed; run npm run walkthroughs:generate`);
  assert.equal(artifact.sourceHash,crypto.createHash('sha256').update(code).digest('hex'));
  assert.equal(artifact.generatorHash,generatorHash,`${problem.id}: recorder changed; regenerate walkthroughs`);
  assert.equal(artifact.fixtureHash,crypto.createHash('sha256').update(JSON.stringify(fixtures[problem.id])).digest('hex'),`${problem.id}: examples changed; regenerate walkthroughs`);
  assert.deepEqual(artifact.indexing,indexingFor(code),`${problem.id}: indexing markers changed; regenerate walkthroughs`);
  assert(artifact.examples.length>=2,`${problem.id}: needs normal and edge cases`);
  assert.equal(artifact.examples.length,fixtures[problem.id].length);
  artifact.examples.forEach((example,index)=>{
    assert.deepEqual(example.input,fixtures[problem.id][index].args);
    assert.deepEqual(example.expected,fixtures[problem.id][index].expected);
    examples++;steps+=example.steps.length;
    example.steps.forEach(step=>assert(step.line>=1&&step.line<=code.split('\n').length));
  });
}
console.log(`Walkthrough coverage: ${problems.length}/250 problems, ${examples} examples, ${steps} steps; source matches.`);
