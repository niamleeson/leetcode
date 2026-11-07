const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { root, problems, solutionMap } = require('../walkthroughs/load.cjs');
const { instrument } = require('../walkthroughs/instrument.cjs');
const { runJavaScript } = require('../../src/components/logic/runtime/javascriptExecution.ts');
const { logicRevision } = require('../../src/data/logic/manifest.ts');
const report = { problems: 0, cases: 0, passed: 0, failures: [], traces: 0 };
for (const problem of problems) {
  const code = solutionMap[problem.id].jsCode;
  const { fixtures } = JSON.parse(fs.readFileSync(path.join(root, 'public/logic/problems', logicRevision, `${problem.id}.json`), 'utf8'));
  const result = runJavaScript({ problemId: problem.id, code, execution: instrument(code), fixtures });
  report.problems++;
  report.cases += result.total;
  report.passed += result.passed;
  for (const test of result.tests) {
    report.traces += test.trace.length;
    if (!test.passed) report.failures.push({ id: problem.id, name: test.name, expected: test.expected, actual: test.actual, error: test.error });
    for (const frame of test.trace) {
      assert(frame.line >= 1 && frame.line <= code.split('\n').length, `${problem.id}: invalid trace source line`);
      assert(frame.statement && code.includes(frame.statement), `${problem.id}: trace statement absent from source`);
    }
  }
}
fs.writeFileSync('/tmp/logic-javascript-runtime-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
assert.equal(report.problems, 250);
assert.equal(report.failures.length, 0, 'JavaScript runtime did not pass all practice cases');
