"""Consolidate the live guide without editing any frozen evidence."""
from pathlib import Path

P=Path(__file__).resolve().parents[1]
W=P/'web/public'
assert not (P/'process/round-88/retention.json').exists()
p=W/'knowledge-guide.js';s=p.read_text(encoding='utf-8')
assert 'function enterWholeMap' not in s, 'R88 is already installed'
def replace(a,b):
 global s
 assert a in s,a[:90]
 s=s.replace(a,b,1)
def function(a,b,new):
 global s
 start=s.index(a);end=s.index(b,start)
 s=s[:start]+new+'\n'+s[end:]
replace("import {localObservationFrame,localSceneMatches,localSnapshot}","import {worldMapEntry} from './entry-policy.js';\nimport {localObservationFrame,localSceneMatches,localSnapshot}")
replace("history:()=>go('history',{restore:true}),locate:node=>visitEventPlace(node),enterPlace:node=>enterEventPlace(node),commit:writeURL", "history:()=>go('history',{restore:true}),locate:node=>visitEventPlace(node),enterPlace:node=>enterEventPlace(node),enterModel:node=>{enterEventPlace(node);if(active&&stage==='place')openModel(placeItem().model);},commit:writeURL")
replace("function openRelations(id=relationId,{scope='context',node,restore=false,geography=false,guide=true}={})", "function openRelations(id=relationId,{scope='region',node,restore=false,geography=false,guide=false}={})")
replace("relationMoving=guide&&!geography&&!reducedMotion;}go('map',{restore,guide});", "relationMoving=guide&&!geography&&!reducedMotion;}go('map',{restore,guide});")
function(' function worldBody(){',' function worldChapterHeading()', ''' function worldBody(){
  const w=selectedKnowledge(worldLessons,world),selectedCountry=countryCatalog.find(c=>c.id===worldPick),p=worldAnchor(worldPick),dest=worldAnchor(worldDestination),km=Math.round(surfaceDistance(worldAnchor('urumqi'),dest));
  const extras=earthFlows[world]?`<section class="wa-flow-control" aria-label="可控制的球面演示"><div><button data-kg-action="world-motion">${worldMoving?'暂停球面演示':'继续球面演示'}</button><button data-kg-action="world-replay">从头观察 ↺</button></div><label>观察进程<input type="range" data-world-progress aria-label="球面演示进程" min="0" max="100" value="${Math.round(worldProgress[world]*100)}"></label><output data-world-phase></output><p data-world-explanation></p></section>`:world==='connections'?`<p>乌鲁木齐与${dest.name}的球面距离约${km.toLocaleString()}公里；不是道路里程。</p>`:'';
  return `<p class="kg-date">01 / 地球与方位</p><h2>${selectedCountry?selectedCountry.name+' · 范围与方位':w.title}</h2><p>${selectedCountry?'金色范围对应当前选择。继续转动或缩放，再重新定位新疆。':w.text}</p><div class="wa-entry-scale" role="group" aria-label="地球认识尺度">${[['position','大陆方位'],['neighbors','中国与周边'],['relief','新疆山河']].map(([id,label])=>`<button data-world-chapter="${id}" aria-pressed="${world===id}">${label}</button>`).join('')}</div>${extras}<div class="wa-world-actions"><button data-kg-stage="map" class="kg-primary">进入新疆全域地图 →</button></div><p class="kg-scale-next">下一层先看完整新疆的山地与盆地，再选择历史或地点。拖动与缩放始终可用。</p><details class="kg-detail"><summary>国家范围、定位与图层</summary>${countryControls()}<button data-kg-action="world-reset">回到欧亚视角 ⌖</button></details>${worldTopics()}<details class="kg-detail"><summary>历史路径与地球专题</summary>${worldPaths()}${worldNextButton()}${trailEntry()}</details><details class="kg-detail"><summary>底图与表示范围</summary><p>沿用NASA Blue Marble全球影像与Natural Earth现代国家参照。国家范围不表示历史疆域；正式政区请对照官方标准地图。</p><a href="./assets/world-countries-source.json">数据来源与处理记录 ↗</a></details>${sources(w.sources)}`;
 }
''')
# Keep the world topics functional, including distance, coordinates and climate controls.
replace("${worldTopics()}<details class=\"kg-detail\"><summary>历史路径与地球专题", "${worldTopics()}${world==='neighbors'?`<details class=\"kg-detail\"><summary>选择周边国家</summary>${worldAnchors.filter(p=>p.kind==='neighbor').map(p=>`<button data-world-pick=\"${p.id}\">${p.name}</button>`).join('')}</details>`:''}${world==='connections'?`<details class=\"kg-detail\"><summary>距离对照</summary>${comparisonCities.map(id=>`<button data-world-pick=\"${id}\">${worldAnchor(id).name}</button>`).join('')}</details>`:''}<details class=\"kg-detail\"><summary>历史路径与地球专题")
function(' function mapBody(){',' function mapDock()', ''' function mapPathChoices(){return `<section class="kg-next-lines"><h3>用历史理解地方</h3><p>先选一个事件，地点与地域联系随之变化。</p><div class="sr-relations" role="group" aria-label="选择历史问题">${Object.values(directorPaths).map(c=>`<button data-sr-relation="${c.id}"><b>${c.name}</b><small>${c.title}</small></button>`).join('')}</div><details class="kg-detail"><summary>其他年代与历史线索</summary>${choices(historicalPeriods,period,'period')}</details></section>`;}
 function mapTools(){return `<details class="kg-detail"><summary>地图工具与分析视图</summary><button data-kg-action="map-fit">新疆全景 ⌖</button><button data-kg-action="map-surroundings">看周边</button>${surfaceSelector()}${traceHTML()}<button data-kg-action="map-gallery">${mapGallery?'收起地点目录':'打开地点目录'}</button></details>`;}
 function mapBody(){
  if(relationsActive()){
   const r=relationById(relationId),p=relationPlace(relationId,relationNode),box=document.createElement('div');box.innerHTML=relationPanel(relationId,relationScope,relationNode,{focus:relationFeature,geographyOnly:relationOnlyGeography});
   const tabs=box.querySelector('.sr-view-tabs'),paths=box.querySelector('.sr-relations');tabs.remove();paths.remove();box.querySelector('.sr-reading')?.remove();box.querySelector('.sr-next')?.remove();box.querySelector('.sr-story')?.remove();
   return `${tabs.outerHTML}${paths.outerHTML}<p class="kg-date">历史问题 / ${eventById(relationId).date}</p><h2>${r.name}</h2><p>${r.question??directorPaths[relationId].question}</p><p>${p.why}</p><button class="kg-primary sr-story" data-sr-action="story">进入${directorPaths[relationId].name}的历史 →</button>${mapObservationHTML()}<details class="kg-detail"><summary>地点、路线与地图观察</summary>${mapBridgeHTML(relationId,relationNode)}${destinationHTML(relationId,relationNode)}${box.innerHTML}</details>${mapTools()}`;
  }
  const f=mapItem(),items=mapItems(lens,referenceCities),h=selectedKnowledge(historicalPeriods,f.period);
  return `<p class="kg-date">02 / 新疆全域</p><h2>${mapGallery?'全部探索线索':'先读完整新疆，再选择一条线索'}</h2><p>阿尔泰山、天山、昆仑山与准噶尔、塔里木两大盆地共同构成地域骨架。地图保留周边；点选对象后再靠近。</p><div class="sr-view-tabs"><button data-sr-mode="geography" aria-pressed="true">地理格局</button><button data-sr-mode="relations">历史联系</button><button data-sr-mode="places">地点与场景</button></div>${choices(mapLessons,lens,'lens')}<div class="kg-map-objects ${lens==='cities'?'kg-city-objects':''}" role="group" aria-label="选择地图对象">${items.map(i=>`<button data-kg-map-feature="${i.id}" aria-pressed="${f.id===i.id}"><span>${i.name}</span><small>${i.kind}</small></button>`).join('')}</div><article class="kg-map-reading"><h3>${f.name}</h3><p>${f.text}</p></article>${mapPathChoices()}${f.place?`<section class="kg-map-next"><h3>走进相关地点</h3><p>${f.observe}</p><button data-kg-place="${f.place}" class="kg-primary">${f.placeLabel} →</button></section>`:''}<details class="kg-detail"><summary>当前地理线索相关的历史</summary><button data-kg-history="${f.period}">${h.label} · ${f.history} →</button></details>${mapTools()}<details class="kg-detail"><summary>完整定位与资料依据</summary>${miniMap()}<a href="${knowledgeSources.standard.url}" target="_blank" rel="noopener noreferrer">官方标准行政地图 ↗</a><p>山系、流域与通道为位置或机制示意；白线是DEM取样。</p>${sources(f.sources)}</details>`;
 }
''')
function(' function mapDock(){',' function selectMapFeature', ''' function mapDock(){return `<div class="kg-map-dock kg-map-key" aria-label="地图图例"><span>新疆范围</span><span>${mapMode==='relations'?'地域联系示意':'山地 / 盆地 / 地点参照'}</span><span>${onSphere()?'球面地图 · 周边保留':'地形分析视图'}</span></div>`;}
''')
# Merge the old interface fragments rather than disabling their tools.
start=s.index(' function render(){')
s=s[:start]+''' function organizeBody(body){
  const box=document.createElement('div');box.innerHTML=body;
  if(stage==='history'&&box.querySelector('.hs-story')){
   const main=box.querySelector('.hs-story'),result=box.querySelector('.hs-result'),envoyButton=box.querySelector('.envoy-entry');
   main.remove();result?.remove();envoyButton?.remove();box.querySelector('.sr-story-return')?.remove();
   const details=document.createElement('details');details.className='kg-detail';details.innerHTML='<summary>其他路径、地点与地图操作</summary>';
   while(box.firstChild)details.append(box.firstChild);
   details.insertAdjacentHTML('beforeend',choices(historicalPeriods,period,'period'));
   box.append(main);if(envoyButton){envoyButton.classList.add('kg-inline-entry');main.append(envoyButton);}if(result)box.append(result);box.append(details);
  }
  if(stage==='place'&&!modelOpen){
   box.querySelector('.sr-story-return')?.remove();box.querySelector('.mt-topline')?.remove();box.querySelector('.ht-routes')?.remove();box.querySelector('.mt-why')?.remove();
   const bridge=box.querySelector('.kg-scale-link');if(bridge){const note=document.createElement('details');note.className='kg-detail';note.innerHTML='<summary>来时的历史与地图</summary>';bridge.replaceWith(note);note.append(bridge);}
   box.querySelector('.kg-scene-preview')?.remove();
  }
  return box.innerHTML;
 }
 function enterWholeMap(){
  historyStoryPlayer.suspend();const entry=worldMapEntry(world);mapMode=entry.mode;lens=entry.lens;mapGallery=false;trail=false;relationMoving=false;relationReturn=false;mapGuide.active=false;mapGuide.playing=false;mapSurface='globe';globeRegionView=null;go('map',{guide:entry.guide});
 }
 function openAllTopics(){director?.stop();mapMode='geography';mapGallery=true;trail=false;relationReturn=false;mapGuide.active=false;mapGuide.playing=false;mapSurface='globe';go('map',{guide:false});}
''' + s[start:]
replace("function render(){\n  viewport.classList.toggle", "function render(){\n  viewport.classList.add('organized-entry');\n  viewport.classList.toggle")
replace("if(trail)body=trailBody();", "if(trail&&stage!=='world'&&stage!=='map')body=trailBody();")
replace("  const selectedWorldCountry=stage==='world'", "  body=organizeBody(body);\n  const selectedWorldCountry=stage==='world'")
# Existing heading stays as a hidden measurement fallback; one breadcrumb replaces the parallel paths.
a="${historyTrails[trail]?historyProgressHTML(";i=s.index(a,s.index(' function render(){'));j=s.index("${stage==='history'?eventCaption():''}",i)
s=s[:i]+s[j:]
replace("${(stage==='place'||stage==='map'&&mapGallery)&&!modelOpen&&!trail&&!relationReturn?sceneRail():''}","${stage==='map'&&mapGallery&&!modelOpen&&!relationReturn?sceneRail():''}")
replace("${trail||relationsActive()||relationReturn?'':stage!=='world'?layerContext():''}","${stage==='place'&&!modelOpen&&!placeOrigin?layerContext():''}")
replace("${trail?'':stage==='place'||stage==='map'||stage==='history'?'':`<div class=\"kg-intro\"><p>${s.intro}</p></div>`}","")
replace("if(b.dataset.kgStage){if(b.dataset.kgStage==='map'){const fromWorld=stage==='world';openRelations(fromWorld?relationId:currentEvent()??relationId,{scope:fromWorld?'region':'context',node:fromWorld?relationNode:undefined});}else", "if(b.dataset.kgStage){if(b.dataset.kgStage==='map'){if(stage==='world')enterWholeMap();else if((trail||placeOrigin||relationReturn)&&['history','place'].includes(stage))returnStoryMap();else{mapMode='geography';trail=false;go('map',{restore:true,guide:false});}}else")
replace("if(enteredFromWorld&&stage==='map'&&relationsActive()&&!director?.active&&guide){applyMapGuide(0,{focus:false});mapGuide.playing=!reducedMotion;syncMapGuide();}", "if(enteredFromWorld&&stage==='map'&&!director?.active){mapGuide.active=false;mapGuide.playing=false;relationMoving=false;}")
replace("viewport.classList.remove('gx-active','kg-active');", "viewport.classList.remove('gx-active','kg-active','organized-entry');")
replace("header.textContent='探索总览'", "header.textContent='全部线索'")
replace("if(b.id==='kg-open'){ev.preventDefault();ev.stopImmediatePropagation();openRelations();return;}","if(b.id==='kg-open'){ev.preventDefault();ev.stopImmediatePropagation();openAllTopics();return;}")
replace("root.querySelector('.kg-heading')).getBoundingClientRect()", "root.querySelector('.kg-nav')).getBoundingClientRect()")
replace("mapMode=params.get('mapMode')==='geography'||params.get('mapSurface')==='terrain'?'geography':'relations'", "mapMode=params.get('mapMode')==='relations'||params.has('relation')||params.has('trail')?'relations':'geography'")
p.write_text(s,encoding='utf-8')

