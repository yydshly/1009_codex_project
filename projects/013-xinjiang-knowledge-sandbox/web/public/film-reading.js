// Spoken captions and the place / period / purpose serve different reading tasks.
export const filmContexts = [
 {start:0,title:'01 · 从地球找到新疆',place:'欧亚大陆 → 新疆 → 天山',era:'地理定位 / 观测影像',intro:'先建立整体位置，再在区域地图锁定乌鲁木齐一号冰川。留意山系、盆地与地点之间的尺度关系。'},
 {start:70,title:'02 · 留下来：第一道水',place:'吐鲁番 · 坎儿井与绿洲用水情境',era:'原创生活案例',intro:'从山地的用水问题转向吐鲁番。先送水到家庭还是田地？观察工作顺序与人物回应。这里并非冰谷下游的实测水系。'},
 {start:175,title:'03 · 联系外界：道路与集市',place:'盆地边缘 → 喀什',era:'跨时期道路示意 / 原创集市',intro:'用水让生活可以继续，物品与补给从哪里来？把前一幕关注的家庭或远行者，带进集市的交换选择。'},
 {start:288,title:'04 · 长期安顿：远行与家庭',place:'盛京一带 → 伊犁 · 察布查尔',era:'1764—1765 西迁背景 / 创作家庭',intro:'从商旅停留转向长期安顿，地点与时代同时切换。比较家庭怎样应对迁移、引水和照护；人物与文书为原创情境。'},
 {start:384,title:'05 · 让下一位接上：庭院传习',place:'转入哈密的文化案例',era:'不同社区 / 原创拍点练习',intro:'家书与工具留下经验，下一代怎样参与？观察示范者的双手、停顿和学习者的接续。与锡伯家庭是不同社区的比较案例。'},
 {start:444,title:'06 · 听见彼此：当代关口',place:'乌鲁木齐物流 → 霍尔果斯',era:'当代需求 / 原创协作情境',intro:'从给学习者留出停顿，转向给不同使用者留出空间。居民、运输工与维护者表达需求，再观察选择回应了谁、留下什么缺口。'},
 {start:581,title:'07 · 带着回应回到整体',place:'霍尔果斯 → 新疆 → 地球',era:'自己的观察记录',intro:'五处案例地点与年代各自独立。回看用水、交换、安顿、传习和协作的回应，再从整体选择下一处。'},
];
export function filmContextAt(seconds) {return filmContexts.findLast(c=>seconds>=c.start)??filmContexts[0];}
export function captionAt(phrases,seconds) {return phrases?.find(p=>seconds>=p.start&&seconds<p.end)??null;}
export async function installFilmReading(player) {
 const root=document.getElementById('film-reading'),context=root.querySelector('.film-context');
 const toggle=document.getElementById('film-subtitles-toggle');
 const screen=document.createElement('div'),caption=document.createElement('div'),fullscreen=document.createElement('button');
 screen.className='film-player';player.before(screen);screen.append(player,caption,fullscreen);caption.className='film-spoken-subtitle';caption.hidden=true;caption.setAttribute('aria-label','当前影片导览字幕');
 fullscreen.className='film-fullscreen';fullscreen.textContent='⛶ 全屏';fullscreen.setAttribute('aria-label','全屏观看成片');
 fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement===screen)await document.exitFullscreen();else await screen.requestFullscreen();}catch{fullscreen.textContent='此浏览器无法全屏';}});
 document.addEventListener('fullscreenchange',()=>{fullscreen.textContent=document.fullscreenElement===screen?'⛶ 退出全屏':'⛶ 全屏';fullscreen.setAttribute('aria-label',document.fullscreenElement===screen?'退出成片全屏':'全屏观看成片');});
 player.controlsList.add('nofullscreen');
 // Custom overlay is visible in this embedded browser as well as wrapper
 // fullscreen. Keep standard tracks available for viewers who prefer them.
 for(const track of player.textTracks)track.mode='hidden';
 let last='',enabled=true,phrases=[],contexts=filmContexts;
 function update(){
  const native=[...player.textTracks].some(t=>t.mode==='showing');
  const spoken=enabled&&!native?captionAt(phrases,player.currentTime):null;
  caption.hidden=!spoken;if(spoken)caption.textContent=spoken.text;
  const points=[...document.querySelectorAll('[data-player="current"]')],point=points.findLast(b=>Number(b.dataset.time)<=player.currentTime);
  for(const b of points)b.setAttribute('aria-pressed',String(b===point));
  const c=contexts.findLast(c=>player.currentTime>=c.start)??contexts[0];if(c.title===last)return;last=c.title;
  context.querySelector('strong').textContent=c.title;context.querySelector('small').textContent=c.place+' · '+c.era;context.querySelector('p').textContent=c.intro;
 }
 toggle.addEventListener('click',()=>{enabled=!enabled;for(const t of player.textTracks)t.mode='hidden';toggle.setAttribute('aria-pressed',String(enabled));toggle.textContent=enabled?'字幕开':'字幕关';update();});
 player.textTracks.addEventListener('change',update);
 player.addEventListener('timeupdate',update);player.addEventListener('seeked',update);player.addEventListener('pause',update);update();
 try{
  const response=await fetch(player.dataset.subtitleManifest??'./assets/captions/r29-subtitles.json');if(!response.ok)throw new Error('字幕文稿未加载');
  const script=await response.json(),list=root.querySelector('.film-transcript-list');
  if(script.contexts?.length)contexts=script.contexts;
  phrases=script.burnedNarration?[]:script.phrases.filter(p=>p.kind==='narration');
  if(script.burnedNarration){toggle.disabled=true;toggle.textContent='字幕已内嵌';}
  last='';update();
  for(const [i,c] of contexts.entries()){
   const section=document.createElement('section'),heading=document.createElement('h4');heading.textContent=c.title;section.append(heading);
   const next=contexts[i+1]?.start??Infinity;
   for(const line of script.transcript.filter(t=>t.start>=c.start&&t.start<next)){
    const row=document.createElement('p'),button=document.createElement('button'),text=document.createElement('span'),sec=Math.floor(line.start);
    button.textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')} · ${line.role}`;button.setAttribute('aria-label',`定位到 ${button.textContent}`);
    button.addEventListener('click',()=>{player.pause();const seek=()=>{player.currentTime=line.start+.1;screen.scrollIntoView({block:'start',behavior:'instant'});};if(player.readyState>=1)seek();else{player.addEventListener('loadedmetadata',seek,{once:true});player.load();}});
    text.textContent=line.text;row.append(button,text);section.append(row);
   }
   list.append(section);
  }
 }catch{root.querySelector('.film-transcript-list').textContent='文稿暂不可用，可下载下方字幕文件。';}
}
export function installLiveCaptions(viewport){
 const player=document.getElementById('demo-player'),caption=document.createElement('div'),button=document.createElement('button');
 caption.id='spoken-caption';caption.hidden=true;caption.setAttribute('aria-label','当前导览字幕');player.append(caption);
 button.id='live-caption-toggle';button.textContent='字幕开';button.setAttribute('aria-pressed','true');document.querySelector('.demo-header-actions').append(button);
 let enabled=true,clips={};fetch('./assets/captions/narration-clips.json').then(r=>r.ok?r.json():{}).then(data=>{clips=data;}).catch(()=>{});
 button.addEventListener('click',()=>{enabled=!enabled;button.textContent=enabled?'字幕开':'字幕关';button.setAttribute('aria-pressed',String(enabled));if(!enabled)caption.hidden=true;});
 return {update({id,elapsed,ready,dialogue}){const phrase=enabled&&ready&&!dialogue?captionAt(clips[id],elapsed):null;caption.hidden=!phrase;if(phrase)caption.textContent=phrase.text;}};
}
