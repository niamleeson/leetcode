const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const base = process.env.LEETCODE_TEST_URL || 'http://127.0.0.1:5193/leetcode/';
const output = process.env.LEETCODE_SCREENSHOTS || '/tmp/leetcode-browser-check';
const revision = fs.readFileSync(path.join(root, 'src/data/logic/guided-manifest.ts'), 'utf8').match(/"([a-f0-9]{16})"/)[1];
const oldCommit = 'a9476fbab332e3b85dfe5de4311cd9fe6b42f09c';
const oldRunner = 'GuidedCodeRunner-CudlrgyO.js';
const runnerPattern = /\/assets\/GuidedCodeRunner-[^/]+\.js(?:\?|$)/;
const runtimePattern = /\/vendor\/pyodide\/|\.worker-/;
const oldHtml = execFileSync('git', ['show', `${oldCommit}:docs/index.html`], { cwd: root });
const oldAssets = new Map();
const lesson = language => JSON.parse(fs.readFileSync(path.join(root, 'public/logic/lessons', revision, `1-${language}.json`)));
const storageKey = language => `lc-guided-progress-1-${language}`;

function oldAsset(name) {
  if (!oldAssets.has(name)) oldAssets.set(name, execFileSync('git', ['show', `${oldCommit}:docs/assets/${name}`], { cwd: root, maxBuffer: 20 * 1024 * 1024 }));
  return oldAssets.get(name);
}
async function newPage(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const requests = [], failures = [], errors = [], navigations = [];
  page.on('request', request => {
    requests.push(request.url());
    if (request.isNavigationRequest() && request.resourceType() === 'document') navigations.push(request.url());
  });
  page.on('response', response => { if (response.status() >= 400) failures.push({ status: response.status(), url: response.url() }); });
  page.on('pageerror', error => errors.push(error.message));
  return { context, page, requests, failures, errors, navigations };
}
async function at(page, question) {
  await page.locator(`[data-question-id=${JSON.stringify(question.id)}]`).waitFor();
  await page.getByRole('heading', { name: question.prompt, exact: true }).waitFor();
}
async function answer(page, question) {
  await at(page, question);
  await page.locator('.guided-choice').nth(question.choices.findIndex(choice => choice.correct)).tap();
}
async function expectProgress(page, language, document, skipFinal = false) {
  const expected = {
    revision: document.revision,
    answered: (skipFinal ? document.questions.slice(0, -1) : document.questions).map(question => question.id),
    skipped: skipFinal ? [document.questions.at(-1).id] : [],
    attempts: document.questions.length - (skipFinal ? 1 : 0),
  };
  await page.waitForFunction(({ key, expected }) => {
    return localStorage.getItem(key) === JSON.stringify(expected);
  }, { key: storageKey(language), expected });
  return expected;
}
async function expectEnd(page, document, skipFinal) {
  await page.locator('.guided-complete').getByText(skipFinal ? 'END OF WALKTHROUGH' : 'DECISIONS COMPLETE', { exact: true }).waitFor();
  if (skipFinal) assert.match(await page.locator('.guided-complete').innerText(), /1 skipped\./);
  assert(await page.getByRole('button', { name: 'Previous step', exact: true }).isEnabled());
  assert.equal(await page.locator('.guided-question-card[data-question-id]').count(), 0);
  assert(await page.getByRole('region', { name: 'Full problem & examples', exact: true }).isVisible());
  assert(await page.getByRole('button', { name: 'Solution', exact: true }).isVisible());
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Recovery screen overflows mobile viewport');
}

// Run the precise pre-fix build as a control. Its runner URL was deleted by the
// next deployment; keeping all other old modules makes that failure deterministic.
// With the fix, only the old HTML is substituted: every asset must come from the
// actual new deployment, including all dependencies of the old runner.
async function oldTabCheck(browser, reproduce) {
  const { context, page, requests, failures, errors } = await newPage(browser);
  const document = lesson('javascript');
  try {
    await page.route('**/*', async route => {
      const request = route.request();
      if (request.isNavigationRequest() && request.resourceType() === 'document') {
        return route.fulfill({ status: 200, contentType: 'text/html', body: oldHtml });
      }
      const requestUrl = new URL(request.url());
      const filename = requestUrl.pathname.split('/').at(-1);
      if (reproduce && requestUrl.pathname.includes('/assets/') && /\.(js|css)$/.test(filename)) {
        if (filename === oldRunner) return route.fulfill({ status: 404, contentType: 'text/plain', body: 'The next deployment removed this lazy module.' });
        return route.fulfill({ status: 200, contentType: filename.endsWith('.js') ? 'text/javascript' : 'text/css', body: oldAsset(filename) });
      }
      return route.continue();
    });
    await page.goto(`${base}#/practice/1?language=javascript`);
    for (const question of document.questions) await answer(page, question);
    if (reproduce) {
      await page.waitForFunction(() => document.getElementById('root')?.children.length === 0);
      assert(errors.some(error => error.includes('Failed to fetch dynamically imported module') && error.includes(oldRunner)), 'Did not reproduce the reported error');
      assert(failures.some(failure => failure.status === 404 && failure.url.endsWith(oldRunner)));
      return { control: 'pre-fix app', reproducedBlankScreen: true, missingChunk: oldRunner, errors };
    }
    await page.getByRole('button', { name: 'Run tests', exact: true }).waitFor();
    await page.waitForLoadState('networkidle');
    assert(requests.some(url => url.endsWith(oldRunner)), 'Did not exercise the reported old runner URL');
    assert.deepEqual(failures, [], 'The retained deployment has missing dependencies');
    assert.deepEqual(errors, [], 'The old open tab still crashed');
    assert(!requests.some(url => runtimePattern.test(url)), 'Retained code eagerly loaded an execution runtime');
    return { control: 'old open tab over new deployment', oldEntry: 'index-BUfjCgML.js', runner: oldRunner, completed: true, failedResources: 0 };
  } finally { await context.close(); }
}

