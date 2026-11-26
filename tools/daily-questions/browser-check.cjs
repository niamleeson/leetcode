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
const screenshotDirectory = process.env.DAILY_SCREENSHOTS_DIR || '/tmp/leetcode-daily-ui';
fs.mkdirSync(screenshotDirectory, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-gpu'] });
  const errors = [];
  const consoleErrors = [];
  const requestFailures = [];
  const badResponses = [];
  const results = [];
  const contexts = [];
  const makePage = async width => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, ...(width < 600 ? { isMobile: true, hasTouch: true } : {}) });
    contexts.push(context);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
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
  const readyDaily = async (page, entry) => {
    await page.waitForURL(url => url.hash === `#/problem/${entry.id}?daily=${entry.date}`);
    await page.locator(`main time[datetime="${entry.date}"]`).waitFor();
    await page.getByRole('region', { name: 'Solution comparison', exact: true }).waitFor();
    const saved = page.locator('section[aria-label^="Saved solution:"]');
    await saved.first().locator(':scope > pre.code-block code').waitFor();
    assert.equal(await saved.count(), entry.solutions.length, `${entry.id}: saved solution count`);
    for (let i = 0; i < entry.solutions.length; i++) {
      assert.equal(await saved.nth(i).locator(':scope > pre.code-block code').textContent(), entry.solutions[i].code, `${entry.id}: exact saved source ${i + 1}`);
      assert.equal(await saved.nth(i).locator('details:not([open])').count(), 0, `${entry.id}: saved code is open`);
      const explanation = saved.nth(i).locator(':scope > .catalog-prose');
      assert.ok((await explanation.innerText()).trim().length > 40, `${entry.id}: short explanation accompanies the code`);
      assert.equal(await explanation.evaluate(element => Boolean(element.compareDocumentPosition(element.parentElement.querySelector(':scope > pre.code-block')) & Node.DOCUMENT_POSITION_FOLLOWING)), true, `${entry.id}: explanation comes before the code`);
    }
  };
  const checkDaily = async (page, entry, index) => {
    await readyDaily(page, entry);
    const description = page.getByRole('region', { name: 'Problem description', exact: true });
    await description.waitFor();
    assert.equal(await description.count(), 1, `${entry.id}: single problem statement`);
    const problemText = await description.innerText();
    assert.match(problemText, /Example(?:\s*1)?\s*:/i, `${entry.id}: examples included`);
    assert.match(problemText, /Input/i);
    assert.match(problemText, /Output/i);
    assert.equal(await description.evaluate(element => Boolean(element.closest('details:not([open])'))), false, `${entry.id}: description and examples are expanded`);
    const comparison = page.getByRole('region', { name: 'Solution comparison', exact: true });
    assert.ok((await comparison.innerText()).includes(entry.comparison.summary));
    for (const detail of entry.comparison.details) assert.ok((await comparison.innerText()).includes(detail));
    for (const solution of entry.solutions) {
      for (const note of solution.notes || []) assert.equal(await page.getByText(note, { exact: true }).isVisible(), true, `${entry.id}: implementation note visible`);
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
    assert.equal(entries.length, 8);
    const page = await makePage(1280);
    const dailyChunks = new Set();
    page.on('request', request => {
      const match = request.url().match(/\/(2026-11-\d{2})-[^/]+\.js(?:\?|$)/);
      if (match) dailyChunks.add(match[1]);
    });
    // Choose Python using the existing UI; the saved JavaScript view must not reset it.
    await page.goto(`${base}#/problem/1352`);
    await page.getByRole('button', { name: 'Python', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Python', exact: true }).getAttribute('aria-pressed'), 'true');
    await openMenuDaily(page);
    const rows = dailyList(page).locator('li');
    assert.equal(await rows.count(), 8);
    assert.deepEqual(await rows.locator('time').evaluateAll(elements => elements.map(element => element.getAttribute('datetime'))), entries.map(entry => entry.date));
    assert.equal(dailyChunks.size, 0, 'Daily list does not fetch saved solution bodies');
    await page.screenshot({ path: path.join(screenshotDirectory, 'list-desktop-dark.png'), fullPage: true });

    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      await dailyList(page).locator(`a[href="#/problem/${entry.id}?daily=${entry.date}"]`).click();
      await checkDaily(page, entry, index);
      assert.deepEqual([...dailyChunks].sort(), entries.slice(0, index + 1).map(item => item.date).sort(), 'Only opened dates fetch saved solution bodies');
      if (entry.id === 3934) {
        await page.screenshot({ path: path.join(screenshotDirectory, 'problem-desktop-dark.png') });
        assert.deepEqual(await page.locator('section[aria-label^="Saved solution:"] > div > h2').allTextContents(), [
          'Simple suffix sorting + LCP', 'Optimized suffix array + LCP', 'Suffix automaton',
        ]);
      }
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
        await themedPage.screenshot({ path: path.join(screenshotDirectory, `list-${width}-${theme}.png`), fullPage: true });
        const firstLink = dailyList(themedPage).locator('a').first();
        if (width < 600) await firstLink.tap();
        else { await firstLink.focus(); await firstLink.press('Enter'); }
        await checkDaily(themedPage, entries[0], 0);
        await themedPage.screenshot({ path: path.join(screenshotDirectory, `problem-${width}-${theme}.png`) });
        const firstCode = themedPage.locator('section[aria-label^="Saved solution:"] pre').first();
        await firstCode.scrollIntoViewIfNeeded();
        await checkOverflow(themedPage);
        await themedPage.screenshot({ path: path.join(screenshotDirectory, `code-${width}-${theme}.png`) });
        results.push({ width, theme, exactSavedImplementations: entries[0].solutions.length, overflow: false, activation: width < 600 ? 'touch' : 'keyboard' });
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
