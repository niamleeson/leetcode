const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = process.env.LEETCODE_TEST_URL || 'http://127.0.0.1:5183/leetcode/';
const output = process.env.LEETCODE_SCREENSHOTS || '/tmp/leetcode-language-browser';

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const group = () => page.getByRole('group', { name: 'Implementation language', exact: true }).first();
    async function selected(language, target = page) {
      const control = target.getByRole('group', { name: 'Implementation language', exact: true }).first();
      await control.getByRole('button', { name: language, exact: true, pressed: true }).waitFor();
      assert.deepEqual(await control.getByRole('button').allTextContents(), ['JavaScript', 'Python']);
      const left = await control.getByRole('button', { name: 'JavaScript', exact: true }).boundingBox();
      const right = await control.getByRole('button', { name: 'Python', exact: true }).boundingBox();
      assert(left.x < right.x, 'JavaScript is not left of Python');
      assert.equal(await control.getByRole('button', { name: 'JavaScript', exact: true }).evaluate(element => getComputedStyle(element).fontSize), '12px', 'Selector typography differs between pages');
    }
    async function navigate(route, heading) {
      await page.goto(`${url}#${route}`);
      if (heading) await page.getByRole('heading', { name: heading, exact: true }).waitFor();
    }
    await navigate('/practice?language=python&keep=1', 'Decide the logic.');
    await selected('Python');
    await page.waitForURL(value => value.hash === '#/practice?keep=1');
    await navigate('/neetcode', 'NeetCode 250');
    await selected('Python');
    await group().getByRole('button', { name: 'JavaScript', exact: true }).tap();
    await page.goBack();
    await page.getByRole('heading', { name: 'Decide the logic.', exact: true }).waitFor();
    await selected('JavaScript');
    for (const [route, heading] of [['/neetcode150', 'NeetCode 150'], ['/blind75', 'NeetCode Blind 75'], ['/problem/1', 'Two Sum'], ['/dsa', 'DSA Reference Guide']]) {
      await navigate(route, heading);
      await selected('JavaScript');
    }
    await navigate('/topic/arrays-hashing');
    await page.getByRole('heading', { name: 'JavaScript Template', exact: true }).waitFor();
    await selected('JavaScript');
    await group().getByRole('button', { name: 'Python', exact: true }).tap();
    await page.getByRole('heading', { name: 'Python Template', exact: true }).waitFor();
    await navigate('/practice/1', 'Two Sum');
    await selected('Python');
    await page.locator('.guided-choice').nth(7).waitFor();
    assert.match(await group().getByRole('button', { name: 'Python', exact: true }).getAttribute('class'), /bg-blue-600/);
    await page.reload();
    await selected('Python');
    await page.screenshot({ path: `${output}/practice-mobile.png`, fullPage: true });
    const second = await context.newPage();
    await second.goto(`${url}#/neetcode`);
    await selected('Python', second);
    await group().getByRole('button', { name: 'JavaScript', exact: true }).tap();
    await selected('JavaScript', second);
    await second.close();
    await navigate('/problem/250', 'Count Univalue Subtrees');
    const select = page.getByRole('combobox', { name: 'Solution language', exact: true });
    await page.getByRole('heading', { name: 'Solution · JavaScript', exact: true }).waitFor();
    const labels = await select.locator('option').allTextContents();
    assert(labels.indexOf('JavaScript') < labels.findIndex(value => value.startsWith('Python')));
    await select.selectOption({ label: labels.find(value => value.startsWith('Python')) });
    await navigate('/practice', 'Decide the logic.');
    await selected('Python');
    await navigate('/problem/250', 'Count Univalue Subtrees');
    await select.selectOption({ label: 'Java' });
    await navigate('/practice', 'Decide the logic.');
    await selected('Python');
    await group().getByRole('button', { name: 'JavaScript', exact: true }).tap();
    await navigate('/problem/156', 'Binary Tree Upside Down');
    await page.getByRole('heading', { name: /^Solution · Python/ }).waitFor();
    await navigate('/practice/1', 'Two Sum');
    await selected('JavaScript');
    await page.locator('.guided-choice').nth(7).waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.getByRole('button', { name: 'Open menu', exact: true }).tap();
    await page.getByRole('button', { name: 'Switch to light theme', exact: true }).tap();
    await page.getByRole('button', { name: 'Close menu', exact: true }).tap();
    await page.waitForFunction(() => document.querySelector('aside').getBoundingClientRect().right <= 1);
    await page.screenshot({ path: `${output}/practice-light.png`, fullPage: true });
    await navigate('/neetcode', 'NeetCode 250');
    await selected('JavaScript');
    await page.screenshot({ path: `${output}/neetcode-mobile.png` });
    assert.deepEqual(errors, []);
    console.log('PASS: JavaScript left/Python right, shared NeetCode styling, all three NeetCode lists, practice library/lesson, problem, DSA and topic pages, reload, cross-tab sync, legacy URL consumption/history, catalog selection and unavailable-language fallback, mobile dark/light layout.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
