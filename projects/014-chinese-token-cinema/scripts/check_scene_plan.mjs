// Verify the review page on our own localhost; no external browser session access.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {chromium}=await import(pathToFileURL('C:/Users/yun68/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu','--no-proxy-server','--autoplay-policy=no-user-gesture-required']});
const errors=[];
try{
  const page=await browser.newPage({viewport:{width:1440,height:1150}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4324/1009_codex_project/014-chinese-token-cinema/scene-plan.html');
  await page.waitForFunction(()=>window.scenePlanReady,undefined,{timeout:30000});
  const frames=[];
  for(const [id,t,expected] of [['verse',1,false],['chorus',42,true],['ending',124,false]]){
    const state=await page.evaluate(t=>window.scenePlanAt(t),t);
    if(state.performanceFrame!==expected)throw new Error('分镜待生成状态错误：'+id);
    if(!expected&&!state.label.includes('待生成'))throw new Error('待生成标记缺失：'+id);
    frames.push({id,time:t,state});
    const bytes=await page.evaluate(()=>document.getElementById('film').toDataURL('image/jpeg',.92).split(',')[1]);
    await fs.writeFile(path.join(project,'assets',`scene-plan-${id}.jpg`),Buffer.from(bytes,'base64'));
  }
  await page.getByRole('button',{name:/主歌 · 克制的等待/}).click();
  await page.waitForFunction(()=>document.getElementById('audio').readyState>=2&&Math.abs(document.getElementById('audio').currentTime-1)<.05);
  await page.evaluate(()=>document.getElementById('audio').play());
  await page.waitForFunction(()=>document.getElementById('audio').currentTime>1.5,undefined,{timeout:10000});
  const playback=await page.evaluate(()=>({paused:document.getElementById('audio').paused,time:document.getElementById('audio').currentTime,duration:document.getElementById('audio').duration}));
  if(playback.paused||playback.time<=1)throw new Error('原歌曲未实际播放');
  await page.evaluate(()=>document.getElementById('audio').pause());
  await page.getByRole('button',{name:/结尾 · 轻声回应/}).click();
  await page.waitForFunction(()=>document.getElementById('audio').currentTime===124);
  await page.screenshot({path:path.join(project,'assets/scene-plan-preview.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(overflow)throw new Error('移动端横向溢出');
  if(errors.length)throw new Error(errors.join('\n'));
  await fs.writeFile(path.join(project,'assets/scene-plan-verification.json'),JSON.stringify({status:'storyboard_verified_not_new_video',frames,playback,mobileOverflow:overflow,errors,date:new Date().toISOString()},null,2)+'\n');
  console.log('多场景分镜通过：三种场景、待生成标记、原歌曲实际播放、段落跳转、手机布局。');
}finally{await browser.close();}
