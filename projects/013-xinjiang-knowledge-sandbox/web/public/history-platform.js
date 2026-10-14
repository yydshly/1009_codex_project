import {learningPlaces} from './knowledge-content.js';
const learningPlaceName=id=>learningPlaces.find(p=>p.id===id)?.name??id;
import {historyEvents,geographyStops,eventById,nodeById} from './history-content.js';
import {eventFrame,eventDuration,phaseProgress,phaseAt,clampProgress,advanceEvent} from './history-process.js';
import {cleanNavigation,cleanMemory,cleanWorkspace,appendObservation} from './exploration-memory.js';
import {workspaceScenes} from './workbench.js';
import {installRegionAtlas} from './region-atlas.js';
import {atlasEntries,reliefNames,waterRelations} from './region-atlas-content.js';
import {readingFor} from './event-reading.js';
import {installExplorationJourney} from './exploration-journey.js';

export function installHistoryPlatform({viewport,adapter}) {
 const shell=viewport.querySelector('.workbench'),left=shell.querySelector('.wb-scenes'),right=shell.querySelector('.wb-inspector');
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 viewport.classList.add('history-platform');
 const library=document.createElement('details');library.className='hp-library';library.innerHTML='<summary>全部场景与原有工具 <span>14</span></summary>';
 while(left.firstChild)library.append(left.firstChild);left.append(library);
 const nav=document.createElement('div');nav.className='hp-navigation';
 nav.innerHTML=`<p class="hp-eyebrow">从世界走进新疆</p><div class="hp-scale-nav"><button data-hp-stage="planet">01 <span>地球定位</span></button><button data-hp-stage="region">02 <span>新疆全貌</span></button><button data-hp-stage="event">03 <span>历史线索</span></button></div><label class="hp-guided-switch"><input id="hp-guided" type="checkbox" checked> 显示探索引导</label><div class="hp-event-list"><h2>用事件打开地图</h2>${historyEvents.map(e=>`<button data-hp-event="${e.id}"><small>${e.date}</small><strong>${e.title}</strong><span data-hp-memory="${e.id}">${e.short} ↗</span></button>`).join('')}</div><p class="hp-nav-note">自由观察 → 对照变化 → 进入模型<br>记录观察，返回地图继续找线索。</p>`;left.prepend(nav);
 const tools=document.createElement('details');tools.className='hp-tools';tools.innerHTML='<summary>模型操作、图层与配置</summary>';
 while(right.firstChild)tools.append(right.firstChild);right.append(tools);
 const panel=document.createElement('section');panel.className='hp-context';panel.setAttribute('aria-label','空间与历史导引');right.prepend(panel);
 const resume=document.createElement('button');resume.className='hp-map-return';resume.id='hp-return';shell.querySelector('.wb-camera').prepend(resume);
 const headerButton=document.createElement('button');headerButton.id='hp-world';headerButton.textContent='地球入口';shell.querySelector('.wb-header nav').prepend(headerButton);
 const journalButton=document.createElement('button');journalButton.id='hp-journal-open';journalButton.setAttribute('aria-expanded','false');headerButton.after(journalButton);
 const journal=document.createElement('section');journal.className='hp-journal';journal.hidden=true;journal.setAttribute('aria-label','我的探索记录');shell.append(journal);
 const component=document.createElement('div');component.className='hp-component-note';component.hidden=true;viewport.append(component);
 let stage='planet',eventId='zhang',placeId=null,phase=0,modelId=null,landform=null,mapBookmark=null,modelBookmark=null;
 let internal=false,lastPanelKey='',structureExploded=false,structurePart=-1,origin=null;
 const extensions={glacier:[['karez','地下水路结构','不同地点的自然与工程比较，不表示实测连通水系。']],karez:[['oasis','绿洲用水','通用工程与原创用水情境，不指定历史建造年代。']],market:[['oasis','绿洲用水','比较不同生活需要，不表示同一条运输或水系。'],['logistics','当代关口协作','从交换转到当代公共空间；地点、时代和人物另成案例。']],people:[['culture','庭院传习','另一个社区与文化案例，不是同一家庭的后续生活。']]};
 let regionContext=null,enteringRegion=false,initializing=true,pendingModel=null;
 const passage=document.createElement('section');passage.className='hp-model-passage';passage.hidden=true;passage.setAttribute('aria-label','从地图靠近地点');shell.append(passage);passage.addEventListener('click',ev=>{if(ev.target.closest('button'))adapter.stopApproach?.();});
 let progress=0,playing=false,speed=1,modelLinked=true,compareSaved=null,guided=true,mapLayer='geography',guidedStop=null;
 const memoryKey='xinjiang-exploration-v1';let memory=cleanMemory(null),storageAvailable=true,lastObservation='';
 try {const raw=localStorage.getItem(memoryKey);if(raw&&raw.length<96*1024)memory=cleanMemory(JSON.parse(raw));}catch {storageAvailable=false;}
 const atlas=installRegionAtlas({shell,onLayer:layer=>{mapLayer=layer;atlas.clear();region({overview:true});},onRegion:overview=>region({overview:!!overview}),onLocate:()=>adapter.locate(),onEntry:selectAtlasEntry,onOpen:openAtlasEntry,onEvent:(id,place,fresh)=>{chooseEvent(id,{fromEntry:true,fresh});if(place)visit(place);},onPreview:previewEvent,onFree:freeScene,onFeature:()=>{region({overview:true});atlas.relief('天山');}});
 const path=installExplorationJourney({shell,onStage:value=>{if(value==='planet')globe();else if(value==='region')region();else if(landform)chooseGeo(landform);else eventMap();},onEvent:chooseEvent,onPlace:id=>{const wasModel=stage==='model';if(landform){chooseGeo(id);if(wasModel)openModel(geographyStops.find(g=>g.id===id)?.scene);}else{visit(id);if(wasModel)openModel(preferredModel(nodeById(selectedEvent(),id))?.[0]);}},onModel:openModel,onSeek:(value,focus)=>{modelLinked=true;compareSaved=null;seek(value);if(focus&&stage!=='model')focusProcess();},onControls:showControls,onRecord:recordObservation,onLink:value=>{modelLinked=value;playing=false;syncProcess();},onNext:()=>{if(stage==='place')openModel(preferredModel(nodeById(selectedEvent(),placeId))[0]);else if(phase<2){playToPhase(phase+1);}else visit(preferredNode().id);},onFocus:focusProcess});
 function pathState(response=''){return {stage,eventId,placeId,modelId,landform,progress,linked:modelLinked,layer:mapLayer,response,guided,pending:!!pendingModel,moving:playing&&guidedStop!==null,nextStep:stage==='place'?preferredModel(nodeById(selectedEvent(),placeId))?.[1]+' →':phase===0?'看过程如何展开 →':phase===1?'看影响与联系 →':'去 '+preferredNode().name.split(' · ')[0]+'，走近观察 →'};}
 function showControls(){tools.open=true;viewport.classList.add('wb-inspector-visible');shell.querySelector('#wb-inspector-open').setAttribute('aria-expanded','true');right.scrollTop=tools.offsetTop-right.offsetTop;}
 function focusProcess(){if(stage==='model'&&modelId!=='structure')adapter.focusModel();else focusReading(phase);}
 function focusReading(index){const r=readingFor(eventId,index),worldFocus=index===phase?adapter.eventAnchor?.(index):null;move(adapter.read().scene,worldFocus?{worldFocus,distance:eventId==='zhang'&&index===1?6:r.distance}:{focus:r.focus,focusOffset:r.focusOffset,distance:r.distance});}
 function playToPhase(index){modelLinked=true;compareSaved=null;guidedStop=phaseProgress[index];playing=true;focusReading(index);syncProcess();}
 function rememberRegion(){if(stage==='region'&&adapter.read().scene==='terrain')regionContext={layer:mapLayer,entry:atlas.selected,eventId,workspace:cleanWorkspace(adapter.read())};}
 function previewEvent(id){eventId=eventById(id).id;atlas.clear();mapLayer='history';progress=0;phase=0;move('terrain',{overview:true});render();}

 const eventActive=()=>!landform&&(['event','place'].includes(stage)||(stage==='model'&&modelLinked));
 const inEvent=()=>!landform&&['event','place','model'].includes(stage);
 const selectedEvent=()=>eventById(eventId);
 const basicSnapshot=()=>({version:3,stage,eventId,placeId,phase,progress,speed,modelLinked,modelId,landform,mapBookmark,modelBookmark,structureExploded,structurePart,origin,regionContext,mapLayer,atlasEntry:atlas.selected});
 const snapshot=()=>({...basicSnapshot(),mapLayer,guided,memory});
 const observed=()=>memory.observations.map(r=>r.navigation.landform?'geo:'+r.navigation.landform:r.navigation.placeId?'place:'+r.navigation.eventId+':'+r.navigation.placeId:'event:'+r.navigation.eventId);
 function persist() {try {const json=JSON.stringify(memory);if(json.length>96*1024)throw new Error('size');localStorage.setItem(memoryKey,json);}catch {storageAvailable=false;}}
 function closeDrawers() {viewport.classList.remove('wb-scenes-visible','wb-inspector-visible');for(const id of ['wb-scenes-open','wb-inspector-open'])shell.querySelector('#'+id).setAttribute('aria-expanded','false');}
 function rememberMap() {if(adapter.read().scene==='terrain'&&stage!=='model')mapBookmark=cleanWorkspace(adapter.read());}
 function saveSession() {
  if(!inEvent())return;
  const map=adapter.read().scene==='terrain'&&stage!=='model'?cleanWorkspace(adapter.read()):mapBookmark;
  memory.sessions[eventId]={progress,speed,mapBookmark:map};persist();updateMemoryLabels();
 }
 function updateMemoryLabels() {
  for(const e of historyEvents){const v=memory.sessions[e.id];nav.querySelector(`[data-hp-memory="${e.id}"]`).textContent=v?`继续上次 · ${Math.round(v.progress*100)}%`:e.short+' ↗';}
  journalButton.textContent='我的探索 '+memory.observations.length;viewport.dataset.explorationCount=memory.observations.length;
 }
 function entryLayout(){const entry=stage==='planet'||stage==='region';viewport.classList.toggle('ra-entry',entry);viewport.classList.toggle('ej-active',['event','place','model'].includes(stage));viewport.classList.toggle('ej-guided',guided);viewport.dataset.platformStage=stage;atlas.update({stage,layer:mapLayer,eventId,entering:enteringRegion});adapter.presentation?.(entry||['event','place'].includes(stage)||modelId==='structure');adapter.resize?.();}
 function move(scene,options={}) {entryLayout();internal=true;adapter.navigate(scene,options);internal=false;}
 function setMap() {adapter.setMapLayer({visible:stage==='region'||['event','place'].includes(stage)||(stage==='model'&&modelId==='structure'),overview:stage==='region'?mapLayer:null,event:selectedEvent(),nodeId:placeId??(stage==='region'&&atlas.selected?'atlas:'+atlas.selected:landform?'geo:'+landform:null),phase,progress,structure:stage==='model'&&modelId==='structure',observed:observed()});}
 function syncProcess() {
  const e=selectedEvent(),f=eventFrame(eventId,progress);phase=f.phase;path.update(pathState());
  viewport.dataset.historyPhase=phase;viewport.dataset.historyProgress=progress.toFixed(4);viewport.dataset.historyModelLinked=String(modelLinked);
  panel.querySelectorAll('[data-hp-phase]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.hpPhase)===phase)));
  const copy=panel.querySelector('.hp-phase-copy');if(copy)copy.textContent=e.phases[phase].text;
  const slider=panel.querySelector('#hp-event-progress');if(slider)slider.value=Math.round(progress*100);
  const value=panel.querySelector('#hp-event-value');if(value)value.textContent=Math.round(progress*100)+'%';
  const compare=panel.querySelector('[data-hp-action=compare]');if(compare)compare.textContent=compareSaved===null?'回看背景':'恢复进程';
  const linked=panel.querySelector('#hp-model-linked');if(linked)linked.checked=modelLinked;
  const live=panel.querySelector('#hp-current-change');if(live)live.textContent=stage==='model'&&!modelLinked?'模型已由你自由接管；事件进度保持 '+Math.round(progress*100)+'%。':f.action;
  const next=panel.querySelector('[data-hp-action=next]');if(next){next.textContent=guidedStop!==null&&playing?'正在观察变化 · 可在底部暂停':nextLabel();next.disabled=guidedStop!==null&&playing;}
  if(inEvent()){setMap();if(stage==='model'&&modelLinked)adapter.eventProgress?.(modelId,f);}
 }
 function seek(value) {playing=false;guidedStop=null;progress=clampProgress(value);syncProcess();saveSession();const u=new URL(location.href);u.searchParams.set('phase',phase);u.searchParams.set('progress',Math.round(progress*100));history.replaceState(null,'',u);}
 function syncModelFeedback(){if(stage!=='model')return;const response=adapter.feedback?.()?.replace(/^场景状态\s*·\s*/,'');const live=panel.querySelector('#hp-current-change');if(live&&response&&live.textContent!==response)live.textContent=response;path.update(pathState(response));}
 function tick(dt) {if(!eventActive()||!playing){syncModelFeedback();return;}progress=Math.min(guidedStop??1,advanceEvent(progress,dt,guidedStop!==null?4:speed));if(progress>=(guidedStop??1)){seek(progress);syncModelFeedback();return;}syncProcess();syncModelFeedback();}
 function clock(action,value) {
  if(!eventActive())return false;if(action!=='toggle')guidedStop=null;
  if(action==='toggle'){if(progress>=1){progress=0;guidedStop=null;}playing=!playing;}if(action==='step'){playing=false;progress=advanceEvent(progress,1);}if(action==='speed')speed=value;if(action==='reset'){playing=false;progress=0;compareSaved=null;}
  syncProcess();if(!playing){const stop=guidedStop;seek(progress);guidedStop=stop;}return true;
 }
 const preferredNode=()=>nodeById(selectedEvent(),eventId==='zhang'?'kashgar':eventId==='xibe'?'qabqal':'luntai');
 function preferredModel(node) {return node?.models.find(m=>m[0]===(node.id==='kashgar'?'market':node.id==='qabqal'?'people':node.models[0][0]))??node?.models[0];}
 function nextLabel() {if(stage==='place')return (preferredModel(nodeById(selectedEvent(),placeId))?.[1]??'进入模型')+' →';if(stage==='model')return '记录当前观察';return phase===0?'看过程怎样展开 →':phase===1?'看影响与联系 →':'去 '+preferredNode().name+' →';}
 function guideHTML() {
  if(!guided||!inEvent())return '';
  return `<div class="hp-next"><small>${stage==='model'&&['market','people','oasis'].includes(modelId)?'人物的回应':'当前观察'}</small><p id="hp-current-change">${eventFrame(eventId,progress).action}</p>${stage==='model'?'<button data-hp-action="controls">操作模型与人物 ↓</button>':''}<button class="hp-primary" data-hp-action="next">${nextLabel()}</button>${stage!=='model'?'<button data-hp-action="record">记录当前观察</button>':''}<span id="hp-record-feedback" role="status">${escape(lastObservation)}</span></div>`;
 }
 function extensionsHTML(){const rows=extensions[modelId]??[];return rows.length?`<details class="hp-related"><summary>带着问题，继续看相关场景</summary>${rows.map(([id,label,scope])=>`<button data-hp-related="${id}">${label} →<small>${scope}</small></button>`).join('')}</details>`:'';}
 function processHTML(e) {
  return `<div class="hp-phases" aria-label="事件观察阶段">${e.phases.map((p,i)=>`<button data-hp-phase="${i}" aria-pressed="${phase===i}">${p.label}</button>`).join('')}</div><p class="hp-phase-copy">${e.phases[phase].text}</p><div class="hp-process-controls"><label for="hp-event-progress">观察进程 <output id="hp-event-value">${Math.round(progress*100)}%</output></label><input id="hp-event-progress" aria-label="历史事件观察进程" type="range" min="0" max="100" step="1" value="${Math.round(progress*100)}"><div><button data-hp-action="focus-process">靠近变化位置 ⌖</button><button data-hp-action="compare">${compareSaved===null?'回看背景':'恢复进程'}</button></div>${stage==='model'?`<label><input id="hp-model-linked" type="checkbox" ${modelLinked?'checked':''}> 模型跟随事件进程</label>`:''}<small>底部运行／暂停／单步控制事件；拖动可倒退。</small></div>`;
 }
 function sourcesHTML(e) {return `<details class="hp-sources"><summary>事件介绍与史料依据</summary><p>${e.summary}</p><ul>${e.facts.map(f=>`<li>${f}</li>`).join('')}</ul><a href="${e.source.url}" target="_blank" rel="noopener noreferrer">${e.source.title} ↗</a>${(e.additionalSources??[]).map(ref=>`<a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.title} ↗</a>`).join('')}<p>${e.source.scope}</p></details>`;}
 function breadcrumbHTML(e,node,geo) {
  const crumbs=[['planet','地球']];if(stage!=='planet')crumbs.push(['region','新疆']);if(inEvent())crumbs.push(['event-map',e.short]);
  if(node)crumbs.push(['place',node.name.split(' · ')[0]]);else if(geo)crumbs.push(['geo',geo.name]);
  if(stage==='model')crumbs.push(['model','模型观察']);if(stage==='free')crumbs.push(['free','自由场景']);
  return crumbs.map(([action,label],i)=>`<button data-hp-crumb="${action}" ${i===crumbs.length-1?'aria-current="location"':''}>${label}</button>`).join('<span> › </span>');
 }
 function render() {
  entryLayout();
  const e=selectedEvent(),node=nodeById(e,placeId),geo=geographyStops.find(g=>g.id===landform);component.hidden=true;lastObservation='';
  const panelKey=[stage,eventId,placeId,landform,modelId].join('/');if(panelKey!==lastPanelKey){right.scrollTop=0;lastPanelKey=panelKey;}
  viewport.dataset.platformStage=stage;viewport.dataset.historyEvent=eventId;viewport.dataset.historyPlace=placeId??landform??'';viewport.dataset.historyPhase=phase;viewport.dataset.explorationLayer=mapLayer;
  const scale=stage==='planet'?'planet':stage==='region'&&mapLayer==='history'||inEvent()?'event':stage==='region'||landform?'region':'free';nav.querySelectorAll('[data-hp-stage]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hpStage===scale)));
  nav.querySelectorAll('[data-hp-event]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hpEvent===eventId&&inEvent())));
  resume.hidden=stage==='planet'||stage==='region';resume.textContent=landform?'← 返回新疆地图':stage==='model'?'← 返回地点':stage==='place'?'← 返回事件地图':'← 返回新疆地图';
  shell.querySelector('#wb-breadcrumb').innerHTML=breadcrumbHTML(e,node,geo);
  if(stage==='planet')panel.innerHTML=`<p class="hp-eyebrow">01 / 全球定位</p><h2>新疆，在世界哪里？</h2><p>从欧亚大陆建立方位，再进入新疆的山地、盆地和历史地点。</p><div class="hp-observe"><strong>转动地球，找内陆位置</strong><p>金色定位环与着色范围标出新疆方向。进入区域后，地图上的入口都可以自己选择。</p></div><button class="hp-primary" data-hp-action="locate">定位新疆 ⌖</button><button data-hp-action="region">进入新疆整体地图 →</button><p class="hp-credit">NASA全球影像 · 定位范围为示意</p>`;
  else if(stage==='region')panel.innerHTML=`<p class="hp-eyebrow">02 / 地图探索</p><h2>地理是底座，历史是线索。</h2><p>先观察三山两盆，再选择一条历史线索。绿色地点进入自然模型；金色地点打开事件。</p><div class="hp-map-filters" role="group" aria-label="地图探索图层">${[['geography','地形格局'],['water','水与绿洲'],['history','历史路线'],['all','地点图鉴']].map(([id,label])=>`<button data-hp-layer="${id}" aria-pressed="${mapLayer===id}">${label}</button>`).join('')}</div><div class="hp-geography">${geographyStops.map(g=>`<button data-hp-geo="${g.id}" aria-pressed="${landform===g.id}">${g.name} ↗</button>`).join('')}</div>${geo?`<div class="hp-observe"><strong>${geo.name}</strong><p>${geo.text}</p>${geo.scene?`<button class="hp-primary" data-hp-model="${geo.scene}">进入地点模型 →</button>`:'<button data-hp-action="record">记录整体地理观察</button>'}</div>`:''}<button class="hp-primary" data-hp-action="events">切到历史入口 →</button><button data-hp-action="overview">回到区域全景 ⌖</button><p class="hp-credit">公开DEM与影像 · 高度可夸张 · 简化区域轮廓</p>`;
  else if(stage==='free')panel.innerHTML=`<p class="hp-eyebrow">${origin?'相关场景 / 自主比较':'自主探索'}</p><h2>${origin?workspaceScenes.find(s=>s.id===adapter.read().scene)?.name:'继续操作已有场景。'}</h2>${origin?`<div class="hp-observe"><strong>从 ${escape(origin.label)} 继续观察</strong><p>地点、时代与人物各自独立。延伸的是观察问题，可以随时回到刚才的事件、镜头和选择。</p><button class="hp-primary" data-hp-action="return-origin">← 返回 ${escape(origin.label)}</button></div>`:'<p>下方保留全部模型参数、图层和模拟控制。可以记录当前场景，或返回地图继续事件线索。</p>'}<button data-hp-action="controls">操作模型与人物 ↓</button><button data-hp-action="record">记录当前观察</button><button data-hp-action="region">返回地图与历史入口 →</button>`;
  else if(landform&&stage==='model')panel.innerHTML=`<p class="hp-eyebrow">自然观察 / 地点模型</p><h2>${geo.name}</h2><p>${geo.text}</p><div class="hp-observe"><strong>从整体定位到局部观察</strong><p>拖动调整视角，展开下方“模型操作”控制地形或过程。记录观察后，地图会留下位置，返回时保留刚才的视角。</p></div><button data-hp-action="controls">操作地形与过程 ↓</button><button data-hp-action="record">记录当前观察</button>${extensionsHTML()}<button class="hp-primary" data-hp-action="region">← 返回新疆地图</button><span id="hp-record-feedback" role="status"></span>`;
  else panel.innerHTML=`<p class="hp-eyebrow">${e.date} / ${stage==='model'?'模型观察':'历史与地理'}</p><h2>${e.title}</h2><p class="hp-question">${e.question}</p>${guideHTML()}${processHTML(e)}${stage!=='model'?`<div class="hp-place-list"><h3>选择地点，继续放大</h3>${e.nodes.map(n=>`<button data-hp-place="${n.id}" aria-pressed="${placeId===n.id}"><strong>${n.name}</strong><small>${n.role}</small></button>`).join('')}</div><button data-hp-action="event-overview">展开事件全图 ⌖</button>`:''}${node?`<div class="hp-observe"><strong>${node.name}</strong><p>${node.text}</p><div class="hp-model-list">${node.models.map(([id,label,nature])=>`<button data-hp-model="${id}" aria-pressed="${stage==='model'&&modelId===id}">${label} →<small>${nature}</small></button>`).join('')}</div></div>`:''}${stage==='model'?'<button class="hp-primary" data-hp-action="back-event">← 返回地点地图</button>':''}${!guided?'<button data-hp-action="record">记录当前观察</button><span id="hp-record-feedback" role="status"></span>':''}${modelId==='structure'&&stage==='model'?`<div class="hp-structure"><label><input id="hp-explode" type="checkbox" ${structureExploded?'checked':''}> 展开屋盖，看内部空间</label><div>${['城门','通道','围墙','内部空间'].map((n,i)=>`<button data-hp-part="${i}">${n}</button>`).join('')}</div><p>抽象空间结构示意 · 非乌垒遗址复原</p></div>`:''}${sourcesHTML(e)}`;
  if(inEvent()&&stage==='model')(panel.querySelector('.hp-next')??panel.querySelector('.hp-question'))?.insertAdjacentHTML('afterend',extensionsHTML());
  tools.open=stage==='model'||stage==='free';
  if(stage==='model'&&modelId==='structure'){shell.querySelector('#wb-title').textContent='空间结构 · 抽象示意';shell.querySelector('#wb-hint').textContent='展开屋盖，点击城门、通道、围墙或内部空间；拖动调整观察角度。';}
  if(inEvent())shell.querySelector('#wb-tag').textContent=stage==='model'?(modelId==='structure'?'结构示意 · 非遗址复原':node?.models.find(m=>m[0]===modelId)?.[2]??'模型观察'):'史料与空间参照';
  shell.querySelector('#wb-type').textContent=stage==='model'?'模型参数与图层':'原有参数与图层';
  path.render(pathState());setMap();if(stage==='model'&&modelId==='structure'){adapter.structureExplode(structureExploded);if(structurePart>=0)selectPart(structurePart);}
  updateMemoryLabels();nav.querySelector('#hp-guided').checked=guided;
  const u=new URL(location.href);u.searchParams.set('stage',stage);u.searchParams.set('event',eventId);for(const [key,value] of [['place',placeId],['geo',landform],['model',modelId]]){if(value)u.searchParams.set(key,value);else u.searchParams.delete(key);}u.searchParams.set('phase',phase);if(inEvent())u.searchParams.set('progress',Math.round(progress*100));else u.searchParams.delete('progress');u.searchParams.set('mapLayer',mapLayer);if(regionContext?.entry&&stage!=='region')u.searchParams.set('returnEntry',regionContext.entry);else u.searchParams.delete('returnEntry');if(stage==='region'&&atlas.selected)u.searchParams.set('atlasEntry',atlas.selected);else u.searchParams.delete('atlasEntry');history.replaceState(null,'',u);syncProcess();
 }
 function globe() {enteringRegion=false;adapter.cancelArrival?.();atlas.clear();saveSession();playing=false;rememberMap();origin=null;stage='planet';landform=null;placeId=null;modelId=null;move('earth',{overview:true});render();closeDrawers();}
 function region({overview=false,located=false,after=null}={}) {
  if(stage==='planet'&&!located&&adapter.approachRegion){if(enteringRegion)return;enteringRegion=true;atlas.update({stage,layer:mapLayer,eventId,entering:true});adapter.approachRegion(ok=>{enteringRegion=false;if(ok){region({overview:true,located:true});after?.();}else atlas.update({stage,layer:mapLayer,eventId,entering:false});});return;}
  saveSession();playing=false;const previous=stage,returning=previous!=='region'&&previous!=='planet';rememberMap();origin=null;landform=null;placeId=null;modelId=null;stage='region';
  if(!overview&&returning&&regionContext){mapLayer=regionContext.layer;eventId=regionContext.eventId;atlas.select(regionContext.entry);move('terrain',{restore:regionContext.workspace,overview:!regionContext.workspace});}
  else{atlas.clear();move('terrain',{restore:overview||previous==='planet'?null:mapBookmark,overview:overview||previous==='planet'||!mapBookmark,bridge:previous==='planet'});}
  render();closeDrawers();
 }
 function chooseEvent(id,{fresh=false,fromEntry=false}={}) {
  const previousEvent=eventId,previousStage=stage;rememberRegion();saveSession();rememberMap();eventId=eventById(id).id;if(previousStage!=='region'&&previousEvent!==eventId){mapLayer='history';if(regionContext){const valid=!regionContext.entry||selectedEvent().nodes.some(n=>n.id===regionContext.entry);regionContext={...regionContext,layer:'history',eventId,entry:valid?regionContext.entry:null,workspace:valid?regionContext.workspace:null};}}const saved=fresh?null:memory.sessions[eventId];progress=saved?.progress??0;speed=saved?.speed??1;phase=phaseAt(progress);
  placeId=null;landform=null;modelId=null;playing=false;compareSaved=null;modelLinked=true;modelBookmark=null;structureExploded=false;structurePart=-1;origin=null;stage='event';mapBookmark=saved?.mapBookmark??null;
  move('terrain',{restore:fromEntry?null:mapBookmark,overview:fromEntry||!mapBookmark});render();closeDrawers();
 }
 function selectAtlasEntry(id){const e=atlasEntries.find(e=>e.id===id);if(!e)return;if(stage==='planet'){region({after:()=>selectAtlasEntry(id)});return;}if(stage!=='region')region();const visible=mapLayer==='all'||mapLayer==='geography'&&e.kind==='nature'||mapLayer==='water'&&['glacier','turpan','ili'].includes(e.id)||mapLayer==='history'&&selectedEvent().nodes.some(n=>n.id===e.id);if(!visible)mapLayer=e.kind==='nature'?'geography':e.kind==='water'?'water':e.event?'history':'all';if(mapLayer==='history'&&e.event)eventId=e.event;rememberMap();landform=null;atlas.select(e.id);move('terrain',{focus:[e.lon,e.lat],distance:14});render();}
 function openAtlasEntry(id){const e=atlasEntries.find(e=>e.id===id);if(!e)return;if(e.geo){chooseGeo(e.geo);openModel(e.model);}else if(e.event){chooseEvent(e.event);visit(e.place);if(e.model)openModel(e.model);}else if(e.free)freeScene(e.free);}
 function freeScene(id){rememberRegion();if(id==='earth'){globe();return;}if(id==='terrain'){region({overview:true});return;}saveSession();playing=false;rememberMap();origin=null;stage='free';modelId=null;landform=null;placeId=null;move(id,{overview:true});render();closeDrawers();}
 function chooseGeo(id) {const g=geographyStops.find(g=>g.id===id);if(!g)return;if(stage==='planet'){region({after:()=>chooseGeo(id)});return;}if(stage!=='region')region();if(mapLayer==='history'||mapLayer==='water'&&g.id!=='glacier')mapLayer='geography';rememberMap();landform=g.id;placeId=null;modelId=null;atlas.select(atlasEntries.find(e=>e.geo===id)?.id);move('terrain',{focus:[g.lon,g.lat],distance:g.scene?12:25});render();closeDrawers();}
 function visit(id) {
  if(id.startsWith('basin:')){const w=waterRelations.find(w=>w.name.startsWith(id==='basin:tarim'?'塔':'伊'));if(w){const p=w.points[Math.floor(w.points.length/2)];rememberMap();atlas.relief(w.name);move('terrain',{focus:p,distance:14});render();}return;}
  if(id.startsWith('atlas:')){selectAtlasEntry(id.slice(6));return;}if(id.startsWith('relief:')){const name=id.slice(7),n=reliefNames.find(r=>r[0]===name);if(n){rememberMap();atlas.relief(name);move('terrain',{focus:[n[1],n[2]],distance:14});}return;}
  if(id.startsWith('event:')){chooseEvent(id.slice(6));return;}if(id.startsWith('geo:')){chooseGeo(id.slice(4));return;}
  const n=nodeById(selectedEvent(),id);if(!n)return;rememberMap();placeId=n.id;modelId=null;landform=null;stage='place';playing=false;move('terrain',{focus:[n.lon,n.lat],distance:11});render();closeDrawers();
 }
 function openModel(id,{immediate=initializing}={}) {
  const node=nodeById(selectedEvent(),placeId),geo=geographyStops.find(g=>g.id===landform);if(!(landform?geo?.scene===id:node?.models.some(m=>m[0]===id)))return;
  rememberRegion();rememberMap();modelBookmark=cleanWorkspace(adapter.read());playing=false;
  const request={id,eventId,placeId,landform};
  const finish=()=>{pendingModel=null;passage.hidden=true;viewport.dataset.placeTransition='model';modelId=id;stage='model';modelLinked=!landform;if(id==='structure'&&progress<.28){progress=.5;phase=1;}
   move(id==='structure'?'terrain':id,{structure:id==='structure',focus:id==='structure'?[84.25,41.78]:null,distance:id==='structure'?7:null,scaleHandoff:!immediate});render();syncProcess();closeDrawers();};
  if(immediate){finish();return;}
  const stop=geo??node;pendingModel=request;viewport.dataset.placeTransition='approaching';
  const options={focus:[stop.lon,stop.lat],distance:landform?7:eventId==='xibe'?5.8:7};
  if(!landform&&eventId==='xibe')options.focusOffset=readingFor('xibe',id==='migration'?0:2).focusOffset;
  move('terrain',{...options,onArrive:ok=>{if(pendingModel!==request)return;pendingModel=null;passage.hidden=true;if(ok&&eventId===request.eventId&&placeId===request.placeId&&landform===request.landform)finish();else{viewport.dataset.placeTransition='cancelled';path.update(pathState());}}});
  pendingModel=request;passage.innerHTML='<small>区域 → 地点 → 模型</small><strong>正在靠近 '+(stop.name.split(' · ')[0])+'</strong><span>先保留地理位置，再进入可操作模型。</span><button>保持当前地图</button>';passage.hidden=false;path.update(pathState());closeDrawers();
 }
 function eventMap({overview=false}={}) {saveSession();playing=false;modelLinked=true;stage='event';placeId=null;landform=null;modelId=null;move('terrain',{restore:overview?null:mapBookmark,overview:overview||!mapBookmark});render();closeDrawers();}
 function backEvent() {if(stage!=='model'){eventMap();return;}saveSession();playing=false;modelLinked=true;stage=placeId?'place':'event';modelId=null;move('terrain',{restore:modelBookmark?.scene==='terrain'?modelBookmark:mapBookmark,overview:!mapBookmark&&!modelBookmark});render();closeDrawers();}
 function selectPart(index) {if(stage!=='model'||modelId!=='structure'||index<0||index>3)return;structurePart=index;adapter.structurePart(index);component.textContent=['城门：观察进入与离开的节点。','通道：观察内外空间怎样相接。','围墙：观察边界与入口的关系。','内部空间：观察道路与使用空间的组织。'][index];component.hidden=false;}
 function takeControl() {modelLinked=false;playing=false;syncProcess();}
 function branchTo(id){if(!(extensions[modelId]??[]).some(r=>r[0]===id))return;playing=false;adapter.pause?.();saveSession();origin={navigation:basicSnapshot(),workspace:cleanWorkspace(adapter.read()),label:landform?geographyStops.find(g=>g.id===landform).name:workspaceScenes.find(s=>s.id===modelId)?.name??'原来的观察'};stage='free';modelId=null;placeId=null;landform=null;move(id,{overview:true});render();closeDrawers();}
 function returnOrigin(){if(!origin)return;const saved=origin;restore(saved.navigation,{loadMemory:false});move(saved.workspace.scene,{restore:saved.workspace});render();closeDrawers();}
 function recordObservation() {
  playing=false;adapter.pause?.();saveSession();const view=adapter.read(),response=stage==='model'||stage==='free'?(view.lived?shell.querySelector('#lived-story-state')?.textContent:shell.querySelector('#wb-response')?.textContent):'';memory=appendObservation(memory,basicSnapshot(),view,'o'+Date.now().toString(36),response??'');persist();updateMemoryLabels();setMap();
  lastObservation=storageAvailable?'已记入“我的探索”，地图保留观察位置。':'已记入本次探索；浏览器未允许本机保存，请导出配置保留。';
  let feedback=panel.querySelector('#hp-record-feedback');if(!feedback){feedback=document.createElement('p');feedback.id='hp-record-feedback';feedback.setAttribute('role','status');panel.append(feedback);}feedback.textContent=lastObservation;const journeyMessage=shell.querySelector('.ej-record-message');if(journeyMessage)journeyMessage.textContent=lastObservation;if(!journal.hidden)renderJournal();
 }
 function recordTitle(r) {const g=r.workspace.guide;if(g){if(g.place==='glacier')return '一号冰川 / 自然导览';if(g.stage==='world')return '地球 / 方位观察';if(g.stage==='map')return '新疆全域 / 地图观察';return eventById(g.event).title+' / '+(g.stage==='place'?learningPlaceName(g.place):'历史观察');}const s=r.navigation;if(s.stage==='region')return s.atlasEntry?atlasEntries.find(e=>e.id===s.atlasEntry).name+' / 地图观察':'新疆地图 / '+({'geography':'地形格局','water':'水与绿洲','history':'历史路线','all':'地点图鉴'}[s.mapLayer]??'全貌');if(s.landform)return geographyStops.find(g=>g.id===s.landform).name;const e=eventById(s.eventId);if(s.stage==='free')return '自由场景 · '+r.workspace.scene;return e.title+(s.placeId?' / '+nodeById(e,s.placeId).name.split(' · ')[0]:'');}
 function renderJournal() {
  journal.innerHTML=`<div class="hp-journal-head"><div><p class="hp-eyebrow">回到你观察过的位置</p><h2>我的探索 <span>${memory.observations.length}</span></h2></div><button data-hp-journal="close" aria-label="关闭探索记录">×</button></div><p>保存地点、镜头、参数与当时进度；点击一条即可回来继续。最多保留12条，同一观察更新保存。</p><div class="hp-journal-rows">${[...memory.observations].reverse().map(r=>{const s=r.navigation,e=eventById(s.eventId);return `<article><h3>${escape(recordTitle(r))}</h3><small>${r.workspace.guide?(r.workspace.guide.place==='glacier'?'自然地理 / 冰谷导览':'主题与地点 / 可继续讲解'):s.landform?'自然地理 / 地点模型':s.stage==='free'?'原有场景 / 自由探索':e.date+' / '+e.phases[s.phase].label+' / '+Math.round(s.progress*100)+'%'}</small><p>${escape(s.landform?geographyStops.find(g=>g.id===s.landform).text:s.stage==='free'?'保留当时模型控制与自由视角。':eventFrame(s.eventId,s.progress).action)}${s.stage==='model'&&!s.landform?' · '+(s.modelLinked?'模型跟随事件':'自由操作模型'):''}</p>${r.response?`<p class="hp-observation-response">画面反馈：${escape(r.response)}</p>`:''}<div><button data-hp-resume="${escape(r.id)}">返回这次观察 ↗</button><button data-hp-remove="${escape(r.id)}" aria-label="移除观察 ${escape(recordTitle(r))}">移除记录</button></div></article>`;}).join('')||'<div class="hp-journal-empty">先选地点、比较变化，再点“记录当前观察”。地图与模型里的位置会留在这里。</div>'}</div><p class="hp-journal-note">${storageAvailable?'记录只存本机；导出配置可一起带走。':'本机保存不可用；导出配置可带走本次记录。'} 影像、音频和影片继续使用同一份素材。</p>`;
 }
 function showJournal(value) {journal.hidden=!value;journalButton.setAttribute('aria-expanded',String(value));if(value){renderJournal();journal.querySelector('[data-hp-journal=close]').focus();}else journalButton.focus();}
 function restore(s,{loadMemory=true}={}) {
  const value=cleanNavigation(s);if(!value)return;playing=false;compareSaved=null;({stage,eventId,placeId,phase,progress,speed,modelLinked,modelId,landform,mapBookmark,modelBookmark,structureExploded,structurePart,origin,regionContext}=value);
  if(loadMemory&&s.version===3&&s.memory)memory=cleanMemory(s.memory);if(['geography','water','history','all'].includes(s.mapLayer))mapLayer=s.mapLayer;if(typeof s.guided==='boolean')guided=s.guided;atlas.select(value.atlasEntry);render();syncProcess();persist();
 }
 function resumeObservation(id) {const r=memory.observations.find(v=>v.id===id);if(!r)return;saveSession();restore(r.navigation,{loadMemory:false});if(!adapter.resumeGuide?.(r)){move(r.workspace.scene,{restore:r.workspace});render();}saveSession();showJournal(false);closeDrawers();}
 panel.addEventListener('input',ev=>{if(ev.target.id==='hp-event-progress'){compareSaved=null;modelLinked=true;seek(Number(ev.target.value)/100);}});
 for(const id of ['wb-model-controls','wb-live-controls'])shell.querySelector('#'+id).addEventListener('input',()=>{if(stage==='model'&&modelLinked)takeControl();});
 panel.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b)return;const action=b.dataset.hpAction;
  if(action==='locate')adapter.locate();if(action==='region')region();if(action==='events'){atlas.clear();mapLayer='history';landform=null;move('terrain',{overview:true});render();}if(action==='overview'){atlas.clear();landform=null;move('terrain',{overview:true});render();}
  if(action==='controls'){tools.open=true;right.scrollTop=tools.offsetTop-right.offsetTop;}
  if(b.dataset.hpRelated)branchTo(b.dataset.hpRelated);if(action==='return-origin')returnOrigin();
  if(action==='back-event')backEvent();if(action==='event-overview')eventMap({overview:true});if(b.dataset.hpPlace)visit(b.dataset.hpPlace);if(b.dataset.hpModel)openModel(b.dataset.hpModel);if(b.dataset.hpGeo)chooseGeo(b.dataset.hpGeo);if(b.dataset.hpLayer){atlas.clear();mapLayer=b.dataset.hpLayer;render();}
  if(b.dataset.hpPhase!==undefined){modelLinked=true;compareSaved=null;seek(phaseProgress[Number(b.dataset.hpPhase)]);}
  if(action==='next'){if(stage==='model')recordObservation();else if(stage==='place')openModel(preferredModel(nodeById(selectedEvent(),placeId))[0]);else if(phase<2)playToPhase(phase+1);else visit(preferredNode().id);}if(action==='record')recordObservation();
  if(action==='focus-process')focusProcess();
  if(action==='compare'){if(compareSaved===null){compareSaved=progress;seek(0);}else{const saved=compareSaved;compareSaved=null;seek(saved);}syncProcess();}if(b.dataset.hpPart!==undefined)selectPart(Number(b.dataset.hpPart));
 });
 panel.addEventListener('change',ev=>{if(ev.target.id==='hp-model-linked'){modelLinked=ev.target.checked;playing=false;syncProcess();}if(ev.target.id==='hp-explode'){structureExploded=ev.target.checked;adapter.structureExplode(structureExploded);}});
 nav.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.hpEvent)chooseEvent(b.dataset.hpEvent);if(b.dataset.hpStage==='planet')globe();if(b.dataset.hpStage==='region')region({overview:true});if(b.dataset.hpStage==='event'){region({overview:true});mapLayer='history';render();}});
 nav.querySelector('#hp-guided').addEventListener('change',ev=>{guided=ev.target.checked;if(!guided&&guidedStop!==null){playing=false;guidedStop=null;}render();});
 shell.querySelector('#wb-breadcrumb').addEventListener('click',ev=>{const action=ev.target.closest('button')?.dataset.hpCrumb;if(action==='planet')globe();if(action==='region')region();if(action==='event-map')eventMap();if(action==='place'&&placeId){if(stage==='model')backEvent();else visit(placeId);}if(action==='geo'&&landform)chooseGeo(landform);});
 resume.addEventListener('click',()=>landform||!['model','place'].includes(stage)?region():backEvent());headerButton.addEventListener('click',globe);journalButton.addEventListener('click',()=>showJournal(journal.hidden));
 journal.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.hpJournal==='close')showJournal(false);if(b.dataset.hpResume)resumeObservation(b.dataset.hpResume);if(b.dataset.hpRemove){memory.observations=memory.observations.filter(r=>r.id!==b.dataset.hpRemove);persist();updateMemoryLabels();setMap();renderJournal();}});
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!journal.hidden)showJournal(false);});window.addEventListener('pagehide',saveSession);
 const params=new URL(location.href).searchParams,desired=params.get('stage');eventId=eventById(params.get('event')).id;if(['geography','water','history','all'].includes(params.get('mapLayer')))mapLayer=params.get('mapLayer');
 shell.querySelector('#wb-scenes-open').textContent='导航';shell.querySelector('#wb-inspector-open').textContent='探索';
 if(desired==='model'&&params.get('geo')&&geographyStops.some(g=>g.id===params.get('geo'))){region({located:true});chooseGeo(params.get('geo'));openModel(params.get('model'));}else if(desired==='region'){region({located:true});if(params.get('geo'))chooseGeo(params.get('geo'));else if(params.get('atlasEntry'))selectAtlasEntry(params.get('atlasEntry'));}
 else if(['event','place','model'].includes(desired)){chooseEvent(eventId);if(params.get('place'))visit(params.get('place'));if(desired==='model'&&params.get('model'))openModel(params.get('model'));phase=Math.max(0,Math.min(2,Number(params.get('phase'))||0));if(params.has('progress')||params.has('phase'))progress=params.has('progress')?clampProgress(Number(params.get('progress'))/100):phaseProgress[phase];phase=phaseAt(progress);render();syncProcess();}
 else if(params.has('scene')&&params.get('scene')!=='earth'){stage='free';render();}else globe();
 if(['event','place','model'].includes(stage)&&atlasEntries.some(e=>e.id===params.get('returnEntry')))regionContext={layer:mapLayer,eventId,entry:params.get('returnEntry'),workspace:null};
 initializing=false;
 return {recordObservation,snapshot,restore,visit,region,selectPart,focusReading,tick,clock,takeControl,openEvent(id,options){mapLayer='history';chooseEvent(id,options);if(options?.progress!==undefined){seek(options.progress);syncProcess();}},
 exploreScene(id,options={}){saveSession();playing=false;guidedStop=null;component.hidden=true;landform=null;placeId=null;modelId=null;stage=id==='earth'?'planet':id==='terrain'?'region':'free';move(id,options);render();closeDrawers();},
 get transport(){return eventActive()?{eventMode:true,time:progress*eventDuration,playing,speed:guidedStop!==null?4:speed,response:eventFrame(eventId,progress).action}:null;},get linked(){return stage==='model'&&eventActive();},sceneChanged(){if(internal)return;saveSession();playing=false;component.hidden=true;stage='free';modelId=null;landform=null;placeId=null;render();},mapPin(data){if(data.action==='terrain'){region();return true;}const g=geographyStops.find(g=>g.name===data.name||g.id==='tianchi'&&data.name==='天山天池');if(g&&stage==='region'){chooseGeo(g.id);return true;}return false;},get frame(){return {stage,eventId,placeId,phase,progress,modelId};}};
}
