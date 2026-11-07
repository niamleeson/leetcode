const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { root, problems, walkthroughs } = require('./load.cjs');
const { validate } = require('./verify.cjs');
const fixtures = require('./fixtures.json');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const generatorHash = digest(fs.readFileSync(path.join(__dirname, 'python-runtime.py')));
function validatePython(result, fixture, id) {
  // Critical and pseudo-critical edges are two ordered categories whose own
  // members can be returned in any order; Python sorts by weight internally.
  if (id === 1489) {
    assert(Array.isArray(result) && result.length === 2);
    result.forEach((group, index) => assert.deepEqual([...group].sort((a,b) => a-b), [...fixture.expected[index]].sort((a,b) => a-b)));
  } else validate(result, fixture);
}

function verify({ write = false, ids } = {}) {
  assert.equal(problems.length, 250);
  assert.equal(new Set(problems.map(problem => problem.id)).size, 250);
  const selected = ids ? walkthroughs.filter(problem => ids.includes(problem.id)) : walkthroughs;
  const errors = [], stats = [];
  for (const problem of selected) {
    const source = problem.solution?.code;
    const cases = fixtures[problem.id];
    if (!source || !cases?.length) { errors.push(`${problem.key}: missing Python source or fixtures`); continue; }
    const requests = cases.flatMap(fixture => [false, true].map(traced => JSON.stringify({source, fixture, id: problem.id, traced})));
    const result = spawnSync('python3', [path.join(__dirname, 'python-runtime.py')], {
      input: requests.join('\n') + '\n', encoding: 'utf8', maxBuffer: 128 * 1024 * 1024,
      timeout: 120000, env: { ...process.env, PYTHONHASHSEED: '0' },
    });
    if (result.status !== 0) { errors.push(`${problem.key}: Python failed: ${result.error?.message || result.stderr}`); continue; }
    const executions = result.stdout.trim().split('\n').map(line => JSON.parse(line));
    if (executions.length !== requests.length) { errors.push(`${problem.key}: missing Python executions`); continue; }
    const examples = [];
    for (const [index, fixture] of cases.entries()) {
      try {
        const plain = executions[index * 2], traced = executions[index * 2 + 1];
        assert(!plain.error, plain.error); assert(!traced.error, traced.error);
        validatePython(plain.result, fixture, problem.id);
        assert.deepEqual(traced.result, plain.result, 'Tracing changed the Python result');
        assert(traced.steps.length > 1, 'No Python execution recorded');
        const lines = source.split('\n');
        for (const step of traced.steps) {
          assert(step.line >= 1 && step.line <= lines.length, 'Python line outside source');
          assert(lines[step.line - 1].trim() && !lines[step.line - 1].trim().startsWith('#'), 'Highlighted blank/comment line');
          assert.equal(traced.sites[step.site].line, step.line);
          assert(step.stack.length > 0, 'Missing real Python call stack');
        }
        examples.push({name: fixture.name, input: fixture.args, expected: fixture.expected, result: traced.result, steps: traced.steps});
      } catch (error) { errors.push(`${problem.key} ${problem.title} [${index}]: ${error.message}`); }
    }
    const artifact = {id: problem.id, ...(problem.variant ? {variant: problem.variant} : {}),
      language: 'python', title: problem.title, topic: problem.topic, code: source,
      sourceHash: digest(source), generatorHash, fixtureHash: digest(JSON.stringify(cases)),
      indexing: executions[1]?.indexing || {}, examples};
    const json = JSON.stringify(artifact) + '\n';
    const file = path.join(root, 'src/data/walkthroughs/generated-python', `${problem.key}.json`);
    if (examples.length === cases.length) {
      if (write) { fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, json); }
      else if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== json) errors.push(`${problem.key}: Python recording differs; regenerate it`);
    }
    stats.push({id: problem.key, cases: examples.length, steps: examples.reduce((n, example) => n + example.steps.length, 0), bytes: json.length});
  }
  return {problems: new Set(selected.map(problem => problem.id)).size, solutions: stats.length,
    cases: stats.reduce((n, item) => n + item.cases, 0), steps: stats.reduce((n, item) => n + item.steps, 0),
    bytes: stats.reduce((n, item) => n + item.bytes, 0), errors, stats};
}
if (require.main === module) {
  const ids = process.argv.find(arg => arg.startsWith('--ids='))?.slice(6).split(',').map(Number);
  const report = verify({write: process.argv.includes('--write'), ids});
  fs.writeFileSync('/tmp/leetcode-python-walkthrough-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({...report, stats: report.stats.sort((a, b) => b.bytes - a.bytes).slice(0, 8)}, null, 2));
  if (report.errors.length) process.exitCode = 1;
}
module.exports = {verify, digest, generatorHash, validatePython};
