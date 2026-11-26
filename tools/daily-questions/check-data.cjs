const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const entriesDirectory = path.join(root, 'src/data/daily-questions/entries');
const importsDirectory = path.join(__dirname, 'imports');
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const references = new Map();

for (const filename of fs.readdirSync(importsDirectory).filter(name => name.endsWith('.md'))) {
  const markdown = fs.readFileSync(path.join(importsDirectory, filename), 'utf8');
  const sections = [...markdown.matchAll(/^## ([A-Za-z]+) (\d{1,2}), (\d{4}) — #(\d+)\. [^\n]*\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
  assert.ok(sections.length, `${filename}: dated questions are present`);
  for (const [, month, day, year, id, section] of sections) {
    const monthIndex = months.indexOf(month);
    assert.ok(monthIndex >= 0, `${filename}: valid month`);
    const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${day.padStart(2, '0')}`;
    const codes = [...section.matchAll(/```javascript\r?\n([\s\S]*?)\r?\n```/g)]
      .map(match => match[1]).filter(code => /^(?:var|class|function)\s/.test(code));
    assert.ok(codes.length, `${date}: selected solutions are present`);
    assert.ok(!references.has(date), `${date}: only one source entry per date`);
    references.set(date, { id: Number(id), codes });
  }
}

for (const filename of fs.readdirSync(importsDirectory).filter(name => name.endsWith('.js'))) {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(\d+)-[a-z0-9-]+\.js$/);
  assert.ok(match, `${filename}: supplemental code identifies its study date and problem ID`);
  const [, date, id] = match;
  const reference = references.get(date);
  assert.ok(reference, `${filename}: supplemental code belongs to an imported date`);
  assert.equal(Number(id), reference.id, `${filename}: supplemental problem ID matches the date`);
  const code = fs.readFileSync(path.join(importsDirectory, filename), 'utf8').replace(/\r?\n$/, '');
  assert.ok(/^(?:var|class|function)\s/.test(code), `${filename}: a complete selected solution is present`);
  assert.ok(!reference.codes.includes(code), `${filename}: supplemental code is not a duplicate`);
  reference.codes.push(code);
}

const entries = fs.readdirSync(entriesDirectory).filter(name => name.endsWith('.json'));
assert.equal(entries.length, references.size, 'Every imported date has one saved entry');
let solutionCount = 0;
for (const filename of entries) {
  const document = JSON.parse(fs.readFileSync(path.join(entriesDirectory, filename), 'utf8'));
  const reference = references.get(document.date);
  assert.ok(reference, `${filename}: date appears in the imported notes`);
  assert.equal(filename, `${document.date}.json`, 'Entries are named by study date');
  assert.equal(document.id, reference.id, `${filename}: original problem ID is preserved`);
  assert.deepEqual(document.solutions.map(solution => solution.code).sort(), [...reference.codes].sort(), `${filename}: every selected solution is preserved exactly, regardless of display order`);
  assert.ok(['same-approach', 'different-approach'].includes(document.comparison.kind));
  assert.ok(document.comparison.summary.trim());
  assert.ok(document.comparison.details.length > 0);
  for (const solution of document.solutions) {
    for (const field of ['title', 'approach', 'timeComplexity', 'spaceComplexity', 'example']) {
      assert.ok(typeof solution[field] === 'string' && solution[field].trim(), `${filename}: ${field} is present`);
    }
    assert.ok(Object.keys(solution.variables).length, `${filename}: complexity variables are explained`);
    assert.ok(Object.values(solution.variables).every(value => typeof value === 'string' && value.trim()));
    solutionCount++;
  }
}
console.log(JSON.stringify({ passed: true, dailyQuestions: entries.length, exactSavedSolutions: solutionCount }));
