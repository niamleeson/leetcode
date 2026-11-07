const test = require('node:test');
const assert = require('node:assert/strict');
const { generateJavaScriptQuestions, statementInventory, optionsByLine } = require('./generate-guided-javascript.cjs');
const { javascriptInventory, auditDocument } = require('./check-guided-coverage.cjs');
const crypto = require('node:crypto');

function audited(source, fixtures) {
  const questions = generateJavaScriptQuestions({ id: 99999, source, fixtures });
  const document = { id: 99999, language: 'javascript', entry: fixtures[0].entry, source,
    sourceHash: crypto.createHash('sha256').update(source).digest('hex'), coverage: questions.coverage,
    questions: [{ id:'pattern',stage:'pattern' },{ id:'structure',stage:'structure' },...questions] };
  return { questions, report: auditDocument(document,javascriptInventory(document),source) };
}

test('questions include updates after the loop condition and the final output', () => {
  const source = 'var total = function(nums) {\n  let sum = 0;\n  for (let i = 0; i < nums.length; i++) {\n    sum += nums[i];\n  }\n  return sum;\n};';
  const {questions,report} = audited(source,[{name:'values',entry:'total',params:['nums'],args:[[2,5]],expected:7}]);
  assert.deepEqual(report.issues,[]);
  assert.ok(questions.some(question=>question.decisionLines.includes(4)));
  assert.ok(questions.some(question=>question.decisionLines.includes(6)));
  assert.equal(questions.at(-1).endLine,6);
});

test('bare early exits have an actual witnessed direct guard choice', () => {
  const source = 'var visit = function(nums) {\n  const result = [];\n  const add = (i) => {\n    if (i >= nums.length) {\n      return;\n    }\n    result.push(nums[i]);\n  };\n  add(0);\n  add(nums.length);\n  return result;\n};';
  const {questions,report} = audited(source,[{name:'one value',entry:'visit',params:['nums'],args:[[8]],expected:[8]}]);
  assert.deepEqual(report.issues,[]);
  const guarded = questions.flatMap(question=>question.guardedReturns || []);
  assert.ok(guarded.some(item=>item.line===5&&item.guardLine===4));
  for (const question of questions.filter(question=>question.decisionLines.includes(5))) {
    assert.ok(question.choices.some(choice=>!choice.correct&&choice.code.split('\n')[5-question.line].trim()!=='return;'));
  }
});

test('algorithmic top-level and concise helpers remain in the inventory', () => {
  const source = 'var main = function(n) {\n  return helper(n);\n};\nvar helper = function(n) {\n  const twice = x => x * 2;\n  return twice(n);\n};';
  const inventory = statementInventory(source,'main');
  const required = inventory.units.flatMap(unit=>unit.requiredLines);
  assert.ok(required.includes(5));
  assert.ok(required.includes(6));
});

test('loop alternatives can change both first and last iteration boundaries', () => {
  const source = 'var main = function(nums) {\n  for (let i = 0; i < nums.length; i++) {\n    nums[i] += 1;\n  }\n  return nums;\n};';
  const group = optionsByLine(source,'main',undefined,false,[{params:['nums'],args:[[1,2]],expected:[2,3]}]).find(group=>group.line===2);
  assert.ok([...group.variants.values()].some(variant=>variant.text.includes('(nums.length) - 1')));
  assert.ok([...group.variants.values()].some(variant=>variant.text.includes('(0) + 1')));
});

test('closing braces are never quiz requirements or terminal decisions', () => {
  const source = 'var main = function(n) {\n  if (n > 0) {\n    return;\n  }\n};';
  const inventory = statementInventory(source,'main');
  assert.ok(!inventory.units.flatMap(unit=>unit.requiredLines).includes(4));
  assert.ok(!inventory.terminalLines.includes(4));
});

test('pre-answer context hides instructional inline comments', () => {
  const source = 'var total = function(nums) {\n  let sum = 0; // Add every value to sum.\n  for (let i = 0; i < nums.length; i++) {\n    sum += nums[i];\n  }\n  return sum;\n};';
  const {questions} = audited(source,[{name:'values',entry:'total',params:['nums'],args:[[2,5]],expected:7}]);
  assert.ok(questions.every(question=>!question.context.includes('Add every value')));
  assert.ok(questions.some(question=>question.choices.some(choice=>choice.correct&&choice.code.includes('Add every value'))));
});

test('ignored private return values never hide the helpers last state change', () => {
  const source = 'var main = function(nums) {\n  const removeFirst = () => {\n    nums.splice(0, 1);\n    return 99;\n  };\n  removeFirst();\n  return nums;\n};';
  const {questions,report} = audited(source,[{name:'remove first',entry:'main',params:['nums'],args:[[2,5]],expected:[5]}]);
  assert.deepEqual(report.issues,[]);
  assert.ok(questions.coverage.contextOnly.some(item=>item.line===4));
  assert.ok(questions.coverage.terminalLines.includes(3));
  assert.ok(questions.some(question=>question.decisionLines.includes(3)));
});

test('the external judge observes a public recursive entry return', () => {
  const source = 'var main = function(n) {\n  if (n > 0) main(n - 1);\n  return n;\n};';
  const {questions,report} = audited(source,[{name:'return original n',entry:'main',params:['n'],args:[2],expected:2}]);
  assert.deepEqual(report.issues,[]);
  assert.ok(!questions.coverage.contextOnly?.some(item=>item.line<=3&&item.endLine>=3));
  assert.ok(questions.coverage.requiredLines.includes(3));
  assert.ok(questions.coverage.terminalLines.includes(3));
  assert.ok(questions.some(question=>question.decisionLines.includes(3)));
});
