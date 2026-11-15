const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:5175/leetcode/';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = [];
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('https://www.hellointerview.com/**', route => route.abort());
      const ready = async mode => {
        await page.waitForFunction(expected => {
          const section = document.querySelector('[data-reading-ready="true"]');
          return section && section.querySelector('nav [aria-current="page"]')?.textContent === expected;
        }, mode === 'full' ? 'Full article' : 'Condensed notes');
      };
      const position = async y => {
        await page.waitForFunction(expected => Math.abs(scrollY - expected) <= 2, y);
      };
      const scroll = async y => {
        await page.evaluate(top => window.scrollTo(0, top), y);
        await position(y);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      };
      const switchTo = async mode => {
        const nav = page.getByRole('navigation', { name: 'Bitly reading mode' });
        const box = await nav.boundingBox();
        assert.ok(box.y >= 0 && box.y < 900, 'Mode switch stays accessible while reading');
        await nav.getByRole('link', { name: mode === 'full' ? 'Full article' : 'Condensed notes', exact: true }).click();
        await ready(mode);
      };
      const frame = () => page.frameLocator('iframe');
      const bad = () => frame().getByRole('button', { name: /^Bad Solution:/ }).first();
      const great = () => frame().getByRole('button', { name: /^Great Solution:/ }).first();
      const checkFrame = async () => {
        await page.waitForFunction(() => {
          const f = document.querySelector('iframe');
          return f?.contentDocument.documentElement.scrollHeight <= f.clientHeight + 1;
        });
        const layout = await page.locator('iframe').evaluate(f => ({
          overflow: f.contentWindow.getComputedStyle(f.contentDocument.documentElement).overflow,
          innerWidth: f.contentDocument.documentElement.scrollWidth,
          width: f.clientWidth,
        }));
        assert.equal(layout.overflow, 'hidden');
        assert.ok(layout.innerWidth <= layout.width + 1);
      };
      await page.goto(base + '#/system-design/bitly');
      await ready('condensed');
      await scroll(1800);
      await switchTo('full');
      await position(0);
      assert.equal(await bad().getAttribute('aria-expanded'), 'false');
      assert.equal(await great().getAttribute('aria-expanded'), 'true');
      const initialHeight = await page.locator('iframe').evaluate(f => f.clientHeight);
      await bad().click();
      assert.equal(await bad().getAttribute('aria-expanded'), 'true');
      await page.waitForFunction(h => document.querySelector('iframe').clientHeight > h, initialHeight);
      await checkFrame();
      await great().focus();
      await great().press('Enter');
      assert.equal(await great().getAttribute('aria-expanded'), 'false');
      await great().press('Space');
      assert.equal(await great().getAttribute('aria-expanded'), 'true');
      await scroll(3400);
      await switchTo('condensed');
      await position(1800);
      await switchTo('full');
      await position(3400);
      assert.equal(await bad().getAttribute('aria-expanded'), 'true', 'Keep custom accordion state across mode changes');
      await checkFrame();

      // Native back/forward must use the same independent positions.
      await page.goBack();
      await ready('condensed');
      await position(1800);
      await page.goForward();
      await ready('full');
      await position(3400);

      // Leaving the article must not overwrite its saved positions with another page's.
      await page.evaluate(() => { location.hash = '/system-design/redis'; });
      await page.locator('[aria-label="Redis condensed notes"]').waitFor();
      await page.waitForSelector('[data-reading-ready="true"]');
      await position(0);
      await scroll(900);
      await page.goBack();
      await ready('full');
      await position(3400);

      // Delayed iframe loads and an immediate switch back cannot overwrite the notes position.
      await switchTo('condensed');
      await position(1800);
      const delayed = '**/01-bitly.html*';
      await page.route(delayed, async route => {
        await new Promise(resolve => setTimeout(resolve, 350));
        await route.continue().catch(() => {});
      });
      await page.getByRole('link', { name: 'Full article', exact: true }).click();
      await page.getByRole('link', { name: 'Condensed notes', exact: true }).click();
      await ready('condensed');
      await position(1800);
      await page.unroute(delayed);
      await switchTo('full');
      await position(3400);

      // A failed load must also leave the previous full-article position intact for retry.
      await switchTo('condensed');
      await page.route(delayed, route => route.fulfill({ status: 404, contentType: 'text/html', body: 'Missing' }));
      await page.getByRole('link', { name: 'Full article', exact: true }).click();
      await page.getByRole('alert').waitFor();
      await page.unroute(delayed);
      await page.getByRole('button', { name: 'Try again', exact: true }).click();
      await ready('full');
      await position(3400);
      await checkFrame();
      assert.deepEqual(errors, []);
      results.push({ width, condensedPosition: 1800, fullPosition: 3400, passed: true });
      await page.close();
    }
    console.log(JSON.stringify({ passed: true, checks: ['accordion defaults', 'click and keyboard toggling', 'iframe resizing without inner scrollbars', 'separate mode positions', 'browser history', 'separate articles', 'slow loads and rapid switching', 'load failure and retry', 'sticky mode controls'], results }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
