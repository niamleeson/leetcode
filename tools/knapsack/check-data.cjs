const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const entriesDirectory = path.resolve(__dirname, '../../src/data/knapsack/entries');
const importsDirectory = path.join(__dirname, 'imports');
const expected = ['mixed-knapsack', 'unbounded-knapsack', 'zero-one-knapsack'];
const suppliedMarkdown = fs.readFileSync(path.join(__dirname, 'source.md'), 'utf8');
const suppliedCode = [...suppliedMarkdown.matchAll(/```javascript\n([\s\S]*?)\n```/g)]
  .map(match => match[1]).filter(code => code.startsWith('function knapsack(items, capacity) {'));
assert.equal(suppliedCode.length, 6, 'The saved user document contains exactly six complete implementations');
const suppliedOrder = ['zero-one-knapsack', 'unbounded-knapsack', 'mixed-knapsack'];
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
    const suppliedIndex = suppliedOrder.indexOf(entry.slug) * 2 + index;
    assert.equal(solution.code, suppliedCode[suppliedIndex], `${filename}: ${variant} exactly preserves the user-supplied JavaScript`);
    for (const field of ['title', 'code', 'pythonCode', 'intuition', 'approach', 'explanation', 'timeComplexity', 'spaceComplexity', 'example', 'walkthrough', 'pythonWalkthrough']) {
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
    assert.ok(solution.variables.n && solution.variables.C, `${filename}: n and C are defined`);
    assert.equal(solution.variables.B, undefined, `${filename}: mixed knapsack has no bounded-copy limit`);
    assert.ok(Array.isArray(solution.notes) && solution.notes.every(note => typeof note === 'string' && note.trim()));
    const jsName = solution.code.match(/^function (\w+)\(/)?.[1];
    const pythonName = solution.pythonCode.match(/^def (\w+)\(/)?.[1];
    assert.equal(jsName, 'knapsack', `${filename}: supplied JavaScript function name`);
    assert.equal(pythonName, 'knapsack', `${filename}: matching Python function name`);
    assert.ok(solution.walkthrough.includes(`${jsName}(items,`));
    assert.ok(solution.pythonWalkthrough.includes(`${pythonName}(items,`));
    for (const field of ['walkthrough', 'pythonWalkthrough']) {
      const trace = solution[field];
      assert.equal(solution[field + 'Markdown'], undefined, `${filename}: only the standard execution trace is saved`);
      assert.doesNotMatch(trace, /^#{1,6} |^```/m, `${filename}: trace is plain text`);
      if (variant === 'dfs') {
        assert.match(trace, /dfs\(/, `${filename}: ${field} follows recursive calls`);
        const expectedCalls = entry.slug === 'zero-one-knapsack' ? 7 : entry.slug === 'unbounded-knapsack' ? 25 : 13;
        assert.equal([...trace.matchAll(/^\s*Call \d+: dfs\(\d+, \d+\)/gm)].length, expectedCalls, `${filename}: ${field} shows every plain recursive call`);
        assert.equal([...trace.matchAll(/^\s*Return call \d+: \d+/gm)].length, expectedCalls, `${filename}: ${field} shows every recursive return`);
        assert.match(trace, /Return from knapsack: \d+/, `${filename}: ${field} reaches the result`);
        continue;
      }
      assert.equal([...trace.matchAll(/^c = \d+$/gm)].length, 13, `${filename}: ${field} covers every capacity iteration`);
      assert.ok(trace.includes('return dp[capacity]'), `${filename}: ${field} reaches the return`);
    }
    solutions++;
  }
}
console.log(JSON.stringify({ passed: true, knapsackProblems: filenames.length, solutions, exactUserJavaScriptImplementations: suppliedCode.length, exactLanguageImplementations: solutions * 2 }));
