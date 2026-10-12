import {createFilm} from './film.js';
import {cinemaShots} from './scene-shot-plan.js';
const $=id=>document.getElementById(id);
const audio=$('audio'),seek=$('seek'),play=$('play'),start=$('start');
const clock=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
let film,timeline,lastChapter=-1,started=false;
let score;
let renderTime=null;
let song=false,motion=false,cinema=false;
try{
  const requested=new URLSearchParams(location.search).get('version');
  const [available,baselineManifest,cinemaManifest]=await Promise.all([
    fetch('./assets/song-timeline.json',{method:'HEAD'}).catch(()=>null),
    fetch('./assets/performance-manifest.json').then(r=>r.ok?r.json():null).catch(()=>null),
    fetch('./assets/cinema-performance-manifest.json').then(r=>r.ok?r.json():null).catch(()=>null)
  ]);
  song=requested!=='narration'&&available?.ok;
  cinema=song&&requested!=='motion'&&requested!=='song'&&cinemaManifest?.status==='complete_multiscene_vocal_coverage';
  const performanceManifest=cinema?cinemaManifest:baselineManifest;
  motion=song&&requested!=='song'&&performanceManifest?.clips?.length>0;
  $('motion-option').hidden=!performanceManifest?.clips?.length;
  $('cinema-option').hidden=cinemaManifest?.status!=='complete_multiscene_vocal_coverage';
  if(available?.ok){
    $('work-version-label').hidden=false;
    $('work-version').value=cinema?'cinema':motion?'motion':song?'song':'narration';
    $('work-version').addEventListener('change',()=>{const url=new URL(location.href);url.searchParams.set('version',$('work-version').value);location.href=url;});
  }
  [timeline,window.modelData,score]=await Promise.all((song?['song-timeline','song-model-data','song-score']:['timeline','model-data','emotion-score']).map(async name=>{
    const r=await fetch('./assets/'+name+'.json');if(!r.ok)throw new Error('数据加载失败：'+name);return r.json();
  }));
  if(motion){
    timeline.performanceClips=performanceManifest.clips;
    // Local exporter can use an ignored intra-frame copy for fast deterministic seeking.
    if(new URLSearchParams(location.search).get('renderMedia')==='1'){
      timeline.performanceClips=timeline.performanceClips.map(c=>({...c,src:'./exports/render-media/'+c.src.split('/').at(-1)}));
    }
  }
  if(cinema)score.shots=cinemaShots;
  film=await createFilm($('film'),timeline,window.modelData,score,()=>{if(renderTime===null)paint();});
  if(song){
    audio.src='./assets/song.mp3';audio.load();
    $('soundtrack').closest('label').hidden=true;
    $('soundtrack-label').textContent='MiniMax Music-3.0 · 原创演唱';
    $('voice-label').textContent='中文女声';
    $('eyebrow').textContent='一首藏在回答之间的歌';
    $('edition').textContent='014 / 中文音乐短片';
    $('start').querySelector('small').textContent=clock(timeline.duration)+' · 建议开启声音';
    $('download-film').href='./exports/wo-hai-zai-zhe-li-song.mp4';
    $('download-film').textContent='下载演唱版 MP4 ↓';
    $('about-intro').textContent='参考 DJ SHO 的词块字幕、技术界面与冷暖色调，使用原创中文歌词和独立生成的场景。歌声为 MiniMax Music-3.0 在线生成，人物画面采用静帧运镜与代码合成。';
    $('about-timing').textContent='连线包含链式、回指、分叉、断续和回应，并随唱词停顿和长音变化。唱词用音频识别时间对齐，少数字词插值，仍有小幅误差。连线方向与粒子位置为视觉编排，不表示真实注意力。';
    $('about-sound').textContent='完整中文演唱；根据最终音轨分析拍点、起音与音量变化，配置字幕和镜头。五张生成静帧随段落切换、推拉和淡化；人物没有口型动画。';
    $('model-download').href='./assets/song-model-data.json';
    $('timeline-download').href='./assets/song-timeline.json';
    if(motion){
      $('edition').textContent='014 / 动态演唱短片';
      $('download-film').href='./exports/wo-hai-zai-zhe-li-motion.mp4';
      $('download-film').textContent='下载动态演唱 MP4 ↓';
      $('about-intro').textContent='原创中文歌曲由 MiniMax Music-3.0 在线生成，人物演唱由 HeyGen 在线生成。使用原角色照片与原唱音频，包含实际嘴形、眼神和头部动作；免费版水印保留。';
      $('about-sound').textContent=performanceManifest.status==='complete_vocal_coverage'
        ?'全部唱词接入对应的人物演唱视频，间奏和尾声使用原场景。原始完整歌曲为唯一音轨，视频按原歌位置播放，不循环口型。'
        :'已接入副歌 39.50–51.56 秒的真实人物演唱样片，其余段落暂为静帧运镜。原始歌曲为唯一音轨。';
      if(cinema){
        $('edition').textContent='014 / 多场景动态演唱';
        $('download-film').href='./exports/wo-hai-zai-zhe-li-cinema.mp4';
        $('download-film').textContent='下载多场景演唱 MP4 ↓';
        $('about-intro').textContent='原创中文歌声由 MiniMax Music-3.0 在线生成；机房主歌与海岸结尾由 ChatArt 在线制作，雨夜副歌沿用 HeyGen 演唱。三个场景保持同一虚构角色，保留原始视频帧及已有水印。';
        $('about-sound').textContent='全部 27 行唱词接入对应的真实人物视频：冷色机房主歌、雨夜副歌、暖色海岸结尾。原歌是唯一音轨，口型视频不循环、不变速；间奏环境细节为静帧运镜。';
      }
    }
  }
  await document.fonts.ready;
  seek.max=timeline.duration;
  $('chapters').innerHTML=timeline.chapters.map((c,i)=>`<button class="chapter" data-index="${i}" aria-label="跳转到${c.name}"><span class="chapter-number">0${i+1}</span><span class="chapter-title">${c.name}</span><span class="chapter-time">${clock(c.start)}</span></button>`).join('');
  $('chapters').addEventListener('click',event=>{
    const button=event.target.closest('button[data-index]');if(button)jump(timeline.chapters[Number(button.dataset.index)].start+.05);
  });
  for(const [id,key]of[['show-words','words'],['show-data','data'],['show-links','links']])$(id).addEventListener('change',()=>{film.options[key]=$(id).checked;paint();});
  $('subtitle-style').addEventListener('change',()=>{film.options.subtitleStyle=$('subtitle-style').value;paint();});
  $('soundtrack').addEventListener('change',changeSoundtrack);
  $('loading').hidden=true;play.disabled=false;
  // Public deterministic renderer used by our local MP4 export and verification.
  window.renderFilmAt=async time=>{renderTime=time;await film.prepareFrame(time);return paint();};
  window.inspectFilmMedia=()=>film.inspectMedia(audio.currentTime);
  window.filmTimeline=timeline;window.filmReady=true;
  const initialTime=Number(new URLSearchParams(location.search).get('start'));
  if(Number.isFinite(initialTime)&&initialTime>0){
    if(audio.readyState<1)await new Promise((resolve,reject)=>{audio.addEventListener('loadedmetadata',resolve,{once:true});audio.addEventListener('error',reject,{once:true});});
    audio.currentTime=Math.min(initialTime,timeline.duration-.1);
  }
  window.playFilmAt=async time=>{jump(time);if(audio.paused)await toggle();};
  paint();
  requestAnimationFrame(tick);
  const exported=['127.0.0.1','localhost','::1'].includes(location.hostname)?await fetch($('download-film').getAttribute('href'),{method:'HEAD',signal:AbortSignal.timeout(3000)}).catch(()=>null):null;
  if(exported?.ok&&exported.headers.get('content-type')?.includes('video'))$('download-film').hidden=false;
}catch(error){$('loading').textContent='短片准备失败';$('error').textContent=error.message;$('error').hidden=false;start.disabled=true;}

