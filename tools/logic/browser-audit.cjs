// Run with Playwright available on NODE_PATH. No existing browser/profile is used.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = process.env.LEETCODE_TEST_URL || 'http://127.0.0.1:5179/leetcode/';
const output = process.env.LEETCODE_AUDIT_DIR || '/tmp/leetcode-browser-check';
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); const errors = [], requests = []; const report = { exercises: [], errors };
  page.on('pageerror', error => errors.push(error.message)); page.on('request', request => requests.push(request.url()));
  let taps = 0;
  async function tap(name) { await page.getByRole('button', { name, exact: true }).click(); taps++; }
  async function group(name) { await tap(name); }
  async function statement(text) {
    const find = () => page.locator('.logic-action').filter({ has: page.locator('code').filter({ hasText: new RegExp(`^${escape(text)}$`) }) });
    if (!await find().count()) await tap('More statements');
    await find().first().click(); taps++;
  }
  async function variant(label, text) { await tap(`Options for ${label}`); await page.locator('.logic-variant-panel').getByRole('button', { name: text, exact: true }).click(); taps++; }
  async function start(id, title) {
    await page.goto(`${url}#/practice/${id}?draft=1`); await page.getByRole('heading', { name: title, exact: true }).waitFor(); taps = 0;
  }
  async function passes(title) {
    const constructionTaps = taps; const start = Date.now(); await tap('Run tests');
    const results = page.getByRole('region', { name: 'Test results' }); await results.waitFor({ timeout: 60000 });
    const text = await results.locator('.logic-results-heading').innerText(); const counts = text.match(/(\d+) \/ (\d+)/);
    assert.equal(counts[1], counts[2], `${title}: ${await results.innerText()}`);
    report.exercises.push({title, constructionTaps, runMs: Date.now() - start, passed: Number(counts[1])}); console.log(report.exercises[report.exercises.length-1]);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'Mobile horizontal overflow');
  }
  await page.goto(`${url}#/`); await page.getByRole('heading').first().waitFor();
  assert(!requests.some(request => /vendor\/pyodide|logic\/problems|python\.worker/.test(request)), 'Runtime or problem prefetched on dashboard');
  await start(1, 'Two Sum');
  assert(!requests.some(request => /vendor\/pyodide/.test(request)), 'Runtime prefetched on opening editor');
  assert(!requests.some(request => /\/solutions\/|generated-python/.test(request)), 'Reference solution loaded during practice');
  await statement('seen = {}'); await group('Loop'); await statement('for i, value in enumerate(nums):'); await group('Check'); await statement('if target - value in seen:'); await group('Return'); await statement('return [seen[target - value], i]'); await group('Update'); await statement('seen[value] = i');
  await passes('Two Sum');
  await page.reload(); await page.getByRole('heading', {name:'Two Sum',exact:true}).waitFor();
  assert.equal(await page.locator('.logic-source-line').count(),5,'Draft not restored');
  await page.locator('.logic-source-line').filter({hasText:'seen[value] = i'}).click(); await tap('Move line up'); await tap('Done');
  await tap('Run tests'); await page.getByText('3 / 6 practice tests passed',{exact:true}).waitFor({timeout:30000});
  assert.match(await page.locator('.logic-case-values').innerText(),/0,\s+0/);
  await tap('Step through'); await tap('Next');
  assert.match(await page.locator('.logic-locals').innerText(),/nums/); assert.doesNotMatch(await page.locator('.logic-locals').innerText(),/format\n1/);
  await page.screenshot({path:`${output}/logic-debug-mobile.png`,fullPage:true});
  await page.locator('.logic-source-line').filter({hasText:'seen[value] = i'}).click(); await tap('Move line down'); await tap('Done');
  await tap('Run tests'); await page.getByText('6 / 6 practice tests passed',{exact:true}).waitFor({timeout:30000});
  const warmStart=Date.now(); await tap('Run tests'); await page.getByText('6 / 6 practice tests passed',{exact:true}).waitFor({timeout:30000}); report.warmRunMs=Date.now()-warmStart;

  await start(217, 'Contains Duplicate'); await statement('seen = set()'); await group('Loop'); await statement('for value in nums:'); await group('Check'); await statement('if value in seen:'); await group('Return'); await statement('return True'); await group('Update'); await statement('seen.add(value)'); await tap('Exit block'); await group('Return'); await statement('return False'); await passes('Contains Duplicate');
  await start(242, 'Valid Anagram'); await group('Return'); await statement('return sorted(s) == sorted(t)'); await passes('Valid Anagram');
  await page.locator('.logic-source-line').click(); await page.getByRole('button',{name:/^Change == at position/}).click();await tap('!=');await tap('Done');await tap('Run tests'); await page.getByRole('region',{name:'Test results'}).waitFor({timeout:30000}); assert.match(await page.locator('.logic-results-heading').innerText(),/0 \/ \d+/);

  await start(704, 'Binary Search'); await statement('left, right = 0, len(nums) - 1'); await group('Loop'); await statement('while left <= right:'); await group('Store'); await statement('mid = (left + right) // 2'); await group('Check'); await statement('if nums[mid] == target:'); await group('Return'); await statement('return mid'); await group('Check'); await statement('if nums[mid] < target:'); await group('Update'); await statement('left = mid + 1'); await tap('Exit block'); await group('Check'); await statement('else:'); await group('Update');
  // The alternative is explicitly chosen; no correct-next-step mechanism exists.
  if (!await page.getByRole('button',{name:'Options for Move a position',exact:true}).count()) await tap('More statements');
  const updateLabel = await page.locator('.logic-action-card').filter({has:page.locator('code').filter({hasText:/^left = mid \+ 1$/})}).locator('.logic-variants-toggle').getAttribute('aria-label');
  await tap(updateLabel); await page.locator('.logic-variant-panel').getByRole('button',{name:'right = mid - 1',exact:true}).click(); taps++;
  await tap('Exit block'); await tap('Exit block'); await group('Return'); await statement('return -1'); await passes('Binary Search');
  await start(121, 'Best Time to Buy And Sell Stock'); await statement('result = 0'); await statement('minimum = prices[0]'); await group('Loop'); await statement('for value in prices:'); await group('Update'); await statement('result = max(result, value - minimum)'); await statement('minimum = min(minimum, value)'); await tap('Exit block'); await group('Return'); await statement('return result'); await passes('Stock profit');

  // All function selectors work on a multi-method design task; failed cases show calls.
  await start(155,'Min Stack'); await page.getByLabel('Choose function to build').selectOption({label:'MinStack.push'}); await tap('Run tests'); await page.getByRole('region',{name:'Test results'}).waitFor({timeout:30000}); await page.getByText('Calls in order',{exact:true}).waitFor(); assert.match(await page.locator('.logic-operation-list').innerText(),/push\(/);
  await page.setViewportSize({width:1440,height:1000}); await page.goto(`${url}#/practice/1?draft=1`);await page.getByRole('heading',{name:'Two Sum',exact:true}).waitFor();await page.screenshot({path:`${output}/logic-desktop.png`,fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('button',{name:'Switch to light theme',exact:true}).click();await page.getByRole('button',{name:'Close menu',exact:true}).click(); await page.waitForFunction(() => document.querySelector('aside').getBoundingClientRect().right <= 1); await page.screenshot({path:`${output}/logic-light-mobile.png`,fullPage:true});
  await page.goto(`${url}#/practice`);await page.getByRole('heading',{name:'Decide the logic.',exact:true}).waitFor();await page.getByRole('searchbox',{name:'Find a practice problem'}).fill('LRU');assert.equal(await page.locator('.logic-problem-card').count(),1);
  assert.deepEqual(errors,[]); fs.writeFileSync(`${output}/logic-browser-report.json`,JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(error => {console.error(error);process.exit(1);});
