import {localObservationFrame} from './local-observation.js';
import {settlementStoryFrame} from './settlement-story.js';
import {settlementStages} from './settlement-chronology.js';
import {createDirectorFlow,directorNarrated} from './exploration-director-flow.js';
import {directorPaths} from './exploration-director-paths.js';
import {createHistoryStoryAudio} from './history-story-audio.js';
import {historyStories} from './history-story.js';
import {storySubtitle} from './story-observation.js';
import {directorStage,directorStages} from './director-spatial-sequence.js';
import {zhangReading,directorLocation} from './zhang-spatial-reading.js';
import {createSpatialContextMap} from './spatial-context-map.js';
import {createDirectorView} from './director-view.js';

export function installExplorationDirector({viewport,shell,enter,ready,frame,freeze,resume,leave,activate,resize,returnMap,adjustView,restoreView,currentPath=()=>null}){
 const overlay=document.createElement('section');overlay.className='exploration-director';overlay.hidden=true;overlay.setAttribute('aria-label','自动导演 · 从远行到安顿');shell.append(overlay);
 const opener=document.createElement('button');opener.id='exploration-director-open';opener.textContent='▷ 自动导演';shell.querySelector('.wb-header nav').prepend(opener);
 let muted=false,lastIndex=-1,cover=false,path=directorPaths[new URL(location.href).searchParams.get('director')]??directorPaths.zhang;
 const contextMap=createSpatialContextMap();
 let view;
 function syncView(manual){viewport.dataset.directorView=manual?'manual':'follow';const b=overlay.querySelector('[data-ed=camera]');if(b)b.disabled=!manual;}
 function revealChapter(smooth=true){const strip=overlay.querySelector('.ed-chapters nav'),current=strip?.querySelector('[aria-current=step]');if(!current)return;if(current.offsetLeft<strip.scrollLeft||current.offsetLeft+current.offsetWidth>strip.scrollLeft+strip.clientWidth)strip.scrollTo({left:Math.max(0,current.offsetLeft-strip.clientWidth/2+current.offsetWidth/2),behavior:smooth?'smooth':'instant'});}
 window.addEventListener('resize',()=>requestAnimationFrame(()=>revealChapter(false)));
 const audio=createHistoryStoryAudio({manifestURL:new URL('./assets/audio/director/manifest.json',import.meta.url)});
 const flow=createDirectorFlow({shots:path.shots,enter:shot=>{view?.reset();enter(shot);},ready,frame,freeze,resume,leave:()=>{viewport.classList.remove('director-active');leave();overlay.hidden=true;resize();},audio,loadAudio:shot=>audio.load(shot.audio?.event??shot.event,shot.audio?.beat??shot.beat),changed:sync});
 view=createDirectorView({interrupt:adjustView,restore:restoreView,changed:syncView});
 function url(active,index=0){const u=new URL(location.href);if(active){u.searchParams.set('director',path.id);u.searchParams.set('directorShot',String(index));}else{u.searchParams.delete('director');u.searchParams.delete('directorShot');}history.replaceState(null,'',u);}
 function coverHTML(){
  overlay.setAttribute('aria-label','自动导演 · 选择探索主题');
  overlay.innerHTML=`<article class="ed-cover"><button class="ed-close" data-ed="close" aria-label="关闭自动导演入口">×</button><p class="ed-eyebrow">自动导演 / 历史与自然探索</p><h1>选一个问题，走进新疆。</h1><p class="ed-lead">从同一个地球出发，选择历史事件或自然地点，让地图、模型和讲解一起推进。</p><div class="ed-paths" role="group" aria-label="选择自动导演路径">${Object.values(directorPaths).map(p=>`<button data-ed-path="${p.id}" aria-pressed="${p.id===path.id}"><img src="${p.image}" alt="" loading="eager"><span><small>${p.name}</small><b>${p.title}</b><em>${p.question}</em></span></button>`).join('')}</div><ol class="ed-preview">${path.outline.map(([title,text])=>`<li><b>${title}</b><span>${text}</span></li>`).join('')}</ol><div class="ed-cover-actions"><button data-ed="start" class="ed-primary">开始${path.name}演示 →</button><button data-ed="close">自己探索</button></div><small>${path.kind==='nature'?'约 3–4 分钟':'约 5–6 分钟'} · 实时 3D · 全幕旁白、同步字幕 · 可暂停、选幕、自由接管 · 缩放和转动不停止演示<br>近景为机制观察情境；模型演示与自主探索记录分别保留。</small></article>`;
 }
 function open({followContext=false}={}){if(flow.state.active)flow.stop();if(followContext)path=directorPaths[currentPath()]??path;cover=true;overlay.hidden=false;overlay.classList.add('ed-cover-mode');coverHTML();url(true);}
 function start(index=0){flow.setShots(path.shots);cover=false;lastIndex=-1;overlay.hidden=false;overlay.classList.remove('ed-cover-mode');overlay.setAttribute('aria-label','自动导演 · '+path.name);viewport.classList.add('director-active');activate(path);resize();flow.jump(index,{play:true});}
 function sync(s){
  viewport.dataset.directorPath=path.id;viewport.dataset.directorActive=String(s.active);viewport.dataset.directorPlaying=String(s.playing);viewport.dataset.directorShot=s.shot.id;viewport.dataset.directorStage=directorStage(s.shot);viewport.dataset.directorTime=s.time.toFixed(2);viewport.dataset.directorFraction=(s.time/s.duration).toFixed(3);viewport.dataset.directorWaiting=String(s.waiting);viewport.dataset.directorComplete=String(s.complete);viewport.dataset.directorAudio=!directorNarrated(s.shot)?'caption':s.silent?'fallback':audio.state;
  if(!s.active)return;
  if(lastIndex!==s.index){const oldScroll=overlay.querySelector('.ed-chapters nav')?.scrollLeft??0;lastIndex=s.index;overlay.innerHTML=`<header class="ed-heading"><p class="ed-eyebrow">自动导演 · ${path.title}</p><span>${s.shot.where}</span><nav class="ed-stages" aria-label="导演探索层级">${directorStages.filter(([id])=>path.kind!=='nature'||id!=='history').map(([id,label])=>`<button data-ed-stage="${id}" aria-current="${directorStage(s.shot)===id?'step':'false'}">${label}</button>`).join('')}</nav></header><aside class="ed-card"><div class="ed-card-reading"><small class="ed-index">${String(s.index+1).padStart(2,'0')} / ${String(path.shots.length).padStart(2,'0')}</small><h2>${s.shot.title}</h2><p class="ed-look" data-ed-look></p><ol class="ed-thread" data-ed-thread aria-label="当前观察的前后关系"></ol><figure class="ed-context-map" data-ed-context-map><canvas width="264" height="155" aria-label="新疆地理定位图，北向朝上，保留当前地点与地域联系"></canvas><figcaption>${path.kind==='nature'?'位置参照 · 天山与一号冰川':'位置参照 · 色线为地域联系示意'}</figcaption></figure><div class="ed-observations" data-ed-observations></div><details class="ed-context"><summary>为何看这里 / 接下来</summary><p>${s.shot.why}</p><div class="ed-next"><small>为什么进入下一层</small><p>${s.shot.next}</p></div></details></div><div class="ed-card-actions"><button data-ed="paths">切换探索主题</button><button data-ed="takeover">在这里接管，自由探索 ↗</button></div></aside><div class="ed-bottom"><div class="ed-caption" role="status"><span data-ed-caption></span></div><div class="ed-transport"><button data-ed="toggle" class="ed-primary"></button><button data-ed="prev" aria-label="导演上一幕" ${s.index===0?'disabled':''}>‹</button><button data-ed="next" aria-label="导演下一幕" ${s.index===path.shots.length-1?'disabled':''}>›</button><span data-ed-status></span><button data-ed="mute" aria-pressed="${!muted}">${muted?'旁白关':'旁白开'}</button><button data-ed="camera" disabled>恢复导演镜头</button><button data-ed="restart" aria-label="导演从头演示">↺</button><button data-ed="map" aria-label="退出导演，返回联系地图">返回地图</button></div><div class="ed-chapters"><small>幕次 <span>${s.index+1}/${path.shots.length}</span></small><nav aria-label="选择导演幕次">${path.shots.map((x,i)=>`<button data-ed-shot="${i}" aria-current="${i===s.index?'step':'false'}"><small>${i+1}</small>${x.label}</button>`).join('')}</nav></div><progress data-ed-progress max="1" aria-label="导演当前幕进度"></progress></div>`;const strip=overlay.querySelector('.ed-chapters nav');strip.scrollLeft=oldScroll;revealChapter();syncView(view.manual);url(true,s.index);}
  syncView(view.manual);
  const put=(q,text)=>{const el=overlay.querySelector(q);if(el&&el.textContent!==text)el.textContent=text;};
  put('[data-ed=toggle]',s.complete?'重看整段':s.playing?'暂停演示':'继续演示');
  put('[data-ed-status]',s.complete?'整段演示结束':!s.playing?'已暂停':s.loading?'准备旁白…':s.waiting?'镜头正在靠近…':s.silent?'字幕演示 · 旁白暂不可用':view.manual?'自由视角 · 演示继续':s.shot.model?'导演示范 · 观察画面回应':directorNarrated(s.shot)?'同步讲解 · 观察标记与变化':'本幕文字引导');
  put('[data-ed-look]',s.shot.geography!==undefined?(viewport.dataset.directorSpatialPhase||s.shot.title):s.shot.beat!==undefined?historyStories[s.shot.event].beats[s.shot.beat].visible:s.shot.where);
  const narration=s.shot.speech??(s.shot.beat!==undefined?historyStories[s.shot.event].beats[s.shot.beat].paragraph:null);
  const caption=directorNarrated(s.shot)?(audio.subtitle||storySubtitle(narration,s.time/s.duration)):s.shot.caption;
  put('[data-ed-caption]',caption);overlay.querySelector('[data-ed-progress]').value=Math.min(1,s.time/s.duration);
  let records=[];try{records=JSON.parse(viewport.dataset.directorRecords||'[]');}catch{}
  const settlementReading=s.shot.settlement?settlementStoryFrame(s.shot.settlement,Number(viewport.dataset.settlementChronologyProgress)||0):null;
  const localReading=['market','structure'].includes(s.shot.model)&&viewport.dataset.localNarrative===s.shot.model?localObservationFrame(s.shot.model,{...viewport.dataset,...(s.shot.model==='market'?{goods:s.shot.goods}:{})},s.shot.model!=='market'||viewport.dataset.localObservationSelected==='true'):null;
  const reading=path.kind==='nature'?{kind:s.shot.world?'position':s.shot.natureRegion?'geography':s.shot.natureReturn?'return':'glacier',index:s.shot.glacierMode==='experiment'?2:s.shot.glacierMode==='flow'?1:0,steps:s.shot.world?['欧亚大陆','中国西北','新疆山河']:['真实地表','流动示意','变化试验'],look:s.shot.where}:localReading?{kind:localReading.kind,index:localReading.index,steps:localReading.steps,look:localReading.text}:settlementReading?{kind:'chronology',look:settlementReading.beat.look,index:settlementReading.index,steps:settlementReading.story.steps.map(x=>x.label)}:s.shot.journey?{kind:'mission',look:viewport.dataset.envoyResponse,index:s.shot.journey==='near'?(viewport.dataset.envoyPhase==='arrival'?2:1):(viewport.dataset.envoyPhase==='return'?2:viewport.dataset.envoyProgress>=.42?1:0),steps:s.shot.journey==='near'?['地域方向','荒漠行进与照应','回看出使结果']:['出发与扣留','到访地域','外交结果']}:path.id==='zhang'?zhangReading(s.shot,s.time/s.duration,viewport.dataset):{kind:s.shot.world?'position':s.shot.geography!==undefined?'geography':s.shot.beat!==undefined?'history':s.shot.id==='return'?'return':'place',index:s.shot.beat??s.shot.geography??1,steps:s.shot.beat!==undefined?['背景','过程','影响']:['地域位置','当前地点','模型观察']};
  viewport.dataset.directorReading=reading.kind;
  if(s.shot.settlement||localReading)put('[data-ed-look]',reading.look);
  if(path.id==='zhang')put('[data-ed-look]',s.shot.journey?viewport.dataset.envoyResponse:reading.look);
  const thread=overlay.querySelector('[data-ed-thread]');
  const threadHTML=reading.steps.map((label,i)=>`<li data-state="${i<reading.index?'done':i===reading.index?'current':'next'}"><small>${i<reading.index?'✓':i+1}</small>${label}</li>`).join('');
  if(thread.innerHTML!==threadHTML)thread.innerHTML=threadHTML;
  const figure=overlay.querySelector('[data-ed-context-map]');figure.hidden=!!s.shot.world;
  if(!figure.hidden)contextMap.update(figure.querySelector('canvas'),{path:path.id,selected:directorLocation(s.shot,viewport.dataset,path.place),kind:reading.kind,index:reading.index,records});
  const observations=overlay.querySelector('[data-ed-observations]');observations.dataset.count=String(records.length);observations.dataset.total=String(path.id==='zhang'||path.id==='xibe'||path.id==='glacier'?3:2);observations.hidden=!s.shot.model&&s.shot.id!=='return';
  const results=path.id==='zhang'?['织物 → 家庭生活','补给 → 继续远行','器物 → 地方制作']:records.map(r=>r.label);
  const resultsHTML=results.map((label,i)=>`<span class="${path.id==='zhang'?records.some(r=>r.priority===String(i))?'is-observed':'': 'is-observed'}">${path.id==='zhang'&&!records.some(r=>r.priority===String(i))?'○':'✓'} ${label}</span>`).join('');
  if(observations.innerHTML!==resultsHTML)observations.innerHTML=resultsHTML;

 }
 function takeover(){if(!flow.state.active)return;flow.stop();url(false);opener.textContent='▷ 自动导演';}
 opener.addEventListener('click',()=>open({followContext:true}));
 overlay.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.edPath){path=directorPaths[b.dataset.edPath];coverHTML();url(true);return;}if(b.dataset.edStage){const index=path.shots.findIndex(s=>directorStage(s)===b.dataset.edStage);flow.jump(index,{play:flow.state.playing});return;}if(b.dataset.edShot!==undefined){flow.jump(Number(b.dataset.edShot),{play:flow.state.playing});return;}const a=b.dataset.ed;
  if(a==='camera')view.follow(flow.state.shot);if(a==='paths')open();if(a==='start')start();if(a==='close'){cover=false;overlay.hidden=true;url(false);}if(a==='toggle'){if(flow.state.complete)start();else flow.state.playing?flow.pause():flow.play();}if(a==='prev')flow.jump(flow.state.index-1);if(a==='next')flow.jump(flow.state.index+1);if(a==='restart')start();if(a==='mute'){muted=!muted;audio.setMuted(muted);b.textContent=muted?'旁白关':'旁白开';b.setAttribute('aria-pressed',String(!muted));}if(a==='takeover')takeover();if(a==='map'){takeover();returnMap(path);}
 });
 // Canvas gestures adjust this shot's framing without stopping narration or models.
 shell.addEventListener('click',event=>{const control=event.target.closest('button,a,input,select');if(flow.state.active&&control&&!overlay.contains(control)&&control!==opener)takeover();},{capture:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)flow.pause();});
 document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(flow.state.active){flow.pause();event.preventDefault();}else if(cover){cover=false;overlay.hidden=true;url(false);event.preventDefault();}});
 if(directorPaths[new URL(location.href).searchParams.get('director')])open();
 return {get manualView(){return view.manual;},inspectView(){if(!flow.state.active)return false;view.inspect();return true;},get active(){return flow.state.active;},get shot(){return flow.state.shot;},get playing(){return flow.state.playing;},update:dt=>flow.update(dt),stop:takeover,open,playPath:(id,index=0)=>{if(!directorPaths[id])return;path=directorPaths[id];start(index);}};
}
