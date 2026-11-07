const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { auditLessons, replaceLines, repairLessons } = require('./verify-guided-javascript.cjs');
const { instrument } = require('../walkthroughs/instrument.cjs');
const source = 'function twoSum(nums,target) {\n  return [0,1];\n}';
const fixture = { name: 'Pair', entry: 'twoSum', args: [[2, 7], 9], expected: [0, 1] };
function lesson() {
  const witness = actual => ({ fixtureIndex: 0, name: fixture.name, input: fixture.args, expected: fixture.expected, actual });
  return { id: 1, language: 'javascript', source, sourceHash: crypto.createHash('sha256').update(source).digest('hex'), execution: instrument(source),
    questions: [{ id: 'return', stage: 'implementation', line: 2, endLine: 2, choices: [
      { id: 'correct', correct: true, code: '  return [0,1];' },
      { id: 'reuse', correct: false, code: '  return [0,0];', witness: witness([0, 0]) },
      { id: 'missing', correct: false, code: '  return [];', witness: witness([]) },
    ] }], validation: { correctCases: 1, wrongChoices: 2, testedWitnesses: 2 } };
}
const check = value => auditLessons({ 1: value }, [{ id: 1, javascript: source, fixtures: [fixture] }]);
test('audits physical replacements and every independently executed witness', () => {
  const report = check(lesson());
  assert.equal(report.correctCasesPassed, 1); assert.equal(report.witnessedFailures, 2); assert.deepEqual(report.errors, []);
  assert.equal(replaceLines('one\ntwo\nthree', { line: 2, endLine: 3 }, '  changed'), 'one\n  changed');
});
test('rejects marking a valid reversed Two Sum pair as wrong', () => {
  const value = lesson(); value.questions[0].choices[1].code = '  return [1,0];';
  assert(check(value).errors.some(error => error.kind === 'wrong_choice_passed'));
});
test('rejects invalid grammar and undefined names as proof', () => {
  for (const code of ['  return [;', '  return missingName;']) {
    const value = lesson(); value.questions[0].choices[1].code = code;
    assert(check(value).errors.some(error => /invalid_(or_unbounded_mutation|failure_proof)/.test(error.kind)));
  }
});
test('detects stale displayed proof and changed prepared code', () => {
  const value = lesson(); value.questions[0].choices[1].witness.actual = [1, 1]; value.execution.code += '\n';
  const kinds = check(value).errors.map(error => error.kind);
  assert(kinds.includes('witness_output_drift')); assert(kinds.includes('prepared_execution_mismatch'));
});
test('repairs witness data and removes unproven choices while preserving question coverage', () => {
  const value = lesson();
  value.questions[0].choices[1].witness.actual = [1, 1];
  value.questions[0].choices.push({ id: 'valid', correct: false, code: '  return [1,0];', witness: { ...value.questions[0].choices[1].witness, actual: [1, 0] } });
  const repairs = repairLessons({ 1: value }, [{ id: 1, javascript: source, fixtures: [fixture] }]);
  assert.equal(repairs.updatedWitnesses, 1); assert.equal(repairs.removedChoices.length, 1);
  assert.equal(value.questions[0].choices.length, 3); assert.deepEqual(repairs.emptyLessons, []);
  assert.deepEqual(check(value).errors, []);
});
