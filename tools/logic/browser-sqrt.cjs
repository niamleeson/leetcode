const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { solutionMap } = require('../walkthroughs/load.cjs');

const root = path.resolve(__dirname, '../..');
const base = process.env.LEETCODE_TEST_URL || 'http://127.0.0.1:5193/leetcode/';
const output = process.env.LEETCODE_SCREENSHOTS || '/tmp/leetcode-browser-check/sqrt';
const revision = fs.readFileSync(path.join(root, 'src/data/logic/guided-manifest.ts'), 'utf8').match(/"([a-f0-9]{16})"/)[1];
const lesson = language => JSON.parse(fs.readFileSync(path.join(root, 'public/logic/lessons', revision, `69-${language}.json`)));
const solution = solutionMap[69];
const js = lesson('javascript'), python = lesson('python');
const runtime = /\/vendor\/pyodide\/|\.worker-/;
const oldJavaScript = /return lo - 1|return k - 1|lo = 0, hi = x \+ 1|minimize k|first-too-large/i;

function matchesSource(actual, expected) { assert.equal(actual.trim(), expected.trim()); }
async function checkJavaScriptProse(container) {
  const text = await container.innerText();
  assert(!oldJavaScript.test(text), 'JavaScript solution still shows the old boundary-search explanation');
  assert.match(text, /answer|valid candidate/i);
}
async function codeFromWalkthrough(page, language) {
  const source = page.getByLabel(`Walkthrough ${language} code`, { exact: true });
  await source.waitFor();
  return (await source.locator('.traversal-line-content').allTextContents()).join('\n');
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  assert.equal(js.questions.filter(question => question.stage === 'structure').length, 4);
  assert.equal(js.questions.filter(question => question.stage === 'implementation').length, 12);
  matchesSource(js.source, solution.jsCode);
  matchesSource(python.source, solution.code);
  assert.match(js.questions.at(-1).choices.find(choice => choice.correct).code, /return answer;/);
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const requests = [], failures = [], errors = [];
  page.on('request', request => requests.push(request.url()));
  page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  page.on('pageerror', error => errors.push(error.message));
  const language = name => page.getByRole('group', { name: 'Implementation language', exact: true }).getByRole('button', { name, exact: true });
  const at = async question => {
    await page.locator(`[data-question-id=${JSON.stringify(question.id)}]`).waitFor();
    await page.getByRole('heading', { name: question.prompt, exact: true }).waitFor();
  };
  const choose = async (question, correct = true) => {
    await at(question);
    await page.locator('.guided-choice').nth(question.choices.findIndex(choice => choice.correct === correct)).tap();
  };
  const reference = page.getByRole('region', { name: 'Reference solution', exact: true });
  const noOverflow = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Sqrt view overflows phone viewport');
  try {
    await page.goto(`${base}#/practice/69?language=javascript`);
    await at(js.questions[0]);
    assert.equal(await page.locator('.guided-choice').count(), 8);
    assert.equal(await language('JavaScript').getAttribute('aria-pressed'), 'true');
    assert(await page.getByRole('region', { name: 'Full problem & examples', exact: true }).isVisible());
    assert.equal(await reference.getByRole('button', { name: 'Solution', exact: true }).getAttribute('aria-expanded'), 'true');
    await reference.locator('pre code').waitFor();
    matchesSource(await reference.locator('pre code').innerText(), solution.jsCode);
    await checkJavaScriptProse(reference);
    assert(requests.filter(url => /\/solutions\//.test(url)).every(url => /\/solutions\/69-[^/]+\.json$/.test(url)), 'Opening a problem downloaded unrelated solutions');
    await reference.getByRole('button', { name: 'Solution', exact: true }).tap();
    assert.equal(await reference.locator('pre code').count(), 0, 'Solution could not be collapsed');
    await reference.getByRole('button', { name: 'Solution', exact: true }).tap();
    await reference.locator('pre code').waitFor();
    assert(!requests.some(url => runtime.test(url)), 'Solution reveal loaded the execution runtime');

    const implementationStart = js.questions.findIndex(question => question.stage === 'implementation');
    for (let index = 0; index < js.questions.length; index++) {
      const question = js.questions[index];
      await at(question);
      assert.equal(await reference.getByRole('button', { name: 'Solution', exact: true }).getAttribute('aria-expanded'), 'true', 'Solution closed while advancing the quiz');
      assert(await reference.locator('pre code').isVisible());
      assert.equal(await page.getByRole('button', { name: 'Run tests', exact: true }).count(), 0, 'Runner appeared before the final answer');
      if (question.stage === 'structure') {
        assert.equal(await page.locator('.guided-question-card').count(), 1);
        assert.equal(await page.locator('.guided-question-card pre, .guided-question-card code, .guided-context').count(), 0, 'Planning exposed the code outline');
        assert.equal(await page.locator('.guided-choice').count(), 3);
        if (index + 1 < implementationStart) assert.equal(await page.getByRole('heading', { name: js.questions[index + 1].prompt, exact: true }).count(), 0);
      }
      if ([0, 1, implementationStart].includes(index)) {
        await choose(question, false);
        await page.getByLabel('Answer feedback', { exact: true }).getByText(index === 0 ? 'Try another approach' : 'Not quite', { exact: true }).waitFor();
        await at(question);
      }
      if (index === 1 || index === js.questions.length - 1) await page.screenshot({ path: path.join(output, index === 1 ? 'sqrt-structure-mobile.png' : 'sqrt-final-question-mobile.png'), fullPage: true });
      await choose(question);
    }
    const runner = page.getByRole('region', { name: 'Completed JavaScript solution', exact: true });
    await runner.getByRole('button', { name: 'Run tests', exact: true }).waitFor();
    await runner.getByLabel('Completed JavaScript code', { exact: true }).locator('pre code').waitFor();
    matchesSource(await runner.getByLabel('Completed JavaScript code', { exact: true }).locator('pre code').innerText(), solution.jsCode);
    assert(!requests.some(url => runtime.test(url)), 'Finishing the lesson loaded the execution runtime before Run');
    await runner.getByRole('button', { name: 'Run tests', exact: true }).tap();
    await runner.getByText(`${js.validation.correctCases} / ${js.validation.correctCases} practice tests passed`, { exact: true }).waitFor({ timeout: 60000 });
    const debugCases = [];
    for (const [name, input, expected, returned] of [['Example', 8, 2, 'return answer;'], ['Edge case', 1, 1, 'return mid;']]) {
      await runner.getByRole('button', { name: `${name} — passed`, exact: true }).tap();
      const values = await runner.locator('.guided-runner-values > div').allInnerTexts();
      assert(values.some(value => value === `Input\n[${input}]`), `Incorrect input for ${name}: ${values}`);
      assert(values.some(value => value === `Actual\n${expected}`), `Incorrect output for ${name}: ${values}`);
      await runner.getByRole('button', { name: 'Step through', exact: true }).tap();
      await runner.getByRole('button', { name: 'Next', exact: true }).tap();
      await runner.getByLabel('JavaScript variables', { exact: true }).waitFor();
      await runner.getByRole('slider', { name: 'Execution step', exact: true }).press('End');
      assert.equal(await runner.getByLabel('Current executed statement', { exact: true }).innerText(), returned);
      assert(await runner.getByRole('button', { name: 'Next', exact: true }).isDisabled());
      debugCases.push({ input, expected, returned });
    }
    assert(!requests.some(url => url.includes('/vendor/pyodide/')), 'JavaScript downloaded Python');
    await noOverflow();
    await page.screenshot({ path: path.join(output, 'sqrt-guided-completed-mobile.png'), fullPage: true });
    await page.getByRole('button', { name: 'Start again', exact: true }).tap();
    await at(js.questions[0]);
    await reference.locator('pre code').waitFor();
    assert.equal(await reference.getByRole('button', { name: 'Solution', exact: true }).getAttribute('aria-expanded'), 'true', 'Restart collapsed the solution');

    await page.goto(`${base}#/problem/69`);
    await page.getByRole('heading', { name: 'JavaScript Solution', exact: true }).waitFor();
    assert.equal(await language('JavaScript').getAttribute('aria-pressed'), 'true', 'Problem page lost the shared JavaScript selection');
    matchesSource(await page.locator('main pre code.language-javascript').innerText(), solution.jsCode);
    const main = page.locator('main');
    await checkJavaScriptProse(main);
    assert((await main.innerText()).includes(solution.jsApproach));
    assert.match(await main.innerText(), /lo > hi.*Return answer = 2/s);
    await noOverflow();
    await language('Python').tap();
    await page.getByRole('heading', { name: 'Python Solution', exact: true }).waitFor();
    matchesSource(await page.locator('main pre code.language-python').innerText(), solution.code);
    assert((await main.innerText()).includes(solution.approach), 'Python explanation changed to the JavaScript algorithm');

    await page.goto(`${base}#/neetcode`);
    await page.getByRole('heading', { name: 'NeetCode 250', exact: true }).waitFor();
    assert.equal(await language('Python').getAttribute('aria-pressed'), 'true', 'NeetCode list lost the shared Python selection');
    const topic = page.locator('.neetcode-topic').filter({ has: page.getByRole('heading', { name: 'Binary Search', level: 2, exact: true }) });
    await topic.locator(':scope > button').tap();
    const row = topic.locator('.neetcode-problem').filter({ has: page.getByText('#69', { exact: true }) });
    await row.getByRole('button', { name: 'Expand solution', exact: true }).tap();
    matchesSource(await codeFromWalkthrough(row, 'Python'), solution.code);
    assert((await row.innerText()).includes(solution.approach));
    await language('JavaScript').tap();
    matchesSource(await codeFromWalkthrough(row, 'JavaScript'), solution.jsCode);
    await checkJavaScriptProse(row);
    assert((await row.innerText()).includes(solution.jsApproach));
    const walkthrough = row.getByRole('region', { name: 'Sqrt(x) walkthrough', exact: true });
    for (const [index, expected, returned] of [['0', '2', 'return answer;'], ['1', '1', 'return mid;']]) {
      await walkthrough.getByRole('combobox', { name: 'Sqrt(x) example', exact: true }).selectOption(index);
      await walkthrough.getByRole('slider', { name: 'Sqrt(x) step', exact: true }).press('End');
      assert.equal(await walkthrough.getByLabel('Final result', { exact: true }).locator('pre').innerText(), expected);
      assert.equal((await walkthrough.locator('.traversal-source-line[aria-current="step"] .traversal-line-content').innerText()).trim(), returned);
    }
    await noOverflow();
    await row.screenshot({ path: path.join(output, 'sqrt-neetcode-javascript-mobile.png') });
    await row.getByRole('link', { name: 'Practice Sqrt(x) in JavaScript', exact: true }).tap();
    await at(js.questions[0]);
    assert.equal(await language('JavaScript').getAttribute('aria-pressed'), 'true', 'Practice link lost the shared JavaScript selection');
    await language('Python').tap();
    await at(python.questions[0]);
    assert.equal(await reference.getByRole('button', { name: 'Solution', exact: true }).getAttribute('aria-expanded'), 'true', 'Changing language collapsed the solution');
    await reference.getByRole('heading', { name: 'Python solution', exact: true }).waitFor();
    matchesSource(await reference.locator('pre code').innerText(), solution.code);
    await choose(python.questions[0]);
    assert(await reference.locator('pre code').isVisible(), 'Python solution closed while advancing');
    await page.goto(`${base}#/practice/1?language=python`);
    await reference.getByRole('heading', { name: 'Python solution', exact: true }).waitFor();
    assert.equal(await reference.getByRole('button', { name: 'Solution', exact: true }).getAttribute('aria-expanded'), 'true', 'Changing problems collapsed the solution');
    assert.match(await reference.locator('pre code').innerText(), /def twoSum/);
    await page.waitForLoadState('networkidle');
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    const report = { passed: true, revision, patternChoices: 8, structureQuestions: 4, implementationQuestions: 12, questions: js.questions.length, wrongAnswersStay: true, completedCodeMatchesCanonical: true, debugCases, pages: ['guided practice', 'problem detail', 'NeetCode 250'], javascriptProseMatches: true, sharedLanguage: true, pythonCodeUnchanged: true, solutionOpenByDefault: true, solutionStaysOpenDuringQuiz: true, optionalCollapseWorks: true, runtimeBeforeRun: false, failedResources: 0 };
    fs.writeFileSync(path.join(output, 'sqrt-browser-report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    await page.screenshot({ path: path.join(output, 'sqrt-browser-failure.png'), fullPage: true }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
