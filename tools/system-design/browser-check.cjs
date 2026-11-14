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
    const layout=await page.locator('iframe').evaluate(f=>{
      const d=f.contentDocument,w=f.contentWindow,content=d.querySelector('#markdown').getBoundingClientRect();
      return {padding:w.getComputedStyle(d.body).padding,margin:w.getComputedStyle(d.body).margin,
        overflow:w.getComputedStyle(d.documentElement).overflow,scrollHeight:d.documentElement.scrollHeight,frameHeight:f.clientHeight,
        left:content.left,width:content.width,frameWidth:f.clientWidth,border:getComputedStyle(f).borderWidth};
    });
    assert.equal(layout.padding,'0px');
    assert.equal(layout.margin,'0px');
    assert.equal(layout.border,'0px');
    assert.equal(layout.overflow,'hidden');
    assert.ok(layout.scrollHeight<=layout.frameHeight+1,'Full article fits its frame without an inner scrollbar');
    assert.equal(layout.left,0);
    assert.ok(Math.abs(layout.width-layout.frameWidth)<=1);
    return page.frameLocator('iframe');
  };
  try {
    await go('/system-design');
    await page.getByRole('searchbox',{name:'Search system design articles'}).waitFor();
    assert.equal(await page.getByRole('status').textContent(),'49 articles');
    await page.getByRole('searchbox').fill('Redis');
    await page.getByRole('status').filter({hasText:/^1 article$/}).waitFor();
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
    assert.equal(await notes.locator('section > ul > li').count(),sourceNotes.split('\n').filter(line=>line.startsWith('- ')).length);
    assert.deepEqual(await notes.locator('h3').allTextContents(),['Understanding the Problem','Functional Requirements','Non-functional Requirements','Core Entities','API','High-Level Design','Deep Dives','Final Design']);
    assert.ok((await notes.locator('li').allTextContents()).every(point=>point.startsWith('-')));
    assert.equal(await notes.locator('strong,table,pre,h1,h2').count(),0);
    assert.equal(await notes.locator('img').count(),8);
    assert.ok(await notes.locator('[data-concept="cache"]').count()>0);
    assert.ok(await notes.locator('[data-concept="gateway"]').count()>0);
    const pointText=(await notes.locator('li').allTextContents()).join('\n');
    const highlightedText=(await notes.locator('li [data-concept]').allTextContents()).join('\n');
    for(const term of ['Redis','PostgreSQL','CDN','TTL','Base62','INCR','INCRBY','primary key','uniqueness constraint','replication','failover','sharding','302','short_code']) {
      const pattern=new RegExp('\\b'+term+'\\b','gi');
      const total=[...pointText.matchAll(pattern)].length;
      assert.ok(total>0,term+' appears in the notes');
      assert.equal([...highlightedText.matchAll(pattern)].length,total,'Every '+term+' occurrence is highlighted');
    }
    const diagramFlow=await notes.locator('figure').evaluateAll(figures=>figures.map(f=>({
      file:new URL(f.querySelector('img').src).pathname.split('/').pop(),
      flow:f.closest('[role="group"]')?.getAttribute('aria-label')||null,
    })));
    assert.deepEqual(diagramFlow,[
      {file:'01.svg',flow:null}, {file:'02.svg',flow:null},
      {file:'03.svg',flow:'Create and return a short link process'},
      {file:'04.svg',flow:'Redirect through the database process'},
      {file:'05.svg',flow:'Generate a short code with a hash process'},
      {file:'06.svg',flow:'Generate a short code with a counter process'},
      {file:'07.svg',flow:'Resolve a short link through the cache and database process'},
      {file:'08.svg',flow:null},
    ]);
    assert.deepEqual(await notes.locator('figure').evaluateAll(figures=>figures.map(f=>f.closest('section').querySelector('h3,h4').textContent)),[
      'Non-functional Requirements','Core Entities','1) Create a short URL','2) Redirect to the original URL',
      '1) Generate unique short codes','1) Generate unique short codes','2) Make redirects fast','Final Design',
    ]);
    assert.ok(await notes.locator('li').nth(1).evaluate(e=>parseFloat(getComputedStyle(e).marginTop)<=4));
    assert.equal(await notes.evaluate(e=>getComputedStyle(e).lineHeight),'24px');
    for(const img of await notes.locator('img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(i=>i.decode());
      assert.ok(await img.evaluate(i=>i.naturalWidth>0&&i.getBoundingClientRect().width>0));
    }
    const [diagramPage]=await Promise.all([page.waitForEvent('popup'),notes.locator('figure a').last().click()]);
    await diagramPage.waitForURL('**/notes/bitly/08.svg*');
    await diagramPage.waitForLoadState('domcontentloaded');
    assert.ok(diagramPage.url().includes('notes/bitly/08.svg'));
    await diagramPage.close();
    await page.evaluate(()=>window.scrollTo(0,0));
    if(process.env.QA_SCREENSHOTS)await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'bitly-condensed.png')});
    await page.getByRole('link',{name:'Full article',exact:true}).click();
    let frame=await ready();
    assert.equal(await frame.locator('#markdown img').count(),8);
    assert.equal(await frame.locator('#markdown button[aria-expanded=false]').count(),0);
    await frame.locator('a[href*="/patterns/scaling-reads"]').first().click();
    await page.waitForURL(/#\/system-design\/scaling-reads\?view=full$/);
    await ready();
    await page.getByRole('link',{name:'Practice reference · 30',exact:true}).click();
    await page.getByRole('heading',{name:'System Design Reference',exact:true}).waitFor();
    await go('/system-design/not-a-page');
    await page.getByText('Article not found.',{exact:true}).waitFor();
    const broken='**/02-dropbox.html*';
    await page.route(broken,route=>route.fulfill({status:404,contentType:'text/html',body:'<h1>Missing</h1>'}));
    await go('/system-design/dropbox?view=full');
    await page.getByRole('alert').waitFor();
    await page.unroute(broken);
    await page.getByRole('button',{name:'Try again',exact:true}).click();
    await ready();
    for(const article of articles) {
      await go(`/system-design/${article.slug}?view=full`);
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
      await page.setViewportSize({width:390,height:844});
      await page.waitForFunction(()=>{const f=document.querySelector('iframe');return f.contentDocument.documentElement.scrollHeight<=f.clientHeight+1;});
      assert.ok(await page.locator('iframe').evaluate(f=>f.contentDocument.documentElement.scrollWidth<=f.clientWidth+1),article.title+' full article mobile');
      await page.setViewportSize({width:1280,height:900});
    }
    let noteImages=0;
    for(const article of articles) {
      await go(`/system-design/${article.slug}`);
      const note=page.locator(`[aria-label="${article.title} condensed notes"]`);
      await note.waitFor();
      const expected=JSON.parse(fs.readFileSync(path.join(root,'src/data/system-design-notes',article.slug+'.json'),'utf8'));
      assert.deepEqual(await note.locator('h3,h4').allTextContents(),expected.sections.map(s=>s.title),article.title);
      assert.deepEqual(await note.locator('li').allTextContents(),expected.sections.flatMap(s=>[
        ...s.points.map(p=>'-'+p),
        ...s.flows.flatMap(flow=>flow.steps.map((step,i)=>`-${i+1}. ${step}`)),
      ]),article.title);
      const flows=expected.sections.flatMap(s=>s.flows);
      assert.ok(flows.length>0,article.title+' has process flows');
      if(article.slug!=='bitly')assert.equal(await note.locator('[data-concept]').count(),0,article.title+' keeps its current style');
      assert.equal(await note.getByRole('group').count(),flows.length,article.title);
      for(const flow of flows) {
        const group=note.getByRole('group',{name:flow.title+' process',exact:true});
        assert.deepEqual(await group.locator('li').allTextContents(),flow.steps.map((step,i)=>`-${i+1}. ${step}`),article.title+' / '+flow.title);
        assert.deepEqual(await group.locator('img').evaluateAll(items=>items.map(img=>new URL(img.src).pathname.split('/').pop())),flow.diagramFilenames||[],article.title+' / '+flow.title+' diagrams');
      }
      const download=await page.request.get(new URL(`system-design/notes/${article.slug}.txt`,base).href);
      assert.ok(download.ok(),article.title+' text download');
      const downloadText=await download.text();
      for(const flow of flows) assert.ok(downloadText.includes('Process: '+flow.title),article.title+' downloaded process');
      const images=note.locator('img');
      assert.equal(await images.count(),article.imageCount+(article.slug==='postgresql'?1:0),article.title);
      for(const img of await images.all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(i=>i.decode()); }
      noteImages+=await images.count();
      await page.setViewportSize({width:390,height:844});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),article.title+' mobile');
      assert.ok(await images.evaluateAll(items=>items.every(i=>i.getBoundingClientRect().right<=innerWidth+1)),article.title+' diagrams');
      if(process.env.QA_SCREENSHOTS) {
        await page.evaluate(()=>window.scrollTo(0,0));
        await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'notes-'+article.slug+'.png')});
      }
      await page.setViewportSize({width:1280,height:900});
    }
    assert.equal(noteImages,497);
    await page.setViewportSize({width:390,height:844});
    await go('/system-design/bitly');
    await page.locator('[aria-label="Bitly condensed notes"]').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    for(const img of await page.locator('[aria-label="Bitly condensed notes"] img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(i=>i.decode());
      assert.ok(await img.evaluate(i=>i.getBoundingClientRect().right<=innerWidth+1));
    }
    if(process.env.QA_SCREENSHOTS)await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'bitly-final-diagram-mobile.png')});
    await page.evaluate(()=>window.scrollTo(0,0));
    if(process.env.QA_SCREENSHOTS)await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'bitly-mobile.png')});
    await go('/system-design');
    await page.getByRole('searchbox').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await go('/system-design/redis?view=full');
    await ready();
    assert.ok(await page.locator('iframe').evaluate(f=>f.contentDocument.documentElement.scrollWidth<=f.clientWidth+1));
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({passed:true,articles:articles.length,images:articles.reduce((n,a)=>n+a.imageCount,0),checks:['filters','plain hyphen notes','full article','internal article links','legacy reference','unknown route','load failure and retry','49 full readers','49 condensed readers','ordered process flows and text downloads','497 note diagrams','mobile overflow']}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
