import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {chromium}=await import(pathToFileURL(path.join(process.env.LEMO_PLAYWRIGHT_PATH,'index.mjs')).href);
const url='http://127.0.0.1:4320/1009_codex_project/010-lemo-opuscar/';
const report={date:'2026-10-10',errors:[],inkPlayback:{},switches:[]};
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(url+'#overview',{waitUntil:'domcontentloaded'});await page.locator('.interactive-summary > summary').click();await page.waitForSelector('#overview-toggle');
  await page.locator('#overview-blueprint').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.getElementById('overview-toggle').textContent.includes('暂停'),{},{timeout:20000});
  report.defaultAnimation=await page.frameLocator('#overview-blueprint').locator('body').evaluate(()=>window.previewState);
  assert(report.defaultAnimation.running);
  await page.locator('[data-overview-film="ink-wash"]').click();
  try {await page.waitForFunction(()=>{const v=document.getElementById('overview-video');return v.videoWidth>0&&v.currentTime>.3&&!v.paused;},{},{timeout:20000});}
  catch {report.inkPlayback.timeout=true;}
  report.inkPlayback={...report.inkPlayback,...await page.locator('#overview-video').evaluate(v=>({readyState:v.readyState,currentTime:v.currentTime,width:v.videoWidth,height:v.videoHeight,paused:v.paused,frames:v.getVideoPlaybackQuality?.().totalVideoFrames||0,src:v.src}))};
  report.livePausedForVideo=await page.frameLocator('#overview-blueprint').locator('body').evaluate(()=>!window.previewState.running);
  for(const slug of ['glass-product','paper-popup']){
    await page.locator(`[data-overview-film="${slug}"]`).click();
    const state=await page.locator('#overview-video').evaluate(v=>({src:v.src,poster:v.poster}));assert(state.src.endsWith(slug+'.mp4'));assert(state.poster.endsWith(slug+'.jpg'));report.switches.push({slug,...state,selectionVerified:true,playbackNotChecked:true});
  }
  assert.deepEqual(report.errors,[]);
  await page.setViewportSize({width:390,height:1000});await page.evaluate(()=>scrollTo({top:document.getElementById('overview').offsetTop-105,behavior:'instant'}));
  await page.screenshot({path:path.join(root,'assets/overview-mobile.png')});
  await fs.writeFile(path.join(root,'assets/overview-media-verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
