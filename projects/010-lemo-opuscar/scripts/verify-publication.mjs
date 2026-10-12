import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const packagePath=process.env.LEMO_PLAYWRIGHT_PATH;
const {chromium}=packagePath?await import(pathToFileURL(path.join(packagePath,'index.mjs')).href):await import('playwright');
const url=process.env.LEMO_PREVIEW_URL||'http://127.0.0.1:4330/1009_codex_project/010-lemo-opuscar/';
const label=url.startsWith('http://127.0.0.1')?'local':'public';
const report={date:'2026-10-12',url,checks:[],widths:[],errors:[],localFailures:[],originalImages:[],animation:{}};
const browser=await chromium.launch({headless:true});
try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(url).origin?route.continue():route.abort());
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)report.localFailures.push({url:r.url(),status:r.status()});});
  await page.goto(url+'#guide',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('#extension-list article');
  for(const [selector,count] of [['#capability-list article',6],['#module-list article',8],['#principle-list li',6],['#extension-list article',8]])assert.equal(await page.locator(selector).count(),count);
  assert.equal(await page.locator('#guide-updated').textContent(),'2026-10-12');
  report.checks.push('完整能力、8类模块、执行原理、8项扩展及条件读取并显示');
  const expected={'understanding-overview.png':'ff8c29b438498bbd00a6c50eba0812e6a97c000bd7521aa6f9f2c13c801d6303','understanding-overview.svg':'fac5516e94f768e4da0dd00ecc8f8bdc76321aa555e2d7866b4eed6984e23ecb'};
  for(const [name,hash] of Object.entries(expected)){
    const response=await page.request.get(url+'assets/guide/'+name);assert.equal(response.status(),200);
    const content=await response.body();assert.equal(createHash('sha256').update(content).digest('hex'),hash);
    report.originalImages.push({name,status:response.status(),contentType:response.headers()['content-type'],bytes:content.length,sha256:hash});
  }
  await page.locator('#original-guide-image').evaluate(img=>img.decode());
  assert.deepEqual(await page.locator('#original-guide-image').evaluate(img=>[img.naturalWidth,img.naturalHeight]),[1600,4219]);
  const collapsed=await page.locator('#original-guide-frame').evaluate(n=>n.getBoundingClientRect().height);
  await page.locator('#expand-original-guide').click();assert.equal(await page.locator('#expand-original-guide').getAttribute('aria-expanded'),'true');
  assert((await page.locator('#original-guide-frame').evaluate(n=>n.getBoundingClientRect().height))>collapsed*2);
  await page.locator('#expand-original-guide').click();
  report.checks.push('原始引导PNG/SVG HTTP字节与SHA256一致，1600×4219，展开/收起有效');
  await page.locator('#guide').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo({top:document.getElementById('guide').offsetTop-95,behavior:'instant'}));
  await page.screenshot({path:path.join(root,`assets/publication-${label}-guide.png`)});
  await page.locator('#architecture').scrollIntoViewIfNeeded();await page.locator('#module-list').screenshot({path:path.join(root,`assets/publication-${label}-modules.png`)});
  await page.locator('#live-blueprint').scrollIntoViewIfNeeded();await page.waitForFunction(()=>!document.getElementById('live-toggle').disabled);
  const frame=page.frameLocator('#live-blueprint');
  assert((await frame.locator('body').evaluate(()=>window.previewState)).ready);
  await page.locator('#live-toggle').click();await page.waitForTimeout(700);
  const playing=await frame.locator('body').evaluate(()=>window.previewState);assert(playing.running&&playing.time>8);
  await page.locator('#live-toggle').click();await page.waitForTimeout(150);
  report.animation=await frame.locator('body').evaluate(()=>window.previewState);assert(!report.animation.running);
  report.checks.push('原作蓝图画面资源就绪、播放推进、暂停控制有效（外部网络阻断）');
  await page.locator('.interactive-summary > summary').click();
  assert.equal(await page.locator('.om-style-names button').count(),43);
  await page.locator('.om-style-names [data-play="blueprint"]').click();await page.waitForSelector('#film-dialog[open]');
  assert.match(await page.locator('#film-spec').innerText(),/Blue and white only/);await page.locator('#close-dialog').click();
  report.checks.push('交互版可展开，43种风格入口及完整蓝图规范正常');
  await page.locator('#extension-list').scrollIntoViewIfNeeded();assert.match(await page.locator('#extension-list').innerText(),/扩展建议|怎样验证|需要补齐/);
  for(const width of [1440,1120,900,390]){
    await page.setViewportSize({width,height:1000});await page.waitForTimeout(120);
    const dimensions=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(dimensions.scroll<=width);report.widths.push(dimensions);
  }
  await page.evaluate(()=>scrollTo({top:document.getElementById('guide').offsetTop-100,behavior:'instant'}));await page.screenshot({path:path.join(root,`assets/publication-${label}-mobile.png`)});
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.localFailures,[]);
  await fs.writeFile(path.join(root,`assets/publication-${label}-verification.json`),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
} finally {await browser.close();}
