// Browser verification of our own local infographic viewer and actual media.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE||'C:/Users/yun68/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu','--no-proxy-server','--autoplay-policy=no-user-gesture-required']});
const url='http://127.0.0.1:4324/1009_codex_project/014-chinese-token-cinema/';
const report={date:new Date().toISOString(),errors:[],media:[],responsive:[]};
try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(()=>window.filmReady&&window.overviewReady&&window.summaryReady,undefined,{timeout:30000});
  assert.equal(await page.locator('#summary-cards article').count(),10);
  assert.equal(await page.locator('#summary-module-rows tr').count(),8);
  assert.equal(await page.locator('#summary-extensions article').count(),4);
  assert(await page.locator('#overview').evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('.cinema'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  report.completeSummaryAndGuideFirst=true;
  await page.getByRole('link',{name:'一图总览 ↓'}).click();
  await page.waitForFunction(()=>{const i=document.querySelector('.overview-figure img');return i.complete&&i.naturalWidth===2880;});
  assert.equal(await page.locator('#overview-transcript p').count(),205);
  assert.equal(await page.locator('#overview-sources a').count(),6);
  report.homeImage=await page.locator('.overview-figure img').evaluate(i=>({width:i.naturalWidth,height:i.naturalHeight}));
  await page.locator('#overview').evaluate(el=>el.scrollIntoView({block:'start'}));
  await page.screenshot({path:path.join(project,'assets/overview-preview.png')});
  // Each button must decode real video and advance at the requested time.
  for(const [kind,time,duration] of [['reference',28,276.053333],['ours',30,135.589002],['reference',228,276.053333]]){
    await page.locator(`#overview [data-overview-watch="${kind}"][data-time="${time}"]`).click();
    await page.waitForFunction(t=>{const v=document.getElementById('overview-media');return !v.paused&&v.videoWidth>0&&v.currentTime>t+.1;},time,{timeout:20000});
    const metadata=await page.locator('#overview-media').evaluate(v=>({src:v.currentSrc,width:v.videoWidth,height:v.videoHeight,duration:v.duration,time:v.currentTime}));
    assert(Math.abs(metadata.duration-duration)<.12);report.media.push({kind,...metadata});
    assert(await page.locator('#audio').evaluate(a=>a.paused));
    assert.equal(await page.locator('#overview-media-status').isHidden(),true);
    await page.getByRole('button',{name:'关闭效果播放'}).click();
    await page.waitForFunction(()=>document.getElementById('overview-media').paused,undefined,{timeout:2000});
  }
  report.previewPlaybackAndIsolation=true;
  for(const width of [390,768]){
    await page.setViewportSize({width,height:844});
    await page.locator('#overview').evaluate(el=>el.scrollIntoView({block:'start'}));
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    assert.equal(overflow,false,`主页横向溢出：${width}`);report.responsive.push({page:'home',width,overflow});
    if(width===390)await page.screenshot({path:path.join(project,'assets/overview-mobile.png')});
  }
  // Static Pages uses the real Canvas player when the ignored export is absent.
  await page.route('**/exports/wo-hai-zai-zhe-li-motion.mp4',route=>route.fulfill({status:404,body:'Not found'}));
  await page.locator('#overview [data-overview-watch="ours"]').click();
  await page.waitForFunction(()=>{const a=document.getElementById('audio');return !a.paused&&a.currentTime>30.1;});
  assert.equal(await page.locator('dialog').isVisible(),false);
  await page.locator('#audio').evaluate(a=>a.pause());
  report.missingExportFallback=true;
  await page.unroute('**/exports/wo-hai-zai-zhe-li-motion.mp4');
  await page.goto(url+'overview.html');await page.waitForFunction(()=>window.overviewReady);
  await page.waitForFunction(()=>{const i=document.getElementById('overview-image');return i.complete&&i.naturalWidth===1920;});
  const response=await page.request.head(url+'assets/overview/overview.svg');
  assert.match(response.headers()['content-type'],/image\/svg\+xml/);
  const initial=await page.locator('#overview-image').evaluate(i=>i.clientWidth);
  await page.getByRole('button',{name:'放大总览图'}).click();
  assert.equal(await page.locator('#overview-scale').textContent(),'150%');
  assert(Math.abs(await page.locator('#overview-image').evaluate(i=>i.clientWidth)/initial-1.5)<.01);
  await page.getByRole('button',{name:'适应宽度'}).click();
  assert.equal(await page.locator('#overview-scale').textContent(),'100%');
  report.vectorZoom=true;
  await page.setViewportSize({width:1440,height:1100});
  await page.getByRole('button',{name:'全屏',exact:true}).click();
  await page.waitForFunction(()=>!!document.fullscreenElement);
  await page.evaluate(()=>document.exitFullscreen());report.fullscreen=true;
  await page.screenshot({path:path.join(project,'assets/overview-viewer-preview.png')});
  for(const width of [390,768]){
    await page.setViewportSize({width,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`阅读器横向溢出：${width}`);
    await page.getByRole('button',{name:'放大总览图'}).click();
    assert(await page.locator('#overview-scroll').evaluate(el=>el.scrollWidth>el.clientWidth));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.getByRole('button',{name:'适应宽度'}).click();
    report.responsive.push({page:'viewer',width,overflow:false,panInContainer:true});
  }
  assert.equal(report.errors.length,0);
  report.status='verified_infographic_zoom_real_media_and_mobile';
  await fs.writeFile(path.join(project,'assets/overview-page-verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log('总览页通过：真实图片、三处实际视频播放与声音互斥、下载资源、矢量放大、全屏、缺少导出回退和手机布局。');
}finally{await browser.close();}
