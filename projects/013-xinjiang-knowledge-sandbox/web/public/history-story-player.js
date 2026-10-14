import {historyPresentation} from './history-presentation.js';
import {spatialOpening} from './history-spatial-cues.js';
import {visualCue,visualObservationFraction} from './history-visual-direction.js';
import {historyStories,historyStorySources} from './history-story.js';
import {createHistoryStoryAudio} from './history-story-audio.js';
import {storyRange,storyProgress,storySubtitle,observationMeaning,modelNarrative} from './story-observation.js';

export function installHistoryStory({root,viewport,context,seek,focus,history,locate,enterPlace=locate,enterModel=null,commit=()=>{},freezeCamera=()=>{},prepareSpatial=()=>{}}){
 const audio=createHistoryStoryAudio({onEnded:()=>ended()});
 let event=null,beat=0,enabled=false,silent=false,muted=false,playing=false,finished=false,time=0,duration=24,ticket=0,error='',pending=false;
 let following=true,lastCue=null,inspecting=false,pendingPlay=false,opening=null,openingRest=null;
 const retainedMotion=new Map();
 function motionClock(){const c=context(),saved=retainedMotion.get(c.id);return enabled?beat*24+time:saved&&Math.abs(saved.progress-c.progress)<1e-7?saved.time:c.progress*72;}
 const story=()=>historyStories[context().id];
 const destination=()=>context().destination??story().place;
 const records=()=>context().records??[];
 const cue=()=>{const c=context(),p=enabled?Math.min(c.progress,storyRange(c.id,beat)[1]-1e-8):c.progress;return visualCue(c.id,p,c.route??[]);};
 function direct(force=false,close=false){const c=cue();if(context().stage!=='history')return;if(force||(following&&playing&&lastCue!==c.key)){focus(close?c.inspectPose:c.pose);lastCue=c.key;} }
 function releaseCamera(){if(opening!==null){ticket++;opening=null;openingRest=null;freezeCamera();}following=false;inspecting=false;sync();}
 function inspect(){pendingPlay=false;audio.pause();playing=false;following=false;inspecting=true;commit();direct(true,true);sync();}
 const chapterAt=(id,p)=>p<storyRange(id,0)[1]?0:p<storyRange(id,1)[1]?1:2;
 function suspend(){if(enabled&&context().id===event)retainedMotion.set(event,{progress:context().progress,time:beat*24+time});ticket++;opening=null;openingRest=null;viewport.dataset.hsOpening='';pendingPlay=false;audio.stop();freezeCamera();playing=false;pending=false;enabled=false;error='';}
 function orient(){
  if(opening!==null){releaseCamera();return;}
  const id=context().id;if(!historyStories[id])return;
  suspend();if(context().stage!=='history')history();prepareSpatial();resetFor(id);beat=0;following=true;seek(0);commit();
  const token=++ticket;
  const travel=index=>{
   if(token!==ticket||context().stage!=='history')return;
   opening=index;sync();const step=spatialOpening[index];
   focus({...step.pose??cue().pose,duration:step.pose?.duration??2400,onArrive:arrived=>{
    if(token!==ticket)return;
    if(!arrived){opening=null;following=false;sync();return;}
    if(index<spatialOpening.length-1)openingRest={seconds:index===0?2:1.5,next:()=>travel(index+1)};else{opening=null;begin(0,{play:false});}
   }});
  };travel(0);
 }
 function resetFor(id){if(event===id)return;suspend();event=id;beat=0;time=0;finished=false;}
 async function begin(index,{play=true,fraction=0,automatic=false}={}){
  const id=context().id;if(!historyStories[id])return;
  suspend();if(context().stage!=='history')history();resetFor(id);
  const token=++ticket;beat=index;time=0;finished=false;enabled=true;error='';pending=true;pendingPlay=play;
  duration=Math.max(12,story().beats[beat].paragraph.length/4.2);
  time=duration*fraction;seek(storyProgress(event,beat,fraction));commit();inspecting=false;if(!automatic||following)direct(true);sync();
  if(silent){pending=false;playing=play;sync();return;}
  try{await audio.load(id,beat);if(token!==ticket)return;duration=audio.duration||duration;time=duration*fraction;audio.seek(fraction);audio.setMuted(muted);if(play&&pendingPlay){const result=await audio.play();if(token!==ticket)return;if(!pendingPlay){audio.pause();playing=false;}else{playing=result!==false&&audio.state==='playing';if(!playing)error='点继续讲解播放旁白，或选择静音讲解。';}}pending=false;}
  catch{if(token===ticket){pending=false;playing=false;error='旁白暂未加载。可重试，或用静音讲解继续观察。';}}
  sync();
 }
 function ended(){if(!enabled||context().stage!=='history'||!playing)return;seek(storyProgress(event,beat,1));if(beat<2){begin(beat+1,{automatic:true});return;}time=duration;playing=false;finished=true;commit();sync();}
 async function playPause(){
  if(pending)return;
  if(!enabled||finished){await begin(0);return;}
  if(playing){audio.pause();playing=false;freezeCamera();lastCue=null;commit();sync();return;}
  if(time/duration>=.995){await begin(beat<2?beat+1:0);return;}
  if(silent){playing=true;direct();sync();return;}
  try{const token=ticket;pendingPlay=true;const result=await audio.play();if(token!==ticket)return;playing=pendingPlay&&result!==false&&audio.state==='playing';if(!pendingPlay)audio.pause();error=playing||!pendingPlay?'':'点继续讲解播放旁白，或选择静音讲解。';if(playing)direct();}catch{error='旁白暂未播放，可重试或静音讲解。';}sync();
 }
 function playerHTML(s){return `<section class="hs-story" aria-label="可控制的历史故事讲解"><p class="hs-kicker">一段历史 / 三幕故事</p><h2>${s.question}</h2><div class="hs-chapters" role="group" aria-label="故事章节">${s.beats.map((b,i)=>`<button data-hs-beat="${i}" aria-pressed="${i===beat}"><small>0${i+1}</small>${['背景','发生','影响'][i]}</button>`).join('')}</div><p class="hs-date" data-hs-date></p><h3 data-hs-title></h3><p class="hs-line" data-hs-line></p><div class="hs-controls"><button data-hs-action="play" class="kg-primary">听这段故事 · 同步看地图 →</button><button data-hs-action="voice" aria-pressed="${!muted}">${muted?'旁白：关':'旁白：开'}</button></div><label class="hs-seek">本幕进度<input type="range" min="0" max="100" value="0" data-hs-seek aria-label="故事本幕进度"></label><p class="hs-status" data-hs-status role="status"></p><button data-hs-action="silent" class="hs-silent" hidden>使用静音讲解</button><div class="hs-watch"><small>在画面里观察</small><p data-hs-visible></p><div class="hs-shots" role="group" aria-label="本幕的三个画面观察点">${[0,1,2].map(i=>`<button data-hs-shot="${i}" aria-label="观察本幕第${i+1}处变化">${['看全局','看变化','看局部'][i]}</button>`).join('')}</div></div><button data-hs-action="advance" data-hs-next-reason class="hs-next kg-primary"></button><details class="hs-view-tools"><summary>视角与地点工具</summary><button data-hs-action="follow" aria-pressed="true">引导镜头：开</button><button data-hs-action="inspect">靠近看变化</button><button data-hs-action="overview">事件全景</button><button data-hs-action="orient">从地球重新定位</button><button data-hs-action="place">只定位地点</button></details><details class="hs-transcript"><summary>完整讲解与资料</summary>${s.beats.map(b=>`<h4>${b.time} · ${b.title}</h4><p>${b.paragraph}</p>`).join('')}<p>${s.scope}</p>${s.sources.map(k=>{const source=historyStorySources[k];return `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.title} ↗</a>`;}).join('')}</details></section>`;}
 function decorate(body){const c=context(),s=story();if(!c.trail||!s)return body;resetFor(c.id);
  const box=document.createElement('div');box.innerHTML=body;
  if(c.stage==='history'){
   for(const selector of ['.mt-question','.mt-why','.mt-timeline','.mt-time-note','.kg-event-reading'])box.querySelector(selector)?.remove();
   const node=document.createElement('div');node.innerHTML=playerHTML(s);box.querySelector('.mt-topline').after(node.firstElementChild);
   for(const b of box.querySelectorAll('button[data-kg-event-destination]'))if(b.parentElement===box)b.remove();
   // Existing views and locator stay reachable; detailed controls remain optional.
   const detail=document.createElement('details');detail.className='hs-manual';detail.innerHTML='<summary>自由观察地图进程</summary><label>完整事件进度<input type="range" data-kg-event-progress min="0" max="100" aria-label="历史观察进程" value="'+Math.round(c.progress*100)+'"></label><button data-kg-action="event-focus">回到事件观察视角 ⌖</button>';
   box.querySelector('.hs-story').after(detail);
  }else if(c.stage==='world'||c.stage==='map'){
   const start=document.createElement('section');start.className='hs-invitation';start.innerHTML=`<small>带着这个问题看历史</small><b>${s.question}</b><button data-hs-action="start">${c.stage==='map'?'从当前地图，听这段历史':'从地球定位，进入这段历史'} →</button>`;box.querySelector('.mt-why')?.after(start);
  }else if(c.stage==='place'){
   const intro=box.querySelector('.mt-why');if(intro)intro.textContent=c.model?s.model.context:c.fromMap?destination().question:s.place.why;
   const bridge=box.querySelector('.kg-scale-link');if(bridge){const p=bridge.querySelector('p');if(p)p.textContent=c.model?s.model.question:s.place.bridge;bridge.querySelector('details')?.setAttribute('open','');}
  }
  const result=observationMeaning(c.id,records());if(c.stage==='history'&&result){const panel=document.createElement('section');panel.className='hs-result';panel.innerHTML=`<small>你的观察 / 已发生的画面回应</small><h3>${result.title}</h3><p>${result.text}</p><small>${result.scope}</small>`;box.querySelector('.hs-story').after(panel);}
  return box.innerHTML;
 }
 function overlay(){const c=context();return c.trail&&story()&&['history','place'].includes(c.stage)?'<section class="hs-caption" aria-label="故事字幕与画面观察"><div><span data-hs-caption-era></span><b data-hs-caption-title></b></div><p data-hs-caption-text></p><small data-hs-caption-look></small></section>':'';}
 function text(selector,value){const el=root.querySelector(selector);if(el&&el.textContent!==value)el.textContent=value;}
 function sync(){const c=context(),s=story();if(!c.trail||!s)return;const b=s.beats[beat],fraction=Math.min(1,time/Math.max(.01,duration));
  viewport.dataset.hsActive=String(enabled);viewport.dataset.hsPlaying=String(playing);viewport.dataset.hsBeat=String(beat);viewport.dataset.hsAudio=silent?'silent':audio.state;viewport.dataset.hsTime=time.toFixed(3);viewport.dataset.hsDuration=duration.toFixed(3);viewport.dataset.hsEvent=c.id;
  if(c.stage==='history'){
   const manual=!enabled,manualBeat=chapterAt(c.id,c.progress),visibleBeat=manual?s.beats[manualBeat]:b;
   const line=manual?visibleBeat.paragraph:fraction>=.995?b.meaning:(!silent&&audio.subtitle)||storySubtitle(b.paragraph,fraction);
   const view=cue(),presentation=historyPresentation(c.id,manual?manualBeat:beat);
   text('[data-hs-intro-number]',presentation.number+' / '+presentation.chapter);text('[data-hs-intro-where]',presentation.where);text('[data-hs-intro-title]',presentation.title);text('[data-hs-intro-text]',presentation.intro);
   for(const [i,label]of presentation.legend.entries()){const selector='[data-hs-intro-legend="'+i+'"]';text(selector,label);const legend=root.querySelector(selector);if(legend)legend.dataset.tone=label.startsWith('青线')?'teal':label.startsWith('金线')?'gold':/^[浅淡]线/.test(label)?'muted':'symbol';}
   for(const button of root.querySelectorAll('[data-hs-shot]')){const i=Number(button.dataset.hsShot);const label=(button.closest?.('.hs-intro-steps')?(i+1)+' · ':'')+presentation.steps[i];if(button.textContent!==label)button.textContent=label;}
   text('[data-hs-next-reason]',presentation.phase===2?(enterModel||c.node===destination().id?'走进':'定位')+destination().name+'，'+(destination().question??s.model.question)+' →':presentation.next);viewport.dataset.hsPresentation=String(presentation.phase);viewport.dataset.hsShot=view.key;viewport.dataset.hsFollowing=String(following);viewport.dataset.hsInspecting=String(inspecting);viewport.dataset.hsMotion=String(motionClock().toFixed(3));text('[data-hs-shot-title]',view.title);text('[data-hs-scene-action]',view.beat===2||c.id==='protectorate'&&view.beat===1?('画面正在发生：'+(viewport.dataset.sphericalAction??'')):'');text('[data-hs-action=follow]',following?'引导镜头：开':'自由视角');root.querySelector('[data-hs-action=follow]')?.setAttribute('aria-pressed',String(following));for(const button of root.querySelectorAll('[data-hs-shot]'))button.setAttribute('aria-pressed',String(Number(button.dataset.hsShot)===['wide','medium','close'].indexOf(view.shot)));
   text('[data-hs-action=place]','定位'+destination().name+'，选择下一层 →');
   if(!enabled&&c.node===destination().id&&destination().id!==s.place.id){text('[data-hs-intro-where]','已定位 / '+destination().name+' · 延伸观察');text('[data-hs-intro-title]',destination().question);text('[data-hs-intro-text]',destination().back);}
   text('[data-hs-date]',visibleBeat.time);text('[data-hs-title]',visibleBeat.title);text('[data-hs-line]',visibleBeat.question);text('[data-hs-visible]',view.detail);
   text('[data-hs-status]',error|| (pending?'正在准备本幕旁白…':finished?'故事讲完了。选择地点，把问题带进模型。':playing?(silent?'静音讲解 · 字幕与地图同步':'MiniMax 旁白 · 字幕与地图同步'):enabled?'已暂停 · 可以自由拖动地图':'你可以听完整故事，也可以选择一幕开始。'));
   const start=root.querySelector('[data-hs-action=play]');if(start){start.disabled=pending;start.textContent=pending?'准备旁白…':playing?'暂停故事讲解':finished?'从头重听故事':enabled&&fraction>=.995?(beat<2?'听下一幕故事 →':'从头重听故事'):enabled?'继续故事讲解':'听这段故事 · 同步看地图 →';}
   const fallback=root.querySelector('[data-hs-action=silent]');if(fallback)fallback.hidden=!error;
   const range=root.querySelector('[data-hs-seek]');if(range&&document.activeElement!==range)range.value=String(Math.round((manual?((c.progress-storyRange(c.id,manualBeat)[0])/(storyRange(c.id,manualBeat)[1]-storyRange(c.id,manualBeat)[0])):fraction)*100));
   for(const el of root.querySelectorAll('[data-hs-beat]'))el.setAttribute('aria-pressed',String(Number(el.dataset.hsBeat)===(manual?manualBeat:beat)));
   text('[data-hs-caption-era]',visibleBeat.time);text('[data-hs-caption-title]',visibleBeat.title);text('[data-hs-caption-text]',manual?visibleBeat.meaning:line);text('[data-hs-caption-look]',view.detail);
   viewport.dataset.hsOpening=opening===null?'':spatialOpening[opening].id;
   for(const control of root.querySelectorAll('[data-hs-action=orient]'))control.textContent=opening===null?'从地球重新定位':'取消定位，留在当前画面';
   if(opening!==null){const step=spatialOpening[opening];text('[data-hs-intro-number]','定位 / 0'+(opening+1));text('[data-hs-intro-title]',step.title);text('[data-hs-caption-title]',step.title);text('[data-hs-caption-text]',step.text);text('[data-hs-status]','正在沿同一地球定位 · 拖动即可接管');}
  }else if(c.stage==='place'){
   const n=c.model?modelNarrative(c.id,viewport.dataset,records()):{title:s.place.why,text:s.place.bridge};
   text('[data-hs-caption-era]',s.title+' / '+s.place.name);text('[data-hs-caption-title]',c.model?n.title:'把历史问题带到这里');text('[data-hs-caption-text]',c.model?n.text:c.fromMap?destination().question:s.place.why);text('[data-hs-caption-look]',c.model?'观察模型中的实际回应；可随时返回原地图。':s.place.bridge);text('[data-hs-scene-action]','');const next=root.querySelector('[data-hs-next-reason]');if(next)next.hidden=true;
  }
 }
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.hsShot!==undefined){following=true;begin(chapterAt(context().id,context().progress),{play:false,fraction:visualObservationFraction(context().id,chapterAt(context().id,context().progress),Number(b.dataset.hsShot))});return;}if(b.dataset.hsBeat!==undefined){begin(Number(b.dataset.hsBeat),{play:false});return;}const a=b.dataset.hsAction;if(!a)return;if(a==='intro'){const card=root.querySelector('.hs-introduction'),expanded=card?.dataset.expanded!=='true';if(card)card.dataset.expanded=String(expanded);b.setAttribute('aria-expanded',String(expanded));b.textContent=expanded?'收起介绍':'读本幕介绍';}if(a==='follow'){following=!following;inspecting=false;if(following)direct(true);else freezeCamera();}if(a==='inspect')inspect();if(a==='overview'){following=false;inspecting=false;focus(story().beats[chapterAt(context().id,context().progress)].focus);}if(a==='advance'){const current=enabled?beat:chapterAt(context().id,context().progress);if(current<2)begin(current+1,{play:false});else{const target=destination().id,selected=context().node===target;suspend();if(enterModel)enterModel(target);else (selected?enterPlace:locate)(target);}}if(a==='start'){if(context().stage==='map')begin(0);else orient();}if(a==='orient')orient();if(a==='play')playPause();if(a==='voice'){muted=!muted;audio.setMuted(muted);b.textContent=muted?'旁白：关':'旁白：开';b.setAttribute('aria-pressed',String(!muted));}if(a==='silent'){silent=true;begin(beat);}if(a==='place'){const target=destination().id;suspend();locate(target);}sync();});
 root.addEventListener('input',e=>{if(!e.target.hasAttribute('data-hs-seek'))return;const fraction=Number(e.target.value)/100;if(!enabled){begin(chapterAt(context().id,context().progress),{play:false,fraction});return;}time=duration*fraction;if(!silent)audio.seek(fraction);seek(storyProgress(event,beat,fraction));commit();if(following)direct(true);sync();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){audio.pause();playing=false;freezeCamera();lastCue=null;commit();sync();}});
 viewport.querySelector('#canvas-host').addEventListener('pointerdown',releaseCamera);viewport.querySelector('#canvas-host').addEventListener('wheel',releaseCamera,{passive:true});
 return {begin,decorate,overlay,suspend,inspect,releaseCamera,get cue(){return cue();},get attention(){return opening===0?{id:'xinjiang',kind:'extent',label:'新疆 · 欧亚大陆内部',anchor:[84.6,41.8]}:opening===1?{id:'tianshan',kind:'geography',label:'天山 · 山地与盆地建立方位',anchor:[83.6,42.75]}:cue()?.attention;},get motion(){return motionClock();},get focus(){return ['background','process','impact'][enabled?beat:chapterAt(context().id,context().progress)];},get observed(){return records().length>0;},get observationNode(){return observationMeaning(context().id,records())?.node;},update(dt){if(openingRest){openingRest.seconds-=Math.max(0,Math.min(.1,dt));if(openingRest.seconds<=0){const next=openingRest.next;openingRest=null;next();}}const c=context();if(!c.trail||!story())return;if(enabled&&c.stage==='history'&&playing){if(silent)time=Math.min(duration,time+Math.max(0,Math.min(.1,dt)));else{time=audio.time;duration=audio.duration||duration;if(audio.state==='error'){playing=false;error='旁白暂未播放，可重试或静音讲解。';}}seek(storyProgress(event,beat,time/duration));if(silent&&time>=duration)ended();direct();}sync();}};
}
