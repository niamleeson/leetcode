const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { root, problems, walkthroughs } = require('./load.cjs');
const fixtures = require('./fixtures.json');
const {indexingFor}=require('./source-analysis.cjs');
const generatorHash=crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'instrument.cjs'))).update(fs.readFileSync(path.join(__dirname,'runtime.cjs'))).digest('hex');
let examples=0,steps=0;
assert.deepEqual(fs.readdirSync(path.join(root,'src/data/walkthroughs/generated')).filter(file=>file.endsWith('.json')).sort(),walkthroughs.map(problem=>`${problem.key}.json`).sort(),'Obsolete or missing walkthrough artifacts');
for (const problem of walkthroughs) {
  const file=path.join(root,'src/data/walkthroughs/generated',`${problem.key}.json`);
  assert(fs.existsSync(file),`Missing walkthrough for ${problem.key}`);
  const artifact=JSON.parse(fs.readFileSync(file,'utf8'));
  const code=problem.solution.jsCode;
  assert.equal(artifact.id,problem.id);
  assert.equal(artifact.variant,problem.variant);
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
console.log(`Walkthrough coverage: ${problems.length}/250 problems, ${walkthroughs.length} solutions, ${examples} examples, ${steps} steps; source matches.`);
