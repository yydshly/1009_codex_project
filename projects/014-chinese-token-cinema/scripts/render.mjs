// Local deterministic MP4 export + browser verification. No network needed.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cinema=process.argv.includes('--cinema');
const motion=cinema||process.argv.includes('--motion');
const song=motion||process.argv.includes('--song');
const version=cinema?'cinema':motion?'motion':song?'song':'narration';
const stamp=cinema?'cinema-':motion?'motion-':song?'song-':'';
if(motion){
  const manifest=JSON.parse(await fs.readFile(path.join(project,'web/public/assets',cinema?'cinema-performance-manifest.json':'performance-manifest.json'),'utf8'));
  const intermediate=path.join(project,'web/public/exports/render-media');await fs.mkdir(intermediate,{recursive:true});
  for(const source of manifest.sources){
    const input=path.join(project,'web/public/assets',source.file),output=path.join(intermediate,path.basename(input));
    const [original,cached]=await Promise.all([fs.stat(input),fs.stat(output).catch(()=>null)]);
    if(cached&&cached.mtimeMs>=original.mtimeMs&&cached.size>100000)continue;
    const encoder=spawn(process.env.FFMPEG_PATH||'ffmpeg',['-y','-hide_banner','-loglevel','error','-i',input,'-map','0:v:0','-c:v','libx264','-preset','fast','-crf','17','-g','1','-keyint_min','1','-an','-movflags','+faststart',output],{stdio:['ignore','ignore','pipe']});
    let diagnostic='';encoder.stderr.on('data',b=>diagnostic+=b.toString());
    await new Promise((resolve,reject)=>{encoder.on('error',reject);encoder.on('close',c=>c===0?resolve():reject(new Error(diagnostic)));});
    console.log('已准备快速定位的渲染副本：'+source.id);
  }
}
const modulePath=process.env.PLAYWRIGHT_MODULE||'C:/Users/yun68/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const {chromium}=await import(pathToFileURL(modulePath));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required','--disable-gpu','--no-proxy-server']});
const errors=[];
try{
  const page=await browser.newPage({viewport:{width:1440,height:1170}});
  page.on('pageerror',error=>errors.push(error.message));
  const previewUrl='http://127.0.0.1:4324/1009_codex_project/014-chinese-token-cinema/?version='+version;
  await page.goto(previewUrl+(motion?'&renderMedia=1':''),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.filmReady,undefined,{timeout:30000});
  async function jpeg(time){return Buffer.from(await page.evaluate(async time=>{await window.renderFilmAt(time);return document.getElementById('film').toDataURL('image/jpeg',.92).split(',')[1];},time),'base64');}
  const timeline=await page.evaluate(()=>window.filmTimeline);
  if(motion&&!timeline.performanceClips?.length)throw new Error('动态人物视频未接入');
  const sampleTimes=song?[1,19,30,42,98,124]:[0,11,27,34,44,57];
  if(song)await page.evaluate(()=>window.renderFilmAt(42));
  await page.screenshot({path:path.join(project,'assets',stamp+'preview.png'),fullPage:true});
  for(const [i,time]of sampleTimes.entries())await fs.writeFile(path.join(project,'assets',`${stamp}frame-${i+1}.jpg`),await jpeg(time));
  // Check actual media playback and controls, then return to deterministic mode.
  await page.goto(previewUrl,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.filmReady);
  await page.getByRole('button',{name:'播放中文短片',exact:true}).click();
  await page.waitForTimeout(700);
  const playback=await page.evaluate(()=>({paused:document.getElementById('audio').paused,time:document.getElementById('audio').currentTime,duration:document.getElementById('audio').duration}));
  if(playback.paused||playback.time<=0)throw new Error('声音未实际播放');
  let performancePlayback=null,performancePaused=null;
  if(motion){
    await page.waitForFunction(()=>{const m=window.inspectFilmMedia();return m?.ready&&!m.paused&&Math.abs(m.localTime-m.targetTime)<.15;},undefined,{timeout:10000});
    performancePlayback=await page.evaluate(()=>window.inspectFilmMedia());
  }
  await page.getByRole('button',{name:'暂停',exact:true}).click();
  if(motion){
    await page.waitForFunction(()=>{const m=window.inspectFilmMedia();return m?.ready&&m.paused&&Math.abs(m.localTime-m.targetTime)<.03;},undefined,{timeout:10000});
    performancePaused=await page.evaluate(()=>window.inspectFilmMedia());
  }
  await page.getByRole('button',{name:'跳转到回应',exact:true}).click();
  const chapter=await page.evaluate(()=>({time:document.getElementById('audio').currentTime,active:document.querySelector('.chapter.active .chapter-title').textContent}));
  if(chapter.active!=='回应')throw new Error('章节跳转失败');
  await page.getByLabel('预测面板',{exact:true}).uncheck();
  await page.getByLabel('预测面板',{exact:true}).check();
  await page.getByLabel('字幕版本',{exact:true}).selectOption('classic');
  const classic=await page.evaluate(()=>window.renderFilmAt(11));
  if(classic.subtitleMode!=='classic')throw new Error('初版字幕切换失败');
  await page.getByLabel('字幕版本',{exact:true}).selectOption('expressive');
  if(!song){await page.getByLabel('配乐版本',{exact:true}).selectOption('original');
  await page.waitForFunction(()=>document.getElementById('audio').currentSrc.endsWith('/story.mp3')&&document.getElementById('audio').readyState>=1);
  await page.getByLabel('配乐版本',{exact:true}).selectOption('emotional');
  await page.waitForFunction(()=>document.getElementById('audio').currentSrc.endsWith('/story-emotional.mp3')&&document.getElementById('audio').readyState>=1);}
  const modes=[];
  for(const time of (song?timeline.cues.map(c=>(c.start+c.end)/2):[5,11,16,23,27,30,34,39,44,49,54,57]))modes.push(await page.evaluate(time=>window.renderFilmAt(time),time));
  if(motion){
    for(const c of timeline.performanceClips){
      const frame=await page.evaluate(time=>window.renderFilmAt(time),(c.start+c.end)/2);
      if(!frame.performanceFrame)throw new Error('人物片段未成功解码：'+c.src);
    }
    for(const c of timeline.cues){
      const middle=(c.start+c.end)/2;
      if(!timeline.performanceClips.some(p=>middle>=p.start&&middle<p.end))throw new Error('唱词没有人物视频覆盖：'+c.text);
    }
  }
  if(new Set(modes.map(item=>item.subtitleMode)).size<5)throw new Error('字幕多态未覆盖');
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(time=>window.renderFilmAt(time),song?42:11);
  await page.screenshot({path:path.join(project,'assets',stamp+'mobile.png'),fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(overflow)throw new Error('移动端出现横向溢出');
  await page.setViewportSize({width:1440,height:1170});
  if(song){
    if(Math.abs(playback.duration-timeline.duration)>.1)throw new Error('歌词时间线与音轨长度不一致');
    if(new Set(modes.map(m=>m.shot)).size<8)throw new Error('演唱版镜头变化不足');
    await page.getByLabel('作品版本',{exact:true}).selectOption('narration');
    await page.waitForFunction(()=>window.filmReady&&window.filmTimeline.kind!=='song');
    await page.getByLabel('作品版本',{exact:true}).selectOption(version);
    await page.waitForFunction(()=>window.filmReady&&window.filmTimeline.kind==='song');
  }
  await fs.writeFile(path.join(project,'assets',stamp+'verification.json'),JSON.stringify({playback,performancePlayback,performancePaused,chapter,classic,modes,musicSwitch:!song,workSwitch:song,mobileOverflow:overflow,errors,date:new Date().toISOString()},null,2)+'\n');
  console.log('桌面/手机、实际声音、章节跳转、字幕多态和作品/声音版本切换通过。');
  if(!process.argv.includes('--stills-only')){
    if(motion){await page.goto(previewUrl+'&renderMedia=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.filmReady);}
    const output=path.join(project,'web/public/exports',cinema?'wo-hai-zai-zhe-li-cinema.mp4':motion?'wo-hai-zai-zhe-li-motion.mp4':song?'wo-hai-zai-zhe-li-song.mp4':'wo-hai-zai-zhe-li-v2.mp4');await fs.mkdir(path.dirname(output),{recursive:true});
    const ffmpeg=spawn(process.env.FFMPEG_PATH||'ffmpeg',['-y','-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-framerate','24','-i','pipe:0','-i',path.join(project,'web/public/assets',song?'song.mp3':'story-emotional.mp3'),'-vf','scale=1280:720','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-t',String(timeline.duration),'-movflags','+faststart',output],{stdio:['pipe','ignore','pipe']});
    let diagnostics='';ffmpeg.stderr.on('data',chunk=>diagnostics+=chunk.toString());
    const completion=new Promise((resolve,reject)=>{ffmpeg.on('error',reject);ffmpeg.on('close',code=>code===0?resolve():reject(new Error(diagnostics||'FFmpeg export failed')));});
    const frameCount=Math.ceil(timeline.duration*24);
    for(let i=0;i<frameCount;i++){
      const bytes=await jpeg(i/24);if(!ffmpeg.stdin.write(bytes))await once(ffmpeg.stdin,'drain');
      if((i+1)%240===0)console.log(`MP4 渲染 ${i+1}/${frameCount} 帧`);
    }
    ffmpeg.stdin.end();await completion;
    console.log('MP4 导出：'+output);
  }
  if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();}
