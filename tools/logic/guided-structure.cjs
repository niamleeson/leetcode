// Reviewed small planning decisions. A structure card contains one decision,
// never the complete source outline or the full plan for later decisions.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const files = ['head', 'middle', 'tail'];
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, `guided-structure-steps-${name}.json`), 'utf8'));

function validateStep(step, problemId) {
  const at = `${problemId}:${step.id}`;
  assert(/^[a-z][a-z0-9-]*$/.test(step.id), `${at}: invalid stable step id`);
  for (const key of ['prompt', 'correct', 'explanation']) {
    assert(typeof step[key] === 'string' && step[key].trim().length > (key === 'correct' ? 0 : 4), `${at}: missing ${key}`);
    assert(!/[\n\r]/.test(step[key]), `${at}: a planning card must not contain an outline`);
  }
  assert(step.prompt.length <= 160, `${at}: overlong prompt`);
  assert(step.correct.length <= 180, `${at}: overlong correct choice`);
  assert(step.explanation.length <= 260, `${at}: overlong explanation`);
  assert(Array.isArray(step.wrong) && step.wrong.length >= 2 && step.wrong.length <= 3, `${at}: need two or three meaningful alternatives`);
  const labels = [step.correct];
  for (const option of step.wrong) {
    const label = typeof option === 'string' ? option : option.label;
    assert(typeof label === 'string' && label.trim().length > 0 && label.length <= 180 && !/[\n\r]/.test(label), `${at}: invalid alternative`);
    if (typeof option !== 'string' && option.feedback !== undefined) assert(typeof option.feedback === 'string' && option.feedback.length > 10 && option.feedback.length <= 260 && !/[\n\r]/.test(option.feedback), `${at}: invalid alternative explanation`);
    labels.push(label);
  }
  assert.equal(new Set(labels).size, labels.length, `${at}: repeated choices`);
  assert(!('code' in step) && !('context' in step) && !('feedbackCode' in step), `${at}: do not present the whole structure`);
}

function loadStructureSteps(problemIds) {
  const base = {};
  for (const file of files) for (const [id, steps] of Object.entries(read(file))) {
    assert(!base[id], `Duplicate structure authoring for ${id}`);
    base[id] = steps;
  }
  const expected = [...problemIds].map(Number).sort((a,b)=>a-b);
  assert.deepEqual(Object.keys(base).map(Number).sort((a,b)=>a-b), expected, 'Every NeetCode problem needs authored structure decisions');
  const javascript = read('javascript');
  for (const [language, bank] of [['base', base], ['javascript', javascript]]) for (const [id, steps] of Object.entries(bank)) {
    assert(expected.includes(Number(id)), `${language}: unknown problem ${id}`);
    assert(Array.isArray(steps) && steps.length >= 1 && steps.length <= 4, `${id}: use one to four focused decisions`);
    assert.equal(new Set(steps.map(step=>step.id)).size, steps.length, `${id}: repeated step IDs`);
    for (const step of steps) validateStep(step, id);
  }
  return { base, javascript };
}

function structureQuestions(steps, id, language, shuffled) {
  return steps.map(step => ({
    id: step.id,
    prompt: step.prompt,
    options: shuffled([
      {id:'correct',label:step.correct,feedback:step.explanation},
      ...step.wrong.map((option,index)=>({id:`alternative-${index+1}`,label:typeof option==='string'?option:option.label,feedback:typeof option==='string'?step.explanation:option.feedback || step.explanation})),
    ], `${id}:structure:${language}:${step.id}`),
    correctId: 'correct',
  }));
}

module.exports = { loadStructureSteps, structureQuestions, validateStep };
