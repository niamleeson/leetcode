const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const {pathToFileURL} = require('node:url');
const {generate} = require('./generate.cjs');
const {root,solutionMap} = require('../walkthroughs/load.cjs');
const {setup,invocation} = require('../walkthroughs/runtime.cjs');
const {validate} = require('../walkthroughs/verify.cjs');
const fixtures = require('../walkthroughs/fixtures.json');
const day = require('./daily-example.cjs');

async function verify() {
  const {catalog,totals}=generate(false);
  const bundle=await import(pathToFileURL(path.join(root,'src/data/master-solution/generated/delivery-control.mjs')));
  assert.deepEqual(bundle.runDeliveryDay(),day.expected,'Combined delivery-day result');
  const modulePath=path.join(root,'src/data/master-solution/generated/delivery-control.mjs');
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'master-cli-'));
  try {
    const alias=path.join(temp,'download.mjs');
    fs.symlinkSync(modulePath,alias);
    assert.deepEqual(JSON.parse(execFileSync(process.execPath,[alias],{encoding:'utf8'})),day.expected,'CLI via a symbolic link must run the example');
    assert.equal(execFileSync(process.execPath,['--input-type=module','-e',`await import(${JSON.stringify(pathToFileURL(modulePath).href)})`],{encoding:'utf8'}),'','Importing must not run the example');
  } finally { fs.rmSync(temp,{recursive:true,force:true}); }
  const input=structuredClone(day.input);bundle.runDeliveryDay(input);assert.deepEqual(input,day.input,'The day runner mutated its caller input');
  assert.equal(catalog.units.length,96);assert.equal(catalog.problems.length,180);
  let cases=0,recordedSteps=0;
  for(const problem of catalog.problems)for(const version of problem.variants){
    const traceFile=path.join(root,'src/data/walkthroughs/generated',version.key+'.json');
    const trace=JSON.parse(fs.readFileSync(traceFile,'utf8'));
    const solution=version.variant?solutionMap[problem.id].followUp:solutionMap[problem.id];
    assert.equal(trace.code,solution.jsCode,`${version.key}: source differs from the highlighted walkthrough`);
    assert.equal(trace.sourceHash,version.sourceHash);
    assert.equal(trace.examples.length,fixtures[problem.id].length);
    assert.equal(version.exampleCount,trace.examples.length);
    for(const [index,fixture] of fixtures[problem.id].entries()){
      const context=vm.createContext({__problemId:problem.id,__case:structuredClone(fixture),__trace:{start(){},stop(){}}});
      new vm.Script(setup).runInContext(context,{timeout:5000});
      const functions=bundle.createOperation(version.key,{guess:n=>n===fixture.pick?0:n<fixture.pick?1:-1});
      assert.deepEqual(Object.keys(functions).sort(),[...version.entryPoints].sort());
      Object.assign(context,functions);
      const value=new vm.Script(invocation(fixture)).runInContext(context,{timeout:15000});
      const actual=JSON.parse(JSON.stringify(value));
      validate(actual,fixture);
      validate(trace.examples[index].result,fixture);
      // The plain exported program and the recorded execution must agree, even
      // on problems where the validator accepts several valid final answers.
      assert.deepEqual(actual,trace.examples[index].result,`${version.key}/${index}: download and walkthrough disagree`);
      assert(trace.examples[index].steps.length>0);
      recordedSteps+=trace.examples[index].steps.length;
      cases++;
    }
  }
  assert.equal(cases,totals.examples);
  for(const unit of catalog.units){
    assert(unit.remember.length>30&&unit.watchFor.length>30);
    assert(unit.variantKeys.length);
    assert.deepEqual(Object.keys(bundle.operation(unit.id)).sort(), Object.keys(bundle.createOperation(unit.variantKeys[0])).sort(), `${unit.id}: default operation must belong to the unit, including units with only alternatives`);
    for(const key of unit.variantKeys){
      const version=bundle.implementations.find(v=>v.key===key);
      assert(version.units.includes(unit.id));
      assert.deepEqual(Object.keys(bundle.operation(unit.id,version.problemId,version.variant||'primary')).sort(),[...version.entryPoints].sort());
    }
  }
  assert.throws(()=>bundle.createOperation('__proto__'),/Unknown implementation/);
  assert.throws(()=>bundle.operation('W02',743),/does not belong/);
  assert.throws(()=>bundle.operation('missing'),/Unknown study unit/);
  assert.throws(()=>bundle.createOperation(374).guessNumber(10),/dependencies.guess/);
  console.log(JSON.stringify({...totals,recordedSteps,dailyChapters:day.stages.length,downloadAndWalkthroughsAgree:true}));
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