async function recoveryCheck(browser, language, { skipFinal = false, failure = '404', repeatedReload = false } = {}) {
  const { context, page, requests, failures, errors, navigations } = await newPage(browser);
  const document = lesson(language);
  let blockRunner = true;
  let blockedRequests = 0;
  try {
    if (failure === '404') await page.route(runnerPattern, route => {
      if (!blockRunner) return route.continue();
      blockedRequests++;
      return route.fulfill({ status: 404, contentType: 'text/plain', body: 'Simulated stale deployment chunk' });
    });
    await page.goto(`${base}#/practice/1?language=${language}`);
    for (const question of document.questions.slice(0, -1)) await answer(page, question);
    await at(page, document.questions.at(-1));
    assert(!requests.some(url => runnerPattern.test(url)), 'Runner must remain lazy until the final decision');
    if (failure === 'offline') await context.setOffline(true);
    if (skipFinal) await page.getByRole('button', { name: 'Skip step', exact: true }).tap();
    else await answer(page, document.questions.at(-1));
    const reload = page.getByRole('button', { name: 'Reload page', exact: true });
    await reload.waitFor();
    await expectEnd(page, document, skipFinal);
    const expectedProgress = await expectProgress(page, language, document, skipFinal);
    assert(!requests.some(url => runtimePattern.test(url)), 'Failure recovery eagerly loaded an execution runtime');
    assert.deepEqual(errors, [], 'A lazy module failure escaped its error boundary');
    await page.waitForLoadState('networkidle');
    assert.equal(navigations.length, 1, 'The page should wait for an explicit retry, not reload automatically');
    // Chromium can request the same module once for modulepreload and again
    // for import after that preload returns404. Neither is a document reload.
    const blockedBeforeReload = blockedRequests;
    if (failure === '404') assert(blockedBeforeReload > 0 && blockedBeforeReload <= 2, 'Unexpected repeated module requests');
    const box = await reload.boundingBox();
    assert(box && box.height >= 44 && box.width >= 44, 'Recovery button is too small for a phone');
    await page.screenshot({ path: path.join(output, `chunk-recovery-${language}-${skipFinal ? 'skipped' : 'answered'}-${failure}.png`), fullPage: true });

    // Keeping the outage through another reload must preserve the checkpoint
    // again and stay interactive, rather than silently resetting the lesson.
    if (repeatedReload) {
      await Promise.all([page.waitForEvent('domcontentloaded'), reload.tap()]);
      await reload.waitFor();
      await expectEnd(page, document, skipFinal);
      await expectProgress(page, language, document, skipFinal);
      await page.waitForLoadState('networkidle');
      assert.equal(navigations.length, 2, 'Unexpected automatic page reload');
      assert(blockedRequests > blockedBeforeReload && blockedRequests <= blockedBeforeReload + 2, 'Unexpected runner retries');
    }
    blockRunner = false;
    await context.setOffline(false);
    await Promise.all([page.waitForEvent('domcontentloaded'), reload.tap()]);
    await page.getByRole('button', { name: 'Run tests', exact: true }).waitFor();
    await page.waitForLoadState('networkidle');
    await expectEnd(page, document, skipFinal);
    await expectProgress(page, language, document, skipFinal);
    assert.equal(await reload.count(), 0);
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey(language)), expectedProgress);
    assert(!requests.some(url => runtimePattern.test(url)), 'Recovery loaded an execution runtime before Run');
    assert.deepEqual(errors, []);

    // Recovery must not change normal completed-lesson revisit behavior.
    await page.reload();
    await at(page, document.questions[0]);
    assert.equal(await page.locator('.guided-runner').count(), 0);
    return { language, finalDecision: skipFinal ? 'skipped' : 'answered', failure, repeatedReload, completionRestored: true, normalRevisitStartsNewAttempt: true, runtimeRequestsBeforeRun: 0, expectedFailedResources: failures.length };
  } finally { await context.close(); }
}


