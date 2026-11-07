const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { root, problems, solutionMap } = require('../walkthroughs/load.cjs');
const { instrument } = require('../walkthroughs/instrument.cjs');
const { runJavaScript } = require('../../src/components/logic/runtime/javascriptExecution.ts');
const { auditDocument, javascriptInventory } = require('./check-guided-coverage.cjs');
const { logicRevision } = require('../../src/data/logic/manifest.ts');

const digest = source => crypto.createHash('sha256').update(source).digest('hex');
const same = (first, second) => JSON.stringify(first) === JSON.stringify(second);
const invalidProof = test => !!test.error && (/SyntaxError|ReferenceError/.test(test.error.type) || /is not defined|loops finish|timed out|Maximum call stack size exceeded/.test(test.error.message));
function replaceLines(source, question, replacement) {
  const lines = source.split('\n');
  if (!Number.isInteger(question.line) || !Number.isInteger(question.endLine) || question.line < 1 || question.endLine < question.line || question.endLine > lines.length) throw new Error('Invalid physical source-line range');
  if (typeof replacement !== 'string') throw new Error('Missing replacement source');
  lines.splice(question.line - 1, question.endLine - question.line + 1, ...replacement.split('\n'));
  return lines.join('\n');
}
function supervisedRun(request, witness = false) {
  // The runtime counts instrumented events independently of displayed frames.
  // VM supervision also interrupts loops in judge normalization/native code.
  const limits = witness ? { frames: 3, events: 50000, milliseconds: 200 } : { frames: 3, events: 500000, milliseconds: 2000 };
  return vm.runInNewContext('execute(request, limits)', { execute: runJavaScript, request, limits }, { timeout: witness ? 750 : 5000 });
}

function auditLessons(lessons, references) {
  const report = { lessons: 0, correctCases: 0, correctCasesPassed: 0, implementationQuestions: 0, correctReplacements: 0, wrongChoices: 0, witnessedFailures: 0, outputFailures: 0, runtimeErrors: {}, onlyErrorQuestions: [], errors: [] };
  const expectedIds = new Set(references.map(row => String(row.id)));
  for (const key of Object.keys(lessons)) if (!expectedIds.has(String(lessons[key].id ?? key))) report.errors.push({ id: key, kind: 'unexpected_lesson' });
  for (const reference of references) {
    const id = reference.id, lesson = lessons[id];
    const problemError = (kind, detail = {}) => report.errors.push({ id, kind, ...detail });
    if (!lesson) { problemError('missing_lesson'); continue; }
    report.lessons++;
    if (lesson.language !== 'javascript') problemError('wrong_language');
    if (lesson.source !== reference.javascript) problemError('source_differs_from_canonical');
    if (lesson.sourceHash !== digest(lesson.source)) problemError('source_hash_mismatch');
    let prepared;
    try { prepared = instrument(lesson.source); }
    catch (error) { problemError('invalid_correct_source', { message: error.message }); continue; }
    if (!same(lesson.execution, prepared)) problemError('prepared_execution_mismatch');
    try {
      const result = supervisedRun({ problemId: id, code: lesson.source, execution: prepared, fixtures: reference.fixtures });
      report.correctCases += result.total; report.correctCasesPassed += result.passed;
      for (const test of result.tests) if (!test.passed) problemError('correct_source_failed', { name: test.name, actual: test.actual, error: test.error });
    } catch (error) { problemError('correct_source_crashed', { message: error.message }); }
    const coverageDocument = lesson.questions[0]?.stage === 'pattern' ? lesson : { ...lesson, questions: [{ id: 'pattern', stage: 'pattern' }, { id: 'structure', stage: 'structure' }, ...lesson.questions] };
    const coverage = auditDocument(coverageDocument, javascriptInventory(coverageDocument), reference.javascript);
    for (const issue of coverage.issues) problemError('coverage_failure', { detail: issue });
    const questions = lesson.questions.filter(question => question.stage === 'implementation');
    if (!questions.length) problemError('missing_implementation_question');
    let lessonWrong = 0, lessonWitnesses = 0;
    for (const question of questions) {
      report.implementationQuestions++;
      const errorFor = (kind, detail = {}) => problemError(kind, { question: question.id, ...detail });
      const correct = question.choices.filter(choice => choice.correct);
      const wrong = question.choices.filter(choice => !choice.correct);
      if (correct.length !== 1 || wrong.length < 1) errorFor('invalid_choice_count');
      if (new Set(question.choices.map(choice => choice.code?.trim())).size !== question.choices.length) errorFor('duplicate_choices');
      try {
        if (correct.length === 1 && replaceLines(lesson.source, question, correct[0].code) === lesson.source) report.correctReplacements++;
        else errorFor('correct_replacement_changed_source');
      } catch (error) { errorFor('invalid_source_range', { message: error.message }); continue; }
      let errorOnly = true;
      for (const choice of wrong) {
        report.wrongChoices++; lessonWrong++;
        const detail = { choice: choice.id };
        const witness = choice.witness;
        if (!witness) { errorFor('missing_witness', detail); continue; }
        lessonWitnesses++;
        const fixture = reference.fixtures[witness.fixtureIndex];
        if (!fixture || !Number.isInteger(witness.fixtureIndex)) { errorFor('invalid_witness_index', detail); continue; }
        if (witness.name !== fixture.name || !same(witness.input, fixture.args) || !same(witness.expected, fixture.expected) || !same(witness.operations, fixture.operations)) errorFor('witness_fixture_drift', detail);
        const code = replaceLines(lesson.source, question, choice.code);
        try {
          const execution = instrument(code);
          const test = supervisedRun({ problemId: id, code, execution, fixtures: [fixture] }, true).tests[0];
          if (test.passed) { errorFor('wrong_choice_passed', { ...detail, actual: test.actual }); continue; }
          if (invalidProof(test)) {
            errorFor('invalid_failure_proof', { ...detail, error: test.error }); continue;
          }
          report.witnessedFailures++;
          if (test.error) {
            report.runtimeErrors[test.error.type] = (report.runtimeErrors[test.error.type] ?? 0) + 1;
            if (!witness.error || witness.error.type !== test.error.type || witness.error.message !== test.error.message) errorFor('witness_error_drift', { ...detail, recorded: witness.error, actual: test.error });
          } else {
            errorOnly = false; report.outputFailures++;
            if (witness.error || !same(witness.actual, test.actual)) errorFor('witness_output_drift', { ...detail, recorded: witness.actual, actual: test.actual, recordedError: witness.error });
          }
        } catch (error) {
          errorFor('invalid_or_unbounded_mutation', { ...detail, type: error.name, message: error.message });
        }
      }
      if (errorOnly && wrong.length) report.onlyErrorQuestions.push({ id, question: question.id, choices: wrong.length });
    }
    if (lesson.validation?.correctCases !== reference.fixtures.length || lesson.validation?.wrongChoices !== lessonWrong || lesson.validation?.testedWitnesses !== lessonWitnesses) problemError('validation_count_drift');
  }
  return report;
}

