const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const entriesDirectory = path.resolve(__dirname, '../../src/data/knapsack/entries');
const importsDirectory = path.join(__dirname, 'imports');
const expected = ['mixed-knapsack', 'unbounded-knapsack', 'zero-one-knapsack'];
const filenames = fs.readdirSync(entriesDirectory).filter(name => name.endsWith('.json')).sort();
assert.deepEqual(filenames, expected.map(slug => `${slug}.json`), 'Each practice problem has one entry');
assert.deepEqual(fs.readdirSync(importsDirectory).sort(), expected.flatMap(slug => [`${slug}.js`, `${slug}.py`, `${slug}-dfs.js`, `${slug}-dfs.py`]).sort(), 'Each problem has exact JavaScript and Python references for DFS and DP');

let solutions = 0;
for (const filename of filenames) {
  const entry = JSON.parse(fs.readFileSync(path.join(entriesDirectory, filename), 'utf8'));
  assert.equal(filename, `${entry.slug}.json`);
  assert.equal(entry.difficulty, 'Medium');
  for (const field of ['slug', 'title', 'descriptionMarkdown']) {
    assert.ok(typeof entry[field] === 'string' && entry[field].trim(), `${filename}: ${field} is present`);
  }
  for (const heading of ['Example 1', 'Example 2', 'Constraints']) {
    assert.ok(entry.descriptionMarkdown.includes(`### ${heading}`), `${filename}: ${heading} is present`);
  }
  assert.match(entry.descriptionMarkdown, /at most/);
  assert.equal(entry.solutions.length, 2, `${filename}: DFS and DP solutions are present`);
  for (const [index, solution] of entry.solutions.entries()) {
    const variant = index === 0 ? 'dfs' : 'dp';
    for (const field of ['title', 'code', 'pythonCode', 'intuition', 'approach', 'explanation', 'timeComplexity', 'spaceComplexity', 'example', 'walkthroughMarkdown', 'pythonWalkthroughMarkdown']) {
      assert.ok(typeof solution[field] === 'string' && solution[field].trim(), `${filename}: ${field} is present`);
    }
    assert.ok(Array.isArray(solution.hints) && solution.hints.length > 0 && solution.hints.every(hint => typeof hint === 'string' && hint.trim()), `${filename}: incremental hints are present`);
    assert.ok(typeof solution.pseudocode?.concept === 'string' && solution.pseudocode.concept.trim(), `${filename}: pseudocode concept is present`);
    assert.ok(Array.isArray(solution.pseudocode.steps) && solution.pseudocode.steps.length > 1 && solution.pseudocode.steps.every(step => typeof step === 'string' && step.trim()), `${filename}: complete pseudocode steps are present`);
    const breakdown = solution.timeComplexityBreakdown;
    assert.ok(breakdown?.variables?.trim() && breakdown.note?.trim(), `${filename}: complexity derivation is explained`);
    assert.ok(Array.isArray(breakdown.phases) && breakdown.phases.length > 0 && breakdown.phases.every(phase => phase.label?.trim() && phase.cost?.trim()), `${filename}: complexity phases are present`);
    assert.ok(Array.isArray(breakdown.simplifications) && breakdown.simplifications.length > 0 && breakdown.simplifications.every(expression => expression.trim()), `${filename}: complexity calculation is present`);
    for (const [field, extension] of [['code', 'js'], ['pythonCode', 'py']]) {
      const reference = fs.readFileSync(path.join(importsDirectory, `${entry.slug}${variant === 'dfs' ? '-dfs' : ''}.${extension}`), 'utf8').replace(/\r?\n$/, '');
      assert.equal(solution[field], reference, `${filename}: ${extension} matches its complete reference exactly`);
    }
    assert.ok(Object.keys(solution.variables).length >= 2, `${filename}: complexity symbols are defined`);
    assert.ok(Object.values(solution.variables).every(value => typeof value === 'string' && value.trim()));
    assert.ok(solution.variables.N && solution.variables.C);
    if (entry.slug === 'mixed-knapsack' && variant === 'dp') assert.ok(solution.variables.B);
    assert.ok(Array.isArray(solution.notes) && solution.notes.every(note => typeof note === 'string' && note.trim()));
    const jsName = solution.code.match(/^function (\w+)\(/)?.[1];
    const pythonName = solution.pythonCode.match(/^def (\w+)\(/)?.[1];
    assert.ok(jsName && pythonName, `${filename}: complete named functions`);
    assert.ok(solution.walkthroughMarkdown.includes(`${jsName}(items,`));
    assert.ok(solution.pythonWalkthroughMarkdown.includes(`${pythonName}(items,`));
    for (const field of ['walkthroughMarkdown', 'pythonWalkthroughMarkdown']) {
      const trace = solution[field];
      if (variant === 'dfs') {
        assert.match(trace, /dfs\(/, `${filename}: ${field} follows recursive calls`);
        assert.match(trace, /(?:memo|cache)/i, `${filename}: ${field} explains memoization`);
        assert.match(trace, /return/i, `${filename}: ${field} reaches the result`);
        continue;
      }
      const expectedIterations = entry.slug === 'mixed-knapsack' ? 25 : 5;
      assert.equal([...trace.matchAll(/^\*\*current = \d+\*\*$/gm)].length, expectedIterations, `${filename}: ${field} covers every capacity iteration`);
      assert.ok(trace.includes('return dp[capacity]'), `${filename}: ${field} reaches the return`);
      if (entry.slug === 'mixed-knapsack') {
        assert.equal([...trace.matchAll(/`count = [12]`:/g)].length, 17, `${filename}: ${field} covers every bounded candidate`);
      }
    }
    solutions++;
  }
}
console.log(JSON.stringify({ passed: true, knapsackProblems: filenames.length, solutions, exactLanguageImplementations: solutions * 2 }));
