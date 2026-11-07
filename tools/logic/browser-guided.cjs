const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const url = process.env.LEETCODE_TEST_URL || 'http://127.0.0.1:5182/leetcode/';
const revision = fs.readFileSync(path.join(root, 'src/data/logic/guided-manifest.ts'), 'utf8').match(/"([a-f0-9]{16})"/)[1];
const lesson = (id, language) => JSON.parse(fs.readFileSync(path.join(root, 'public/logic/lessons', revision, `${id}-${language}.json`)));
const output = process.env.LEETCODE_SCREENSHOTS || '/tmp/leetcode-browser-check';

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const requests = [], errors = [];
    page.on('request', request => requests.push(request.url()));
    page.on('pageerror', error => errors.push(error.message));
    const choices = page.locator('.guided-choice');
    const feedback = page.getByLabel('Answer feedback', { exact: true });
    async function answer(question, correct = true) {
      await page.getByRole('heading', { name: question.prompt, exact: true }).waitFor();
      await choices.nth(question.choices.findIndex(choice => choice.correct === correct)).tap();
    }
    async function noOverflow() { assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Page overflows mobile viewport'); }
    async function finish(document, start = 0) {
      for (const question of document.questions.slice(start)) await answer(question);
      await page.getByRole('button', { name: 'Run tests', exact: true }).waitFor();
    }
    async function runAndDebug(language, count = 6) {
      await page.getByRole('button', { name: 'Run tests', exact: true }).tap();
      try { await page.getByText(`${count} / ${count} practice tests passed`, { exact: true }).waitFor({ timeout: 60000 }); }
      catch (error) { console.error(await page.locator('.guided-runner').innerText()); await page.screenshot({ path: path.join(output, 'guided-run-failure.png'), fullPage: true }); throw error; }
      await page.getByRole('button', { name: 'Step through', exact: true }).tap();
      await page.getByRole('button', { name: 'Next', exact: true }).tap();
      assert((await page.getByLabel('Current executed statement', { exact: true }).innerText()).length > 0);
      await page.getByLabel(`${language} variables`, { exact: true }).waitFor();
      await noOverflow();
    }
    const js = lesson(1, 'javascript'), py = lesson(1, 'python');
    await page.goto(`${url}#/practice/1?language=javascript`);
    await choices.nth(7).waitFor();
    await page.waitForLoadState('networkidle');
    assert.equal(await choices.count(), 8);
    assert.equal(await page.locator('.guided-context, .guided-runner').count(), 0);
    assert.equal(requests.filter(value => value.includes('/logic/lessons/')).length, 1);
    assert(!requests.some(value => /\/solutions\/|\/vendor\/pyodide\/|\.worker-/.test(value)));
    const initialRequests = [...requests];
    await page.screenshot({ path: path.join(output, 'guided-pattern-mobile.png'), fullPage: true });
    await noOverflow();
    await answer(js.questions[0], false);
    await page.getByRole('alert').filter({ hasText: 'Try another approach' }).waitFor();
    assert.equal(await choices.count(), 8);
    await answer(js.questions[0]);
    await page.getByRole('heading', { name: js.questions[1].prompt, exact: true }).waitFor();
    assert.equal(await choices.count(), 4);
    assert.match(await feedback.innerText(), /Correct/);
    await answer(js.questions[1], false);
    await page.getByRole('alert').filter({ hasText: 'Try another approach' }).waitFor();
    await answer(js.questions[1]);
    const firstImplementation = js.questions[2];
    await answer(firstImplementation, false);
    await page.getByRole('alert').filter({ hasText: 'Not quite' }).waitFor();
    await page.getByText('See the counterexample', { exact: true }).tap();
    await page.getByText('This choice produces', { exact: true }).waitFor();
    await page.screenshot({ path: path.join(output, 'guided-feedback-mobile.png'), fullPage: true });
    await page.reload();
    await page.getByRole('heading', { name: firstImplementation.prompt, exact: true }).waitFor();
    await page.getByRole('button', { name: 'Python', exact: true }).tap();
    await choices.nth(7).waitFor();
    assert.equal(await choices.count(), 8, 'Python inherited JavaScript progress');
    await answer(py.questions[0]);
    await page.getByRole('heading', { name: py.questions[1].prompt, exact: true }).waitFor();
    await page.getByRole('button', { name: 'JavaScript', exact: true }).tap();
    await page.getByRole('heading', { name: firstImplementation.prompt, exact: true }).waitFor();
    const reference = page.getByRole('region', { name: 'Reference solution', exact: true });
    await reference.getByRole('button', { name: 'Reveal solution', exact: true }).tap();
    await reference.getByRole('heading', { name: 'JavaScript solution', exact: true }).waitFor();
    assert.equal((await reference.locator('pre code').innerText()).trim(), js.source.trim());
    await reference.getByRole('button', { name: 'Hide solution', exact: true }).tap();
    assert.equal(await reference.locator('pre code').count(), 0);
    assert(!requests.some(value => /\/vendor\/pyodide\/|\.worker-/.test(value)));
    await finish(js, 2);
    assert(!requests.some(value => /\.worker-/.test(value)), 'Worker loaded before Run');
    await runAndDebug('JavaScript');
    assert(!requests.some(value => value.includes('/vendor/pyodide/')), 'JavaScript downloaded Python');
    await page.getByLabel('JavaScript execution debugger', { exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, 'guided-javascript-debugger.png'), fullPage: true });
    await page.getByRole('button', { name: 'Python', exact: true }).tap();
    await page.getByRole('heading', { name: py.questions[1].prompt, exact: true }).waitFor();
    await reference.getByRole('button', { name: 'Reveal solution', exact: true }).tap();
    await reference.getByRole('heading', { name: 'Python solution', exact: true }).waitFor();
    assert.equal((await reference.locator('pre code').innerText()).trim(), py.source.trim());
    await reference.getByRole('button', { name: 'Hide solution', exact: true }).tap();
    await finish(py, 1);
    assert(!requests.some(value => value.includes('/vendor/pyodide/')), 'Python loaded before Run');
    await runAndDebug('Python');
    await page.getByLabel('Python execution debugger', { exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, 'guided-python-debugger.png'), fullPage: true });
    await page.reload();
    await page.getByRole('button', { name: 'Run tests', exact: true }).waitFor();
    assert.equal(await page.getByText('6 / 6 practice tests passed', { exact: true }).count(), 0, 'Reload automatically ran code');
    await page.getByRole('button', { name: 'Start again', exact: true }).tap();
    await choices.nth(7).waitFor();
    assert.equal(await page.locator('.guided-runner').count(), 0);
    assert.equal(await reference.locator('pre code').count(), 0);
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
    await page.getByRole('button', { name: 'Close menu', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('aside').getBoundingClientRect().right <= 1);
    await page.screenshot({ path: path.join(output, 'guided-pattern-light.png'), fullPage: true });
    await noOverflow();
    await page.route('**/logic/lessons/*/217-python.json', route => route.abort());
    await page.goto(`${url}#/practice/217?language=python`);
    await page.getByRole('alert').filter({ hasText: 'guided questions could not load' }).waitFor();
    await page.unroute('**/logic/lessons/*/217-python.json');
    await page.getByRole('button', { name: 'Retry questions', exact: true }).tap();
    await choices.nth(7).waitFor();
    await page.route('**/solutions/217-*.json', route => route.abort());
    await reference.getByRole('button', { name: 'Reveal solution', exact: true }).tap();
    await reference.getByRole('alert').waitFor();
    await page.unroute('**/solutions/217-*.json');
    await reference.getByRole('button', { name: 'Retry solution', exact: true }).tap();
    await reference.locator('pre code').waitFor();
    for (const [id, language] of [[208, 'python'], [705, 'javascript'], [1584, 'javascript']]) {
      const document = lesson(id, language);
      await page.goto(`${url}#/practice/${id}?language=${language}`);
      await finish(document);
      await runAndDebug(language === 'python' ? 'Python' : 'JavaScript', document.validation.correctCases);
      if (id === 208 || id === 705) await page.getByText('Constructor and calls in order', { exact: true }).waitFor();
    }
    await page.goto(`${url}#/practice`);
    await page.getByRole('searchbox', { name: 'Find a practice problem' }).fill('Binary Search');
    await page.getByRole('button', { name: 'JavaScript', exact: true }).tap();
    await page.getByRole('link', { name: /#704/ }).tap();
    await choices.nth(7).waitFor();
    assert.equal(await page.getByRole('button', { name: 'JavaScript', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: path.join(output, 'guided-desktop.png'), fullPage: true });
    assert.deepEqual(errors, []);
    const report = { passed: true, revision, initialRequests, checks: ['8 patterns, structure, implementation', 'wrong stays, correct advances', 'real counterexamples', 'independent persistent language progress', 'matching reveal and retry', 'real Python and JavaScript tests and stepping', 'no runtime before Run', 'no Python downloads for JavaScript', 'restart', 'mobile touch, dark/light, desktop', 'library language links'] };
    fs.writeFileSync(path.join(output, 'guided-browser-report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
