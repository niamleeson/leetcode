const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:5175/leetcode/';
const root = path.resolve(__dirname, '../..');
const data = fs.readFileSync(path.join(root,'src/data/system-design-articles.ts'),'utf8');
const articles = JSON.parse(data.slice(data.indexOf('=')+1,data.lastIndexOf('as const')).trim());

(async () => {
  assert.equal(articles.length,49);
  for(const article of articles) {
    const bytes=fs.readFileSync(path.join(root,'public/system-design/hello-interview',article.filename));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12),article.revision,article.title);
  }
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://www.hellointerview.com/**',route=>route.abort());
  const go=async route=>{await page.goto(base+'#'+route,{waitUntil:'domcontentloaded'});};
  const ready=async()=>{
    await page.locator('iframe').waitFor({state:'visible'});
    await page.waitForFunction(()=>{const f=document.querySelector('iframe');const d=f?.contentDocument;return d?.querySelector('#markdown') && f.getBoundingClientRect().height>640;});
    return page.frameLocator('iframe');
  };
  try {
    await go('/system-design');
    await page.getByRole('searchbox',{name:'Search system design articles'}).waitFor();
    assert.equal(await page.getByRole('status').textContent(),'49 articles');
    await page.getByRole('searchbox').fill('Redis');
    assert.equal(await page.getByRole('status').textContent(),'1 article');
    await page.getByRole('combobox').selectOption('Patterns');
    await page.getByText('No articles match these filters.').waitFor();
    await page.getByRole('searchbox').fill('');
    await page.getByRole('status').filter({hasText:'7 articles'}).waitFor();
    assert.equal(await page.getByRole('status').textContent(),'7 articles');
    await page.getByRole('combobox').selectOption('All');
    await page.getByRole('link',{name:'Bitly Notes',exact:true}).click();
    const notes=page.locator('[aria-label="Bitly condensed notes"]');
    await notes.waitFor();
    const sourceNotes=fs.readFileSync(path.join(root,'src/data/bitly-condensed.txt'),'utf8');
    assert.equal(await notes.locator('li').count(),sourceNotes.split('\n').filter(line=>line.startsWith('- ')).length);
    assert.deepEqual(await notes.locator('h3').allTextContents(),['Understanding the Problem','Functional Requirements','Non-functional Requirements','Core Entities','API','High-Level Design','Deep Dives','Final Design']);
    assert.ok((await notes.locator('li').allTextContents()).every(point=>point.startsWith('-')));
    assert.equal(await notes.locator('strong,table,pre,h1,h2').count(),0);
    if(process.env.QA_SCREENSHOTS)await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'bitly-condensed.png')});
    await page.getByRole('link',{name:'Full article',exact:true}).click();
    let frame=await ready();
    assert.equal(await frame.locator('#markdown img').count(),8);
    assert.equal(await frame.locator('#markdown button[aria-expanded=false]').count(),0);
    await frame.locator('a[href*="/patterns/scaling-reads"]').first().click();
    await page.waitForURL(/#\/system-design\/scaling-reads$/);
    await ready();
    await page.getByRole('link',{name:'Practice reference · 30',exact:true}).click();
    await page.getByRole('heading',{name:'System Design Reference',exact:true}).waitFor();
    await go('/system-design/not-a-page');
    await page.getByText('Article not found.',{exact:true}).waitFor();
    const broken='**/02-dropbox.html*';
    await page.route(broken,route=>route.fulfill({status:404,contentType:'text/html',body:'<h1>Missing</h1>'}));
    await go('/system-design/dropbox');
    await page.getByRole('alert').waitFor();
    await page.unroute(broken);
    await page.getByRole('button',{name:'Try again',exact:true}).click();
    await ready();
    for(const article of articles) {
      await go(`/system-design/${article.slug}${article.slug==='bitly'?'?view=full':''}`);
      frame=await ready();
      await page.waitForFunction(()=>[...document.querySelector('iframe').contentDocument.querySelectorAll('#markdown img')].every(i=>i.complete));
      const check=await page.locator('iframe').evaluate(f=>{
        const d=f.contentDocument,r=d.querySelector('#markdown'),imgs=[...r.querySelectorAll('img')];
        return {text:r.innerText.length,images:imgs.length,missing:imgs.filter(i=>!i.naturalWidth).length,closed:r.querySelectorAll('button[aria-expanded=false]').length,
          excluded:[...r.querySelectorAll('h1,h2,h3,h4,h5,h6,p')].some(e=>/^(What is Expected at Each Level|Test Your Knowledge|Try it yourself first|Watch Video Walkthrough)/i.test(e.textContent.trim()))};
      });
      assert.ok(check.text>1000,article.title);
      assert.equal(check.images,article.imageCount,article.title);
      assert.equal(check.missing,0,article.title);
      assert.equal(check.closed,0,article.title);
      assert.equal(check.excluded,false,article.title);
    }
    await page.setViewportSize({width:390,height:844});
    await go('/system-design/bitly');
    await page.locator('[aria-label="Bitly condensed notes"]').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(process.env.QA_SCREENSHOTS)await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'bitly-mobile.png')});
    await go('/system-design');
    await page.getByRole('searchbox').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await go('/system-design/redis');
    await ready();
    assert.ok(await page.locator('iframe').evaluate(f=>f.contentDocument.documentElement.scrollWidth<=f.clientWidth+1));
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({passed:true,articles:articles.length,images:articles.reduce((n,a)=>n+a.imageCount,0),checks:['filters','plain hyphen notes','full article','internal article links','legacy reference','unknown route','load failure and retry','49 readers','mobile overflow']}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
