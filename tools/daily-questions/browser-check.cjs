const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const root = path.resolve(__dirname, '../..');
const base = (process.argv[2] || 'http://127.0.0.1:5193/leetcode/').replace(/\/?$/, '/');
const origin = new URL(base).origin;
const directory = path.join(root, 'src/data/daily-questions/entries');
const entries = fs.readdirSync(directory).filter(name => name.endsWith('.json')).sort().reverse()
  .map(name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')));
const practiceDirectory = path.join(root, 'src/data/knapsack/entries');
const practices = ['zero-one-knapsack', 'unbounded-knapsack', 'mixed-knapsack']
  .map(slug => JSON.parse(fs.readFileSync(path.join(practiceDirectory, `${slug}.json`), 'utf8')));
const screenshotDirectory = process.env.DAILY_SCREENSHOTS_DIR || '/tmp/leetcode-daily-ui';
fs.mkdirSync(screenshotDirectory, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-gpu'] });
  const errors = [];
  const consoleErrors = [];
  const requestFailures = [];
  const badResponses = [];
  const results = [];
  let referenceSections;
  let referenceTrace;
  let referenceApproach;
  let referenceProblemHeading;
  let referenceProblemText;
  let referenceExample;
  const contexts = [];
  const makePage = async width => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, ...(width < 600 ? { isMobile: true, hasTouch: true } : {}) });
    contexts.push(context);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push({ text: message.text(), location: message.location() }); });
    page.on('requestfailed', request => {
      if (request.url().startsWith(origin) && request.failure()?.errorText !== 'net::ERR_ABORTED') {
        requestFailures.push({ url: request.url(), error: request.failure()?.errorText });
      }
    });
    page.on('response', response => {
      if (response.url().startsWith(origin) && response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() });
    });
    return page;
  };
  const dailyList = page => page.getByRole('list', { name: 'Daily questions', exact: true });
  const openMenuDaily = async page => {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await page.getByRole('link', { name: 'Daily Questions', exact: true }).click();
    await page.getByRole('heading', { name: 'Daily Questions', exact: true }).waitFor();
    await page.waitForFunction(() => document.querySelector('aside').getBoundingClientRect().right <= 0);
  };
  const checkOverflow = async page => {
    const layout = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    assert.ok(layout.document <= layout.width + 1, `Page overflows horizontally: ${JSON.stringify(layout)}`);
    assert.ok(layout.body <= layout.width + 1, `Body overflows horizontally: ${JSON.stringify(layout)}`);
  };
  const checkRemovedControls = async page => {
    assert.equal(await page.getByRole('heading', { name: 'Rate your confidence', exact: true }).count(), 0);
    assert.equal(await page.getByRole('button', { name: /^(?:Add notes\.\.\.|Hide notes|[0-5]\s+(?:Blackout|Wrong|Hard|OK|Good|Easy))$/ }).count(), 0);
    assert.equal(await page.getByPlaceholder('Your notes (patterns, approach, key insight)...').count(), 0);
  };
  const templateSections = root => root.locator('[data-solution-section]').evaluateAll(elements => elements.map(element => ({
    name: element.getAttribute('data-solution-section'),
    headingClass: element.querySelector(':scope > h2, :scope > div > h2')?.className ?? null,
  })));
  const typography = locator => locator.evaluate(element => {
    const style = getComputedStyle(element);
    return Object.fromEntries(['fontSize', 'lineHeight', 'fontFamily', 'padding', 'borderRadius', 'whiteSpace']
      .map(key => [key, style[key]]));
  });
  const checkProblemTemplate = async page => {
    const description = page.getByRole('region', { name: 'Problem description', exact: true });
    assert.equal(await description.locator(':scope > h2').getAttribute('class'), referenceProblemHeading, 'Problem heading matches #2');
    const text = await typography(description.locator(':scope > .catalog-prose'));
    assert.equal(text.fontSize, referenceProblemText.fontSize, 'Problem text size matches #2');
    assert.equal(text.lineHeight, referenceProblemText.lineHeight, 'Problem text line height matches #2');
    const example = description.locator('pre, .problem-template-example').first();
    const actual = await typography(example);
    if (await example.evaluate(element => element.tagName !== 'PRE')) actual.whiteSpace = referenceExample.whiteSpace;
    assert.deepEqual(actual, referenceExample, 'Example typography matches #2');
  };
  const checkComparison = async (page, width) => {
    const variants = page.getByRole('region', { name: 'DFS and DP solutions', exact: true }).locator(':scope > section');
    assert.equal(await variants.count(), 3);
    assert.deepEqual(await variants.locator(':scope > div > h2').allTextContents(), [
      'DFS without memoization', 'DFS with memoization', 'Bottom-up DP (Mixed Knapsack)',
    ], 'Read plain DFS, then memoized DFS, then DP on mobile and with assistive technology');
    const dfs = page.getByRole('region', { name: 'Saved solution: DFS without memoization', exact: true });
    const memo = page.getByRole('region', { name: 'Saved solution: DFS with memoization', exact: true });
    const dp = page.getByRole('region', { name: 'Saved solution: Bottom-up DP (Mixed Knapsack)', exact: true });
    const left = await dfs.boundingBox();
    const below = await memo.boundingBox();
    const right = await dp.boundingBox();
    if (width >= 1024) {
      assert.ok(left.x + left.width <= right.x, 'DFS is left of DP');
      assert.ok(Math.abs(left.y - right.y) <= 1, 'Plain DFS and DP start together');
      assert.ok(Math.abs(left.x - below.x) <= 1 && Math.abs(left.width - below.width) <= 1, 'Memoized DFS uses the same left column');
      assert.ok(left.y + left.height <= below.y, 'The complete memoized solution sits below plain DFS');
      for (const name of referenceSections.map(section => section.name)) {
        const first = await dfs.locator(`[data-solution-section="${name}"]`).boundingBox();
        const second = await dp.locator(`[data-solution-section="${name}"]`).boundingBox();
        assert.ok(Math.abs(first.y - second.y) <= 1, `${name}: comparison columns align`);
      }
    } else {
      assert.ok(left.y + left.height <= below.y, 'Plain DFS stacks above memoized DFS on mobile');
      assert.ok(below.y + below.height <= right.y, 'Memoized DFS stacks above DP on mobile');
      assert.ok(Math.abs(left.x - below.x) <= 1 && Math.abs(left.x - right.x) <= 1, 'All mobile solutions use the same column');
    }
  };
  const rollingWalkthrough = page => page.getByRole('region', { name: 'Binary search + rolling hash walkthrough', exact: true });
  const sequenceWalkthrough = page => page.getByRole('region', { name: 'Binary search + exact sequence IDs walkthrough', exact: true });
  const checkTemplate = async (page, solutions) => {
    await checkRemovedControls(page);
    const preference = await page.evaluate(() => JSON.parse(localStorage.getItem('lc-language') || '"javascript"'));
    const sections = page.locator('section[aria-label^="Saved solution:"]');
    assert.equal(await sections.count(), solutions.length);
    for (let index = 0; index < solutions.length; index++) {
      const solution = solutions[index];
      const section = page.getByRole('region', { name: `Saved solution: ${solution.title}`, exact: true });
      const expectedCode = preference === 'python' && solution.pythonCode ? solution.pythonCode : solution.code;
      assert.equal(await section.locator('[data-solution-section="solution"] > pre.code-block code').textContent(), expectedCode, `${solution.title}: exact code in selected language`);
      if (solution.pythonCode) {
        const js = section.getByRole('button', { name: 'JavaScript', exact: true });
        const py = section.getByRole('button', { name: 'Python', exact: true });
        assert.equal(await js.getAttribute('aria-pressed'), String(preference === 'javascript'), `${solution.title}: shared JavaScript selection`);
        assert.equal(await py.getAttribute('aria-pressed'), String(preference === 'python'), `${solution.title}: shared Python selection`);
        assert.ok((await js.boundingBox()).x < (await py.boundingBox()).x, `${solution.title}: JavaScript is left of Python`);
      }
      assert.deepEqual(await templateSections(section), referenceSections, `${solution.title}: same template and heading styles as problem #2`);
      assert.ok((await section.locator('[data-solution-section="intuition"]').innerText()).includes(solution.intuition));
      assert.ok((await section.locator('[data-solution-section="explanation"]').innerText()).includes(solution.explanation));
      assert.deepEqual(await section.locator('[data-solution-section="pseudocode"] li').allTextContents(), solution.pseudocode.steps);
      assert.ok((await section.locator('[data-solution-section="pseudocode"]').innerText()).includes(solution.pseudocode.concept));
      assert.ok((await section.locator('[data-solution-section="complexity"]').innerText()).includes(solution.timeComplexityBreakdown.note));
      for (const definition of Object.values(solution.variables)) {
        assert.ok((await section.locator('[data-solution-section="complexity"]').innerText()).includes(definition));
      }
      for (const name of ['Intuition', 'Approach', 'Hints', 'Pseudocode (for memorization)', 'Explanation', 'Step-by-Step Walkthrough']) {
        assert.equal(await section.getByRole('heading', { name, exact: true }).count(), 1, `${solution.title}: ${name}`);
      }
      assert.equal(await section.locator('details:not([open])').count(), 0);
      assert.equal(await section.getByRole('region', { name: `${solution.title} walkthrough`, exact: true }).isVisible(), true);
      if (solution.walkthrough) {
        const trace = section.getByRole('region', { name: `${solution.title} walkthrough`, exact: true }).locator(':scope > pre');
        const expectedTrace = preference === 'python' && solution.pythonCode ? solution.pythonWalkthrough : solution.walkthrough;
        assert.equal(await trace.textContent(), expectedTrace, `${solution.title}: complete execution trace`);
        assert.equal(await trace.getAttribute('class'), referenceTrace, `${solution.title}: same trace renderer as #2`);
        const approach = section.locator('[data-solution-section="approach"] > span');
        assert.equal(await approach.getAttribute('class'), referenceApproach);
        assert.equal(await section.locator('[data-solution-section="approach"] pre').count(), 0, 'No repeated example in Approach');
        for (const note of solution.notes || []) {
          assert.ok((await section.locator('[data-solution-section="explanation"]').innerText()).includes(note));
        }
      }
    }
  };
  const checkSequenceWalkthrough = async page => {
    const walkthrough = sequenceWalkthrough(page);
    await walkthrough.waitFor();
    const saved = entries.find(entry => entry.id === 3934).solutions[0];
    assert.equal(await walkthrough.locator(':scope > pre').textContent(), saved.walkthrough);
    assert.equal(await walkthrough.locator('table, .catalog-prose, details').count(), 0);
    assert.equal([...saved.walkthrough.matchAll(/^Block i =/gm)].length, 6);
    assert.equal([...saved.walkthrough.matchAll(/^  Window i =/gm)].length, 7);
    assert.match(saved.walkthrough, /Output: return lo = 3/);
  };
  const checkRollingWalkthrough = async page => {
    const walkthrough = rollingWalkthrough(page);
    await walkthrough.waitFor();
    const saved = entries.find(entry => entry.id === 3934).solutions[1];
    assert.equal(await walkthrough.locator(':scope > pre').textContent(), saved.walkthrough);
    assert.equal(await walkthrough.locator('table, .catalog-prose, details').count(), 0);
    assert.equal([...saved.walkthrough.matchAll(/^Binary check/gm)].length, 3);
    assert.equal([...saved.walkthrough.matchAll(/^  recordWindow\(/gm)].length, 19);
    assert.ok(saved.walkthrough.includes('1000110002 - 109995 = 1000000007'));
  };
  const readyDaily = async (page, entry) => {
    await page.waitForURL(url => url.hash === `#/problem/${entry.id}?daily=${entry.date}`);
    await page.locator(`main time[datetime="${entry.date}"]`).waitFor();
    await page.getByRole('region', { name: 'Solution comparison', exact: true }).waitFor();
    const saved = page.locator('section[aria-label^="Saved solution:"]');
    await saved.first().locator('[data-solution-section="solution"] > pre.code-block code').waitFor();
    assert.equal(await saved.count(), entry.solutions.length, `${entry.id}: saved solution count`);
    for (let i = 0; i < entry.solutions.length; i++) {
      assert.equal(await saved.nth(i).locator('details:not([open])').count(), 0, `${entry.id}: saved code is open`);
      const explanation = saved.nth(i).locator('[data-solution-section="approach"] > span');
      assert.ok((await explanation.innerText()).trim().length > 40, `${entry.id}: short explanation accompanies the code`);
      assert.equal(await explanation.evaluate(element => Boolean(element.compareDocumentPosition(element.closest('section[aria-label^="Saved solution:"]').querySelector('[data-solution-section="solution"] > pre.code-block')) & Node.DOCUMENT_POSITION_FOLLOWING)), true, `${entry.id}: explanation comes before the code`);
    }
    await checkTemplate(page, entry.solutions);
  };
  const checkDaily = async (page, entry, index) => {
    await readyDaily(page, entry);
    const description = page.getByRole('region', { name: 'Problem description', exact: true });
    await description.waitFor();
    assert.equal(await description.count(), 1, `${entry.id}: single problem statement`);
    await checkProblemTemplate(page);
    const problemText = await description.innerText();
    assert.match(problemText, /Example(?:\s*1)?\s*:/i, `${entry.id}: examples included`);
    assert.match(problemText, /Input/i);
    assert.match(problemText, /Output/i);
    assert.equal(await description.evaluate(element => Boolean(element.closest('details:not([open])'))), false, `${entry.id}: description and examples are expanded`);
    const comparison = page.getByRole('region', { name: 'Solution comparison', exact: true });
    assert.ok((await comparison.innerText()).includes(entry.comparison.summary));
    for (const detail of entry.comparison.details) assert.ok((await comparison.innerText()).includes(detail));
    for (const solution of entry.solutions) {
      const section = page.getByRole('region', { name: `Saved solution: ${solution.title}`, exact: true });
      for (const note of solution.notes || []) assert.equal(await section.getByText(note, { exact: true }).isVisible(), true, `${entry.id}: implementation note visible`);
    }
    const adjacent = page.getByRole('navigation', { name: 'Adjacent daily questions', exact: true });
    const previous = adjacent.getByRole('link', { name: '← Previous question', exact: true });
    const next = adjacent.getByRole('link', { name: 'Next question →', exact: true });
    if (index > 0) assert.equal(await previous.getAttribute('href'), `#/problem/${entries[index - 1].id}?daily=${entries[index - 1].date}`);
    else assert.equal(await previous.count(), 0);
    if (index < entries.length - 1) assert.equal(await next.getAttribute('href'), `#/problem/${entries[index + 1].id}?daily=${entries[index + 1].date}`);
    else assert.equal(await next.count(), 0);
    await checkOverflow(page);
  };

  try {
    assert.equal(entries.length, 9);
    const page = await makePage(1280);
    await page.goto(`${base}#/problem/2`);
    await page.getByRole('heading', { name: 'Pseudocode (for memorization)', exact: true }).waitFor();
    referenceSections = await templateSections(page.locator('main'));
    referenceTrace = await page.getByRole('region', { name: 'Step-by-step walkthrough', exact: true }).locator(':scope > pre').getAttribute('class');
    referenceApproach = await page.locator('[data-solution-section="approach"] > span').getAttribute('class');
    referenceProblemHeading = await page.getByRole('region', { name: 'Problem description', exact: true }).locator(':scope > h2').getAttribute('class');
    referenceProblemText = await typography(page.getByRole('region', { name: 'Problem description', exact: true }).locator(':scope > span'));
    referenceExample = await typography(page.getByRole('region', { name: 'Problem description', exact: true }).locator(':scope > pre'));
    assert.deepEqual(referenceSections.map(section => section.name), ['intuition', 'approach', 'hints', 'solution', 'pseudocode', 'explanation', 'complexity']);
    await checkRemovedControls(page);
    await page.getByRole('button', { name: 'Reveal Hint 1', exact: true }).click();
    assert.equal(await page.getByText('Hint 1:', { exact: true }).count(), 1);
    await page.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, 'reference-problem-2-desktop.png'), fullPage: true });
    await page.goto(`${base}#/problem/4101`);
    await page.getByRole('region', { name: 'Solution implementation', exact: true }).waitFor();
    await checkRemovedControls(page);
    const dailyChunks = new Set();
    const practiceChunks = new Set();
    page.on('request', request => {
      const match = request.url().match(/\/(2026-11-\d{2})-[^/]+\.js(?:\?|$)/);
      if (match) dailyChunks.add(match[1]);
      const practice = request.url().match(/\/(zero-one-knapsack|unbounded-knapsack|mixed-knapsack)-[^/]+\.js(?:\?|$)/);
      if (practice) practiceChunks.add(practice[1]);
    });
    // Choose Python using the existing UI; the saved JavaScript view must not reset it.
    await page.goto(`${base}#/problem/1352`);
    await page.getByRole('button', { name: 'Python', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Python', exact: true }).getAttribute('aria-pressed'), 'true');
    await openMenuDaily(page);
    const rows = dailyList(page).locator('li');
    assert.equal(await rows.count(), entries.length);
    assert.deepEqual(await rows.locator('time').evaluateAll(elements => elements.map(element => element.getAttribute('datetime'))), entries.map(entry => entry.date));
    assert.equal(dailyChunks.size, 0, 'Daily list does not fetch saved solution bodies');
    assert.equal(practiceChunks.size, 0, 'Daily list does not fetch knapsack solution bodies');
    assert.equal(await page.getByRole('list', { name: 'Knapsack practice', exact: true }).locator('li').count(), 3);
    await page.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, 'list-desktop-dark.png'), fullPage: true });

    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      await dailyList(page).locator(`a[href="#/problem/${entry.id}?daily=${entry.date}"]`).click();
      await checkDaily(page, entry, index);
      const variants = page.locator('section[aria-label^="Saved solution:"]');
      for (let variantIndex = 0; variantIndex < entry.solutions.length; variantIndex++) {
        const variant = page.getByRole('region', { name: `Saved solution: ${entry.solutions[variantIndex].title}`, exact: true });
        for (let hintIndex = 0; hintIndex < entry.solutions[variantIndex].hints.length; hintIndex++) {
          await variant.getByRole('button', { name: `Reveal Hint ${hintIndex + 1}`, exact: true }).click();
          assert.ok((await variant.locator('[data-solution-section="hints"]').innerText()).includes(entry.solutions[variantIndex].hints[hintIndex]));
        }
      }
      assert.deepEqual([...dailyChunks].sort(), entries.slice(0, index + 1).map(item => item.date).sort(), 'Only opened dates fetch saved solution bodies');
      if (entry.id === 3934) {
        await checkSequenceWalkthrough(page);
        await checkRollingWalkthrough(page);
        await page.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, 'problem-desktop-dark.png') });
        assert.deepEqual(await page.locator('section[aria-label^="Saved solution:"] > div > h2').allTextContents(), [
          'Binary search + exact sequence IDs', 'Binary search + rolling hash', 'Simple suffix sorting + LCP', 'Optimized suffix array + LCP', 'Suffix automaton',
        ]);
      }
      if (entry.id === 3946) {
        await variants.nth(0).getByRole('button', { name: 'JavaScript', exact: true }).click();
        await checkTemplate(page, entry.solutions);
        await checkComparison(page, 1280);
        await variants.nth(1).getByRole('button', { name: 'Python', exact: true }).click();
        await checkTemplate(page, entry.solutions);
        await checkComparison(page, 1280);
      }
      if (entry.id === 2914) await page.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, 'daily-template-desktop.png'), fullPage: true });
      if (entry.id === 1352) {
        await page.getByRole('link', { name: 'View existing app solution', exact: true }).click();
        await page.getByRole('button', { name: 'Python', exact: true }).waitFor();
        assert.equal(await page.getByRole('button', { name: 'Python', exact: true }).getAttribute('aria-pressed'), 'true', 'Daily view preserved the shared Python preference');
        const example = page.locator('main pre').filter({ hasText: 'Output: [null,null,null,null,0,null,0]' });
        assert.equal(await example.count(), 1, 'Existing #1352 example includes the zero in the last three numbers');
        await page.goBack();
        await readyDaily(page, entry);
      }
      await page.getByRole('link', { name: '← Daily Questions', exact: true }).click();
      await dailyList(page).waitFor();
    }
    // Actual adjacent-page clicks and browser back retain the intended date and solution.
    await dailyList(page).locator('a').first().click();
    await readyDaily(page, entries[0]);
    await page.getByRole('link', { name: 'Next question →', exact: true }).click();
    await readyDaily(page, entries[1]);
    await page.waitForFunction(() => window.scrollY <= 1);
    await page.getByRole('link', { name: '← Previous question', exact: true }).click();
    await readyDaily(page, entries[0]);
    await page.waitForFunction(() => window.scrollY <= 1);
    await page.goBack();
    await readyDaily(page, entries[1]);
    results.push({ width: 1280, theme: 'dark', allDates: entries.length, exactSavedImplementations: entries.reduce((count, entry) => count + entry.solutions.length, 0), lazyLoading: true, sharedLanguagePreserved: true });

    for (const width of [1280, 390]) {
      const themedPage = await makePage(width);
      for (const theme of width === 1280 ? ['light'] : ['dark', 'light']) {
        await themedPage.goto(`${base}#/daily`);
        await dailyList(themedPage).waitFor();
        if (theme === 'light') {
          await themedPage.getByRole('button', { name: 'Open menu', exact: true }).click();
          await themedPage.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
          await themedPage.getByRole('button', { name: 'Close menu', exact: true }).click();
          await themedPage.waitForFunction(() => document.querySelector('aside').getBoundingClientRect().right <= 0);
        }
        await checkOverflow(themedPage);
        await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `list-${width}-${theme}.png`), fullPage: true });
        const firstLink = dailyList(themedPage).locator('a').first();
        if (width < 600) await firstLink.tap();
        else { await firstLink.focus(); await firstLink.press('Enter'); }
        await checkDaily(themedPage, entries[0], 0);
        await themedPage.getByRole('region', { name: 'Saved solution: DFS without memoization', exact: true }).getByRole('button', { name: 'JavaScript', exact: true }).click();
        await checkTemplate(themedPage, entries[0].solutions);
        await checkComparison(themedPage, width);
        await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `problem-${width}-${theme}.png`) });
        await themedPage.locator('[data-solution-section="intuition"]').first().scrollIntoViewIfNeeded();
        await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `intuition-${width}-${theme}.png`) });
        const firstCode = themedPage.locator('[data-solution-section="solution"] > pre.code-block').first();
        await firstCode.scrollIntoViewIfNeeded();
        await checkOverflow(themedPage);
        await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `code-${width}-${theme}.png`) });
        const memoCode = themedPage.getByRole('region', { name: 'Saved solution: DFS with memoization', exact: true }).locator('[data-solution-section="solution"]');
        await memoCode.evaluate(element => element.scrollIntoView({ block: 'start' }));
        await checkOverflow(themedPage);
        await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `sale-memo-javascript-${width}-${theme}.png`) });
        await themedPage.getByRole('region', { name: 'Saved solution: Bottom-up DP (Mixed Knapsack)', exact: true }).getByRole('button', { name: 'Python', exact: true }).click();
        await checkTemplate(themedPage, entries[0].solutions);
        await checkComparison(themedPage, width);
        await memoCode.evaluate(element => element.scrollIntoView({ block: 'start' }));
        await checkOverflow(themedPage);
        await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `sale-memo-python-${width}-${theme}.png`) });
        await themedPage.locator('section[aria-label$=" walkthrough"]').first().getByRole('heading', { name: 'Step-by-Step Walkthrough', exact: true }).scrollIntoViewIfNeeded();
        await checkOverflow(themedPage);
        await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `sale-walkthrough-${width}-${theme}.png`) });
        await themedPage.locator('[data-solution-section="pseudocode"]').first().scrollIntoViewIfNeeded();
        await checkOverflow(themedPage);
        await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `pseudocode-${width}-${theme}.png`) });
        const suffixEntry = entries.find(entry => entry.id === 3934);
        await themedPage.goto(`${base}#/problem/3934?daily=${suffixEntry.date}`);
        await checkDaily(themedPage, suffixEntry, entries.indexOf(suffixEntry));
        await checkSequenceWalkthrough(themedPage);
        for (const solution of suffixEntry.solutions) {
          const section = themedPage.getByRole('region', { name: `Saved solution: ${solution.title}`, exact: true });
          const trace = section.getByRole('region', { name: `${solution.title} walkthrough`, exact: true });
          await trace.evaluate(element => element.scrollIntoView({ block: 'start' }));
          await checkOverflow(themedPage);
          const slug = solution.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `${slug}-${width}-${theme}.png`) });
        }
        await checkRollingWalkthrough(themedPage);
        results.push({ width, theme, exactSavedImplementations: entries[0].solutions.length, overflow: false, activation: width < 600 ? 'touch' : 'keyboard' });
        for (const practice of practices) {
          await themedPage.goto(`${base}#/daily`);
          await themedPage.getByRole('list', { name: 'Knapsack practice', exact: true }).getByRole('link', { name: new RegExp(practice.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();
          await themedPage.waitForURL(url => url.hash === `#/daily?practice=${practice.slug}`);
          await themedPage.getByRole('heading', { name: practice.title, level: 1, exact: true }).waitFor();
          assert.equal(await themedPage.getByRole('region', { name: 'Problem description', exact: true }).count(), 1);
          await checkProblemTemplate(themedPage);
          await checkTemplate(themedPage, practice.solutions);
          const variants = themedPage.locator('section[aria-label^="Saved solution:"]');
          assert.equal(await variants.count(), 2, 'DFS and DP are both visible');
          assert.equal(await variants.nth(0).getByText('DFS', { exact: true }).count(), 1);
          assert.equal(await variants.nth(1).getByText('Bottom-up DP', { exact: true }).count(), 1);
          const dfsBox = await variants.nth(0).boundingBox();
          const dpBox = await variants.nth(1).boundingBox();
          if (width >= 1024) {
            assert.ok(dfsBox.x + dfsBox.width <= dpBox.x, 'DFS is left of DP');
            assert.ok(Math.abs(dfsBox.y - dpBox.y) <= 1, 'Both columns start together');
            for (const name of referenceSections.map(section => section.name)) {
              const left = await variants.nth(0).locator(`[data-solution-section="${name}"]`).boundingBox();
              const right = await variants.nth(1).locator(`[data-solution-section="${name}"]`).boundingBox();
              assert.ok(Math.abs(left.y - right.y) <= 1, `${name} sections align across columns`);
            }
          } else {
            assert.ok(dfsBox.y + dfsBox.height <= dpBox.y, 'The complete DFS solution stacks above DP on mobile');
            assert.ok(Math.abs(dfsBox.x - dpBox.x) <= 1);
          }
          await variants.nth(0).getByRole('button', { name: 'JavaScript', exact: true }).click();
          await checkTemplate(themedPage, practice.solutions);
          await variants.nth(0).locator('[data-solution-section="solution"]').evaluate(element => element.scrollIntoView({ block: 'start' }));
          await checkOverflow(themedPage);
          await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `${practice.slug}-javascript-${width}-${theme}.png`) });
          const js = await variants.nth(0).getByRole('button', { name: 'JavaScript', exact: true }).boundingBox();
          const py = await variants.nth(0).getByRole('button', { name: 'Python', exact: true }).boundingBox();
          assert.ok(js.x < py.x, 'JavaScript is left of Python');
          await variants.nth(1).getByRole('button', { name: 'Python', exact: true }).click();
          await checkTemplate(themedPage, practice.solutions);
          for (let variantIndex = 0; variantIndex < 2; variantIndex++) {
            assert.equal(await variants.nth(variantIndex).getByRole('button', { name: 'Python', exact: true }).getAttribute('aria-pressed'), 'true');
          }
          await variants.nth(0).getByRole('button', { name: 'Reveal Hint 1', exact: true }).click();
          assert.equal(await variants.nth(0).getByText('Hint 1:', { exact: true }).count(), 1);
          assert.equal(await variants.nth(1).getByText('Hint 1:', { exact: true }).count(), 0);
          await checkOverflow(themedPage);
          await variants.nth(0).locator('[data-solution-section="solution"]').evaluate(element => element.scrollIntoView({ block: 'start' }));
          await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `${practice.slug}-${width}-${theme}.png`) });
          if (width >= 1024) {
            const leftCode = await variants.nth(0).locator('[data-solution-section="solution"] > pre.code-block').boundingBox();
            const rightCode = await variants.nth(1).locator('[data-solution-section="solution"] > pre.code-block').boundingBox();
            assert.ok(Math.abs(leftCode.y - rightCode.y) <= 1, 'Code remains aligned after language changes and hint reveal');
          }
          await variants.nth(0).getByRole('heading', { name: 'Step-by-Step Walkthrough', exact: true }).scrollIntoViewIfNeeded();
          await checkOverflow(themedPage);
          await themedPage.screenshot({ animations: 'disabled', path: path.join(screenshotDirectory, `${practice.slug}-walkthrough-${width}-${theme}.png`) });
        }
        // Adjacent practice pages reset scroll, retain language, and support browser Back.
        await themedPage.getByRole('link', { name: '← Previous problem', exact: true }).click();
        await themedPage.getByRole('heading', { name: 'Unbounded Knapsack', level: 1, exact: true }).waitFor();
        await themedPage.waitForFunction(() => window.scrollY <= 1);
        await checkTemplate(themedPage, practices[1].solutions);
        await themedPage.goBack();
        await themedPage.getByRole('heading', { name: 'Mixed Knapsack', level: 1, exact: true }).waitFor();
        await checkTemplate(themedPage, practices[2].solutions);
        await themedPage.reload();
        await themedPage.getByRole('heading', { name: 'Mixed Knapsack', level: 1, exact: true }).waitFor();
        await checkTemplate(themedPage, practices[2].solutions);
        results.push({ width, theme, knapsackProblems: practices.length, bothLanguages: true, sharedTemplate: true });
      }
    }
    assert.deepEqual(errors, [], 'No runtime errors');
    assert.deepEqual(consoleErrors, [], 'No browser console errors');
    assert.deepEqual(requestFailures, [], 'No failed app requests');
    assert.deepEqual(badResponses, [], 'No HTTP errors from app assets');
    console.log(JSON.stringify({ passed: true, results, screenshots: screenshotDirectory, errors, consoleErrors, requestFailures, badResponses }));
  } finally {
    for (const context of contexts) await context.close();
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
