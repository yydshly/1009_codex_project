import {historyEvents,eventById,nodeById,geographyStops} from './history-content.js';
import {eventFrame,phaseProgress} from './history-process.js';
import {regionBoundary} from './region-boundary.js';
import {readingFor,placeReading} from './event-reading.js';
import {atlasThemes} from './region-atlas-content.js';

const shortName=n=>n.name.split(' · ')[0];
const xy=p=>[(p[0]-73)/24*240,(50-p[1])/16*160];
const line=points=>points.map(p=>xy(p).map(v=>v.toFixed(1)).join(',')).join(' ');
export function routeCoordinates(event){
 return event.id==='xibe'?event.nodes.map(n=>[n.lon,n.lat]):event.corridor;
}
export function locatorHTML(event,placeId,landform){
 const geo=geographyStops.find(g=>g.id===landform),nodes=geo?[geo]:event.nodes,route=geo?[]:routeCoordinates(event);
 return '<div class="ej-locator-map"><svg viewBox="0 0 240 160" aria-hidden="true"><polygon points="'+line(regionBoundary)+'"/><polyline class="ej-route-base" points="'+line(route)+'"/><polyline class="ej-route-progress" pathLength="1" points="'+line(route)+'"/></svg>'+nodes.map(n=>{
  const p=xy([n.lon,n.lat]);return '<button data-ej-place="'+n.id+'" style="left:'+p[0]/2.4+'%;top:'+p[1]/1.6+'%" aria-label="定位'+shortName(n)+'" aria-pressed="'+(n.id===placeId||n.id===landform)+'"><i></i><span>'+shortName(n)+'</span></button>';
 }).join('')+'</div>';
}

