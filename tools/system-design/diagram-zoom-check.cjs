const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const base = (process.argv[2] || 'http://127.0.0.1:5193/leetcode/').replace(/\/?$/, '/');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/data/system-design-articles.ts'), 'utf8');
const articles = JSON.parse(source.slice(source.indexOf('=') + 1, source.lastIndexOf('as const')).trim());
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--disable-gpu'] });
  const errors = [];
  const contexts = [];
  const makeContext = async options => {
    const context = await browser.newContext(options);
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    contexts.push(context);
    return context;
  };
  const openArticle = async (page, article) => {
    await page.goto(`${base}#/system-design/${article.slug}?view=full`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(filename => {
      const frame = document.querySelector('iframe');
      return document.querySelector('[data-reading-ready="true"]')
        && frame?.contentDocument?.URL.includes(filename)
        && frame.contentDocument.querySelector('#markdown')
        && frame.getBoundingClientRect().height > 0;
    }, article.filename);
  };
  try {
    assert.equal(articles.length, 49);
    const desktop = await makeContext({ viewport: { width: 1280, height: 900 } });
    const page = await desktop.newPage();
    let totalLinks = 0;
    let totalImages = 0;
    for (const article of articles) {
      await openArticle(page, article);
      const original = fs.readFileSync(path.join(root, 'public/system-design/hello-interview', article.filename), 'utf8');
      const expectedCount = [...original.matchAll(/aria-label="zoom-in"/g)].length;
      const actual = await page.locator('iframe').evaluate(async frame => {
        const content = frame.contentDocument.querySelector('#markdown');
        const images = [...content.querySelectorAll('img')];
        const links = await Promise.all([...content.querySelectorAll('a[data-diagram-zoom]')].map(async link => {
          const image = link.parentElement.querySelector('img');
          const match = image.src.match(/^data:image\/([^;]+);base64,(.*)$/s);
          const bytes = Uint8Array.from(atob(match[2]), char => char.charCodeAt(0));
          const digest = await crypto.subtle.digest('SHA-256', bytes);
          return {
            href: link.href, label: link.getAttribute('aria-label'), target: link.target, rel: link.rel,
            imageIndex: images.indexOf(image), extension: ({ 'svg+xml': 'svg', jpeg: 'jpg' })[match[1]] || match[1],
            expectedHash: [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join(''),
          };
        }));
        return { links, images: images.length, deadButtons: content.querySelectorAll('button[aria-label="zoom-in"]').length };
      });
      assert.equal(actual.deadButtons, 0, `${article.title}: no inactive magnifier buttons`);
      assert.equal(actual.links.length, expectedCount, `${article.title}: every magnifier is linked`);
      assert.equal(actual.images, article.imageCount, `${article.title}: diagrams are preserved`);
      totalLinks += actual.links.length;
      totalImages += actual.images;
      // Keep requests bounded while checking every target against the original embedded image.
      for (let offset = 0; offset < actual.links.length; offset += 8) {
        await Promise.all(actual.links.slice(offset, offset + 8).map(async link => {
          const filename = `${String(link.imageIndex + 1).padStart(2, '0')}.${link.extension}`;
          const expectedUrl = new URL(`system-design/notes/${article.slug}/${filename}?v=${article.revision}`, base).href;
          assert.equal(link.href, expectedUrl, `${article.title}: correct full-size asset`);
          assert.equal(link.target, '_blank');
          assert.ok(link.rel.split(/\s+/).includes('noopener'));
          assert.ok(link.rel.split(/\s+/).includes('noreferrer'));
          assert.match(link.label, /^Open .+ at full size$/);
          const response = await desktop.request.get(link.href);
          assert.equal(response.status(), 200, `${article.title}: ${filename} loads`);
          assert.equal(sha256(await response.body()), link.expectedHash, `${article.title}: ${filename} matches the original diagram`);
          await response.dispose();
        }));
      }
    }
    assert.equal(totalLinks, 489);
    assert.equal(totalImages, 496);

    const interactionResults = [];
    const openDiagram = async (testPage, slug, extension, method) => {
      const article = articles.find(item => item.slug === slug);
      await openArticle(testPage, article);
      const frame = testPage.frameLocator('iframe');
      const link = frame.locator(`a[data-diagram-zoom][href*=".${extension}?"]`).first();
      // A diagram can be inside a collapsed solution; expand its actual accordion controls.
      const hiddenPanels = await link.evaluate(element => {
        const panels = [];
        for (let parent = element.parentElement; parent; parent = parent.parentElement) {
          if (parent.hidden && parent.id) panels.unshift(parent.id);
        }
        return panels;
      });
      for (const id of hiddenPanels) await frame.locator(`button[aria-controls=${JSON.stringify(id)}]`).click();
      await link.evaluate(element => element.scrollIntoView({ block: 'center' }));
      if (method === 'keyboard') await link.focus();
      await testPage.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const before = await testPage.evaluate(() => ({ url: location.href, scrollY }));
      const target = await link.getAttribute('href');
      const popupPromise = testPage.waitForEvent('popup');
      if (method === 'keyboard') await link.press('Enter');
      else if (method === 'touch') await link.tap();
      else await link.click();
      const popup = await popupPromise;
      await popup.waitForLoadState('domcontentloaded');
      assert.equal(popup.url(), new URL(target, base).href);
      await popup.waitForFunction(() => document.querySelector('svg') || [...document.images].some(image => image.complete && image.naturalWidth > 0));
      await popup.close();
      await testPage.bringToFront();
      const after = await testPage.evaluate(() => ({ url: location.href, scrollY }));
      assert.equal(after.url, before.url, `${method}: original article remains open`);
      assert.ok(Math.abs(after.scrollY - before.scrollY) <= 2, `${method}: reading position is unchanged (${before.scrollY} → ${after.scrollY})`);
      interactionResults.push({ slug, extension, method, passed: true });
    };
    for (const method of ['mouse', 'keyboard']) {
      await openDiagram(page, 'bitly', 'svg', method);
      await openDiagram(page, 'dynamodb', 'png', method);
    }
    const mobile = await makeContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mobilePage = await mobile.newPage();
    await openDiagram(mobilePage, 'bitly', 'svg', 'touch');
    await openDiagram(mobilePage, 'dynamodb', 'png', 'touch');
    assert.deepEqual(errors, [], 'No browser runtime errors');
    console.log(JSON.stringify({ passed: true, articles: articles.length, images: totalImages, zoomLinks: totalLinks, targetsVerified: totalLinks, interactions: interactionResults }));
  } finally {
    for (const context of contexts) await context.close();
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