function paint(){
  if(!film)return;
  const t=renderTime??audio.currentTime;
  if(renderTime===null)film.syncMedia(t,!audio.paused);
  const state=film.draw(t);$('time').innerHTML=`${clock(t)} <span>/ ${clock(timeline.duration)}</span>`;
  seek.value=t;seek.style.setProperty('--progress',`${t/timeline.duration*100}%`);
  if(state.chapter!==lastChapter){
    $('chapters').querySelectorAll('button').forEach((button,i)=>{button.classList.toggle('active',i===state.chapter);button.setAttribute('aria-current',i===state.chapter?'true':'false');});lastChapter=state.chapter;
  }
  return state;
}
function tick(){if(!document.hidden&&renderTime===null&&!audio.paused)paint();requestAnimationFrame(tick);}
async function toggle(){
  renderTime=null;
  if(audio.paused){
    if(audio.currentTime>=timeline.duration-.3)audio.currentTime=0;
    try{await audio.play();started=true;start.hidden=true;}catch(error){$('error').textContent='声音播放失败，请重新点击播放。'+error.message;$('error').hidden=false;}
  }else audio.pause();
  paint();
}
function jump(t){renderTime=null;audio.currentTime=Math.max(0,Math.min(timeline.duration,t));if(t>0){started=true;start.hidden=true;}paint();}
async function changeSoundtrack(){
  const position=renderTime??audio.currentTime,playing=!audio.paused,version=$('soundtrack').value;
  renderTime=position;audio.pause();
  film.options.soundtrack=version;
  $('soundtrack-label').textContent=version==='emotional'?'情绪配乐 · 四段编排':'初版电子配乐';
  try{
    const loaded=new Promise((resolve,reject)=>{audio.addEventListener('loadedmetadata',resolve,{once:true});audio.addEventListener('error',reject,{once:true});});
    audio.src='./assets/'+(version==='emotional'?'story-emotional.mp3':'story.mp3');audio.load();
    await loaded;audio.currentTime=position;renderTime=null;
    if(playing)await audio.play();paint();
  }catch(error){renderTime=null;$('error').textContent='配乐切换失败，请重新播放。';$('error').hidden=false;}
}
play.addEventListener('click',toggle);start.addEventListener('click',toggle);
$('film').addEventListener('click',()=>{if(started)toggle();});
$('restart').addEventListener('click',()=>{jump(0);if(audio.paused)toggle();});
seek.addEventListener('input',()=>jump(Number(seek.value)));
audio.addEventListener('play',()=>{play.textContent='Ⅱ';play.setAttribute('aria-label','暂停');});
audio.addEventListener('pause',()=>{play.textContent='▶';play.setAttribute('aria-label','播放');paint();});
audio.addEventListener('ended',()=>{start.hidden=false;start.querySelector('span:nth-child(2)').textContent='再看一次';paint();});
audio.addEventListener('seeked',paint);
$('mute').addEventListener('click',()=>{audio.muted=!audio.muted;$('mute').textContent=audio.muted?'×':'♪';$('mute').setAttribute('aria-label',audio.muted?'开启声音':'静音');$('mute').setAttribute('aria-pressed',String(audio.muted));});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('stage').requestFullscreen();}catch(error){$('error').textContent='当前浏览器无法进入全屏。';$('error').hidden=false;}});
$('about-button').addEventListener('click',()=>{const visible=$('about').hidden;$('about').hidden=!visible;$('about-button').setAttribute('aria-expanded',String(visible));if(visible)$('about').scrollIntoView({behavior:'smooth',block:'nearest'});});
document.addEventListener('keydown',event=>{
  if(event.target.closest('input,button,a,select,textarea,video,audio,[contenteditable="true"]'))return;
  if(event.code==='Space'){event.preventDefault();toggle();}
  if(event.code==='ArrowRight'){event.preventDefault();jump(audio.currentTime+5);}
  if(event.code==='ArrowLeft'){event.preventDefault();jump(audio.currentTime-5);}
});