p=W/'history-story-player.js';s=p.read_text(encoding='utf-8')
s=s.replace('enterPlace=locate,commit=()=>{}','enterPlace=locate,enterModel=null,commit=()=>{}',1)
s=s.replace('<button class="hs-orient" data-hs-action="orient">先从地球定位，再看这段历史 →</button>','',1)
s=s.replace('<button data-hs-action="place" class="hs-next">定位${s.place.name}，选择下一层 →</button>','<button data-hs-action="advance" data-hs-next-reason class="hs-next kg-primary"></button><details class="hs-view-tools"><summary>视角与地点工具</summary><button data-hs-action="follow" aria-pressed="true">引导镜头：开</button><button data-hs-action="inspect">靠近看变化</button><button data-hs-action="overview">事件全景</button><button data-hs-action="orient">从地球重新定位</button><button data-hs-action="place">只定位地点</button></details>',1)
i=s.index(' function overlay(){');j=s.index(' function text(',i)
s=s[:i]+''' function overlay(){const c=context();return c.trail&&story()&&['history','place'].includes(c.stage)?'<section class="hs-caption" aria-label="故事字幕与画面观察"><div><span data-hs-caption-era></span><b data-hs-caption-title></b></div><p data-hs-caption-text></p><small data-hs-caption-look></small></section>':'';}
'''+s[j:]
s=s.replace("(c.node===destination().id?'走进':'定位')+destination().name", "(enterModel||c.node===destination().id?'走进':'定位')+destination().name",1)
s=s.replace("(selected?enterPlace:locate)(target);", "if(enterModel)enterModel(target);else (selected?enterPlace:locate)(target);",1)
p.write_text(s,encoding='utf-8')

