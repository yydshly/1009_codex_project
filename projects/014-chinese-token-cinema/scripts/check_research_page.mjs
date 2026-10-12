// Own localhost only: verify actual media playback and isolation between players.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const modulePath=process.env.PLAYWRIGHT_MODULE||'C:/Users/yun68/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const {chromium}=await import(pathToFileURL(modulePath));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu','--no-proxy-server','--autoplay-policy=no-user-gesture-required']});
const url='http://127.0.0.1:4324/1009_codex_project/014-chinese-token-cinema/';
const report={date:new Date().toISOString(),errors:[],media:[]};
try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(()=>window.filmReady&&window.researchReady,undefined,{timeout:30000});
  assert.equal(await page.locator('.experiment-card').count(),3);
  assert.equal(await page.locator('#research-lyrics p').count(),27);
  assert.match(await page.locator('#reference-status').textContent(),/本地完整原片/);
  assert.match(await page.locator('.research-status').textContent(),/尚未通过/);
  await page.getByRole('link',{name:'原片与研究记录 ↓'}).click();
  // Read metadata rather than inferring readiness from DOM presence.
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('#research .review-video')).every(v=>v.readyState>=1&&v.videoWidth>0));
  report.media=await page.locator('#research .review-video').evaluateAll(videos=>videos.map(v=>({src:v.currentSrc,duration:v.duration,width:v.videoWidth,height:v.videoHeight})));
  assert(Math.abs(report.media[0].duration-276.053333)<.1);
  assert.equal(report.media[0].width,1920);
  const range=await page.request.get(url+'assets/reference/dj-sho-slopcore.mp4',{headers:{Range:'bytes=0-1023'}});
  assert.equal(range.status(),206);assert.equal((await range.body()).length,1024);
  assert.match(range.headers()['content-range'],/^bytes 0-1023\/191951547$/);
  report.rangeStreaming=true;
  // Native reference playback: real time advances after a watch-point click.
  await page.getByRole('button',{name:'播放词块与回指，00:28'}).click();
  await page.waitForFunction(()=>{const v=document.getElementById('reference-video');return !v.paused&&v.currentTime>28.3;},undefined,{timeout:10000});
  await page.locator('#play').click();
  await page.waitForFunction(()=>{const a=document.getElementById('audio');return !a.paused&&a.currentTime>.2;});
  assert(await page.locator('#reference-video').evaluate(v=>v.paused));
  report.mainPausesReference=true;
  // All three outputs are playable and pause the main song / previous output.
  for(let i=0;i<3;i++){
    await page.locator('.experiment-card .test-marker').nth(i).click();
    const threshold=[4.2,4,8.5][i]+.15;
    await page.waitForFunction(({i,t})=>{const v=document.querySelectorAll('.experiment-card video')[i];return !v.paused&&v.currentTime>t;},{i,t:threshold},{timeout:10000});
    assert(await page.locator('#audio').evaluate(a=>a.paused));
    const active=await page.locator('.review-video').evaluateAll(vs=>vs.filter(v=>!v.paused).length);
    assert.equal(active,1);
  }
  report.pilotsPlayable=true;report.pilotsPauseMainAndEachOther=true;
  // Native video keyboard input must not trigger the main-film shortcut.
  const last=page.locator('.experiment-card video').nth(2);
  await last.focus();await last.press('Space');
  assert(await page.locator('#audio').evaluate(a=>a.paused));
  report.nativeKeyboardDoesNotStartMain=true;
  await page.locator('#test-original-audio').evaluate(a=>a.play());
  await page.waitForFunction(()=>document.getElementById('test-original-audio').currentTime>.2);
  assert(await page.locator('.review-video').evaluateAll(vs=>vs.every(v=>v.paused)));
  report.originalInputPlayable=true;
  await page.locator('#test-original-audio').evaluate(a=>a.pause());
  await page.getByRole('button',{name:'播放词块与回指，00:28'}).click();
  await page.waitForFunction(()=>document.getElementById('reference-video').currentTime>28.3);
  await page.locator('#reference-video').evaluate(v=>v.pause());
  await page.locator('#research').scrollIntoViewIfNeeded();
  await page.evaluate(()=>document.getElementById('research').scrollIntoView({block:'start'}));
  await page.screenshot({path:path.join(project,'assets/research-preview.png')});
  // Reset paused outputs to their actual-frame posters for the overview capture.
  await page.locator('.experiment-card video').evaluateAll(vs=>vs.forEach(v=>v.load()));
  await page.locator('#experiments').evaluate(el=>el.scrollIntoView({block:'start'}));
  await page.screenshot({path:path.join(project,'assets/research-tests-preview.png'),fullPage:false});
  report.mobile=[];
  for(const width of [390,768]){
    await page.setViewportSize({width,height:844});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    assert.equal(overflow,false,`横向溢出：${width}`);
    report.mobile.push({width,overflow});
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('#research').evaluate(el=>el.scrollIntoView({block:'start'}));
  await page.screenshot({path:path.join(project,'assets/research-mobile.png')});
  // A clean checkout without the ignored reference MP4 uses the public source.
  await page.route('**/assets/reference/dj-sho-slopcore.mp4',route=>route.fulfill({status:404,body:'Not found'}));
  await page.route('https://video.twimg.com/**',route=>route.abort());
  await page.reload();await page.waitForFunction(()=>window.researchReady);
  assert.match(await page.locator('#reference-status').textContent(),/网页研究片段/);
  assert(await page.locator('#reference-download').isHidden());
  await page.getByRole('button',{name:'播放词块与回指，00:28'}).click();
  await page.waitForFunction(()=>{const v=document.getElementById('reference-video');return v.videoWidth>0&&v.duration===12&&!v.paused&&v.currentTime>4.1;});
  await page.locator('#reference-video').evaluate(v=>v.pause());
  report.missingLocalReferenceFallback=true;
  assert.equal(report.errors.length,0);
  report.status='verified_reference_and_three_rejected_pilots';
  await fs.writeFile(path.join(project,'assets/research-page-verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log('研究页通过：原片与三条样片实际播放、定位、音频互斥、原唱输入、原片缺失回退及手机布局。');
}finally{await browser.close();}
