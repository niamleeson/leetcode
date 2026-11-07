const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {root, problems, walkthroughs} = require('./load.cjs');
const {digest, generatorHash, validatePython} = require('./verify-python.cjs');
const fixtures = require('./fixtures.json');
const directory = path.join(root, 'src/data/walkthroughs/generated-python');
assert.deepEqual(fs.readdirSync(directory).filter(file => file.endsWith('.json')).sort(),
  walkthroughs.map(problem => `${problem.key}.json`).sort(), 'Obsolete or missing Python walkthrough artifacts');
let examples = 0, steps = 0;
for (const problem of walkthroughs) {
  const artifact = JSON.parse(fs.readFileSync(path.join(directory, `${problem.key}.json`), 'utf8'));
  const code = problem.solution.code;
  assert.equal(artifact.id, problem.id);
  assert.equal(artifact.variant, problem.variant);
  assert.equal(artifact.language, 'python');
  assert.equal(artifact.code, code, `${problem.key}: displayed Python changed; regenerate walkthroughs`);
  assert.equal(artifact.sourceHash, digest(code));
  assert.equal(artifact.generatorHash, generatorHash, `${problem.key}: Python recorder changed; regenerate walkthroughs`);
  assert.equal(artifact.fixtureHash, digest(JSON.stringify(fixtures[problem.id])));
  assert(artifact.examples.length >= 2);
  assert.equal(artifact.examples.length, fixtures[problem.id].length);
  artifact.examples.forEach((example, index) => {
    assert.deepEqual(example.input, fixtures[problem.id][index].args);
    assert.deepEqual(example.expected, fixtures[problem.id][index].expected);
    validatePython(example.result, fixtures[problem.id][index], problem.id);
    examples++; steps += example.steps.length;
    assert(example.steps.length > 1);
    example.steps.forEach(step => {
      assert(step.line >= 1 && step.line <= code.split('\n').length);
      assert(step.stack.length > 0);
    });
  });
}
console.log(`Python walkthrough coverage: ${problems.length}/250 problems, ${walkthroughs.length} solutions, ${examples} examples, ${steps} steps; source matches.`);