p=W/'knowledge-guide.css';s=p.read_text(encoding='utf-8')
s+='''
/* R88: one default path; existing advanced tools are folded rather than removed. */
.kg-active.organized-entry .kg-heading,.kg-active.organized-entry .mt-stops,.kg-active.organized-entry .hs-director{display:none!important}
.kg-active.organized-entry .kg-nav{display:flex!important;left:18px;right:calc(var(--wb-right) + 18px);top:15px;gap:5px;width:auto;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:thin;max-height:42px}
.kg-active.organized-entry .kg-nav button{white-space:nowrap;flex-shrink:0;padding:8px 10px;min-height:32px}
.kg-active.organized-entry .kg-panel{padding-top:22px}
.kg-active.organized-entry .kg-panel>h2{font-size:22px;line-height:1.5;margin:8px 0 12px}
.kg-active.organized-entry .kg-panel h3{font-size:14px;line-height:1.6;margin:14px 0 8px}
.kg-active.organized-entry .kg-detail{margin-top:16px;border-top:1px solid #81977644;padding-top:12px}
.kg-active.organized-entry .kg-detail>summary{font-size:12px;line-height:1.8;cursor:pointer}
.kg-active.organized-entry .kg-detail button{margin:5px 4px 3px 0}
.kg-active.organized-entry .wa-entry-scale{display:flex;gap:5px;margin:16px 0}
.kg-active.organized-entry .wa-entry-scale button{font-size:11px;padding:9px 7px;flex:1}
.kg-active.organized-entry .wa-entry-scale [aria-pressed=true]{background:#aebe9d;color:#23372c}
.kg-active.organized-entry .wa-world-actions{display:flex;margin:18px 0 10px}
.kg-active.organized-entry .wa-world-actions>.kg-primary{width:100%;font-size:13px;min-height:43px}
.kg-active.organized-entry .kg-next-lines{margin:18px 0;border-top:1px solid #81977644;padding-top:8px}
.kg-active.organized-entry .kg-next-lines .sr-relations button{padding:11px 10px}
.kg-active.organized-entry .kg-map-key{display:flex;gap:15px;flex-wrap:wrap;padding:9px 12px;font-size:10px;bottom:55px;background:#14251fdc;max-width:calc(100% - var(--wb-right) - 36px);width:auto}
.kg-active.organized-entry .kg-map-key span:first-child{color:#efd7a2}
.kg-active.organized-entry .hs-story{margin-top:0;border-top:0;padding-top:0}
.kg-active.organized-entry .hs-kicker{font-size:10px}
.kg-active.organized-entry .hs-story>h2{font-size:21px;line-height:1.5}
.kg-active.organized-entry .hs-line{display:none}
.kg-active.organized-entry .hs-view-tools{margin:14px 0;font-size:11px;line-height:1.8}
.kg-active.organized-entry .hs-view-tools button{margin:6px 3px}
.kg-active.organized-entry .kg-inline-entry{font-size:11px;margin:10px 0;padding:9px;background:transparent}
.kg-active.organized-entry .kg-inline-entry span{display:none}
.kg-active.organized-entry .hs-caption b,.kg-active.organized-entry .hs-caption small{display:none}
.kg-active.organized-entry .lp-current p{display:none}
.kg-active.organized-entry .wb-header #hp-world,.kg-active.organized-entry .wb-header #gx-open{display:none}
.kg-active.organized-entry.director-active .kg-nav{display:none!important}
@media(max-width:700px){.kg-active.organized-entry .kg-nav{left:10px;right:10px;top:8px}.kg-active.organized-entry .kg-nav button{font-size:10px;padding:7px 8px}.kg-active.organized-entry .kg-nav .kg-exit{display:none}.kg-active.organized-entry .kg-panel{padding:15px 16px 28px}.kg-active.organized-entry .kg-panel>h2{font-size:19px}.kg-active.organized-entry .kg-map-key{display:none}.kg-active.organized-entry .hs-story>h2{font-size:18px}}
'''
p.write_text(s,encoding='utf-8')
print('R88 guide consolidation installed')