export function installExplorationJourney({shell,onStage,onEvent,onPlace,onModel,onSeek,onControls,onRecord,onLink,onNext,onFocus}){
 const root=document.createElement('section');root.className='exploration-journey';root.setAttribute('aria-label','当前探索路径');root.hidden=true;shell.append(root);
 let state={},key='';
 function render(next){
  state=next;root.dataset.guided=String(state.guided!==false);root.hidden=!['event','place','model'].includes(state.stage);if(root.hidden)return;
  const e=eventById(state.eventId),node=nodeById(e,state.placeId),geo=geographyStops.find(g=>g.id===state.landform);
  const theme=atlasThemes.find(t=>t.id===state.layer)??atlasThemes[0],inModel=state.stage==='model',natural=!!geo,compactHistory=inModel||state.stage==='place';
  key=[state.stage,e.id,state.placeId,state.landform,state.modelId,state.layer].join('/');
  const connection=placeReading(e.id,state.placeId);
  const heading=geo?.name??(node?shortName(node):e.title);
  root.innerHTML='<nav class="ej-path" aria-label="探索层级"><button data-ej-stage="planet">01 地球</button><span>›</span><button data-ej-stage="region">02 新疆 / '+theme.sub+'</button><span>›</span>'+
   (natural?'':'<button data-ej-stage="event">'+e.short+'</button><span>›</span>')+
   '<strong>'+heading+(inModel?' / 模型观察':'')+'</strong></nav>'+
   '<section class="ej-context"><p class="ej-kicker">'+(natural?'自然地理 / 地点观察':e.date+' / '+(inModel?'地点与模型':state.stage==='place'?'地点观察':'事件探索'))+'</p><h1>'+heading+'</h1>'+
   '<p class="ej-question">'+(geo?.text??(node?.text??e.question))+'</p>'+
   (connection?'<div class="ej-place-purpose"><small>为什么来到这里</small><p>'+connection.why+'</p><small>接下来可以探索</small><p>'+connection.next+'</p></div>':'')+
   (inModel?'<div class="ej-model-toolbar"><button data-ej-controls class="ej-primary">操作模型与人物 ↗</button><button data-ej-stage="event">'+(natural?'回到地点':'回看事件')+'</button></div>':'')+
   (natural?'<p class="ej-reading">从区域位置走近真实地形，拖动环视；打开操作面板调整过程与参数。</p>':
   (compactHistory?'<details class="ej-model-history"><summary>背景、进程与联动</summary>':'')+'<div class="ej-event-switch"><label>历史线索<select aria-label="切换当前历史事件">'+historyEvents.map(v=>'<option value="'+v.id+'" '+(v.id===e.id?'selected':'')+'>'+v.title+'</option>').join('')+'</select></label></div>'+
   '<div class="ej-phases" aria-label="观察事件变化">'+e.phases.map((p,i)=>'<button data-ej-phase="'+i+'">'+p.label+'</button>').join('')+'</div><div class="ej-event-reading"><strong></strong><p></p><small></small></div><details class="ej-phase-scope"><summary>阶段说明与表达范围</summary><p class="ej-phase-text"></p></details>'+
   '<label class="ej-progress-label">事件进程 <output></output><input aria-label="联动事件进程" type="range" min="0" max="100" step="1"></label>'+
   (inModel?'<label class="ej-linked"><input type="checkbox" aria-label="模型与事件联动"> 模型与事件联动</label>':'')+
   (compactHistory?'</details>':'')+'<div class="ej-stops" aria-label="事件关联地点">'+e.nodes.map(n=>'<button data-ej-place="'+n.id+'" aria-pressed="'+(n.id===state.placeId)+'">'+shortName(n)+' →</button>').join('')+'</div>')+
   (node?'<div class="ej-models"><small>在这个位置观察</small>'+node.models.map(m=>'<button data-ej-model="'+m[0]+'" aria-pressed="'+(inModel&&state.modelId===m[0])+'">'+m[1]+' →</button>').join('')+'</div>':'')+
   '<div class="ej-response"><small>'+ (inModel?'画面正在回应':'观察变化')+'</small><p class="ej-response-text" aria-live="polite"></p></div>'+
   '<div class="ej-actions">'+(inModel?'<button data-ej-record>记录当前观察</button>':'<button data-ej-next class="ej-primary">'+(node?(node.models.find(m=>m[0]===('kashgar'===node.id?'market':'qabqal'===node.id?'people':node.models[0][0]))??node.models[0])[1]:'选一个地点，走近观察')+' →</button><button data-ej-focus>靠近变化位置 ⌖</button>')+'<span class="ej-record-message" role="status"></span></div>'+
   (natural?'':'<details class="ej-source"><summary>事件背景与依据</summary><p>'+e.summary+'</p><a href="'+e.source.url+'" target="_blank" rel="noopener noreferrer">'+e.source.title+' ↗</a><small>'+e.source.scope+'</small></details>')+
   '<button class="ej-map-back" data-ej-stage="region">← 返回新疆地图，继续探索</button></section>'+
   '<aside class="ej-locator"><header><span>你在新疆的位置</span><button data-ej-stage="region">返回地图 ↗</button></header>'+locatorHTML(e,state.placeId,state.landform)+'<small>'+(natural?'区域定位参照':e.id==='xibe'?'盛京 → 伊犁：全球方向；图中为安置地域参照':e.lineLabel)+'</small></aside>';
  if(inModel)root.querySelector('.ej-model-toolbar').before(root.querySelector('.ej-response'));
  else{const actions=root.querySelector('.ej-actions'),anchor=compactHistory?root.querySelector('.ej-model-history'):root.querySelector('.ej-phase-scope');if(anchor)anchor.before(actions);const focus=actions.querySelector('[data-ej-focus]');if(focus){focus.textContent='⌖';focus.setAttribute('aria-label','靠近变化位置');focus.title='靠近变化位置';}}
  update(state);
 }
 function update(next){
  const nextKey=[next.stage,next.eventId,next.placeId,next.landform,next.modelId,next.layer].join('/');
  if(nextKey!==key){render(next);return;}state=next;root.dataset.guided=String(state.guided!==false);if(root.hidden)return;
  const e=eventById(state.eventId),f=eventFrame(e.id,state.progress);const nextButton=root.querySelector('[data-ej-next]');if(nextButton&&state.nextStep){nextButton.textContent=state.pending?'正在靠近地点…':state.moving?'正在展开变化 · 可暂停':state.nextStep;nextButton.disabled=state.pending||state.moving;}
  const reading=root.querySelector('.ej-event-reading'),r=readingFor(e.id,f.phase);if(reading){reading.querySelector('strong').textContent=r.title;reading.querySelector('p').textContent=r.look;reading.querySelector('small').textContent=r.reason;}
  root.querySelectorAll('[data-ej-phase]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.ejPhase)===f.phase)));
  const phaseText=root.querySelector('.ej-phase-text');if(phaseText)phaseText.textContent=e.phases[f.phase].text;
  const slider=root.querySelector('input[type=range]');if(slider)slider.value=Math.round(state.progress*100);
  const output=root.querySelector('output');if(output)output.textContent=Math.round(state.progress*100)+'%';
  const linked=root.querySelector('input[type=checkbox]');if(linked)linked.checked=state.linked;
  const response=root.querySelector('.ej-response-text'),copy=state.response||(state.landform?'保持地图位置，操作局部地形与过程。':state.stage==='model'&&!state.linked?'模型由你自由操作，事件进度保留。':f.action);if(response.textContent!==copy)response.textContent=copy;
  const path=root.querySelector('.ej-route-progress');if(path)path.style.strokeDasharray=(e.id==='xibe'?f.settle:f.route)+' 1';
  root.querySelectorAll('.ej-locator-map button').forEach(b=>b.dataset.active=String(f.active.includes(b.dataset.ejPlace)));
 }
 root.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b)return;
  if(b.dataset.ejStage)onStage(b.dataset.ejStage);
  if(b.dataset.ejPlace)onPlace(b.dataset.ejPlace);
  if(b.dataset.ejModel&&!state.pending)onModel(b.dataset.ejModel);
   if(b.dataset.ejPhase!==undefined)onSeek(phaseProgress[Number(b.dataset.ejPhase)],true);
  if(b.hasAttribute('data-ej-controls'))onControls();
  if(b.hasAttribute('data-ej-record'))onRecord();
  if(b.hasAttribute('data-ej-next'))onNext();
  if(b.hasAttribute('data-ej-focus'))onFocus();
 });
 root.addEventListener('input',ev=>{if(ev.target.type==='range')onSeek(Number(ev.target.value)/100);});
 root.addEventListener('change',ev=>{if(ev.target.tagName==='SELECT')onEvent(ev.target.value);if(ev.target.type==='checkbox')onLink(ev.target.checked);});
 return {render,update};
}