async function solutionRecoveryCheck(browser, language, reviewingOpening) {
  const { context, page, requests, errors } = await newPage(browser);
  const document = lesson(language);
  const implementationStart = document.questions.findIndex(question => question.stage === 'implementation');
  const resumeAt = implementationStart + 1;
  let blockSolution = true;
  try {
    await page.route(/\/assets\/PracticeSolution-[^/]+\.js(?:\?|$)/, route => blockSolution
      ? route.fulfill({ status: 404, contentType: 'text/plain', body: 'Simulated stale solution chunk' })
      : route.continue());
    await page.goto(`${base}#/practice/1?language=${language}`);
    for (const question of document.questions.slice(0, implementationStart)) await answer(page, question);
    await at(page, document.questions[implementationStart]);
    await page.getByRole('button', { name: 'Skip step', exact: true }).tap();
    await at(page, document.questions[resumeAt]);
    let currentIndex = resumeAt;
    if (reviewingOpening) {
      await page.reload();
      await answer(page, document.questions[0]);
      currentIndex = 1;
      await at(page, document.questions[currentIndex]);
      await page.getByText('Review the approach and each structure step, then continue your saved implementation.', { exact: true }).waitFor();
    }
    const expectedProgress = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey(language));
    // The default-open solution can fail immediately; the quiz remains usable.
    const reload = page.getByRole('button', { name: 'Reload page', exact: true });
    await reload.waitFor();
    await at(page, document.questions[currentIndex]);
    assert(await page.getByRole('button', { name: 'Previous step', exact: true }).isEnabled());
    blockSolution = false;
    await Promise.all([page.waitForEvent('domcontentloaded'), reload.tap()]);
    await at(page, document.questions[currentIndex]);
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey(language)), expectedProgress, 'Solution recovery lost the current progress or attempts');
    if (reviewingOpening) {
      await page.getByText('Review the approach and each structure step, then continue your saved implementation.', { exact: true }).waitFor();
      for (let index = currentIndex; index < implementationStart; index++) await answer(page, document.questions[index]);
      await at(page, document.questions[resumeAt]);
      assert.equal(await page.getByText('Review the approach and each structure step, then continue your saved implementation.', { exact: true }).count(), 0);
    }
    assert.equal(await page.getByRole('button', { name: 'Solution', exact: true }).getAttribute('aria-expanded'), 'true');
    await page.getByRole('heading', { name: `${language === 'python' ? 'Python' : 'JavaScript'} solution`, exact: true }).waitFor();
    await page.locator('.logic-solution-content code').first().waitFor();
    assert(!requests.some(url => runtimePattern.test(url)), 'Showing the solution downloaded an execution runtime');
    assert.deepEqual(errors, []);
    return { language, failure: 'solution chunk 404', reviewingOpening, exactCursorRestored: true, skippedDecisionPreserved: true, openingResumePreserved: true };
  } finally { await context.close(); }
}

async function routeRecoveryCheck(browser) {
  const { context, page, errors } = await newPage(browser);
  let blockRoute = true;
  try {
    await page.route(/\/assets\/LogicPractice-[^/]+\.js(?:\?|$)/, route => blockRoute
      ? route.fulfill({ status: 404, contentType: 'text/plain', body: 'Simulated stale practice route chunk' })
      : route.continue());
    await page.goto(`${base}#/practice/1?language=javascript`);
    const reload = page.getByRole('button', { name: 'Reload page', exact: true });
    await reload.waitFor();
    assert.equal(await page.locator('#root').count(), 1);
    blockRoute = false;
    await Promise.all([page.waitForEvent('domcontentloaded'), reload.tap()]);
    await at(page, lesson('javascript').questions[0]);
    assert.deepEqual(errors, []);
    return { failure: 'practice route chunk 404', recovered: true };
  } finally { await context.close(); }
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    const reproduce = process.argv.includes('--reproduce-only');
    const oldTab = await oldTabCheck(browser, reproduce);
    const recovery = [];
    if (!reproduce) {
      for (const language of ['javascript', 'python']) {
        recovery.push(await recoveryCheck(browser, language, { repeatedReload: language === 'javascript' }));
        recovery.push(await recoveryCheck(browser, language, { skipFinal: true }));
      }
      recovery.push(await recoveryCheck(browser, 'python', { failure: 'offline' }));
    }
    const solutions = [];
    if (!reproduce) for (const language of ['javascript', 'python']) {
      solutions.push(await solutionRecoveryCheck(browser, language, false));
      solutions.push(await solutionRecoveryCheck(browser, language, true));
    }
    const route = reproduce ? null : await routeRecoveryCheck(browser);
    const report = { passed: true, revision, oldTab, recovery, solutions, route };
    fs.writeFileSync(path.join(output, reproduce ? 'chunk-reproduction-report.json' : 'chunk-recovery-report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