function repairLessons(lessons, references) {
  const changes = { updatedWitnesses: 0, removedChoices: [], removedQuestions: [], emptyLessons: [] };
  for (const reference of references) {
    const lesson = lessons[reference.id];
    if (!lesson) continue;
    lesson.questions = lesson.questions.filter(question => {
      if (question.stage !== 'implementation') return true;
      question.choices = question.choices.filter(choice => {
        if (choice.correct) return true;
        const detail = { id: reference.id, question: question.id, choice: choice.id };
        try {
          const fixture = reference.fixtures[choice.witness?.fixtureIndex];
          if (!fixture) throw new Error('Missing original witness fixture');
          const code = replaceLines(lesson.source, question, choice.code);
          const test = supervisedRun({ problemId: reference.id, code, execution: instrument(code), fixtures: [fixture] }, true).tests[0];
          if (test.passed || invalidProof(test)) {
            changes.removedChoices.push({ ...detail, reason: test.passed ? 'The answer passes the witness.' : test.error.message });
            return false;
          }
          const witness = { fixtureIndex: choice.witness.fixtureIndex, name: fixture.name, input: fixture.args,
            ...(fixture.operations ? { operations: fixture.operations } : {}), expected: fixture.expected,
            ...(test.error ? { error: { type: test.error.type, message: test.error.message } } : { actual: test.actual }) };
          if (!same(choice.witness, witness)) changes.updatedWitnesses++;
          choice.witness = witness;
          choice.feedback = test.error
            ? `This statement breaks the implementation on “${fixture.name}”: ${test.error.message}`
            : `This changes the result on “${fixture.name}”. Compare the actual output with the expected output below.`;
          return true;
        } catch (error) {
          changes.removedChoices.push({ ...detail, reason: error.message });
          return false;
        }
      });
      if (question.choices.filter(choice => choice.correct).length !== 1 || question.choices.filter(choice => !choice.correct).length < 1) {
        changes.removedQuestions.push({ id: reference.id, question: question.id });
        return false;
      }
      return true;
    });
    const implementation = lesson.questions.filter(question => question.stage === 'implementation');
    if (!implementation.length) changes.emptyLessons.push(reference.id);
    lesson.validation = { correctCases: reference.fixtures.length,
      wrongChoices: implementation.reduce((count, question) => count + question.choices.filter(choice => !choice.correct).length, 0),
      testedWitnesses: implementation.reduce((count, question) => count + question.choices.filter(choice => !!choice.witness).length, 0) };
  }
  return changes;
}

function readLessons(input) {
  if (fs.statSync(input).isDirectory()) return Object.fromEntries(fs.readdirSync(input).filter(file => file.endsWith('-javascript.json')).map(file => {
    const lesson = JSON.parse(fs.readFileSync(path.join(input, file), 'utf8')); return [lesson.id, lesson];
  }));
  return JSON.parse(fs.readFileSync(input, 'utf8'));
}
if (require.main === module) {
  const manifest = require('../../src/data/logic/guided-manifest.ts');
  const input = process.argv[2] ?? path.join(root, 'public/logic/lessons', manifest.guidedRevision);
  const references = problems.map(problem => ({ id: problem.id, javascript: solutionMap[problem.id].jsCode,
    fixtures: JSON.parse(fs.readFileSync(path.join(root, 'public/logic/problems', logicRevision, `${problem.id}.json`), 'utf8')).fixtures }));
  const lessons = readLessons(input);
  let repairs;
  if (process.argv.includes('--repair')) {
    if (fs.statSync(input).isDirectory()) throw new Error('Repair the authoring cache, then republish the versioned lessons. Published lesson directories are read-only.');
    repairs = repairLessons(lessons, references);
    const temporary = input + '.repairing';
    fs.writeFileSync(temporary, JSON.stringify(lessons)); fs.renameSync(temporary, input);
    fs.writeFileSync('/tmp/leetcode-guided-javascript-repairs.json', JSON.stringify(repairs, null, 2));
  }
  const report = { ...auditLessons(lessons, references), ...(repairs ? { repairs } : {}) };
  fs.writeFileSync('/tmp/leetcode-guided-javascript-audit.json', JSON.stringify({ input, ...report }, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length) process.exitCode = 1;
}
module.exports = { auditLessons, replaceLines, readLessons, repairLessons };
